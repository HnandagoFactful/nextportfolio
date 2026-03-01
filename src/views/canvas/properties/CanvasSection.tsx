/**
 * CanvasSection
 *
 * Canvas-level settings block, always rendered at the top of the properties
 * panel regardless of tool or selection state.
 *
 * Currently exposes only the background colour picker; additional canvas-wide
 * settings (e.g. grid snap, ruler visibility) can be added here without
 * touching any other section.
 *
 * Reads directly from CanvasProvider (the global canvas context) rather than
 * PropertiesContext because background colour is a canvas-level concern, not
 * a per-object property.
 */

import { use } from 'react';
import { Text, Separator } from '@radix-ui/themes';
import CanvasProvider from '@/providers/CanvasProvider';
import { ColorInput } from './inputs';

/**
 * Renders the "Canvas" heading and the background colour picker.
 * Always visible.
 */
export default function CanvasSection() {
  const { canvasBackground, setCanvasBackground } = use(CanvasProvider);

  return (
    <>
      <Text size="1" weight="bold" color="lime">Canvas</Text>
      <ColorInput
        label="Background"
        value={canvasBackground}
        onChange={setCanvasBackground}
      />
      <Separator size="4" />
    </>
  );
}
