import { useCallback, useRef, useEffect, useState } from 'react';
import { toPng } from 'html-to-image';
import LightFixture from './LightFixture';
import { generateId } from '../utils/lightUtils';
import { Plus, Download, Copy, Clipboard, MousePointerClick, Undo2 } from 'lucide-react';

const MAX_WIDTH = 800;
const MAX_HEIGHT = 520;

export default function RoomCanvas({ room, lights, setLights, selectedIds, setSelectedIds, clipboard, setClipboard, canvasRef, onUndo, undoCount }) {
  const cellSize = Math.floor(Math.min(MAX_WIDTH / room.length, MAX_HEIGHT / room.width));
  const canvasWidth = cellSize * room.length;
  const canvasHeight = cellSize * room.width;
  const wrapperRef = useRef(null);
  const dragStartPositions = useRef(null);
  const [marquee, setMarquee] = useState(null);
  const marqueeStart = useRef(null);
  const marqueeUsed = useRef(false);
  const [isDraggingMarquee, setIsDraggingMarquee] = useState(false);

  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef?.current || e.target.closest('svg')) {
      if (!marqueeUsed.current) {
        setSelectedIds([]);
      }
      marqueeUsed.current = false;
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
    const toCopy = lights.filter((l) => selectedIds.includes(l.id)).map(({ x, y, label, lumens, kelvin }) => ({ x, y, label, lumens, kelvin }));
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

  const handleMarqueeMouseDown = useCallback((e) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    // Only start marquee on the canvas background or SVG grid, not on light fixtures
    if (e.target !== canvas && !e.target.closest('svg')) return;
    // Don't start marquee on right-click
    if (e.button !== 0) return;

    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    marqueeStart.current = { x: startX, y: startY, additive: e.ctrlKey || e.metaKey };
    marqueeUsed.current = false;
    setIsDraggingMarquee(true);
    setMarquee(null);
  }, [canvasRef]);

  const handleMarqueeMouseMove = useCallback((e) => {
    if (!marqueeStart.current) return;
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(canvasWidth, e.clientX - rect.left));
    const currentY = Math.max(0, Math.min(canvasHeight, e.clientY - rect.top));
    const start = marqueeStart.current;

    const x = Math.min(start.x, currentX);
    const y = Math.min(start.y, currentY);
    const w = Math.abs(currentX - start.x);
    const h = Math.abs(currentY - start.y);

    // Only show marquee if dragged at least 5px to avoid accidental selections
    if (w > 5 || h > 5) {
      setMarquee({ x, y, width: w, height: h });
    }
  }, [canvasRef, canvasWidth, canvasHeight]);

  const handleMarqueeMouseUp = useCallback(() => {
    if (!marqueeStart.current) return;
    const additive = marqueeStart.current.additive;
    marqueeStart.current = null;
    setIsDraggingMarquee(false);

    if (!marquee) {
      // No rectangle drawn, just a click — let handleCanvasClick deal with it
      setMarquee(null);
      return;
    }

    // A marquee was drawn, mark it so handleCanvasClick doesn't clear selection
    marqueeUsed.current = true;

    // Find lights whose center falls within the marquee rectangle
    const halfCell = cellSize / 2;
    const insideIds = lights
      .filter((l) => {
        const cx = l.x + halfCell;
        const cy = l.y + halfCell;
        return (
          cx >= marquee.x &&
          cx <= marquee.x + marquee.width &&
          cy >= marquee.y &&
          cy <= marquee.y + marquee.height
        );
      })
      .map((l) => l.id);

    if (additive) {
      // Add to existing selection (Ctrl/Cmd held)
      setSelectedIds((prev) => [...new Set([...prev, ...insideIds])]);
    } else {
      setSelectedIds(insideIds);
    }

    setMarquee(null);
  }, [marquee, lights, cellSize, setSelectedIds]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (marqueeStart.current) {
        marqueeStart.current = null;
        setIsDraggingMarquee(false);
        setMarquee(null);
      }
    };
    // Only needed for mouse released outside the canvas
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

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
      } else if (isMod && e.key === 'z') {
        e.preventDefault();
        onUndo();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handlePaste, handleSelectAll, handleDeleteSelected, onUndo]);

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
    <div className="flex flex-col gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-xl" ref={wrapperRef} tabIndex={-1}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">{room.name}</h3>
          <p className="text-gray-400 text-xs">{room.length} ft × {room.width} ft · {room.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={undoCount === 0}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 font-medium rounded-lg px-3 py-2 text-sm transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
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
          <span className="text-gray-600 ml-2">· Drag to select · Ctrl/⌘+Click to multi-select · Ctrl+C/V to copy/paste · Ctrl+Z to undo · Delete to remove</span>
        </p>
      )}
      <div
        ref={canvasRef}
        className="relative border border-gray-700 rounded-xl overflow-hidden"
        style={{ width: canvasWidth, height: canvasHeight, background: '#111827', cursor: isDraggingMarquee ? 'crosshair' : 'default' }}
        onClick={handleCanvasClick}
        onMouseDown={handleMarqueeMouseDown}
        onMouseMove={handleMarqueeMouseMove}
        onMouseUp={handleMarqueeMouseUp}
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
        {marquee && (
          <div
            style={{
              position: 'absolute',
              left: marquee.x,
              top: marquee.y,
              width: marquee.width,
              height: marquee.height,
              border: '1px solid rgba(245, 158, 11, 0.6)',
              background: 'rgba(245, 158, 11, 0.1)',
              pointerEvents: 'none',
              zIndex: 30,
            }}
          />
        )}
        {lights.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-600 text-sm">Click &quot;Add Light&quot; to place a fixture</p>
          </div>
        )}
      </div>
    </div>
  );
}
