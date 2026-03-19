import { use, useEffect, useState } from "react";
import { Flex, Tooltip, IconButton, Separator, Popover, Button, Text } from "@radix-ui/themes";
import {
  CursorArrowIcon,
  SquareIcon,
  CircleIcon,
  TriangleUpIcon,
  DividerHorizontalIcon,
  TextIcon,
  Pencil1Icon,
  ImageIcon,
  VideoIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import CanvasProvider, { CanvasTool } from "@/providers/CanvasProvider";
import { useCanvasExport } from "./hooks/useCanvasExport";
import { assignId } from "./canvasUtils";
import ShapesBar from "./ShapesBar";

const ArrowToolIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="13" x2="11" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <polygon points="11,1 14,7 8,7" fill="currentColor"/>
  </svg>
);

const UndoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 2.5L1.5 5.5L4.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.5 5.5H9C11 5.5 12.5 7 12.5 9C12.5 11 11 12.5 9 12.5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const RedoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 2.5L13.5 5.5L10.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 5.5H6C4 5.5 2.5 7 2.5 9C2.5 11 4 12.5 6 12.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ── Page sizes (mm → px at 96 dpi, 1 mm = 3.7795 px) ────────────────────────
const MM = 3.7795;
const PAGE_SIZES = [
  { label: 'A2', w: Math.round(420 * MM), h: Math.round(594 * MM) },
  { label: 'A3', w: Math.round(297 * MM), h: Math.round(420 * MM) },
  { label: 'A4', w: Math.round(210 * MM), h: Math.round(297 * MM) },
  { label: 'A5', w: Math.round(148 * MM), h: Math.round(210 * MM) },
];

const PageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="3" y="1" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    <line x1="5" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1"/>
    <line x1="5" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1"/>
    <line x1="5" y1="10" x2="8"  y2="10" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

const TOOLS: Array<{ tool: CanvasTool; icon: React.ReactNode; label: string }> = [
  { tool: 'select',   icon: <CursorArrowIcon />,       label: 'Select' },
  { tool: 'rect',     icon: <SquareIcon />,             label: 'Rectangle' },
  { tool: 'circle',   icon: <CircleIcon />,             label: 'Circle' },
  { tool: 'triangle', icon: <TriangleUpIcon />,         label: 'Triangle' },
  { tool: 'line',     icon: <DividerHorizontalIcon />,  label: 'Line' },
  { tool: 'arrow',    icon: <ArrowToolIcon />,          label: 'Arrow' },
  { tool: 'text',     icon: <TextIcon />,               label: 'Text' },
  { tool: 'pencil',   icon: <Pencil1Icon />,            label: 'Pencil' },
  { tool: 'image',    icon: <ImageIcon />,              label: 'Add Image' },
  { tool: 'video',    icon: <VideoIcon />,              label: 'Add Video' },
];

