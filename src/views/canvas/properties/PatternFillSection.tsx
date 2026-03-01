/**
 * PatternFillSection
 *
 * Image-pattern fill controls for text objects.
 *
 * Visibility: shown only when a text (i-text / text) object is selected.
 *
 * Flow:
 *  1. User clicks "Apply Pattern" → hidden file input opens.
 *  2. File is passed to `applyPatternFill` which loads the image, pre-renders
 *     it onto an offscreen canvas, and sets it as the Fabric Pattern fill.
 *  3. While a pattern is active, controls for Repeat mode and Scale appear.
 *  4. "Remove" restores the plain colour fill.
 *
 * All operations go through PropertiesContext so this component stays
 * presentation-only with no direct Fabric API calls.
 */

import { useRef } from 'react';
import { Flex, Text, Button, Separator } from '@radix-ui/themes';
import type { PatternRepeat } from '@/providers/CanvasProvider';
import { usePropertiesContext } from '../PropertiesContext';
import { NumberInput } from './inputs';

/** CSS repeat options surfaced in the picker. */
const REPEAT_OPTIONS: { value: PatternRepeat; label: string }[] = [
  { value: 'repeat',   label: 'Repeat (both)' },
  { value: 'repeat-x', label: 'Repeat X' },
  { value: 'repeat-y', label: 'Repeat Y' },
  { value: 'no-repeat', label: 'No Repeat' },
];

/** Shared style for the repeat-mode <select> element. */
const selectStyle: React.CSSProperties = {
  flex: 1,
  padding: '4px 6px',
  borderRadius: 4,
  border: '1px solid var(--gray-6)',
  backgroundColor: 'var(--gray-2)',
  color: 'inherit',
  fontSize: 12,
};

/**
 * Renders the "Pattern Fill" heading, an upload button, and — when a pattern
 * is active — repeat-mode picker, scale input, and remove button.
 *
 * Returns null when no text object is selected.
 */
export default function PatternFillSection() {
  const {
    properties,
    selectedLayerType,
    applyPatternFill,
    updatePatternRepeat,
    updatePatternScale,
    removePatternFill,
  } = usePropertiesContext();

  const patternInputRef = useRef<HTMLInputElement | null>(null);

  const isTextSelected = selectedLayerType === 'i-text' || selectedLayerType === 'text';
  if (!isTextSelected) return null;

  const { hasFillPattern, patternRepeat, patternScale } = properties;

  return (
    <>
      <Separator size="4" />
      <Text size="1" weight="bold" color="lime">Pattern Fill</Text>

      {/* Hidden file input — triggered by the button below */}
      <input
        ref={patternInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) applyPatternFill(file);
          e.target.value = '';
        }}
      />

      {/* Upload / change button + remove button */}
      <Flex gap="2">
        <Button
          size="1"
          variant="soft"
          color="lime"
          style={{ flex: 1 }}
          onClick={() => patternInputRef.current?.click()}
        >
          {hasFillPattern ? 'Change Image' : 'Apply Pattern'}
        </Button>
        {hasFillPattern && (
          <Button
            size="1"
            variant="ghost"
            color="red"
            onClick={removePatternFill}
          >
            Remove
          </Button>
        )}
      </Flex>

      {/* Repeat + scale controls — only shown while a pattern is active */}
      {hasFillPattern && (
        <>
          <Flex align="center" justify="between" gap="2">
            <Text size="1" style={{ minWidth: 80 }}>Repeat</Text>
            <select
              value={patternRepeat}
              onChange={(e) => updatePatternRepeat(e.target.value as PatternRepeat)}
              style={selectStyle}
            >
              {REPEAT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Flex>

          <NumberInput
            label="Scale"
            value={Math.round(patternScale * 100) / 100}
            min={0.01}
            max={20}
            step={0.01}
            onChange={updatePatternScale}
          />
        </>
      )}
    </>
  );
}
