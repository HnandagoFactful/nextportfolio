/**
 * ArrowAnimSection
 *
 * Stroke-dash animation toggle for arrow objects.
 *
 * Visibility: shown only when an arrow layer is selected.
 *
 * Mode buttons:
 *  - "None"         → clears the dash array (solid line)
 *  - "Dashed Flow"  → applies [10, 8] dash; the rAF loop in
 *                     useCanvasAnimations advances the dashOffset each frame,
 *                     creating the flowing animation effect.
 *
 * Writes directly to the Fabric object via `applyArrowAnimation`
 * (instant-apply — no "Apply to Selection" needed).
 */

import { Flex, Text, Button, Separator } from '@radix-ui/themes';
import type { ArrowAnimationType } from '@/providers/CanvasProvider';
import { usePropertiesContext } from '../PropertiesContext';

/** Ordered list of animation modes surfaced as toggle buttons. */
const ANIMATION_TYPES: { value: ArrowAnimationType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'dash', label: 'Dashed Flow' },
];

/**
 * Renders the "Animation" heading and mode-toggle buttons.
 * Returns null when no arrow is selected.
 */
export default function ArrowAnimSection() {
  const { properties, selectedLayerType, applyArrowAnimation } = usePropertiesContext();

  if (selectedLayerType !== 'arrow') return null;

  return (
    <>
      <Separator size="4" />
      <Text size="1" weight="bold" color="lime">Animation</Text>
      <Flex gap="1" wrap="wrap">
        {ANIMATION_TYPES.map(({ value, label }) => (
          <Button
            key={value}
            size="1"
            variant={properties.arrowAnimation === value ? 'solid' : 'surface'}
            color="lime"
            onClick={() => applyArrowAnimation(value)}
          >
            {label}
          </Button>
        ))}
      </Flex>
    </>
  );
}
