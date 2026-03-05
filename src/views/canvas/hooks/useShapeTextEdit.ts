/**
 * useShapeTextEdit
 *
 * Double-click any non-text, non-arrow shape to add/edit a centred text label.
 *
 * Lifecycle
 * ─────────
 *  1. dblclick plain shape  → create IText (linked via canvasTextOwnerId), enter editing
 *  2. dblclick same shape   → re-enter editing on existing linked IText
 *  3. editing:exited
 *       empty text  → remove IText (no group created)
 *       non-empty   → group(shape, IText) with canvasShapeTextGroup flag
 *  4. dblclick shape-text group → ungroup (restoring absolute coords), re-enter editing
 *
 * Ungrouping uses canvas.toActiveSelection() (Fabric's official API) so child
 * group-references are cleared and canvas-space positions are restored correctly.
 */

import { useEffect, useRef, type RefObject } from 'react';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import { assignId } from '../canvasUtils';
import type { CanvasTool } from '@/providers/CanvasProvider';

type WithMeta = FabricObject & {
  canvasId?: string;
  canvasTextOwnerId?: string;
  canvasTextShouldGroup?: boolean; // set only on IText created via Case 3 (new label)
  canvasArrowType?: string;
  canvasShapeTextGroup?: boolean;
};

const SKIP_TYPES = new Set([
  'i-text', 'text', 'textbox',
  'line',
  'active-selection',
]);

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Remove a Fabric Group from the canvas and place its children back as
 * independent top-level objects.
 *
 * IMPORTANT: after canvas.remove(group), each child still holds a `group`
 * back-reference to the (now-removed) parent.  Fabric v6's renderer skips
 * any object whose `group` property is non-null, so we must clear it before
 * calling canvas.add() — otherwise the items are on the internal object list
 * but never painted (the "shape disappears" bug).
 */
