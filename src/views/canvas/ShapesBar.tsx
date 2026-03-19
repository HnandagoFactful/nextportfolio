'use client';

import { use, useState } from 'react';
import { Flex, Popover, Text } from '@radix-ui/themes';
import CanvasProvider from '@/providers/CanvasProvider';
import { SHAPES, SHAPE_GROUPS } from './shapes';

// ── Inline SVG previews ────────────────────────────────────────────────────────

const S = 1.4; // icon stroke-width

const ICONS: Record<string, React.ReactNode> = {
  hexagon: (
    <svg viewBox="0 0 44 38" fill="none" width={34} height={28}>
      <path d="M 11,1 L 33,1 L 43,19 L 33,37 L 11,37 L 1,19 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  octagon: (
    <svg viewBox="0 0 38 38" fill="none" width={28} height={28}>
      <path d="M 11,1 L 27,1 L 37,11 L 37,27 L 27,37 L 11,37 L 1,27 L 1,11 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  pentagon: (
    <svg viewBox="0 0 38 36" fill="none" width={28} height={28}>
      <path d="M 19,1 L 37,14 L 30,35 L 8,35 L 1,14 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  diamond: (
    <svg viewBox="0 0 40 36" fill="none" width={32} height={28}>
      <path d="M 20,1 L 39,18 L 20,35 L 1,18 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 32 32" fill="none" width={26} height={26}>
      <path d="M 11,1 L 21,1 L 21,11 L 31,11 L 31,21 L 21,21 L 21,31 L 11,31 L 11,21 L 1,21 L 1,11 L 11,11 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  star5: (
    <svg viewBox="0 0 38 38" fill="none" width={28} height={28}>
      <path d="M 19,1 L 23,13 L 37,13 L 26,21 L 30,34 L 19,26 L 8,34 L 12,21 L 1,13 L 15,13 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  star6: (
    <svg viewBox="0 0 36 36" fill="none" width={28} height={28}>
      <path d="M 18,1 L 23,10 L 34,10 L 27,18 L 34,26 L 23,26 L 18,35 L 13,26 L 2,26 L 9,18 L 2,10 L 13,10 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  starburst: (
    <svg viewBox="0 0 36 36" fill="none" width={28} height={28}>
      <path d="M 18,1 L 20,8 L 26,3 L 24,10 L 32,10 L 26,15 L 33,19 L 26,21 L 30,28 L 23,25 L 22,33 L 18,27 L 14,33 L 13,25 L 6,28 L 10,21 L 3,19 L 10,15 L 4,10 L 12,10 L 10,3 L 16,8 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 36 36" fill="none" width={28} height={28}>
      <circle cx="18" cy="18" r="8" stroke="currentColor" strokeWidth={S}/>
      <path d="M 18,1 L 18,5 M 18,31 L 18,35 M 1,18 L 5,18 M 31,18 L 35,18 M 5,5 L 8,8 M 28,28 L 31,31 M 31,5 L 28,8 M 8,28 L 5,31"
        stroke="currentColor" strokeWidth={S} strokeLinecap="round"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 34 30" fill="none" width={28} height={24}>
      <path d="M 17,28 C 6,20 1,14 1,8 C 1,3 5,1 10,1 C 13,1 16,3 17,5 C 18,3 21,1 24,1 C 29,1 33,3 33,8 C 33,14 28,20 17,28 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 30 34" fill="none" width={22} height={26}>
      <path d="M 20,2 C 8,2 1,9 1,17 C 1,25 8,32 20,32 C 13,27 10,22 10,17 C 10,12 13,7 20,2 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  arc: (
    <svg viewBox="0 0 38 22" fill="none" width={30} height={18}>
      <path d="M 1,19 A 18,18,0,0,1,37,19 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  pie: (
    <svg viewBox="0 0 36 36" fill="none" width={28} height={28}>
      <path d="M 18,18 L 18,1 A 17,17,0,0,1,32,26 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'speech-bubble': (
    <svg viewBox="0 0 44 34" fill="none" width={34} height={26}>
      <path d="M 4,1 L 40,1 Q 43,1 43,4 L 43,22 Q 43,25 40,25 L 16,25 L 9,33 L 11,25 L 4,25 Q 1,25 1,22 L 1,4 Q 1,1 4,1 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 42 28" fill="none" width={34} height={22}>
      <path d="M 1,1 L 30,1 L 41,14 L 30,27 L 1,27 L 12,14 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  banner: (
    <svg viewBox="0 0 46 22" fill="none" width={36} height={18}>
      <path d="M 1,1 L 45,1 L 40,11 L 45,21 L 1,21 L 6,11 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'double-arrow': (
    <svg viewBox="0 0 40 24" fill="none" width={32} height={20}>
      <path d="M 1,12 L 10,1 L 10,7 L 30,7 L 30,1 L 39,12 L 30,23 L 30,17 L 10,17 L 10,23 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  callout: (
    <svg viewBox="0 0 44 34" fill="none" width={34} height={26}>
      <path d="M 4,1 L 40,1 Q 43,1 43,4 L 43,22 Q 43,25 40,25 L 24,25 L 18,33 L 18,25 L 4,25 Q 1,25 1,22 L 1,4 Q 1,1 4,1 Z"
        stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
};

const FALLBACK = (
  <svg viewBox="0 0 32 22" fill="none" width={26} height={18}>
    <rect x="1" y="1" width="30" height="20" rx="2" stroke="currentColor" strokeWidth={S}/>
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────────

export default function ShapesBar() {
  const { canvasRef } = use(CanvasProvider);
  const [open, setOpen] = useState(false);

  const handleAdd = async (id: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shape = SHAPES.find((s) => s.id === id);
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
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M 7,14 L 10.5,7 L 14,14 Z" stroke="currentColor" strokeWidth="1.1" fill="none"/>
            <rect x="7.5" y="7.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.1"/>
          </svg>
          Shapes
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        sideOffset={6}
        style={{ padding: 12, width: 340, maxHeight: 520, overflowY: 'auto' }}
      >
        <Text size="1" color="gray" weight="medium" style={{ display: 'block', marginBottom: 10 }}>
          Click a shape to add it to the canvas
        </Text>

        {SHAPE_GROUPS.map((group) => {
          const groupShapes = SHAPES.filter((s) => s.group === group);
          return (
            <div key={group} style={{ marginBottom: 12 }}>
              <Text
                size="1"
                weight="bold"
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: 'var(--lime-11)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 10,
                }}
              >
                {group}
              </Text>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                {groupShapes.map((shape) => (
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
                      minHeight: 60,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background    = 'var(--lime-3)';
                      e.currentTarget.style.borderColor   = 'var(--lime-7)';
                      e.currentTarget.style.color         = 'var(--lime-11)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background    = 'var(--gray-2)';
                      e.currentTarget.style.borderColor   = 'var(--gray-4)';
                      e.currentTarget.style.color         = 'var(--gray-11)';
                    }}
                  >
                    <Flex align="center" justify="center" style={{ height: 30 }}>
                      {ICONS[shape.id] ?? FALLBACK}
                    </Flex>
                    <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>
                      {shape.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </Popover.Content>
    </Popover.Root>
  );
}
