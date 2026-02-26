import { Flex, Text, Box } from "@radix-ui/themes";
import { ILayersPanel } from "./types";

export default function LayersPanel({ layers, selectedLayerId, onSelectLayer }: ILayersPanel) {
  if (layers.length === 0) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%', opacity: 0.5 }}>
        <Text size="2">No objects on canvas</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="1" style={{ height: '100%', overflowY: 'auto' }}>
      {[...layers].reverse().map((layer) => {
        const isSelected = layer.id === selectedLayerId;
        return (
          <Box
            key={layer.id}
            onClick={() => onSelectLayer(layer.id)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: isSelected
                ? 'var(--lime-4)'
                : 'var(--gray-2)',
              border: isSelected ? '1px solid var(--lime-8)' : '1px solid transparent',
              userSelect: 'none',
            }}
          >
            <Text size="2" color={isSelected ? 'lime' : undefined} weight={isSelected ? 'bold' : 'regular'}>
              {layer.label}
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
}
