import type { CSSProperties } from 'react';
import type { VisualInterfacePreview } from '../../../../shared/site00-design-bench/grokTwinTestA/types.js';

export function GrokTwinTestAArtboard({
  preview,
  scale = 1,
  testId = 'twin-test-a-artboard',
}: {
  preview: VisualInterfacePreview;
  scale?: number;
  testId?: string;
}) {
  const layers = [...preview.layers].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  return (
    <div
      className="twin-test-a-artboard"
      data-testid={testId}
      style={{
        width: preview.frameWidth * scale,
        height: preview.frameHeight * scale,
        background: preview.background,
      }}
    >
      <div
        className="twin-test-a-artboard__canvas"
        style={{
          width: preview.frameWidth,
          height: preview.frameHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: preview.background,
        }}
      >
        {layers.map((layer) => {
          const style: CSSProperties = {
            position: 'absolute',
            left: layer.x,
            top: layer.y,
            width: layer.width,
            height: layer.height,
            background: layer.type === 'text' ? 'transparent' : layer.fill,
            border: layer.stroke ? `${layer.strokeWidth ?? 1}px solid ${layer.stroke}` : undefined,
            borderRadius: layer.radius,
            opacity: layer.opacity ?? 1,
            overflow: 'hidden',
            color: layer.textColor,
            fontFamily: layer.fontFamily ?? 'Martian Mono, ui-monospace, monospace',
            fontSize: layer.fontSize,
            fontWeight: layer.fontWeight,
            letterSpacing: layer.letterSpacing,
            lineHeight: layer.lineHeight ? `${layer.lineHeight}` : undefined,
            textAlign: layer.textAlign,
            textTransform: layer.textTransform,
            display: layer.type === 'text' ? 'flex' : undefined,
            alignItems: layer.type === 'text' ? 'center' : undefined,
            boxSizing: 'border-box',
          };
          if (layer.type === 'ellipse') style.borderRadius = '50%';
          if (layer.type === 'line') {
            style.height = layer.strokeWidth ?? 1;
            style.background = layer.stroke ?? layer.fill ?? '#000';
          }
          return (
            <div key={layer.id} data-layer-id={layer.id} data-layer-type={layer.type} style={style}>
              {layer.type === 'text' ? layer.text : null}
              {layer.type === 'image' ? (
                <span className="twin-test-a-artboard__image-slot" data-image-role={layer.imageRole}>
                  {layer.imageRole ?? 'IMAGE'}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
