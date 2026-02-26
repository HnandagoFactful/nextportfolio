import { Tabs, Flex, Text } from "@radix-ui/themes";
import LayersPanel from "./LayersPanel";
import PropertiesPanel from "./PropertiesPanel";
import { IRightPanel } from "./types";

export default function RightPanel({
  layers,
  selectedLayerId,
  properties,
  activeTool,
  onSelectLayer,
  onPropertyChange,
  onApply,
}: IRightPanel) {
  return (
    <Tabs.Root defaultValue="layers" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs.List>
        <Tabs.Trigger value="layers">
          <Text size="2">Layers</Text>
        </Tabs.Trigger>
        <Tabs.Trigger value="properties">
          <Text size="2">Properties</Text>
        </Tabs.Trigger>
      </Tabs.List>

      <Flex direction="column" style={{ flex: 1, minHeight: 0, overflow: 'hidden', paddingTop: 8 }}>
        <Tabs.Content value="layers" style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <LayersPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={onSelectLayer}
          />
        </Tabs.Content>
        <Tabs.Content value="properties" style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <PropertiesPanel
            properties={properties}
            activeTool={activeTool}
            onPropertyChange={onPropertyChange}
            onApply={onApply}
          />
        </Tabs.Content>
      </Flex>
    </Tabs.Root>
  );
}
