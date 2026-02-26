import { useState, useRef, useEffect } from "react";
import { Flex, Text, IconButton, Tooltip, Checkbox, Button } from "@radix-ui/themes";
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, GroupIcon } from "@radix-ui/react-icons";
import { ILayersPanel } from "./types";

export default function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onRemoveLayer,
  onReorderLayer,
  onCheckLayers,
  onGroupChecked,
  onRenameLayer,
}: ILayersPanel) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const handleCheck = (id: string, checked: boolean) => {
    const next = new Set(checkedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setCheckedIds(next);
    onCheckLayers(Array.from(next));
  };

  const handleGroup = () => {
    const ids = Array.from(checkedIds);
    onGroupChecked(ids);
    setCheckedIds(new Set());
    onCheckLayers([]);
  };

  const startEditing = (id: string, currentLabel: string) => {
    setEditingId(id);
    setEditingLabel(currentLabel);
  };

  const commitEdit = () => {
    if (editingId) onRenameLayer(editingId, editingLabel);
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  if (layers.length === 0) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%', opacity: 0.5 }}>
        <Text size="2">No objects on canvas</Text>
      </Flex>
    );
  }

  const reversed = [...layers].reverse();

  return (
    <Flex direction="column" gap="1" style={{ height: '100%', overflow: 'hidden' }}>

      {checkedIds.size >= 2 && (
        <Button
          size="1"
          color="lime"
          variant="soft"
          onClick={handleGroup}
          style={{ marginBottom: 4, flexShrink: 0 }}
        >
          <GroupIcon />
          Group {checkedIds.size} layers
        </Button>
      )}

      <Flex direction="column" gap="1" style={{ flex: 1, overflowY: 'auto' }}>
        {reversed.map((layer, reversedIndex) => {
          const isSelected = layer.id === selectedLayerId;
          const isChecked  = checkedIds.has(layer.id);
          const isEditing  = editingId === layer.id;
          const isTop      = reversedIndex === 0;
          const isBottom   = reversedIndex === reversed.length - 1;

          return (
            <Flex
              key={layer.id}
              align="center"
              justify="between"
              gap="1"
              onClick={() => !isEditing && onSelectLayer(layer.id)}
              style={{
                padding: '4px 6px',
                borderRadius: '6px',
                cursor: isEditing ? 'default' : 'pointer',
                backgroundColor: isChecked
                  ? 'var(--lime-3)'
                  : isSelected
                  ? 'var(--lime-4)'
                  : 'var(--gray-2)',
                border: isChecked
                  ? '1px solid var(--lime-6)'
                  : isSelected
                  ? '1px solid var(--lime-8)'
                  : '1px solid transparent',
                userSelect: 'none',
              }}
            >
              {/* Checkbox — stopPropagation so clicking it doesn't also fire onSelectLayer */}
              <Flex align="center" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                <Checkbox
                  size="1"
                  color="lime"
                  checked={isChecked}
                  onCheckedChange={(v) => handleCheck(layer.id, !!v)}
                />
              </Flex>

              {/* Label — double-click to rename inline */}
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
                    if (e.key === 'Escape') cancelEdit();
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 'var(--font-size-2)',
                    background: 'var(--color-background)',
                    color: 'var(--gray-12)',
                    border: '1px solid var(--lime-7)',
                    borderRadius: 4,
                    padding: '1px 4px',
                    outline: 'none',
                  }}
                />
              ) : (
                <Text
                  size="2"
                  color={isSelected ? 'lime' : undefined}
                  weight={isSelected || isChecked ? 'bold' : 'regular'}
                  onDoubleClick={(e) => { e.stopPropagation(); startEditing(layer.id, layer.label); }}
                  style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 4 }}
                >
                  {layer.label}
                </Text>
              )}

              <Flex gap="1" onClick={(e) => e.stopPropagation()}>
                <Tooltip content="Move up">
                  <IconButton size="1" variant="ghost" color="gray" disabled={isTop}
                    onClick={() => onReorderLayer(layer.id, 'up')} aria-label="Move layer up">
                    <ChevronUpIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Move down">
                  <IconButton size="1" variant="ghost" color="gray" disabled={isBottom}
                    onClick={() => onReorderLayer(layer.id, 'down')} aria-label="Move layer down">
                    <ChevronDownIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Remove">
                  <IconButton size="1" variant="ghost" color="red"
                    onClick={() => onRemoveLayer(layer.id)} aria-label="Remove layer">
                    <TrashIcon />
                  </IconButton>
                </Tooltip>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