function ungroupToCanvas(canvas: FabricCanvas, group: FabricObject): FabricObject[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = group as any;
  const items: FabricObject[] = (g.getObjects() as FabricObject[]).slice();

  // Snapshot BEFORE removing the group.
  // In Fabric.js v6, getCenterPoint() already applies the parent group's
  // transform and returns the canvas-space centre — no matrix multiply needed.
  // Multiplying by calcTransformMatrix() again would double-transform and
  // land the item at a wrong ("random") location.
  const snapshots = items.map((item) => {
    const ctr = item.getCenterPoint(); // canvas-space centre ✓
    return {
      item,
      cx:     ctr.x,
      cy:     ctr.y,
      scaleX: (item.scaleX ?? 1) * (g.scaleX ?? 1),
      scaleY: (item.scaleY ?? 1) * (g.scaleY ?? 1),
      angle:  (item.angle  ?? 0) + (g.angle  ?? 0),
    };
  });

  canvas.remove(group);

  for (const { item, cx, cy, scaleX, scaleY, angle } of snapshots) {
    // Clear the stale parent-group reference so Fabric v6's renderer treats
    // this object as a top-level canvas item and actually paints it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item as any).group = undefined;
    item.set({ left: cx, top: cy, originX: 'center', originY: 'center', scaleX, scaleY, angle });
    item.setCoords();
    canvas.add(item);
  }
  return items;
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useShapeTextEdit(
  canvasRef: RefObject<FabricCanvas | null>,
  canvasReady: boolean,
  activeTool: CanvasTool,
) {
  const activeToolRef = useRef(activeTool);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady) return;

    // ── dblclick handler ──────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onDblClick = async (e: any) => {
      if (activeToolRef.current !== 'select') return;

      const target = e.target as WithMeta | undefined;
      if (!target) return;
      if (target.canvasArrowType === 'arrow') return;

      // ── Case 1: double-click a shape+text group → ungroup and re-edit ──────
      if (target.type === 'group' && target.canvasShapeTextGroup) {
        // Capture child refs NOW (before the timeout) while they're still
        // accessible via getObjects(). The setTimeout defers the actual work
        // until Fabric finishes its own dblclick handling.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const children = ((target as any).getObjects() as FabricObject[]);
        const capturedTxt   = children.find((o: FabricObject) => o.type === 'i-text') as (WithMeta & { text?: string }) | undefined;
        const capturedShape = children.find((o: FabricObject) => o.type !== 'i-text') as WithMeta | undefined;
        const capturedGroup = target;

        setTimeout(() => {
          const cv = canvasRef.current;
          if (!cv) return;
          if (!cv.getObjects().includes(capturedGroup)) return; // already removed

          // Ungroup: clears item.group back-references and restores canvas positions.
          ungroupToCanvas(cv, capturedGroup);

          // Restore link so onEditExited can re-group on exit
          if (capturedTxt && capturedShape?.canvasId) {
            capturedTxt.canvasTextOwnerId = capturedShape.canvasId;
          }

          if (capturedTxt) {
            capturedTxt.set({ selectable: true, evented: true });
            capturedShape?.set({ selectable: true, evented: true });
            cv.setActiveObject(capturedTxt);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const t = capturedTxt as any;
            t.enterEditing();
            // Place cursor at end so the user can continue typing
            const len = (t.text as string)?.length ?? 0;
            t.selectionStart = len;
            t.selectionEnd   = len;
            cv.requestRenderAll();
          }
        }, 0);
        return;
      }

      // ── Skip non-shape types (but allow 'path' — flowchart symbols) ────────
      if (SKIP_TYPES.has(target.type ?? '') || target.type === 'group') return;

      const { IText } = await import('fabric');
      const center   = target.getCenterPoint();
      const ownerId  = target.canvasId;

      // ── Case 2: linked IText already on canvas → re-enter editing ──────────
      if (ownerId) {
        const existing = canvas.getObjects().find(
          (o) => (o as WithMeta).canvasTextOwnerId === ownerId,
        ) as (FabricObject & { text?: string }) | undefined;

        if (existing && (existing.type === 'i-text' || existing.type === 'textbox')) {
          canvas.setActiveObject(existing);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (existing as any).enterEditing();
          canvas.requestRenderAll();
          return;
        }
      }

      // ── Case 3: no label yet → create IText and enter editing ──────────────
      const lbl = new IText('', {
        left:       center.x,
        top:        center.y,
        originX:    'center',
        originY:    'center',
        fontSize:   14,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill:       '#e2e8f0',
        textAlign:  'center',
        editable:   true,
      });
      assignId(lbl);
      if (ownerId) {
        (lbl as WithMeta).canvasTextOwnerId  = ownerId;
        (lbl as WithMeta).canvasTextShouldGroup = true; // mark for grouping on exit
      }

      canvas.add(lbl);
      canvas.setActiveObject(lbl);
      lbl.enterEditing();
      canvas.requestRenderAll();
    };

    // ── editing:exited handler ────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onEditExited = (e: any) => {
      const lbl = e.target as (WithMeta & { text?: string }) | undefined;
      // Only group when the label was freshly created (Case 3).
      // Pre-existing labels (e.g. flowchart template boxes) keep shape + label separate
      // so that arrow connections continue to track the shape by canvasId.
      if (!lbl?.canvasTextOwnerId || !lbl?.canvasTextShouldGroup) return;

      const text = (lbl.text ?? '').trim();

      if (!text) {
        // Empty → discard without grouping
        canvas.remove(lbl);
        canvas.requestRenderAll();
        return;
      }

      // Defer grouping so the editing-exit event fully settles first
      const ownerId = lbl.canvasTextOwnerId;
      setTimeout(async () => {
        const cv = canvasRef.current;
        if (!cv) return;

        // Guard: label might have been removed by the time this runs
        if (!cv.getObjects().includes(lbl)) return;

        const shape = cv.getObjects().find(
          (o) => (o as WithMeta).canvasId === ownerId,
        );
        if (!shape) return;

        const { Group } = await import('fabric');
        cv.discardActiveObject();
        cv.remove(shape);
        cv.remove(lbl);

        const group = new Group([shape, lbl]);
        assignId(group);
        (group as WithMeta).canvasShapeTextGroup = true;

        cv.add(group);
        cv.setActiveObject(group);
        cv.requestRenderAll();
      }, 0);
    };

    canvas.on('mouse:dblclick',      onDblClick);
    canvas.on('text:editing:exited', onEditExited);

    return () => {
      canvas.off('mouse:dblclick',      onDblClick);
      canvas.off('text:editing:exited', onEditExited);
    };
  }, [canvasRef, canvasReady]);
}
