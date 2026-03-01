/**
 * LayersPanel
 *
 * Displays the stack of Fabric canvas objects as a list and provides
 * controls for selecting, reordering, renaming, removing, and grouping them.
 *
 * Data source: LayersContext (no props required).
 * This removes the CanvasViewer → RightPanel → LayersPanel prop-drilling chain.
 *
 * Local state:
 *  - checkedIds: the set of layer IDs currently checked for multi-select/group
 *  - editingId / editingLabel: inline rename UI state
 *
 * Interaction model:
 *  - Single click → select layer (sets active Fabric object)
 *  - Checkbox → add to checked set (creates temporary ActiveSelection)
 *  - Double-click label → inline rename (committed on blur or Enter)
 *  - ↑ / ↓ buttons → z-order reorder
 *  - Trash → remove from canvas
 *  - "Group N layers" button (shown when ≥ 2 checked) → permanent fabric.Group
 */

import { useState, useRef, useEffect } from 'react';
import { Flex, Text, IconButton, Tooltip, Checkbox, Button } from '@radix-ui/themes';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  GroupIcon,
} from '@radix-ui/react-icons';
import { useLayersContext } from './LayersContext';

/**
 * Renders the layers list. Subscribes to LayersContext for all data and ops.
 */
export default function LayersPanel() {
  const {
    layers,
    selectedLayerId,
    selectLayerById,
    removeLayerById,
    reorderLayerById,
    handleCheckLayers,
    handleGroupChecked,
    renameLayerById,
  } = useLayersContext();

  // ── Local UI state ─────────────────────────────────────────────────────────

  /** IDs of layers whose checkboxes are currently ticked. */
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  /** ID of the layer whose label is being edited inline, or null. */
  const [editingId, setEditingId] = useState<string | null>(null);

  /** Draft text for the inline rename input. */
  const [editingLabel, setEditingLabel] = useState('');

  /** Ref to the rename <input> so we can focus it programmatically. */
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the rename input as soon as it mounts.
  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Toggle a single layer's checked state and notify the context. */
  const handleCheck = (id: string, checked: boolean) => {
    const next = new Set(checkedIds);
    if (checked) { next.add(id); } else { next.delete(id); }
    setCheckedIds(next);
    handleCheckLayers(Array.from(next));
  };

  /** Group all checked layers and reset the check state. */
  const handleGroup = () => {
    handleGroupChecked(Array.from(checkedIds));
    setCheckedIds(new Set());
    handleCheckLayers([]);
  };

  /** Open the inline rename editor for a layer. */
  const startEditing = (id: string, currentLabel: string) => {
    setEditingId(id);
    setEditingLabel(currentLabel);
  };

  /** Commit the in-progress rename and close the editor. */
  const commitEdit = () => {
    if (editingId) renameLayerById(editingId, editingLabel);
    setEditingId(null);
  };

  /** Cancel the in-progress rename without saving. */
  const cancelEdit = () => setEditingId(null);

  // ── Empty state ────────────────────────────────────────────────────────────

  if (layers.length === 0) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%', opacity: 0.5 }}>
        <Text size="2">No objects on canvas</Text>
      </Flex>
    );
  }

  // Reverse so the topmost layer (highest z-index) appears at the top of the list.
  const reversed = [...layers].reverse();

  return (
    <Flex direction="column" gap="1" style={{ height: '100%', overflow: 'hidden' }}>

      {/* Group button — appears when 2 or more layers are checked */}
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
              onClick={() => !isEditing && selectLayerById(layer.id)}
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
              {/* Checkbox — stopPropagation prevents triggering selectLayerById */}
              <Flex
                align="center"
                onClick={(e) => e.stopPropagation()}
                style={{ flexShrink: 0 }}
              >
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
                    if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); }
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
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditing(layer.id, layer.label);
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingLeft: 4,
                  }}
                >
                  {layer.label}
                </Text>
              )}

              {/* z-order + remove controls — stopPropagation prevents row selection */}
              <Flex gap="1" onClick={(e) => e.stopPropagation()}>
                <Tooltip content="Move up">
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    disabled={isTop}
                    onClick={() => reorderLayerById(layer.id, 'up')}
                    aria-label="Move layer up"
                  >
                    <ChevronUpIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Move down">
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    disabled={isBottom}
                    onClick={() => reorderLayerById(layer.id, 'down')}
                    aria-label="Move layer down"
                  >
                    <ChevronDownIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Remove">
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="red"
                    onClick={() => removeLayerById(layer.id)}
                    aria-label="Remove layer"
                  >
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