export default function CanvasToolbar() {
  const { activeTool, setActiveTool, undo, redo, canUndo, canRedo, canvasRef, setProperties } = use(CanvasProvider);
  const { downloadAsPng, downloadAsJpeg, downloadAsPdf } = useCanvasExport(canvasRef);
  const [isRow, setIsRow] = useState(false);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsRow(window.innerWidth < 1005);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const addPage = async (wPx: number, hPx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPageSizeOpen(false);
    const { Rect, Shadow } = await import('fabric');

    // Lock canvas to exactly the page dimensions — no zoom/pan.
    // The container has overflow:auto so large pages scroll naturally.
    (canvas as unknown as Record<string, unknown>).__pageSize = { w: wPx, h: hPx };
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setDimensions({ width: wPx, height: hPx });

    const rect = new Rect({
      left: 0, top: 0,
      width: wPx, height: hPx,
      fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.18)', blur: 12, offsetX: 3, offsetY: 3 }),
    });
    assignId(rect);
    canvas.add(rect);
    canvas.setActiveObject(rect);

    // Default drawing colours to black — shapes/text are visible on the white page
    setProperties({ fillColor: '#000000', strokeColor: '#000000', brushColor: '#000000' });

    canvas.requestRenderAll();
  };

  return (
    <Flex
      direction={'row'}
      gap="2"
      align="center"
      wrap={'nowrap'}
      className={isRow ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto overflow-x-hidden'}
      style={{ height: '100%', paddingTop: '2px' }}
    >
      {/* Undo / Redo */}
      <Tooltip content="Undo (Ctrl+Z)" side={isRow ? 'bottom' : 'right'}>
        <IconButton
          variant="soft"
          color="gray"
          size="1"
          disabled={!canUndo}
          onClick={undo}
          aria-label="Undo"
        >
          <UndoIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Redo (Ctrl+Y)" side={isRow ? 'bottom' : 'right'}>
        <IconButton
          variant="soft"
          color="gray"
          size="1"
          disabled={!canRedo}
          onClick={redo}
          aria-label="Redo"
        >
          <RedoIcon />
        </IconButton>
      </Tooltip>

      <Separator orientation="vertical" size="1" style={{ height: 20 }} />

      {/* Drawing tools */}
      {TOOLS.map(({ tool, icon, label }) => (
        <Tooltip key={tool} content={label} side={isRow ? 'bottom' : 'right'}>
          <IconButton
            variant={activeTool === tool ? 'solid' : 'soft'}
            color={activeTool === tool ? 'lime' : 'gray'}
            size="1"
            onClick={() => {
              if (activeTool === tool) {
                setActiveTool('select');
              } else {
                setActiveTool(tool);
              }
            }}
            aria-label={label}
          >
            {icon}
          </IconButton>
        </Tooltip>
      ))}

      <Separator orientation="vertical" size="1" style={{ height: 20 }} />

      {/* Download */}
      <Popover.Root>
        <Tooltip content="Download" side={isRow ? 'bottom' : 'right'}>
          <Popover.Trigger>
            <IconButton variant="soft" color="gray" size="1" aria-label="Download">
              <DownloadIcon />
            </IconButton>
          </Popover.Trigger>
        </Tooltip>
        <Popover.Content side={isRow ? 'bottom' : 'right'} align="center" sideOffset={6} style={{ padding: 8 }}>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium" style={{ paddingBottom: 2 }}>Export as</Text>
            <Button size="1" variant="soft" color="lime" onClick={downloadAsPng}>PNG</Button>
            <Button size="1" variant="soft" color="lime" onClick={downloadAsJpeg}>JPEG</Button>
            <Button size="1" variant="soft" color="lime" onClick={downloadAsPdf}>PDF</Button>
          </Flex>
        </Popover.Content>
      </Popover.Root>

      {/* Page size */}
      <Popover.Root open={pageSizeOpen} onOpenChange={setPageSizeOpen}>
        <Tooltip content="Add page" side={isRow ? 'bottom' : 'right'}>
          <Popover.Trigger>
            <IconButton variant="soft" color="gray" size="1" aria-label="Add page">
              <PageIcon />
            </IconButton>
          </Popover.Trigger>
        </Tooltip>
        <Popover.Content side={isRow ? 'bottom' : 'right'} align="center" sideOffset={6} style={{ padding: 8, minWidth: 160 }}>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium" style={{ paddingBottom: 2 }}>Add page frame</Text>
            {PAGE_SIZES.map(({ label, w, h }) => (
              <Flex key={label} gap="1">
                <Button size="1" variant="soft" color="lime" style={{ flex: 1 }} onClick={() => addPage(w, h)}>
                  {label} Portrait
                </Button>
                <Button size="1" variant="soft" color="gray" style={{ flex: 1 }} onClick={() => addPage(h, w)}>
                  {label} Land.
                </Button>
              </Flex>
            ))}
          </Flex>
        </Popover.Content>
      </Popover.Root>

      <Separator orientation="vertical" size="1" style={{ height: 20 }} />

      {/* Extra shapes */}
      <ShapesBar />

    </Flex>
  );
}
