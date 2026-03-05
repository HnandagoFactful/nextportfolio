/**
 * ShadowSection
 *
 * Toggle + controls for the drop-shadow applied to a Fabric object.
 *
 * Visibility:
 *  - Drawing mode: hidden only for tools that produce shadow-incompatible
 *    objects (pencil, line, image, video). All shape-drawing tools
 *    (rect, circle, triangle, text, arrow) show the shadow panel.
 *  - Select mode: shown whenever the selected object's type supports shadows
 *    (rect, ellipse, triangle, i-text, arrow, group). Hidden for path
 *    (pencil stroke), line, and image.
 *
 * The checkbox enables/disables the shadow by setting blur to 10 (on)
 * or resetting all fields to zero (off). Individual sliders fine-tune
 * colour, blur radius, and X/Y offset.
 *
 * Writes via setProperties → committed to Fabric by "Apply to Selection".
 */

import { Flex, Text, Separator, Checkbox } from '@radix-ui/themes';
import { usePropertiesContext } from '../PropertiesContext';
import { ColorInput, NumberInput } from './inputs';

/**
 * Drawing tools that produce objects that don't support drop-shadow.
 * 'select' is intentionally absent — visibility is gated on selectedLayerType
 * when the select tool is active.
 */
const TOOL_NO_SHADOW = new Set(['pencil', 'line', 'image', 'video']);

/**
 * Fabric layer types for which shadow is irrelevant.
 * 'path' = freehand pencil stroke. 'arrow' is NOT listed — arrows support shadows.
 */
const TYPE_NO_SHADOW = new Set(['path', 'line', 'image']);

export default function ShadowSection() {
  const { properties, setProperties, activeTool, selectedLayerType } = usePropertiesContext();

  if (activeTool === 'select') {
    // In select mode: show only when a shadow-compatible object is selected.
    if (!selectedLayerType || TYPE_NO_SHADOW.has(selectedLayerType)) return null;
  } else {
    // In drawing mode: hide for tools that produce shadow-incompatible objects.
    if (TOOL_NO_SHADOW.has(activeTool)) return null;
  }

  const { shadow } = properties;
  const shadowEnabled = shadow.blur > 0 || shadow.offsetX !== 0 || shadow.offsetY !== 0;

  return (
    <>
      <Separator size="4" />

      <Flex align="center" gap="2">
        <Checkbox
          checked={shadowEnabled}
          onCheckedChange={(checked) =>
            setProperties({
              shadow: checked
                ? { ...shadow, blur: 10 }
                : { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
            })
          }
          color="lime"
        />
        <Text size="1">Shadow</Text>
      </Flex>

      {shadowEnabled && (
        <Flex direction="column" gap="2">
          <ColorInput
            label="Shadow Color"
            value={shadow.color}
            onChange={(v) => setProperties({ shadow: { ...shadow, color: v } })}
          />
          <NumberInput
            label="Blur"
            value={shadow.blur}
            min={0}
            max={100}
            onChange={(v) => setProperties({ shadow: { ...shadow, blur: v } })}
          />
          <NumberInput
            label="Offset X"
            value={shadow.offsetX}
            min={-100}
            max={100}
            onChange={(v) => setProperties({ shadow: { ...shadow, offsetX: v } })}
          />
          <NumberInput
            label="Offset Y"
            value={shadow.offsetY}
            min={-100}
            max={100}
            onChange={(v) => setProperties({ shadow: { ...shadow, offsetY: v } })}
          />
        </Flex>
      )}
    </>
  );
}
