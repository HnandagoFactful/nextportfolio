/**
 * PropertiesPanel
 *
 * Thin orchestrator that composes all property-section components into a
 * scrollable column. Each section manages its own visibility and reads its
 * data directly from PropertiesContext — no props are passed down.
 *
 * Adding a new property section is as simple as:
 *  1. Create the section component in properties/
 *  2. Add it to the import list and render it here.
 *
 * The "Apply to Selection" button at the bottom commits the current panel
 * values to the active Fabric object(s). It is hidden for the pencil tool
 * since pencil changes are applied live via useToolMode's brush-sync effect.
 */

import { Flex, Button } from '@radix-ui/themes';
import { usePropertiesContext } from './PropertiesContext';

import CanvasSection       from './properties/CanvasSection';
import FillStrokeSection   from './properties/FillStrokeSection';
import ShadowSection       from './properties/ShadowSection';
import BrushSection        from './properties/BrushSection';
import TypographySection   from './properties/TypographySection';
import PatternFillSection  from './properties/PatternFillSection';
import TextOnPathSection   from './properties/TextOnPathSection';
import ArrowAnimSection    from './properties/ArrowAnimSection';
import RectBorderSection   from './properties/RectBorderSection';
import TransformSection    from './properties/TransformSection';

/**
 * Renders all property sections in a scrollable column followed by
 * the "Apply to Selection" button (hidden for the pencil tool).
 */
export default function PropertiesPanel() {
  const { activeTool, applyPropertiesToSelection } = usePropertiesContext();

  return (
    <Flex
      direction="column"
      gap="3"
      style={{ overflowY: 'auto', height: '100%', padding: '4px 2px' }}
    >
      {/* Canvas-level settings — always visible */}
      <CanvasSection />

      {/* Per-object appearance */}
      <FillStrokeSection />
      <ShadowSection />
      <BrushSection />

      {/* Text-specific */}
      <TypographySection />
      <PatternFillSection />
      <TextOnPathSection />

      {/* Type-specific instant-apply controls */}
      <ArrowAnimSection />
      <RectBorderSection />
      <TransformSection />

      {/* Commit button — hidden for pencil (live updates via brush-sync effect) */}
      {activeTool !== 'pencil' && (
        <Button
          color="lime"
          variant="soft"
          size="2"
          onClick={applyPropertiesToSelection}
          className="!mt-2"
        >
          Apply to Selection
        </Button>
      )}
    </Flex>
  );
}
