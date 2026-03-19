'use client';

import { use, useState } from 'react';
import { Flex, Popover, Text } from '@radix-ui/themes';
import CanvasProvider from '@/providers/CanvasProvider';
import { UI_SHAPES } from './uiShapes';

// ── Mini SVG icons ────────────────────────────────────────────────────────────

const S = 1.4;

const ICONS: Record<string, React.ReactNode> = {
  'ui-accordion': (
    <svg viewBox="0 0 40 30" fill="none" width={34} height={26}>
      <rect x="1" y="1"  width="38" height="9" rx="2" stroke="currentColor" strokeWidth={S}/>
      <rect x="1" y="10" width="38" height="10" rx="0" stroke="currentColor" strokeWidth={S} opacity=".4"/>
      <rect x="1" y="20" width="38" height="9" rx="2" stroke="currentColor" strokeWidth={S}/>
      <path d="M 33,5 L 36,7 L 39,5" stroke="currentColor" strokeWidth={S}/>
      <path d="M 35,24 L 38,24" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'ui-bullet-list': (
    <svg viewBox="0 0 40 32" fill="none" width={34} height={26}>
      <rect x="1" y="1" width="38" height="30" rx="3" stroke="currentColor" strokeWidth={S}/>
      {[6, 13, 20, 27].map((y, i) => (
        <g key={i}>
          <circle cx="8" cy={y + 3} r="2.5" fill="currentColor" opacity=".5"/>
          <rect x="14" y={y} width={18 - i * 2} height="6" rx="1" fill="currentColor" opacity=".4"/>
        </g>
      ))}
    </svg>
  ),
  'ui-numbered-list': (
    <svg viewBox="0 0 40 32" fill="none" width={34} height={26}>
      <rect x="1" y="1" width="38" height="30" rx="3" stroke="currentColor" strokeWidth={S}/>
      {[6, 13, 20, 27].map((y, i) => (
        <g key={i}>
          <rect x="5" y={y} width="7" height="6" rx="1" fill="currentColor" opacity=".5"/>
          <rect x="15" y={y} width={18 - i * 2} height="6" rx="1" fill="currentColor" opacity=".4"/>
        </g>
      ))}
    </svg>
  ),
  'ui-card': (
    <svg viewBox="0 0 36 44" fill="none" width={28} height={36}>
      <rect x="1" y="1" width="34" height="42" rx="4" stroke="currentColor" strokeWidth={S}/>
      <rect x="1" y="1" width="34" height="16" rx="4" fill="currentColor" opacity=".15"/>
      <rect x="5" y="21" width="20" height="4" rx="1" fill="currentColor" opacity=".5"/>
      <rect x="5" y="27" width="26" height="3" rx="1" fill="currentColor" opacity=".3"/>
      <rect x="5" y="32" width="22" height="3" rx="1" fill="currentColor" opacity=".3"/>
      <rect x="5" y="37" width="14" height="5" rx="2" fill="currentColor" opacity=".6"/>
    </svg>
  ),
  'ui-button': (
    <svg viewBox="0 0 40 26" fill="none" width={34} height={22}>
      <rect x="3" y="3" width="36" height="22" rx="4" fill="currentColor" opacity=".15"/>
      <rect x="0" y="0" width="36" height="22" rx="4" fill="currentColor" opacity=".4" stroke="currentColor" strokeWidth={S}/>
      <rect x="9" y="8" width="18" height="6" rx="1" fill="currentColor" opacity=".8"/>
    </svg>
  ),
  'ui-tabs': (
    <svg viewBox="0 0 44 32" fill="none" width={36} height={26}>
      <rect x="1" y="9" width="42" height="22" rx="3" stroke="currentColor" strokeWidth={S}/>
      <rect x="1" y="1" width="13" height="10" rx="2" fill="currentColor" opacity=".6" stroke="currentColor" strokeWidth={S}/>
      <rect x="15" y="1" width="13" height="10" rx="2" stroke="currentColor" strokeWidth={S}/>
      <rect x="29" y="1" width="13" height="10" rx="2" stroke="currentColor" strokeWidth={S}/>
      <rect x="5" y="16" width="30" height="4" rx="1" fill="currentColor" opacity=".3"/>
      <rect x="5" y="22" width="24" height="4" rx="1" fill="currentColor" opacity=".3"/>
    </svg>
  ),
  'ui-toast': (
    <svg viewBox="0 0 44 24" fill="none" width={36} height={20}>
      <rect x="3" y="3" width="40" height="20" rx="4" fill="currentColor" opacity=".12"/>
      <rect x="0" y="0" width="40" height="20" rx="4" stroke="currentColor" strokeWidth={S}/>
      <rect x="0" y="3" width="3" height="14" rx="1" fill="#4ade80"/>
      <circle cx="11" cy="10" r="5" fill="currentColor" opacity=".4"/>
      <rect x="20" y="6" width="14" height="4" rx="1" fill="currentColor" opacity=".7"/>
      <rect x="20" y="12" width="18" height="3" rx="1" fill="currentColor" opacity=".4"/>
    </svg>
  ),
  'ui-toggle': (
    <svg viewBox="0 0 44 20" fill="none" width={36} height={16}>
      <rect x="1" y="1" width="42" height="18" rx="4" stroke="currentColor" strokeWidth={S}/>
      <rect x="6" y="7" width="16" height="6" rx="1" fill="currentColor" opacity=".4"/>
      <rect x="28" y="4" width="13" height="12" rx="6" fill="currentColor" opacity=".6"/>
      <circle cx="37" cy="10" r="4" fill="currentColor" opacity=".9"/>
    </svg>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function UiShapesBar() {
  const { canvasRef } = use(CanvasProvider);
  const [open, setOpen] = useState(false);

  const handleAdd = async (id: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shape = UI_SHAPES.find((s) => s.id === id);
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
          {/* component blocks icon */}
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1" y="8" width="5"  height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8" y="8" width="5"  height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          UI
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        sideOffset={6}
        style={{ padding: 10, width: 300 }}
      >
        <Text size="1" color="gray" weight="medium" style={{ display: 'block', marginBottom: 8 }}>
          Click a component to add it to the canvas
        </Text>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {UI_SHAPES.map((shape) => (
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
              <Flex align="center" justify="center" style={{ height: 36 }}>
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
