import { Flex, Text, Button, Checkbox, Separator } from "@radix-ui/themes";
import { IPropertiesPanel } from "./types";

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <Flex align="center" justify="between" gap="2">
      <Text size="1" style={{ minWidth: 80 }}>{label}</Text>
      <Flex align="center" gap="2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 32, height: 28, padding: 2, border: 'none', borderRadius: 4, cursor: 'pointer' }}
        />
        <Text size="1" color="gray">{value}</Text>
      </Flex>
    </Flex>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}) {
  return (
    <Flex align="center" justify="between" gap="2">
      <Text size="1" style={{ minWidth: 80 }}>{label}</Text>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: 70,
          padding: '4px 6px',
          borderRadius: 4,
          border: '1px solid var(--gray-6)',
          backgroundColor: 'var(--gray-2)',
          color: 'inherit',
          fontSize: 12,
        }}
      />
    </Flex>
  );
}

export default function PropertiesPanel({
  properties,
  activeTool,
  onPropertyChange,
  onApply,
}: IPropertiesPanel) {
  const showFill = activeTool !== 'pencil' && activeTool !== 'line';
  const showBrush = activeTool === 'pencil';
  const showShadow = !['pencil', 'line', 'image', 'video', 'select'].includes(activeTool);
  const shadowEnabled = properties.shadow.blur > 0 || properties.shadow.offsetX !== 0 || properties.shadow.offsetY !== 0;

  return (
    <Flex direction="column" gap="3" style={{ overflowY: 'auto', height: '100%', padding: '4px 2px' }}>
      {showFill && (
        <ColorInput
          label="Fill"
          value={properties.fillColor}
          onChange={(v) => onPropertyChange({ fillColor: v })}
        />
      )}

      <ColorInput
        label="Stroke"
        value={properties.strokeColor}
        onChange={(v) => onPropertyChange({ strokeColor: v })}
      />

      <NumberInput
        label="Stroke Width"
        value={properties.strokeWidth}
        min={0}
        max={50}
        onChange={(v) => onPropertyChange({ strokeWidth: v })}
      />

      <NumberInput
        label="Opacity %"
        value={Math.round(properties.opacity * 100)}
        min={0}
        max={100}
        onChange={(v) => onPropertyChange({ opacity: v / 100 })}
      />

      {showShadow && (
        <>
          <Separator size="4" />
          <Flex align="center" gap="2">
            <Checkbox
              checked={shadowEnabled}
              onCheckedChange={(checked) => {
                if (!checked) {
                  onPropertyChange({ shadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 } });
                } else {
                  onPropertyChange({ shadow: { ...properties.shadow, blur: 10 } });
                }
              }}
              color="lime"
            />
            <Text size="1">Shadow</Text>
          </Flex>
          {shadowEnabled && (
            <Flex direction="column" gap="2">
              <ColorInput
                label="Shadow Color"
                value={properties.shadow.color}
                onChange={(v) => onPropertyChange({ shadow: { ...properties.shadow, color: v } })}
              />
              <NumberInput
                label="Blur"
                value={properties.shadow.blur}
                min={0}
                max={100}
                onChange={(v) => onPropertyChange({ shadow: { ...properties.shadow, blur: v } })}
              />
              <NumberInput
                label="Offset X"
                value={properties.shadow.offsetX}
                min={-100}
                max={100}
                onChange={(v) => onPropertyChange({ shadow: { ...properties.shadow, offsetX: v } })}
              />
              <NumberInput
                label="Offset Y"
                value={properties.shadow.offsetY}
                min={-100}
                max={100}
                onChange={(v) => onPropertyChange({ shadow: { ...properties.shadow, offsetY: v } })}
              />
            </Flex>
          )}
        </>
      )}

      {showBrush && (
        <>
          <Separator size="4" />
          <ColorInput
            label="Brush Color"
            value={properties.brushColor}
            onChange={(v) => onPropertyChange({ brushColor: v })}
          />
          <NumberInput
            label="Thickness"
            value={properties.brushWidth}
            min={1}
            max={100}
            onChange={(v) => onPropertyChange({ brushWidth: v })}
          />
        </>
      )}

      {activeTool !== 'pencil' && (
        <Button
          color="lime"
          variant="soft"
          size="2"
          onClick={onApply}
          className="!mt-2"
        >
          Apply to Selection
        </Button>
      )}
    </Flex>
  );
}
