import { Flex, Text, Button, Checkbox, Separator } from "@radix-ui/themes";
import { FontBoldIcon, FontItalicIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { IPropertiesPanel } from "./types";

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
  'Courier New', 'Verdana', 'Trebuchet MS', 'Impact',
];

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
  layers,
  selectedLayerId,
  textPathId,
  textPathOffset,
  onPropertyChange,
  onApply,
  onApplyTextOnPath,
  onOpenPathDrawer,
}: IPropertiesPanel) {
  const showFill = activeTool !== 'pencil' && activeTool !== 'line';
  const showBrush = activeTool === 'pencil';
  const showShadow = !['pencil', 'line', 'image', 'video', 'select'].includes(activeTool);
  const shadowEnabled = properties.shadow.blur > 0 || properties.shadow.offsetX !== 0 || properties.shadow.offsetY !== 0;

  const selectedLayerType = layers.find(l => l.id === selectedLayerId)?.type;
  const isTextSelected = selectedLayerType === 'i-text' || selectedLayerType === 'text';
  const showTypography = activeTool === 'text' || isTextSelected;
  const showTextOnPath = selectedLayerType === 'i-text';

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

      {showTypography && (
        <>
          <Separator size="4" />
          <Text size="1" weight="bold" color="lime">Typography</Text>
          <Flex align="center" justify="between" gap="2">
            <Text size="1" style={{ minWidth: 80 }}>Font</Text>
            <select
              value={properties.fontFamily}
              onChange={(e) => onPropertyChange({ fontFamily: e.target.value })}
              style={{
                flex: 1,
                padding: '4px 6px',
                borderRadius: 4,
                border: '1px solid var(--gray-6)',
                backgroundColor: 'var(--gray-2)',
                color: 'inherit',
                fontSize: 12,
              }}
            >
              {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Flex>
          <NumberInput
            label="Font Size"
            value={properties.fontSize}
            min={1}
            max={400}
            onChange={(v) => onPropertyChange({ fontSize: v })}
          />
          <Flex align="center" justify="between" gap="2">
            <Text size="1" style={{ minWidth: 80 }}>Style</Text>
            <Flex gap="1">
              <Button
                size="1"
                variant={properties.fontWeight === 'bold' ? 'solid' : 'surface'}
                color="lime"
                onClick={() => onPropertyChange({ fontWeight: properties.fontWeight === 'bold' ? 'normal' : 'bold' })}
                title="Bold"
              >
                <FontBoldIcon />
              </Button>
              <Button
                size="1"
                variant={properties.fontStyle === 'italic' ? 'solid' : 'surface'}
                color="lime"
                onClick={() => onPropertyChange({ fontStyle: properties.fontStyle === 'italic' ? 'normal' : 'italic' })}
                title="Italic"
              >
                <FontItalicIcon />
              </Button>
            </Flex>
          </Flex>
        </>
      )}

      {showTextOnPath && (
        <>
          <Separator size="4" />
          <Text size="1" weight="bold" color="lime">Text on Path</Text>
          <Flex gap="2">
            <Button
              size="1"
              variant="soft"
              color="lime"
              style={{ flex: 1 }}
              onClick={onOpenPathDrawer}
            >
              <Pencil1Icon />
              {textPathId ? 'Redraw Path' : 'Draw Path'}
            </Button>
            {textPathId && (
              <Button
                size="1"
                variant="ghost"
                color="red"
                onClick={() => onApplyTextOnPath(null, 0)}
              >
                Remove
              </Button>
            )}
          </Flex>
          {textPathId && (
            <NumberInput
              label="Path Offset"
              value={textPathOffset}
              min={0}
              max={2000}
              onChange={(v) => onApplyTextOnPath(textPathId, v)}
            />
          )}
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
