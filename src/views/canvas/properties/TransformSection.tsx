/**
 * TransformSection
 *
 * Scale and skew transform controls for shape and group objects.
 *
 * Visibility: shown for rects, ellipses, triangles, and groups —
 * the object types where non-uniform scaling and skewing make visual sense.
 *
 * All four inputs use `applyTransform` which writes directly to the Fabric
 * object and calls setCoords so the selection handles update in real-time
 * (instant-apply — no "Apply to Selection" button needed).
 */

import { Text, Separator } from '@radix-ui/themes';
import { usePropertiesContext } from '../PropertiesContext';
import { NumberInput } from './inputs';

/** Layer types for which the transform section is shown. */
const TRANSFORM_TYPES = ['rect', 'ellipse', 'triangle', 'group'];

/**
 * Renders the "Transform" heading plus scaleX, scaleY, skewX, and skewY inputs.
 * Returns null when the selected object type doesn't support transforms.
 */
export default function TransformSection() {
  const { properties, selectedLayerType, applyTransform } = usePropertiesContext();

  if (!TRANSFORM_TYPES.includes(selectedLayerType ?? '')) return null;

  return (
    <>
      <Separator size="4" />
      <Text size="1" weight="bold" color="lime">Transform</Text>

      <NumberInput
        label="Scale X"
        value={Math.round(properties.scaleX * 100) / 100}
        min={0.01}
        max={20}
        step={0.01}
        onChange={(v) => applyTransform({ scaleX: v })}
      />
      <NumberInput
        label="Scale Y"
        value={Math.round(properties.scaleY * 100) / 100}
        min={0.01}
        max={20}
        step={0.01}
        onChange={(v) => applyTransform({ scaleY: v })}
      />
      <NumberInput
        label="Skew X °"
        value={Math.round(properties.skewX)}
        min={-85}
        max={85}
        step={1}
        onChange={(v) => applyTransform({ skewX: v })}
      />
      <NumberInput
        label="Skew Y °"
        value={Math.round(properties.skewY)}
        min={-85}
        max={85}
        step={1}
        onChange={(v) => applyTransform({ skewY: v })}
      />
    </>
  );
}
