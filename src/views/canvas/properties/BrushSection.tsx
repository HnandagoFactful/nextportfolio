/**
 * BrushSection
 *
 * Brush colour and stroke-thickness controls for the freehand pencil tool.
 *
 * Visibility: only rendered when `activeTool === 'pencil'`.
 *
 * Unlike most sections, brush changes take effect in real-time via the
 * dedicated brush-sync effect in useToolMode — no "Apply" button needed.
 * setProperties is still called here so the panel reflects the live state.
 */

import { Separator } from '@radix-ui/themes';
import { usePropertiesContext } from '../PropertiesContext';
import { ColorInput, NumberInput } from './inputs';

/**
 * Renders brush colour and thickness inputs.
 * Returns null when the pencil tool is not active.
 */
export default function BrushSection() {
  const { properties, setProperties, activeTool } = usePropertiesContext();

  if (activeTool !== 'pencil') return null;

  return (
    <>
      <Separator size="4" />
      <ColorInput
        label="Brush Color"
        value={properties.brushColor}
        onChange={(v) => setProperties({ brushColor: v })}
      />
      <NumberInput
        label="Thickness"
        value={properties.brushWidth}
        min={1}
        max={100}
        onChange={(v) => setProperties({ brushWidth: v })}
      />
    </>
  );
}
