/**
 * FillStrokeSection
 *
 * Controls for fill colour, stroke colour, stroke width, and opacity.
 * These apply to almost every object type (shapes, text, arrows).
 *
 * Visibility rules:
 *  - The Fill picker is hidden when:
 *      • the active tool is 'pencil' (uses BrushSection instead)
 *      • the active tool is 'line'  (lines have no fill)
 *      • a text object with an active Pattern fill is selected
 *        (the fill slot is occupied by the image)
 *  - Stroke and opacity are always shown (this section always renders
 *    at least those two rows).
 *
 * Writes to PropertiesContext.properties via setProperties; the "Apply to
 * Selection" button in PropertiesPanel commits these values to Fabric.
 */

import { usePropertiesContext } from '../PropertiesContext';
import { ColorInput, NumberInput } from './inputs';

/**
 * Renders fill (conditional), stroke colour, stroke width, and opacity inputs.
 */
export default function FillStrokeSection() {
  const { properties, setProperties, activeTool, selectedLayerType } = usePropertiesContext();

  const isTextSelected = selectedLayerType === 'i-text' || selectedLayerType === 'text';
  const showFill =
    activeTool !== 'pencil' &&
    activeTool !== 'line' &&
    !(isTextSelected && properties.hasFillPattern);

  return (
    <>
      {showFill && (
        <ColorInput
          label="Fill"
          value={properties.fillColor}
          onChange={(v) => setProperties({ fillColor: v })}
        />
      )}

      <ColorInput
        label="Stroke"
        value={properties.strokeColor}
        onChange={(v) => setProperties({ strokeColor: v })}
      />

      <NumberInput
        label="Stroke Width"
        value={properties.strokeWidth}
        min={0}
        max={50}
        onChange={(v) => setProperties({ strokeWidth: v })}
      />

      <NumberInput
        label="Opacity %"
        value={Math.round(properties.opacity * 100)}
        min={0}
        max={100}
        onChange={(v) => setProperties({ opacity: v / 100 })}
      />
    </>
  );
}
