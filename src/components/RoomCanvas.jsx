import { useCallback, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import LightFixture from './LightFixture';
import { generateId } from '../utils/lightUtils';
import { Plus, Download, Copy, Clipboard, MousePointerClick } from 'lucide-react';

const MAX_WIDTH = 800;
const MAX_HEIGHT = 520;

export default function RoomCanvas({ room, lights, setLights, selectedIds, setSelectedIds, clipboard, setClipboard, canvasRef }) {
  const cellSize = Math.floor(Math.min(MAX_WIDTH / room.length, MAX_HEIGHT / room.width));
  const canvasWidth = cellSize * room.length;
  const canvasHeight = cellSize * room.width;
  const wrapperRef = useRef(null);
  const dragStartPositions = useRef(null);

  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef?.current || e.target.closest('svg')) {
      setSelectedIds([]);
    }
  }, [setSelectedIds, canvasRef]);

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
    setSelectedIds([newLight.id]);
  };

  const handleExport = useCallback(async () => {
    const node = canvasRef?.current;
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { backgroundColor: '#111827', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${room.name.replace(/\s+/g, '-').toLowerCase() || 'room'}-layout.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  }, [canvasRef, room.name]);

  const clampPosition = useCallback((x, y) => ({
    x: Math.max(0, Math.min(canvasWidth - cellSize, x)),
    y: Math.max(0, Math.min(canvasHeight - cellSize, y)),
  }), [canvasWidth, canvasHeight, cellSize]);

  const handleDragStart = useCallback((id) => {
    const positions = {};
    lights.forEach((l) => {
      if (selectedIds.includes(l.id)) {
        positions[l.id] = { x: l.x, y: l.y };
      }
    });
    dragStartPositions.current = { draggedId: id, positions };
  }, [lights, selectedIds]);

  const handleDrag = useCallback((id, x, y) => {
    const start = dragStartPositions.current;
    if (!start || start.draggedId !== id || !selectedIds.includes(id) || selectedIds.length <= 1) return;

    const dx = x - start.positions[id].x;
    const dy = y - start.positions[id].y;

    setLights((prev) =>
      prev.map((l) => {
        if (l.id === id) return l; // dragged light is managed by react-draggable
        if (selectedIds.includes(l.id) && start.positions[l.id]) {
          const clamped = clampPosition(
            start.positions[l.id].x + dx,
            start.positions[l.id].y + dy
          );
          return { ...l, x: clamped.x, y: clamped.y };
        }
        return l;
      })
    );
  }, [selectedIds, setLights, clampPosition]);

  const handleDragStop = useCallback((id, x, y) => {
    const start = dragStartPositions.current;
    if (start && start.draggedId === id && selectedIds.includes(id) && selectedIds.length > 1) {
      const dx = x - start.positions[id].x;
      const dy = y - start.positions[id].y;
      setLights((prev) =>
        prev.map((l) => {
          if (l.id === id) return { ...l, x, y };
          if (selectedIds.includes(l.id) && start.positions[l.id]) {
            const clamped = clampPosition(
              start.positions[l.id].x + dx,
              start.positions[l.id].y + dy
            );
            return { ...l, x: clamped.x, y: clamped.y };
          }
          return l;
        })
      );
    } else {
      setLights((prev) =>
        prev.map((l) => (l.id === id ? { ...l, x, y } : l))
      );
    }
    dragStartPositions.current = null;
  }, [selectedIds, setLights, clampPosition]);

  const handleSelect = useCallback((id, e) => {
    const isMultiSelect = e?.ctrlKey || e?.metaKey;
    if (isMultiSelect) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  }, [setSelectedIds]);

  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const toCopy = lights.filter((l) => selectedIds.includes(l.id)).map(({ id, ...rest }) => rest);
    setClipboard(toCopy);
  }, [lights, selectedIds, setClipboard]);

  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return;
    const offset = 20;
    const newLights = clipboard.map((l) => {
      const clamped = clampPosition(l.x + offset, l.y + offset);
      return {
        ...l,
        id: generateId(),
        label: `${l.label} (copy)`,
        x: clamped.x,
        y: clamped.y,
      };
    });
    setLights((prev) => [...prev, ...newLights]);
    setSelectedIds(newLights.map((l) => l.id));
  }, [clipboard, setLights, setSelectedIds, clampPosition]);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(lights.map((l) => l.id));
  }, [lights, setSelectedIds]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setLights((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
    setSelectedIds([]);
  }, [selectedIds, setLights, setSelectedIds]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const handleKeyDown = (e) => {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if (isMod && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (isMod && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handlePaste, handleSelectAll, handleDeleteSelected]);

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
    <div className="flex flex-col gap-3" ref={wrapperRef} tabIndex={-1} style={{ outline: 'none' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">{room.name}</h3>
          <p className="text-gray-400 text-xs">{room.length} ft × {room.width} ft · {room.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            disabled={lights.length === 0}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 font-medium rounded-lg px-3 py-2 text-sm transition-colors"
            title="Select all lights (Ctrl+A)"
          >
            <MousePointerClick className="w-4 h-4" />
            Select All
          </button>
          <button
            onClick={handleCopy}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 font-medium rounded-lg px-3 py-2 text-sm transition-colors"
            title="Copy selected lights (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handlePaste}
            disabled={clipboard.length === 0}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 font-medium rounded-lg px-3 py-2 text-sm transition-colors"
            title="Paste lights (Ctrl+V)"
          >
            <Clipboard className="w-4 h-4" />
            Paste
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg px-3 py-2 text-sm transition-colors"
            title="Export canvas as PNG image"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleAddLight}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Light
          </button>
        </div>
      </div>
      {selectedIds.length > 0 && (
        <p className="text-xs text-gray-400">
          {selectedIds.length} light{selectedIds.length !== 1 ? 's' : ''} selected
          <span className="text-gray-600 ml-2">· Ctrl/⌘+Click to multi-select · Ctrl+C/V to copy/paste · Delete to remove</span>
        </p>
      )}
      <div
        ref={canvasRef}
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
            isSelected={selectedIds.includes(light.id)}
            onSelect={handleSelect}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
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
