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
  const { activeTool, setActiveTool, undo, redo, canUndo, canRedo, canvasRef } = use(CanvasProvider);
  const { downloadAsPng, downloadAsJpeg, downloadAsPdf } = useCanvasExport(canvasRef);
  const [isRow, setIsRow] = useState(false);

  useEffect(() => {
    const check = () => setIsRow(window.innerWidth < 1005);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
    </Flex>
  );
}
