/**
 * TextOnPathSection
 *
 * Controls for binding a text object to a freehand-drawn path so the
 * characters flow along the curve.
 *
 * Visibility: shown only when an IText object is selected (type 'i-text').
 * (Multiline Text objects use a different rendering model that doesn't
 * support path assignment in Fabric v6.)
 *
 * Flow:
 *  1. User clicks "Draw Path" → activates freehand drawing mode.
 *  2. After drawing, the path is assigned to the text via applyPathToText.
 *  3. The offset slider shifts the start character along the arc.
 *  4. "Remove" detaches the path and restores normal text rendering.
 */

import { Flex, Text, Button, Separator } from '@radix-ui/themes';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { usePropertiesContext } from '../PropertiesContext';
import { NumberInput } from './inputs';

/**
 * Renders the "Text on Path" heading, draw / redraw button, path offset
 * slider, and remove button.
 *
 * Returns null when no IText object is selected.
 */
export default function TextOnPathSection() {
  const {
    selectedLayerType,
    textPathId,
    textPathOffset,
    openPathDrawer,
    applyPathToText,
  } = usePropertiesContext();

  if (selectedLayerType !== 'i-text') return null;

  return (
    <>
      <Separator size="4" />
      <Text size="1" weight="bold" color="lime">Text on Path</Text>

      {/* Draw / redraw + remove buttons */}
      <Flex gap="2">
        <Button
          size="1"
          variant="soft"
          color="lime"
          style={{ flex: 1 }}
          onClick={openPathDrawer}
        >
          <Pencil1Icon />
          {textPathId ? 'Redraw Path' : 'Draw Path'}
        </Button>
        {textPathId && (
          <Button
            size="1"
            variant="ghost"
            color="red"
            onClick={() => applyPathToText(null, 0)}
          >
            Remove
          </Button>
        )}
      </Flex>

      {/* Path offset — only shown once a path is assigned */}
      {textPathId && (
        <NumberInput
          label="Path Offset"
          value={textPathOffset}
          min={0}
          max={2000}
          onChange={(v) => applyPathToText(textPathId, v)}
        />
      )}
    </>
  );
}
