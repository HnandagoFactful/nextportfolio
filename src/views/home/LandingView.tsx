"use client";
import { useEffect, useState } from "react";
import { Box, Flex, Heading, Text, Button, Card } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
const StarBackground = dynamic(() => import("@/components/globals/StarBackground"), { ssr: false });

const imageProcessorFeatures = [
    "Upload multiple images",
    "Crop with aspect ratio control",
    "Scale and resize",
    "Translate (X / Y axis)",
    "Rotate images",
];

const canvasFeatures = [
    "Shapes: Rectangle, Circle, Triangle, Line",
    "Connected arrows with auto-tracking",
    "Text tool & Text on path",
    "Freehand pencil brush",
    "Image & Video upload",
    "Layer management & grouping",
    "Fill, stroke, shadow, opacity controls",
    "Animated dashed flows",
];

const diagramsFeatures = [
    "Drag-and-drop shapes: Rectangle, Square, Circle, Oval",
    "Custom image nodes with file upload or URL",
    "Connect nodes with animated, dashed, or colored edges",
    "Resize nodes and edit labels, colors, and borders",
    "Export as PNG, JPEG, SVG, or shareable .flow code",
    "Import .flow files to restore diagrams instantly",
    "Adjustable canvas background color",
];

const converterFeatures = [
    "JSON ↔ CSV conversion",
    "XML → JSON and XML → CSV",
    "CSV / JSON / XML → Excel",
    "Excel → JSON",
    "Instant in-browser processing — no upload to server",
];

const directflowFeatures = [
    "Read EPub & PDF files fully offline",
    "No account or internet connection needed",
    "Remembers reading position per book",
    "Adjustable font size and reading theme",
    "Library view with cover art",
    "Available on Android & iOS",
];

function FeatureList({ items }: { items: string[] }) {
    return (
        <Box>
            {items.map((item) => (
                <Flex key={item} align="center" gap="2" mt="1">
                    <Text color="lime" size="2" style={{ color: "var(--accent-a10)" }}>→</Text>
                    <Text size="2" color="gray">{item}</Text>
                </Flex>
            ))}
        </Box>
    );
}

