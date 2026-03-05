import Draggable from 'react-draggable';
import { useRef } from 'react';
import { kelvinToRgbString, lumensToGlowSize } from '../utils/lightUtils';

export default function LightFixture({ light, cellSize, isSelected, onSelect, onDragStop, canvasWidth, canvasHeight }) {
  const nodeRef = useRef(null);
  const color = kelvinToRgbString(light.kelvin);
  const glowSize = lumensToGlowSize(light.lumens, cellSize);
  const iconSize = Math.max(12, cellSize * 0.6);

  const bounds = {
    left: 0,
    top: 0,
    right: canvasWidth - cellSize,
    bottom: canvasHeight - cellSize,
  };

  const handleDragStop = (e, data) => {
    onDragStop(light.id, data.x, data.y);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(light.id);
  };

  const { r, g, b } = (() => {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) return { r: match[1], g: match[2], b: match[3] };
    return { r: 255, g: 200, b: 100 };
  })();

  const gradientStyle = {
    position: 'absolute',
    width: glowSize,
    height: glowSize,
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(${r},${g},${b},0.8) 0%, rgba(${r},${g},${b},0.4) 30%, rgba(${r},${g},${b},0.07) 70%, transparent 100%)`,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: light.x, y: light.y }}
      onStop={handleDragStop}
      bounds={bounds}
    >
      <div
        ref={nodeRef}
        style={{ position: 'absolute', width: cellSize, height: cellSize, cursor: 'grab', zIndex: isSelected ? 20 : 10 }}
        onClick={handleClick}
      >
        <div style={gradientStyle} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: iconSize,
            height: iconSize,
            borderRadius: '50%',
            background: color,
            border: isSelected ? '2px solid white' : `2px solid rgba(${r},${g},${b},0.8)`,
            boxShadow: `0 0 ${iconSize * 0.5}px ${color}`,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        {light.label && (
          <div
            style={{
              position: 'absolute',
              bottom: -18,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 9,
              color: '#ccc',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {light.label}
          </div>
        )}
      </div>
    </Draggable>
  );
}
