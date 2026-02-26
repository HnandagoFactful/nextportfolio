import { ICanvasStage } from "./types";

export default function CanvasStage({ containerRef, canvasElRef }: ICanvasStage) {
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      <canvas ref={canvasElRef} />
    </div>
  );
}
