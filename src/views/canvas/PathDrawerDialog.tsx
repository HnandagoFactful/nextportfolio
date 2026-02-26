'use client';

import { useEffect, useRef, useState } from "react";
import { Dialog, Button, Flex, Text } from "@radix-ui/themes";
import type { Canvas as FabricCanvas } from "fabric";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the raw path commands array from the drawn Fabric Path */
  onApply: (pathCommands: unknown[][], pathLength: number) => void;
}

export default function PathDrawerDialog({ open, onClose, onApply }: Props) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const commandsRef = useRef<unknown[][] | null>(null);
  const pathLengthRef = useRef<number>(0);
  const [hasPath, setHasPath] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    // Defer so Dialog's DOM is mounted before we initialise Fabric
    const timer = setTimeout(() => {
      import('fabric').then(({ Canvas, PencilBrush }) => {
        if (cancelled || !canvasElRef.current) return;

        const fc = new Canvas(canvasElRef.current, {
          width: 480,
          height: 280,
          backgroundColor: '#1a1a2e',
          isDrawingMode: true,
        });

        const brush = new PencilBrush(fc);
        brush.color = '#84cc16';
        brush.width = 3;
        fc.freeDrawingBrush = brush;

        fc.on('path:created', (e: { path: { path: unknown[][]; length?: number; getPathLength?: () => number } }) => {
          // Keep only the most recent stroke
          fc.getObjects().forEach(obj => {
            if (obj !== (e.path as unknown)) fc.remove(obj);
          });
          commandsRef.current = e.path.path;
          // Fabric v6 exposes path length via a method or property
          pathLengthRef.current =
            typeof e.path.getPathLength === 'function'
              ? e.path.getPathLength()
              : typeof e.path.length === 'number'
              ? e.path.length
              : 300; // sensible fallback
          setHasPath(true);
          fc.requestRenderAll();
        });

        fabricRef.current = fc;
      });
    }, 80);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      fabricRef.current?.dispose();
      fabricRef.current = null;
      commandsRef.current = null;
      pathLengthRef.current = 0;
      setHasPath(false);
    };
  }, [open]);

  const handleClear = () => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = '#1a1a2e';
    fabricRef.current.requestRenderAll();
    commandsRef.current = null;
    pathLengthRef.current = 0;
    setHasPath(false);
  };

  const handleApply = () => {
    if (!commandsRef.current) return;
    onApply(commandsRef.current, pathLengthRef.current);
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Content style={{ maxWidth: 540 }}>
        <Dialog.Title>Draw Path for Text</Dialog.Title>
        <Dialog.Description size="2" mb="3" color="gray">
          Draw a curve below — your text will flow along it. Draw again to replace.
        </Dialog.Description>

        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--gray-6)' }}>
          {!hasPath && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', opacity: 0.4, zIndex: 1,
            }}>
              <Text size="2" color="gray">Click and drag to draw a curve</Text>
            </div>
          )}
          <canvas ref={canvasElRef} />
        </div>

        <Flex mt="4" justify="between" align="center">
          <Button size="2" variant="soft" color="gray" disabled={!hasPath} onClick={handleClear}>
            Clear
          </Button>
          <Flex gap="2">
            <Dialog.Close>
              <Button size="2" variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button size="2" variant="solid" color="lime" disabled={!hasPath} onClick={handleApply}>
              Apply to Text
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
