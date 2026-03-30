"use client";
import { Box, Flex, Heading, Text, Button, Card } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useMediaQuery } from "@uidotdev/usehooks";

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

export default function LandingView() {
    const router = useRouter();
    const isMobile = useMediaQuery("(max-width: 768px)"); // Adjust animation distance based on screen size

    return (
        <Flex direction="column" gap="6" px="2" py="2">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                <Heading color="lime" style={{ color: "var(--accent-a12)" }} size="8">
                    Mini-apps that save me the headache
                </Heading>
                 <Text as="p" color="gray" size="3" mt="2">
                    No Ads, No data collection.
                </Text>
                <Text as="p" color="gray" size="3" mt="2">
                    Browser and android app based creative tools — no installation required.
                </Text>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ flex: "1 1 280px" }}>
                    <Card style={{ borderColor: "var(--lime-6)", height: "100%" }}>
                        <Flex direction="column" gap="3" p="3" style={{ height: "100%" }}>
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
                                    className="cursor-pointer w-full">
                                    Open Image Manipulator →
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ flex: "1 1 280px" }}>
                    <Card style={{ borderColor: "var(--lime-6)", height: "100%" }}>
                        <Flex direction="column" gap="3" p="3" style={{ height: "100%" }}>
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
                                    className="cursor-pointer w-full">
                                    Open Canvas →
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    style={{ flex: "1 1 280px" }}>
                    <Card style={{ borderColor: "var(--lime-6)", height: "100%" }}>
                        <Flex direction="column" gap="3" p="3" style={{ height: "100%" }}>
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
                                    className="cursor-pointer w-full">
                                    Open Diagram Builder →
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
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
