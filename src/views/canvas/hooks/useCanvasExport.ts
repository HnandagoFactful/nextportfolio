/**
 * useCanvasExport
 *
 * Provides stable callbacks to download the Fabric canvas as PNG, JPEG, or PDF.
 *
 * PDF is generated without external libraries by constructing a minimal
 * single-page PDF spec (PDF 1.4) around the JPEG image bytes.
 * The MediaBox uses the canvas's pixel dimensions so the page matches the
 * canvas exactly. All three functions deselect active objects first so
 * selection handles are not baked into the export.
 */

import { useCallback, RefObject } from 'react';
import type { Canvas as FabricCanvas } from 'fabric';

// ── Helpers ────────────────────────────────────────────────────────────────────

function triggerDownload(url: string, filename: string, isObjectUrl = false) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (isObjectUrl) URL.revokeObjectURL(url);
}

/**
 * Builds a minimal valid PDF (1.4) Uint8Array containing a single JPEG page.
 *
 * Structure:
 *   obj 1 — Catalog
 *   obj 2 — Pages
 *   obj 3 — Page  (MediaBox = canvas pixel dimensions)
 *   obj 4 — Image XObject (DCTDecode = raw JPEG bytes)
 *   obj 5 — Content stream  (places image to fill the page)
 *   xref table + trailer
 */
function buildJpegPdf(jpegBytes: Uint8Array, canvasW: number, canvasH: number): Uint8Array {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const objOffsets: number[] = [];
  let pos = 0;

  const pushStr = (s: string) => {
    const b = enc.encode(s);
    chunks.push(b);
    pos += b.length;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    pos += b.length;
  };
  const trackObj = () => objOffsets.push(pos);

  // Header
  pushStr('%PDF-1.4\n');

  // obj 1 — Catalog
  trackObj();
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // obj 2 — Pages
  trackObj();
  pushStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // obj 3 — Page
  const w = Math.round(canvasW);
  const h = Math.round(canvasH);
  trackObj();
  pushStr(
    `3 0 obj\n` +
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}]\n` +
    `   /Resources << /XObject << /Im0 4 0 R >> >>\n` +
    `   /Contents 5 0 R\n` +
    `>>\nendobj\n`,
  );

  // obj 4 — JPEG image XObject
  trackObj();
  pushStr(
    `4 0 obj\n` +
    `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h}\n` +
    `   /ColorSpace /DeviceRGB /BitsPerComponent 8\n` +
    `   /Filter /DCTDecode /Length ${jpegBytes.length}\n` +
    `>>\nstream\n`,
  );
  pushBytes(jpegBytes);
  pushStr('\nendstream\nendobj\n');

  // obj 5 — Content stream: place image to fill the whole page.
  // The transform  q W 0 0 H 0 0 cm  maps the unit image square to [0,0,W,H].
  trackObj();
  const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q\n`;
  pushStr(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);

  // xref table — each entry is exactly 20 bytes: nnnnnnnnnn ggggg n \r\n
  const xrefStart = pos;
  const pad = (n: number) => String(n).padStart(10, '0');
  // free object 0 entry
  let xref = `xref\n0 6\n0000000000 65535 f \r\n`;
  for (const off of objOffsets) {
    xref += `${pad(off)} 00000 n \r\n`;
  }
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  pushStr(xref);

  // Concatenate all chunks into one Uint8Array
  const result = new Uint8Array(pos);
  let cursor = 0;
  for (const chunk of chunks) {
    result.set(chunk, cursor);
    cursor += chunk.length;
  }
  return result;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useCanvasExport(canvasRef: RefObject<FabricCanvas | null>) {
  /** Deselect all objects so handles aren't baked into the export. */
  const withDeselect = (canvas: FabricCanvas, fn: () => void) => {
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    fn();
  };

  const downloadAsPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    withDeselect(canvas, () => {
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
      triggerDownload(dataUrl, 'canvas.png');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  const downloadAsJpeg = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    withDeselect(canvas, () => {
      const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.92, multiplier: 1 });
      triggerDownload(dataUrl, 'canvas.jpg');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  const downloadAsPdf = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    withDeselect(canvas, () => {
      const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.92, multiplier: 1 });

      // Decode base64 → raw JPEG bytes
      const base64 = dataUrl.split(',')[1];
      const bin = atob(base64);
      const jpegBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) jpegBytes[i] = bin.charCodeAt(i);

      const pdfBytes = buildJpegPdf(jpegBytes, canvas.width ?? 800, canvas.height ?? 600);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      triggerDownload(URL.createObjectURL(blob), 'canvas.pdf', true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  return { downloadAsPng, downloadAsJpeg, downloadAsPdf };
}
