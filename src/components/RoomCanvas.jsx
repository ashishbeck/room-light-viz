import { useCallback } from 'react';
import LightFixture from './LightFixture';
import { generateId } from '../utils/lightUtils';
import { Plus } from 'lucide-react';

const MAX_WIDTH = 800;
const MAX_HEIGHT = 520;

export default function RoomCanvas({ room, lights, setLights, selectedLight, setSelectedLight }) {
  const cellSize = Math.floor(Math.min(MAX_WIDTH / room.length, MAX_HEIGHT / room.width));
  const canvasWidth = cellSize * room.length;
  const canvasHeight = cellSize * room.width;

  const handleCanvasClick = useCallback(() => {
    setSelectedLight(null);
  }, [setSelectedLight]);

  const handleAddLight = () => {
    const newLight = {
      id: generateId(),
      label: `Light ${lights.length + 1}`,
      lumens: 800,
      kelvin: 3000,
      x: Math.floor(canvasWidth / 2 - cellSize / 2),
      y: Math.floor(canvasHeight / 2 - cellSize / 2),
    };
    setLights((prev) => [...prev, newLight]);
    setSelectedLight(newLight.id);
  };

  const handleDragStop = useCallback((id, x, y) => {
    setLights((prev) =>
      prev.map((l) => (l.id === id ? { ...l, x, y } : l))
    );
  }, [setLights]);

  const handleSelect = useCallback((id) => {
    setSelectedLight(id);
  }, [setSelectedLight]);

  const gridLines = [];
  for (let x = 0; x <= room.length; x++) {
    gridLines.push(
      <line
        key={`v${x}`}
        x1={x * cellSize}
        y1={0}
        x2={x * cellSize}
        y2={canvasHeight}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
    );
  }
  for (let y = 0; y <= room.width; y++) {
    gridLines.push(
      <line
        key={`h${y}`}
        x1={0}
        y1={y * cellSize}
        x2={canvasWidth}
        y2={y * cellSize}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">{room.name}</h3>
          <p className="text-gray-400 text-xs">{room.length} ft × {room.width} ft · {room.type}</p>
        </div>
        <button
          onClick={handleAddLight}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Light
        </button>
      </div>
      <div
        className="relative border border-gray-700 rounded-xl overflow-hidden"
        style={{ width: canvasWidth, height: canvasHeight, background: '#111827', cursor: 'default' }}
        onClick={handleCanvasClick}
      >
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {gridLines}
        </svg>
        {lights.map((light) => (
          <LightFixture
            key={light.id}
            light={light}
            cellSize={cellSize}
            isSelected={selectedLight === light.id}
            onSelect={handleSelect}
            onDragStop={handleDragStop}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        ))}
        {lights.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-600 text-sm">Click &quot;Add Light&quot; to place a fixture</p>
          </div>
        )}
      </div>
    </div>
  );
}
