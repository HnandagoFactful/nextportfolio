/**
 * ShadowSection
 *
 * Toggle + controls for the drop-shadow applied to a Fabric object.
 *
 * Visibility: hidden for the tools/types that don't support shadows
 * (pencil, line, image, video, select).
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

/** Tools/types for which shadow controls are irrelevant and should be hidden. */
const SHADOW_HIDDEN_FOR = ['pencil', 'line', 'image', 'video', 'select'];

/**
 * Renders the shadow enable checkbox and, when enabled, the colour picker
 * plus blur / offsetX / offsetY number inputs.
 *
 * Returns null when the active tool does not support shadows.
 */
export default function ShadowSection() {
  const { properties, setProperties, activeTool } = usePropertiesContext();

  if (SHADOW_HIDDEN_FOR.includes(activeTool)) return null;

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
