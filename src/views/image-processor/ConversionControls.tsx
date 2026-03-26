import { ChangeEvent, use, useRef, useState, useTransition } from "react";
import { Badge, Box, Button, Checkbox, Dialog, Flex, Heading, Separator, Tabs, Text, TextField } from "@radix-ui/themes";
import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import imageConversion from "@/services/image-conversion";
import pageProvider from "@/providers/PageProvider";

// ── Preset definitions ────────────────────────────────────────────────────────

type Preset = { label: string; width: number; height: number; format: string; desc: string }
type PresetGroup = { group: string; presets: Preset[] }

const PRESET_GROUPS: PresetGroup[] = [
  {
    group: 'Android',
    presets: [
      { label: 'App Icon',       width: 192,  height: 192,  format: 'png',  desc: '192 × 192' },
      { label: 'Foreground',     width: 432,  height: 432,  format: 'png',  desc: '432 × 432' },
      { label: 'Background',     width: 1920, height: 1080, format: 'jpeg', desc: '1920 × 1080' },
      { label: 'Splash Screen',  width: 1080, height: 1920, format: 'png',  desc: '1080 × 1920' },
    ],
  },
  {
    group: 'iOS',
    presets: [
      { label: 'App Icon',        width: 1024, height: 1024, format: 'png',  desc: '1024 × 1024' },
      { label: 'Foreground',      width: 512,  height: 512,  format: 'png',  desc: '512 × 512' },
      { label: 'Background',      width: 1920, height: 1080, format: 'jpeg', desc: '1920 × 1080' },
      { label: 'Splash (iPhone)', width: 1125, height: 2436, format: 'png',  desc: '1125 × 2436' },
      { label: 'Splash (iPad)',   width: 2048, height: 2732, format: 'png',  desc: '2048 × 2732' },
    ],
  },
  {
    group: 'YouTube',
    presets: [
      { label: 'Video Thumbnail', width: 1280, height: 720,  format: 'jpeg', desc: '1280 × 720' },
      { label: 'Channel Art',     width: 2560, height: 1440, format: 'jpeg', desc: '2560 × 1440' },
      { label: 'Profile Picture', width: 800,  height: 800,  format: 'jpeg', desc: '800 × 800' },
    ],
  },
  {
    group: 'Instagram',
    presets: [
      { label: 'Reels Thumbnail', width: 1080, height: 1920, format: 'jpeg', desc: '1080 × 1920' },
      { label: 'Square Post',     width: 1080, height: 1080, format: 'jpeg', desc: '1080 × 1080' },
      { label: 'Portrait Post',   width: 1080, height: 1350, format: 'jpeg', desc: '1080 × 1350' },
      { label: 'Story',           width: 1080, height: 1920, format: 'jpeg', desc: '1080 × 1920' },
      { label: 'Profile Picture', width: 320,  height: 320,  format: 'jpeg', desc: '320 × 320' },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConversionControls() {
    const pageContext = use(pageProvider);
    const processorProvider = use(ImageProcessorProvider);
    const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);
    const blobUrlRef = useRef<string>('');
    const [, transition] = useTransition()
    const [isApiDispatched, setIsApiDispatched] = useState<boolean>(false);
    const dialogCloseRef= useRef<HTMLButtonElement | null>(null);
    const [selectedImageFormat, setSelectedFormat] = useState<string | undefined>(undefined);
    const [canFlip, setCanFlip] = useState<boolean>(false);
    const [resize, setResize] = useState<{height: number, width: number}>({
        height: 600,
        width: 600
    });
    const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined);

    function applyPreset(group: string, preset: Preset) {
        setSelectedPreset(`${group}:${preset.label}`)
        setResize({ height: preset.height, width: preset.width })
        setSelectedFormat(preset.format)
    }

    const getConvertedFile = async function() {
        if (!processorProvider.selectedFileData || !selectedImageFormat) return
        setIsApiDispatched(true);
        try {
            const response = await imageConversion({
                data: processorProvider.selectedFileData,
                format: selectedImageFormat,
                flip: canFlip ? '1' : '0',
                resize: [resize.height, resize.width]
            });

            if (!response) throw new Error('Conversion API returned no data')

            blobUrlRef.current = URL.createObjectURL(response)
            if (hiddenAnchorRef.current) {
                hiddenAnchorRef.current.href = blobUrlRef.current
                hiddenAnchorRef.current.click()
            }
            dialogCloseRef.current?.click?.()
            transition(() => {
                setIsApiDispatched(false);
                pageContext.setAlertContentType('Image converted successfully', 'success')
            });
        } catch(e) {
            transition(() => {
                console.log(e);
                setIsApiDispatched(false);
                pageContext.setAlertContentType('Failed to convert image', 'error')
            });
        }
    }

    return (
        <Box>
            <a className="visibility-hidden h-w w-0"
            href="#hidden"
            ref={hiddenAnchorRef}
            download
            style={{
                position: 'absolute',
                top: '-200vh',
                visibility: 'hidden',
            }}
            >
            Hidden download
            </a>
            <Flex direction={"row"} justify={"between"} gap={"2"} align={"center"}>
                <Heading color="lime">
                    Convert image
                </Heading>
                <Dialog.Root>
                    <Dialog.Trigger>
                        <Button color="lime" disabled={!selectedImageFormat}>Convert & Download</Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                        <Dialog.Title color="lime">Confirm image to convert</Dialog.Title>
                        <Dialog.Description size="2" mb="4"  color="lime">
                            {
                            processorProvider.selectedFileData?.name ?
                                `${processorProvider.selectedFileData?.name} to ${selectedImageFormat} format`
                                : 'No Image file selected to convert'
                            }
                        </Dialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button ref={dialogCloseRef} variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button color="lime" loading={isApiDispatched}
                                disabled={!processorProvider.selectedFileData?.name || isApiDispatched}
                                onClick={getConvertedFile}>
                                    Convert
                                </Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Root>
            </Flex>
            <Flex direction={"row"} gap={"4"} align={"center"} className="pt-4">
                <Text color="lime" as="label" size="2">
                    <Flex gap="2">
                        <Checkbox color="lime"
                            checked={canFlip}
                            onCheckedChange={(event: boolean) => {
                                setCanFlip(event)
                            }} />
                        {"Flip Image"}
                    </Flex>
                </Text>
                <Flex gap="2" wrap={"wrap"}>
                    <TextField.Root placeholder="Resize Height" type="number"
                        value={resize.height} onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setResize({
                            ...resize,
                            height: Number(event.target.value)
                        })
                    }}>
                        <TextField.Slot color="lime" className="bg-gray-700 rounded mr-1 ml-[0.5px] text-xs">Resize height</TextField.Slot>
                    </TextField.Root>
                    <TextField.Root placeholder="Resize Width"  type="number"
                        value={resize.width} onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setResize({
                            ...resize,
                            width: Number(event.target.value)
                        })
                    }}>
                        <TextField.Slot color="lime" className="bg-gray-700 rounded mr-1 ml-[0.5px] text-xs">Resize width</TextField.Slot>
                    </TextField.Root>
                </Flex>
            </Flex>
            <Flex direction={"column"} className="mt-2" gap="4">
                <Text as="p">{processorProvider.selectedFileData ? `Selected Image type: ${processorProvider.selectedFileData.type}` : 'Upload and select an image file'}</Text>

                {/* ── Quick Presets ────────────────────────────────────────── */}
                <Box>
                    <Flex align="center" gap="2" mb="2">
                        <Text size="2" weight="bold" color="gray">Quick Presets</Text>
                        <Separator orientation="horizontal" style={{ flex: 1 }} />
                    </Flex>
                    <Tabs.Root defaultValue="Android">
                        <div className="overflow-x-auto pb-1">
                            <Tabs.List size="1" style={{ whiteSpace: 'nowrap', minWidth: 'max-content' }}>
                                {PRESET_GROUPS.map(g => (
                                    <Tabs.Trigger key={g.group} value={g.group}>{g.group}</Tabs.Trigger>
                                ))}
                            </Tabs.List>
                        </div>
                        {PRESET_GROUPS.map(g => (
                            <Tabs.Content key={g.group} value={g.group}>
                                <Flex wrap="wrap" gap="2" pt="3">
                                    {g.presets.map(p => {
                                        const key = `${g.group}:${p.label}`
                                        const active = selectedPreset === key
                                        return (
                                            <Badge
                                                key={key}
                                                size="2"
                                                variant={active ? 'solid' : 'surface'}
                                                color={active ? 'lime' : 'gray'}
                                                onClick={() => applyPreset(g.group, p)}
                                                className="cursor-pointer select-none"
                                                style={{ gap: 6 }}
                                            >
                                                {p.label}
                                                <span style={{ opacity: 0.7 }}>{p.desc}</span>
                                                <span style={{
                                                    background: active ? 'var(--lime-a5)' : 'var(--gray-a4)',
                                                    borderRadius: 4,
                                                    padding: '0 4px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600,
                                                }}>
                                                    {p.format.toUpperCase()}
                                                </span>
                                            </Badge>
                                        )
                                    })}
                                </Flex>
                            </Tabs.Content>
                        ))}
                    </Tabs.Root>
                </Box>

                {/* ── Format checkboxes ────────────────────────────────────── */}
                <Flex direction={"row"} wrap={"wrap"} gap="2" className="pt-1 pl-4">
                    <Box className="w-[80px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime"
                                    checked={selectedImageFormat === "jpeg"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("jpeg")
                                        setSelectedPreset(undefined)
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }} />
                                {"To JPEG"}
                            </Flex>
                        </Text>
                    </Box>
                    <Box className="w-[80px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime"
                                    checked={selectedImageFormat === "png"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("png")
                                        setSelectedPreset(undefined)
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }} />
                                {"To PNG"}
                            </Flex>
                        </Text>
                    </Box>
                    <Box className="w-[80px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime" checked={selectedImageFormat === "pdf"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("pdf")
                                        setSelectedPreset(undefined)
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }} />
                                {"To PDF"}
                            </Flex>
                        </Text>
                    </Box>
                    <Box className="w-[90px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime" checked={selectedImageFormat === "webp"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("webp")
                                        setSelectedPreset(undefined)
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }}/>
                                {"To WEBP"}
                            </Flex>
                        </Text>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    )
}
