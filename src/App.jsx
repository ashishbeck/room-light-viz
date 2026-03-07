import { useState, useCallback, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import RoomSetup from './components/RoomSetup';
import RoomCanvas from './components/RoomCanvas';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SavedRooms from './components/SavedRooms';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateId } from './utils/lightUtils';

const DEFAULT_ROOM = {
  name: 'My Room',
  length: 20,
  width: 15,
  type: 'Living Room',
};

const MAX_UNDO = 50;

export default function App() {
  const [room, setRoom] = useLocalStorage('ll-room', null);
  const [lights, setLights] = useLocalStorage('ll-lights', []);
  const [savedRooms, setSavedRooms] = useLocalStorage('ll-saved-rooms', []);
  const [selectedIds, setSelectedIds] = useState([]);
  const [clipboard, setClipboard] = useLocalStorage('ll-clipboard', []);
  const [propertyClipboard, setPropertyClipboard] = useLocalStorage('ll-prop-clipboard', null);
  const canvasRef = useRef(null);
  const undoStack = useRef([]);
  const [undoCount, setUndoCount] = useState(0);

  const selectedLights = lights.filter((l) => selectedIds.includes(l.id));
  const selectedLight = selectedLights.length === 1 ? selectedLights[0] : null;

  const pushUndo = useCallback((snapshot) => {
    undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), snapshot];
    setUndoCount(undoStack.current.length);
  }, []);

  const setLightsWithUndo = useCallback((updater) => {
    setLights((prev) => {
      pushUndo(prev);
      return updater instanceof Function ? updater(prev) : updater;
    });
  }, [setLights, pushUndo]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop();
    setUndoCount(undoStack.current.length);
    setLights(prev);
    setSelectedIds([]);
  }, [setLights]);

  const handleGenerate = useCallback((roomConfig) => {
    setRoom(roomConfig);
    setLightsWithUndo([]);
    setSelectedIds([]);
  }, [setRoom, setLightsWithUndo]);

  const handleUpdateLight = useCallback((updated) => {
    setLightsWithUndo((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, [setLightsWithUndo]);

  const handleDeleteLight = useCallback((id) => {
    setLightsWithUndo((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  }, [setLightsWithUndo]);

  const handleDeleteSelected = useCallback(() => {
    setLightsWithUndo((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
    setSelectedIds([]);
  }, [setLightsWithUndo, selectedIds]);

  const handleCopyProperties = useCallback(() => {
    if (!selectedLight) return;
    setPropertyClipboard({ lumens: selectedLight.lumens, kelvin: selectedLight.kelvin });
  }, [selectedLight, setPropertyClipboard]);

  const handlePasteProperties = useCallback(() => {
    if (!propertyClipboard || selectedIds.length === 0) return;
    setLightsWithUndo((prev) =>
      prev.map((l) =>
        selectedIds.includes(l.id)
          ? { ...l, lumens: propertyClipboard.lumens, kelvin: propertyClipboard.kelvin }
          : l
      )
    );
  }, [propertyClipboard, selectedIds, setLightsWithUndo]);

  const handleSaveRoom = useCallback(() => {
    if (!room) return;
    const entry = {
      id: generateId(),
      room,
      lights,
      savedAt: new Date().toISOString(),
    };
    setSavedRooms((prev) => [entry, ...prev]);
  }, [room, lights, setSavedRooms]);

  const handleLoadRoom = useCallback((savedEntry) => {
    setRoom(savedEntry.room);
    setLights(savedEntry.lights);
    setSelectedIds([]);
  }, [setRoom, setLights]);

  const handleDeleteSavedRoom = useCallback((id) => {
    setSavedRooms((prev) => prev.filter((sr) => sr.id !== id));
  }, [setSavedRooms]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LumenLayout</h1>
            <p className="text-xs text-gray-400">Lighting Simulator</p>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-6">
        {!room ? (
          <div className="flex justify-center items-center min-h-[70vh]">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to LumenLayout</h2>
                <p className="text-gray-400 text-sm">Configure your room to start planning your lighting.</p>
              </div>
              <RoomSetup onGenerate={handleGenerate} initialRoom={DEFAULT_ROOM} />
              {savedRooms.length > 0 && (
                <div className="mt-6">
                  <SavedRooms
                    savedRooms={savedRooms}
                    onSave={handleSaveRoom}
                    onLoad={handleLoadRoom}
                    onDelete={handleDeleteSavedRoom}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-64 flex flex-col gap-4">
                <RoomSetup onGenerate={handleGenerate} initialRoom={room} />
                <SavedRooms
                  savedRooms={savedRooms}
                  onSave={handleSaveRoom}
                  onLoad={handleLoadRoom}
                  onDelete={handleDeleteSavedRoom}
                />
              </div>
              <div className="flex-1 min-w-0">
                <RoomCanvas
                  room={room}
                  lights={lights}
                  setLights={setLightsWithUndo}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  clipboard={clipboard}
                  setClipboard={setClipboard}
                  canvasRef={canvasRef}
                  onUndo={handleUndo}
                  undoCount={undoCount}
                />
              </div>
              <div className="flex-shrink-0 w-64 flex flex-col gap-4">
                <Sidebar
                  light={selectedLight}
                  selectedCount={selectedIds.length}
                  onUpdate={handleUpdateLight}
                  onDelete={handleDeleteLight}
                  onDeleteSelected={handleDeleteSelected}
                  onCopyProperties={handleCopyProperties}
                  onPasteProperties={handlePasteProperties}
                  propertyClipboard={propertyClipboard}
                />
              </div>
            </div>
            <Dashboard room={room} lights={lights} />
          </div>
        )}
      </main>
    </div>
  );
}
