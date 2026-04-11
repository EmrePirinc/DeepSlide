// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import React from 'react';
import type { LineObject as LineObjectType } from '@/types/slide-object';

interface LineObjectProps {
  object: LineObjectType;
  zoom: number;
  isSelected: boolean;
}

export const LineObjectRender = React.memo(function LineObjectRender({
  object,
  zoom,
  isSelected,
}: LineObjectProps) {
  const x1 = object.startX * zoom;
  const y1 = object.startY * zoom;
  const x2 = object.endX * zoom;
  const y2 = object.endY * zoom;

  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const svgW = Math.abs(x2 - x1) + 40;
  const svgH = Math.abs(y2 - y1) + 40;
  const pad = 20;

  const arrowId = `arrow-${object.id}`;
  const arrowStartId = `arrow-start-${object.id}`;

  const getArrowMarker = (id: string, type: string, color: string, reverse = false) => {
    if (type === 'none') return null;
    switch (type) {
      case 'triangle':
        return (
          <marker id={id} markerWidth="12" markerHeight="8" refX={reverse ? 0 : 12} refY="4" orient="auto-start-reverse">
            <polygon points="0 0, 12 4, 0 8" fill={color} />
          </marker>
        );
      case 'circle':
        return (
          <marker id={id} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <circle cx="4" cy="4" r="3" fill={color} />
          </marker>
        );
      case 'square':
        return (
          <marker id={id} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <rect x="1" y="1" width="6" height="6" fill={color} />
          </marker>
        );
      case 'diamond':
        return (
          <marker id={id} markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <polygon points="5 0, 10 5, 5 10, 0 5" fill={color} />
          </marker>
        );
      default:
        return null;
    }
  };

  const dashArray = object.stroke.style === 'dashed' ? '10 5' :
                    object.stroke.style === 'dotted' ? '3 3' : undefined;

  // Dirsek bağlayıcı (elbow) — 90° kırılma
  const isElbow = object.lineType === 'elbow';
  const elbowPath = isElbow
    ? `M ${x1 - minX + pad} ${y1 - minY + pad} H ${(x1 + x2) / 2 - minX + pad} V ${y2 - minY + pad} H ${x2 - minX + pad}`
    : undefined;

  return (
    <svg
      width={svgW}
      height={svgH}
      style={{
        position: 'absolute',
        left: minX - pad,
        top: minY - pad,
        pointerEvents: 'none',
        zIndex: object.zIndex,
      }}
    >
      <defs>
        {getArrowMarker(arrowId, object.endArrow, object.stroke.color)}
        {getArrowMarker(arrowStartId, object.startArrow, object.stroke.color, true)}
      </defs>

      {/* Seçim alanı (görünmez, tıklanabilir) */}
      {isElbow ? (
        <path
          d={elbowPath}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(object.stroke.width * zoom + 10, 15)}
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        />
      ) : (
        <line
          x1={x1 - minX + pad}
          y1={y1 - minY + pad}
          x2={x2 - minX + pad}
          y2={y2 - minY + pad}
          stroke="transparent"
          strokeWidth={Math.max(object.stroke.width * zoom + 10, 15)}
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        />
      )}

      {/* Asıl çizgi */}
      {isElbow ? (
        <path
          d={elbowPath}
          fill="none"
          stroke={object.stroke.color}
          strokeWidth={object.stroke.width * zoom}
          strokeDasharray={dashArray}
          markerEnd={object.endArrow !== 'none' ? `url(#${arrowId})` : undefined}
          markerStart={object.startArrow !== 'none' ? `url(#${arrowStartId})` : undefined}
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <line
          x1={x1 - minX + pad}
          y1={y1 - minY + pad}
          x2={x2 - minX + pad}
          y2={y2 - minY + pad}
          stroke={object.stroke.color}
          strokeWidth={object.stroke.width * zoom}
          strokeDasharray={dashArray}
          markerEnd={object.endArrow !== 'none' ? `url(#${arrowId})` : undefined}
          markerStart={object.startArrow !== 'none' ? `url(#${arrowStartId})` : undefined}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Seçim göstergesi — uç noktalar */}
      {isSelected && (
        <>
          <circle cx={x1 - minX + pad} cy={y1 - minY + pad} r={5} fill="white" stroke="#6366F1" strokeWidth={2} style={{ pointerEvents: 'auto', cursor: 'move' }} />
          <circle cx={x2 - minX + pad} cy={y2 - minY + pad} r={5} fill="white" stroke="#6366F1" strokeWidth={2} style={{ pointerEvents: 'auto', cursor: 'move' }} />
        </>
      )}
    </svg>
  );
});
