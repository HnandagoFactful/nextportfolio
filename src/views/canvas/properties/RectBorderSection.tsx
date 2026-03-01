/**
 * RectBorderSection
 *
 * Border-dash style controls for rect (rectangle) objects.
 *
 * Visibility: shown only when a rect layer is selected.
 *
 * Border styles:
 *  - "Solid"           → strokeDashArray cleared (default browser rendering)
 *  - "Dashed"          → [6, 6] static dash array
 *  - "Animated"        → [6, 6] dash array; rAF loop in useCanvasAnimations
 *                        advances the dashOffset each frame
 *
 * Writes directly to the Fabric object via `applyRectBorderStyle`
 * (instant-apply — no "Apply to Selection" needed).
 */

import { Flex, Text, Button, Separator } from '@radix-ui/themes';
import type { RectBorderStyle } from '@/providers/CanvasProvider';
import { usePropertiesContext } from '../PropertiesContext';

/** Border styles surfaced as toggle buttons, in display order. */
const BORDER_STYLES: { value: RectBorderStyle; label: string }[] = [
  { value: 'solid',            label: 'Solid' },
  { value: 'dashed',           label: 'Dashed' },
  { value: 'animated-dashed',  label: 'Animated' },
];

/**
 * Renders the "Border Style" heading and style-toggle buttons.
 * Returns null when no rect is selected.
 */
export default function RectBorderSection() {
  const { properties, selectedLayerType, applyRectBorderStyle } = usePropertiesContext();

  if (selectedLayerType !== 'rect') return null;

  return (
    <>
      <Separator size="4" />
      <Text size="1" weight="bold" color="lime">Border Style</Text>
      <Flex gap="1" wrap="wrap">
        {BORDER_STYLES.map(({ value, label }) => (
          <Button
            key={value}
            size="1"
            variant={properties.rectBorderStyle === value ? 'solid' : 'surface'}
            color="lime"
            onClick={() => applyRectBorderStyle(value)}
          >
            {label}
          </Button>
        ))}
      </Flex>
    </>
  );
}
