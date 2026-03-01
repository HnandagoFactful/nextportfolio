/**
 * RightPanel
 *
 * Tab container that hosts the Layers and Properties panels.
 *
 * Previously this component received ~15 props from CanvasViewer and forwarded
 * them to LayersPanel and PropertiesPanel. Now that both panels consume their
 * own sub-contexts (LayersContext / PropertiesContext), RightPanel has zero
 * props and acts purely as a structural shell.
 *
 * Tab layout:
 *  - "Layers"     → LayersPanel (object stack + selection / reorder / rename)
 *  - "Properties" → PropertiesPanel (fill, stroke, shadow, typography, …)
 */

import { Tabs, Flex, Text } from '@radix-ui/themes';
import LayersPanel     from './LayersPanel';
import PropertiesPanel from './PropertiesPanel';

/**
 * Renders a two-tab interface (Layers / Properties).
 * No props required — data flows through LayersContext and PropertiesContext.
 */
export default function RightPanel() {
  return (
    <Tabs.Root
      defaultValue="layers"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Tabs.List>
        <Tabs.Trigger value="layers">
          <Text size="2">Layers</Text>
        </Tabs.Trigger>
        <Tabs.Trigger value="properties">
          <Text size="2">Properties</Text>
        </Tabs.Trigger>
      </Tabs.List>

      <Flex
        direction="column"
        style={{ flex: 1, minHeight: 0, overflow: 'hidden', paddingTop: 8 }}
      >
        <Tabs.Content
          value="layers"
          style={{ flex: 1, height: '100%', overflow: 'hidden' }}
        >
          <LayersPanel />
        </Tabs.Content>

        <Tabs.Content
          value="properties"
          style={{ flex: 1, height: '100%', overflow: 'hidden' }}
        >
          <PropertiesPanel />
        </Tabs.Content>
      </Flex>
    </Tabs.Root>
  );
}
