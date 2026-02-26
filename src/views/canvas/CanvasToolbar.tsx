import { use, useEffect, useState } from "react";
import { Flex, Tooltip, IconButton } from "@radix-ui/themes";
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
} from "@radix-ui/react-icons";
import CanvasProvider, { CanvasTool } from "@/providers/CanvasProvider";

const TOOLS: Array<{ tool: CanvasTool; icon: React.ReactNode; label: string }> = [
  { tool: 'select',   icon: <CursorArrowIcon />,       label: 'Select' },
  { tool: 'rect',     icon: <SquareIcon />,             label: 'Rectangle' },
  { tool: 'circle',   icon: <CircleIcon />,             label: 'Circle' },
  { tool: 'triangle', icon: <TriangleUpIcon />,         label: 'Triangle' },
  { tool: 'line',     icon: <DividerHorizontalIcon />,  label: 'Line' },
  { tool: 'text',     icon: <TextIcon />,               label: 'Text' },
  { tool: 'pencil',   icon: <Pencil1Icon />,            label: 'Pencil' },
  { tool: 'image',    icon: <ImageIcon />,              label: 'Add Image' },
  { tool: 'video',    icon: <VideoIcon />,              label: 'Add Video' },
];

export default function CanvasToolbar() {
  const { activeTool, setActiveTool } = use(CanvasProvider);
  const [isRow, setIsRow] = useState(false);

  useEffect(() => {
    const check = () => setIsRow(window.innerWidth < 1005);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <Flex
      direction={isRow ? 'row' : 'column'}
      gap="2"
      align="center"
      wrap={isRow ? 'wrap' : 'nowrap'}
      className={isRow ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto overflow-x-hidden'}
      style={{ height: '100%', paddingTop: '8px' }}
    >
      {TOOLS.map(({ tool, icon, label }) => (
        <Tooltip key={tool} content={label} side={isRow ? 'bottom' : 'right'}>
          <IconButton
            variant={activeTool === tool ? 'solid' : 'soft'}
            color={activeTool === tool ? 'lime' : 'gray'}
            size="2"
            onClick={() => setActiveTool(tool)}
            aria-label={label}
          >
            {icon}
          </IconButton>
        </Tooltip>
      ))}
    </Flex>
  );
}
