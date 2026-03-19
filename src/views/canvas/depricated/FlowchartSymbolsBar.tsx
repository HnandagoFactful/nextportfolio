'use client';

import { use, useState } from 'react';
import { Flex, Popover, Text } from '@radix-ui/themes';
import CanvasProvider from '@/providers/CanvasProvider';
import { FLOWCHART_SYMBOLS } from './flowchartSymbols';

// ── Mini SVG icon per symbol ──────────────────────────────────────────────────

const S = 1.5; // stroke-width for icons

const ICONS: Record<string, React.ReactNode> = {
  'fc-process': (
    <svg viewBox="0 0 40 26" fill="none" width={34} height={22}>
      <rect x="1" y="1" width="38" height="24" rx="2" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-terminator': (
    <svg viewBox="0 0 44 26" fill="none" width={36} height={22}>
      <rect x="1" y="1" width="42" height="24" rx="12" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-decision': (
    <svg viewBox="0 0 38 32" fill="none" width={30} height={26}>
      <path d="M 19,1 L 37,16 L 19,31 L 1,16 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-document': (
    <svg viewBox="0 0 42 30" fill="none" width={34} height={24}>
      <path d="M 1,1 L 41,1 L 41,22 Q 31,30 21,22 Q 11,14 1,22 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-input-output': (
    <svg viewBox="0 0 46 26" fill="none" width={36} height={22}>
      <path d="M 12,1 L 45,1 L 33,25 L 1,25 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-manual-operation': (
    <svg viewBox="0 0 44 26" fill="none" width={36} height={22}>
      <path d="M 1,1 L 43,1 L 37,25 L 7,25 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-merge': (
    <svg viewBox="0 0 40 30" fill="none" width={32} height={26}>
      <path d="M 1,1 L 39,1 L 20,29 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-manual-input': (
    <svg viewBox="0 0 44 26" fill="none" width={36} height={22}>
      <path d="M 1,7 L 43,1 L 43,25 L 1,25 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-connector': (
    <svg viewBox="0 0 28 28" fill="none" width={24} height={24}>
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-database': (
    <svg viewBox="0 0 34 38" fill="none" width={26} height={30}>
      <path d="M 1,8 Q 17,1 33,8 L 33,30 Q 17,37 1,30 Z" stroke="currentColor" strokeWidth={S}/>
      <path d="M 1,8 Q 17,15 33,8" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-data-storage': (
    <svg viewBox="0 0 46 28" fill="none" width={36} height={22}>
      <path d="M 12,1 L 40,1 L 40,27 L 12,27 Q 1,14 12,1 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-display': (
    <svg viewBox="0 0 46 28" fill="none" width={36} height={22}>
      <path d="M 1,14 L 10,1 L 37,1 Q 45,14 37,27 L 10,27 Z" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-internal-storage': (
    <svg viewBox="0 0 36 32" fill="none" width={28} height={26}>
      <rect x="1" y="1" width="34" height="30" stroke="currentColor" strokeWidth={S}/>
      <line x1="1" y1="9" x2="35" y2="9" stroke="currentColor" strokeWidth={S}/>
      <line x1="9" y1="1" x2="9" y2="31" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  'fc-tape-data': (
    <svg viewBox="0 0 30 30" fill="none" width={24} height={24}>
      <circle cx="15" cy="15" r="14" stroke="currentColor" strokeWidth={S}/>
      <line x1="15" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function FlowchartSymbolsBar() {
  const { canvasRef } = use(CanvasProvider);
  const [open, setOpen] = useState(false);

  const handleAdd = async (id: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sym = FLOWCHART_SYMBOLS.find((s) => s.id === id);
    if (!sym) return;
    setOpen(false);
    await sym.create(canvas);
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
          {/* small shapes icon */}
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          Symbols
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        sideOffset={6}
        style={{ padding: 10, width: 320 }}
      >
        <Text size="1" color="gray" weight="medium" style={{ display: 'block', marginBottom: 8 }}>
          Click a symbol to add it to the canvas
        </Text>

        {/* 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {FLOWCHART_SYMBOLS.map((sym) => (
            <button
              key={sym.id}
              onClick={() => handleAdd(sym.id)}
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
                {ICONS[sym.id] ?? (
                  <svg viewBox="0 0 32 22" fill="none" width={26} height={18}>
                    <rect x="1" y="1" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </Flex>
              <span style={{ fontSize: 10, textAlign: 'center', lineHeight: 1.2 }}>
                {sym.label}
              </span>
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
