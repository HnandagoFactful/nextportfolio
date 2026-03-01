/**
 * Primitive input components shared across all property sections.
 *
 * ColorInput — dynamic-positioning strategy
 * ─────────────────────────────────────────
 * The native <input type="color"> opens the browser's OS-level colour dialog
 * at a position chosen by the browser relative to the input element. When the
 * input is near a screen edge (e.g. the right-hand Properties panel), the
 * dialog overflows the viewport.
 *
 * Fix: the colour swatch acts as a trigger for a Radix Popover configured with:
 *   - side="left"       → opens to the left, away from the right panel edge
 *   - avoidCollisions   → flips or shifts if there isn't enough space on the left
 *   - collisionPadding  → keeps the popover ≥ 8 px from every screen edge
 *
 * The actual <input type="color"> lives inside this positioned Popover, so the
 * browser opens its dialog from a location that always has viewport space.
 * Radix renders Popover.Content via a Portal (document.body), bypassing any
 * CSS stacking-context issues from the grid layout.
 */

import { useState, useEffect } from 'react';
import { Flex, Text, Popover } from '@radix-ui/themes';

// ── ColorInput ────────────────────────────────────────────────────────────────

interface ColorInputProps {
  /** Short label rendered to the left of the picker (max ~12 chars). */
  label: string;
  /** Current colour hex string, e.g. '#84cc16'. */
  value: string;
  /** Called with the new hex string whenever the colour changes. */
  onChange: (val: string) => void;
}

/**
 * Labelled colour picker with dynamic-positioning popover.
 *
 * The trigger row shows a coloured swatch and the current hex value.
 * Clicking opens a Popover that Radix keeps within the viewport via
 * collision-avoidance. Inside the Popover:
 *   - a full native colour picker for interactive selection
 *   - a hex text field for direct keyboard entry
 */
export function ColorInput({ label, value, onChange }: ColorInputProps) {
  /**
   * Local hex text state allows partial input (e.g. "#84") without calling
   * onChange on every keystroke. onChange fires only when the text is a valid
   * 6-digit hex string.
   */
  const [hexText, setHexText] = useState(value);

  // Keep hexText in sync when value changes externally (e.g. native picker drag).
  useEffect(() => { setHexText(value); }, [value]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setHexText(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
  };

  return (
    <Flex align="center" justify="between" gap="2">
      <Text size="1" style={{ minWidth: 80, flexShrink: 0 }}>{label}</Text>

      <Popover.Root>
        {/*
          Trigger: coloured swatch + hex label.
          Styled as inline-flex so the button resets browser chrome while
          remaining keyboard-accessible.
        */}
        <Popover.Trigger>
          <button
            aria-label={`${label} colour picker, current value ${value}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Coloured swatch preview */}
            <span
              style={{
                display: 'block',
                width: 32,
                height: 28,
                background: value,
                borderRadius: 4,
                border: '1px solid var(--gray-6)',
                flexShrink: 0,
              }}
            />
            <Text
              as="span"
              size="1"
              color="gray"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {value}
            </Text>
          </button>
        </Popover.Trigger>

        {/*
          Popover with viewport collision avoidance.
          ──────────────────────────────────────────
          side="left"         : prefers opening to the left (away from the right
                                screen edge where the Properties panel sits).
          avoidCollisions     : Radix flips to top/bottom/right if left has
                                insufficient space.
          collisionPadding={8}: keeps ≥ 8 px gap from every viewport edge.
          sideOffset={6}      : gap between the swatch trigger and popover box.

          Rendered via Portal at document.body → no CSS stacking-context from
          the grid-layout cards can clip or obscure it.
        */}
        <Popover.Content
          side="left"
          align="center"
          avoidCollisions
          collisionPadding={8}
          sideOffset={6}
          style={{ padding: 10, width: 'auto' }}
        >
          <Flex direction="column" gap="2">
            {/*
              Native colour picker inside the collision-aware popover.
              The browser positions its OS dialog relative to this element,
              which Radix has already placed in a viewport-safe location.
            */}
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: 180,
                height: 100,
                border: 'none',
                padding: 0,
                display: 'block',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            />

            {/* Manual hex entry — partial typing is buffered in hexText state */}
            <input
              type="text"
              value={hexText}
              onChange={handleHexChange}
              spellCheck={false}
              maxLength={7}
              placeholder="#000000"
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid var(--gray-6)',
                backgroundColor: 'var(--gray-2)',
                color: 'inherit',
                fontSize: 12,
                fontFamily: 'monospace',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  );
}

// ── NumberInput ───────────────────────────────────────────────────────────────

/** Common style applied to all number inputs. */
const numberInputStyle: React.CSSProperties = {
  width: 70,
  padding: '4px 6px',
  borderRadius: 4,
  border: '1px solid var(--gray-6)',
  backgroundColor: 'var(--gray-2)',
  color: 'inherit',
  fontSize: 12,
};

interface NumberInputProps {
  /** Short label rendered to the left of the input (max ~12 chars). */
  label: string;
  /** Current numeric value. */
  value: number;
  /** Minimum allowed value (passed to <input min>). */
  min?: number;
  /** Maximum allowed value (passed to <input max>). */
  max?: number;
  /** Scroll / arrow step increment. Defaults to 1. */
  step?: number;
  /** Called with the parsed number whenever the input changes. */
  onChange: (val: number) => void;
}

/**
 * A labelled number input with optional min, max, and step constraints.
 * Converts the raw string value from the DOM event to a JS number before
 * calling `onChange`.
 */
export function NumberInput({ label, value, min, max, step, onChange }: NumberInputProps) {
  return (
    <Flex align="center" justify="between" gap="2">
      <Text size="1" style={{ minWidth: 80 }}>{label}</Text>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
        style={numberInputStyle}
      />
    </Flex>
  );
}
