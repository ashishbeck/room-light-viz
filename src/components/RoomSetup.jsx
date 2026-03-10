import { useState } from 'react';
import { Home, Ruler, ChevronDown } from 'lucide-react';

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Kitchen', 'Dining', 'Bathroom', 'Office', 'Garage', 'Portico'];

export default function RoomSetup({ onGenerate, initialRoom }) {
  const [roomName, setRoomName] = useState(initialRoom?.name || '');
  const [length, setLength] = useState(initialRoom?.length || 20);
  const [width, setWidth] = useState(initialRoom?.width || 15);
  const [roomType, setRoomType] = useState(initialRoom?.type || 'Living Room');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      name: roomName || 'My Room',
      length: Number(length),
      width: Number(width),
      type: roomType,
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full">
      <div className="flex items-center gap-2 mb-6">
        <Home className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Room Setup</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Living Room"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> Length (ft)</span>
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> Width (ft)</span>
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Room Type</label>
          <div className="relative">
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors appearance-none"
            >
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg py-2 text-sm transition-colors mt-2"
        >
          Generate Room
        </button>
      </form>
    </div>
  );
}