function ScreenshotCarousel({ images }: { images: string[] }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;
        const id = setInterval(() => {
            setCurrent(i => (i + 1) % images.length);
        }, 2000);
        return () => clearInterval(id);
    }, [images.length]);

    if (!images.length) return null;

    return (
        // Image strip — right 50%, masked to fade out toward the left
        <div style={{
            position: "absolute",
            top: 0, right: 0, bottom: 0,
            width: "50%",
            overflow: "hidden",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 40%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 40%)",
        }}>
            <div style={{
                display: "flex",
                width: `${images.length * 100}%`,
                height: "100%",
                transform: `translateX(-${current * (100 / images.length)}%)`,
                transition: "transform 0.6s ease-in-out",
            }}>
                {images.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt=""
                        style={{
                            width: `${100 / images.length}%`,
                            height: "100%",
                            objectFit: "cover",
                            flexShrink: 0,
                            display: "block",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function LandingView() {
    const router = useRouter();
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <Flex direction="column" gap="6" px="2" py="2">
            <StarBackground />
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                <Heading color="lime" style={{ color: "var(--accent-a12)" }} size="8">
                    Ad-free utility tools — your data never leaves your browser
                </Heading>
                <Text as="p" color="gray" size="3" mt="2">
                    No Ads, No data collection. Browser and android app based creative tools.
                </Text>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 20 }}>
                {/* Image Manipulator */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ flex: "1 1 280px" }}>
                    <Card style={{ borderColor: "var(--lime-6)", height: "100%", position: "relative", overflow: "hidden" }}>
                        <ScreenshotCarousel images={[
                            "/screenshots/images/images-1.png",
                            "/screenshots/images/images-2.png",
                            "/screenshots/images/images-3.png",
                        ]} />
                        <Flex direction="column" gap="3" p="3" style={{ height: "100%", position: "relative", zIndex: 1 }}>
                            <Heading size="5" style={{ color: "var(--accent-a11)" }}>
                                Image Manipulator
                            </Heading>
                            <Text as="p" color="gray" size="2">
                                Upload and manipulate images directly in your browser.
                                Crop, scale, rotate, and reposition with ease.
                            </Text>
                            <FeatureList items={imageProcessorFeatures} />
                            <Box mt="auto" pt="3">
                                <Button
                                    color="lime"
                                    variant="soft"
                                    size="3"
                                    onClick={() => router.push('/en/image-process')}
                                    className="cursor-pointer" style={{ width: "300px" }}>
                                    Open Image Manipulator →
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                </motion.div>

                {/* Canvas Editor */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ flex: "1 1 280px" }}>
                    <Card style={{ borderColor: "var(--lime-6)", height: "100%", position: "relative", overflow: "hidden" }}>
                        <ScreenshotCarousel images={[
                            "/screenshots/canvas/canvas-1.png",
                            "/screenshots/canvas/canvas-2.png",
                            "/screenshots/canvas/canvas-3.png",
                            "/screenshots/canvas/canvas-4.png",
                            "/screenshots/canvas/canvas-5.png",
                        ]} />
                        <Flex direction="column" gap="3" p="3" style={{ height: "100%", position: "relative", zIndex: 1 }}>
                            <Heading size="5" style={{ color: "var(--accent-a11)" }}>
                                Canvas Editor
                            </Heading>
                            <Text as="p" color="gray" size="2">
                                A full-featured drawing editor powered by Fabric.js.
                                Create diagrams, illustrations, and annotated visuals.
                            </Text>
                            <FeatureList items={canvasFeatures} />
                            <Box mt="auto" pt="3">
                                <Button
                                    color="lime"
                                    variant="soft"
                                    size="3"
                                    onClick={() => router.push('/en/canvas')}
                                    className="cursor-pointer" style={{ width: "300px" }}>
                                    Open Canvas →
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                </motion.div>

                {/* Diagram Builder */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    style={{ flex: "1 1 280px" }}>
                    <Card style={{ borderColor: "var(--lime-6)", height: "100%", position: "relative", overflow: "hidden" }}>
                        <ScreenshotCarousel images={[
                            "/screenshots/diagrams/diagrams-1.png",
                            "/screenshots/diagrams/diagrams-2.png",
                            "/screenshots/diagrams/diagrams-3.png",
                            "/screenshots/diagrams/diagrams-4.png",
                        ]} />
                        <Flex direction="column" gap="3" p="3" style={{ height: "100%", position: "relative", zIndex: 1 }}>
                            <Heading size="5" style={{ color: "var(--accent-a11)" }}>
                                Diagram Builder
                            </Heading>
                            <Text as="p" color="gray" size="2">
                                A drag-and-drop flowchart builder. Create, connect, and export diagrams entirely in your browser.
                            </Text>
                            <FeatureList items={diagramsFeatures} />
                            <Box mt="auto" pt="3">
                                <Button
                                    color="lime"
                                    variant="soft"
                                    size="3"
                                    onClick={() => router.push('/en/diagrams')}
                                    className="cursor-pointer" style={{ width: "300px" }}>
                                    Open Diagram Builder →
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                </motion.div>

                {/* Converter */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ flex: "1 1 280px" }}>
                    <Card style={{ borderColor: "var(--lime-6)", height: "100%", position: "relative", overflow: "hidden" }}>
                        <ScreenshotCarousel images={[
                            "/screenshots/converter/converter-1.png",
                            "/screenshots/converter/converter-2.png",
                            "/screenshots/converter/converter-3.png",
                            "/screenshots/converter/converter-5.png",
                        ]} />
                        <Flex direction="column" gap="3" p="3" style={{ height: "100%", position: "relative", zIndex: 1 }}>
                            <Heading size="5" style={{ color: "var(--accent-a11)" }}>
                                Converter
                            </Heading>
                            <Text as="p" color="gray" size="2">
                                Convert between JSON, CSV, XML, and Excel entirely in your browser.
                                No file uploads — all processing happens locally.
                            </Text>
                            <FeatureList items={converterFeatures} />
                            <Box mt="auto" pt="3">
                                <Button
                                    color="lime"
                                    variant="soft"
                                    size="3"
                                    onClick={() => router.push('/en/json-to-sql')}
                                    className="cursor-pointer" style={{ width: "300px" }}>
                                    Open Converter →
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                </motion.div>

                {/* Directflow Reader — no screenshots yet */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    style={{ flex: "1 1 280px" }}>
                    <Card style={{ borderColor: "var(--lime-6)", height: "100%" }}>
                        <Flex direction="column" gap="3" p="3" style={{ height: "100%" }}>
                            <Heading size="5" style={{ color: "var(--accent-a11)" }}>
                                Directflow Reader
                            </Heading>
                            <Text as="p" color="gray" size="2">
                                An offline-first mobile app for reading EPub and PDF files.
                                Your entire library stays on your device — no cloud, no account required.
                            </Text>
                            <FeatureList items={directflowFeatures} />
                            <Box mt="auto" pt="3">
                                <Button
                                    color="lime"
                                    variant="outline"
                                    size="3"
                                    disabled
                                    className="w-full"
                                    style={{ opacity: 0.6 }}>
                                    Coming to app stores soon
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                </motion.div>
            </div>
        </Flex>
    );
}
