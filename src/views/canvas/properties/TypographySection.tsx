/**
 * TypographySection
 *
 * Font-family picker, font-size input, bold toggle, and italic toggle.
 *
 * Visibility: shown when the text tool is active (so the user can configure
 * the font before clicking to place a text object) OR when an IText / text
 * object is currently selected.
 *
 * Writes via setProperties → committed to Fabric by "Apply to Selection".
 */

import { Flex, Text, Button, Separator } from '@radix-ui/themes';
import { FontBoldIcon, FontItalicIcon } from '@radix-ui/react-icons';
import { usePropertiesContext } from '../PropertiesContext';
import { NumberInput } from './inputs';

/** Font families available in the picker. */
const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Impact',
];

/** Shared style for the font-family <select> element. */
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
 * Renders the "Typography" heading, font-family picker, font-size input,
 * and bold / italic toggle buttons.
 *
 * Returns null when the section is not applicable.
 */
export default function TypographySection() {
  const { properties, setProperties, activeTool, selectedLayerType } = usePropertiesContext();

  const isTextSelected = selectedLayerType === 'i-text' || selectedLayerType === 'text';
  if (activeTool !== 'text' && !isTextSelected) return null;

  return (
    <>
      <Separator size="4" />
      <Text size="1" weight="bold" color="lime">Typography</Text>

      {/* Font family */}
      <Flex align="center" justify="between" gap="2">
        <Text size="1" style={{ minWidth: 80 }}>Font</Text>
        <select
          value={properties.fontFamily}
          onChange={(e) => setProperties({ fontFamily: e.target.value })}
          style={selectStyle}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Flex>

      {/* Font size */}
      <NumberInput
        label="Font Size"
        value={properties.fontSize}
        min={1}
        max={400}
        onChange={(v) => setProperties({ fontSize: v })}
      />

      {/* Bold / italic toggles */}
      <Flex align="center" justify="between" gap="2">
        <Text size="1" style={{ minWidth: 80 }}>Style</Text>
        <Flex gap="1">
          <Button
            size="1"
            variant={properties.fontWeight === 'bold' ? 'solid' : 'surface'}
            color="lime"
            onClick={() =>
              setProperties({ fontWeight: properties.fontWeight === 'bold' ? 'normal' : 'bold' })
            }
            title="Bold"
          >
            <FontBoldIcon />
          </Button>
          <Button
            size="1"
            variant={properties.fontStyle === 'italic' ? 'solid' : 'surface'}
            color="lime"
            onClick={() =>
              setProperties({ fontStyle: properties.fontStyle === 'italic' ? 'normal' : 'italic' })
            }
            title="Italic"
          >
            <FontItalicIcon />
          </Button>
        </Flex>
      </Flex>
    </>
  );
}
