'use client';

import { use, useState } from 'react';
import { Flex, Popover, Text } from '@radix-ui/themes';
import CanvasProvider from '@/providers/CanvasProvider';
import { KANBAN_SHAPES } from './kanbanShapes';

// ── Mini SVG icon per shape ───────────────────────────────────────────────────

const S = 1.5; // stroke-width for icons

const ICONS: Record<string, React.ReactNode> = {
  'kb-task': (
    <svg viewBox="0 0 44 26" fill="none" width={36} height={22}>
      <rect x="1" y="1" width="42" height="24" rx="3" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'kb-epic': (
    <svg viewBox="0 0 52 32" fill="none" width={40} height={26}>
      <rect x="1" y="1" width="50" height="30" rx="5" stroke="currentColor" strokeWidth={S}/>
      <line x1="8" y1="11" x2="44" y2="11" stroke="currentColor" strokeWidth={S} strokeDasharray="3 2"/>
    </svg>
  ),
  'kb-bug': (
    <svg viewBox="0 0 44 26" fill="none" width={36} height={22}>
      <rect x="1" y="1" width="42" height="24" rx="3" stroke="#f87171" strokeWidth={S}/>
      <circle cx="9" cy="9" r="3" fill="#f87171"/>
    </svg>
  ),
  'kb-swimlane': (
    <svg viewBox="0 0 54 16" fill="none" width={44} height={14}>
      <rect x="1" y="1" width="52" height="14" rx="2" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'kb-milestone': (
    <svg viewBox="0 0 32 32" fill="none" width={26} height={26}>
      <path d="M 16,1 L 31,16 L 16,31 L 1,16 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'kb-sticky': (
    <svg viewBox="0 0 30 30" fill="none" width={26} height={26}>
      <path d="M 1,1 L 23,1 L 29,7 L 29,29 L 1,29 Z" stroke="currentColor" strokeWidth={S}/>
      <path d="M 23,1 L 23,7 L 29,7" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'kb-blocker': (
    <svg viewBox="0 0 30 30" fill="none" width={26} height={26}>
      <path d="M 9,1 L 21,1 L 29,9 L 29,21 L 21,29 L 9,29 L 1,21 L 1,9 Z" stroke="#dc2626" strokeWidth={S}/>
    </svg>
  ),
  'kb-label-tag': (
    <svg viewBox="0 0 42 22" fill="none" width={34} height={18}>
      <path d="M 1,1 L 33,1 L 41,11 L 33,21 L 1,21 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function KanbanShapesBar() {
  const { canvasRef } = use(CanvasProvider);
  const [open, setOpen] = useState(false);

  const handleAdd = async (id: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shape = KANBAN_SHAPES.find((s) => s.id === id);
    if (!shape) return;
    setOpen(false);
    await shape.create(canvas);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 10px',
            border: '1px solid var(--lime-7)',
            borderRadius: 6,
            background: 'var(--lime-3)',
            color: 'var(--lime-11)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {/* kanban card icon */}
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1" y="8" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          Shapes
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        sideOffset={6}
        style={{ padding: 10, width: 300 }}
      >
        <Text size="1" color="gray" weight="medium" style={{ display: 'block', marginBottom: 8 }}>
          Click a shape to add it to the canvas
        </Text>

        {/* 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {KANBAN_SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => handleAdd(shape.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '8px 4px',
                border: '1px solid var(--gray-4)',
                borderRadius: 6,
                background: 'var(--gray-2)',
                cursor: 'pointer',
                color: 'var(--gray-11)',
                minHeight: 64,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--lime-3)';
                e.currentTarget.style.borderColor = 'var(--lime-7)';
                e.currentTarget.style.color = 'var(--lime-11)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--gray-2)';
                e.currentTarget.style.borderColor = 'var(--gray-4)';
                e.currentTarget.style.color = 'var(--gray-11)';
              }}
            >
              <Flex align="center" justify="center" style={{ height: 32 }}>
                {ICONS[shape.id] ?? (
                  <svg viewBox="0 0 36 22" fill="none" width={28} height={18}>
                    <rect x="1" y="1" width="34" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </Flex>
              <span style={{ fontSize: 10, textAlign: 'center', lineHeight: 1.2 }}>
                {shape.label}
              </span>
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
