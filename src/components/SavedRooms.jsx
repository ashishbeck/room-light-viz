import { useState } from 'react';
import { FolderOpen, Save, Trash2, Lightbulb, Upload } from 'lucide-react';

const ROOM_TYPE_COLORS = {
  'Living Room': { border: 'border-l-amber-400', dot: 'bg-amber-400' },
  'Bedroom':     { border: 'border-l-purple-400', dot: 'bg-purple-400' },
  'Kitchen':     { border: 'border-l-orange-400', dot: 'bg-orange-400' },
  'Dining':      { border: 'border-l-rose-400', dot: 'bg-rose-400' },
  'Bathroom':    { border: 'border-l-cyan-400', dot: 'bg-cyan-400' },
  'Office':      { border: 'border-l-blue-400', dot: 'bg-blue-400' },
  'Garage':      { border: 'border-l-slate-400', dot: 'bg-slate-400' },
  'Portico':     { border: 'border-l-green-400', dot: 'bg-green-400' },
};

const DEFAULT_COLOR = { border: 'border-l-gray-400', dot: 'bg-gray-400' };

function getRoomColor(type) {
  return ROOM_TYPE_COLORS[type] || DEFAULT_COLOR;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function SavedRooms({ savedRooms, onSave, onLoad, onDelete, layout = 'horizontal' }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  if (layout === 'vertical') {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Saved Rooms</h3>
          </div>
        </div>
        <div className="border-t border-gray-700">
          {savedRooms.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <Lightbulb className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">No saved rooms yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {savedRooms.map((sr) => (
                <li key={sr.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors border-l-2 ${getRoomColor(sr.room.type).border}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getRoomColor(sr.room.type).dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{sr.room.name}</p>
                    <p className="text-xs text-gray-500">
                      {sr.room.type} · {sr.room.length}×{sr.room.width} ft · {sr.lights.length} light{sr.lights.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-600">{formatDate(sr.savedAt)}</p>
                  </div>
                  <button
                    onClick={() => onLoad(sr)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg px-2.5 py-1 transition-colors flex-shrink-0"
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2 flex-shrink-0">
          <FolderOpen className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white whitespace-nowrap">Saved Rooms</h3>
          {savedRooms.length > 0 && (
            <span className="bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-0.5">
              {savedRooms.length}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin">
          {savedRooms.length === 0 ? (
            <p className="text-gray-500 text-xs whitespace-nowrap">No saved rooms yet. Click "Save" to store the current design.</p>
          ) : (
            <div className="flex gap-2 py-0.5">
              {savedRooms.map((sr) => (
                <div
                  key={sr.id}
                  className={`flex items-center gap-2 bg-gray-800 border border-gray-700 border-l-2 ${getRoomColor(sr.room.type).border} rounded-lg px-3 py-1.5 flex-shrink-0 group hover:border-gray-600 transition-colors`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getRoomColor(sr.room.type).dot}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate max-w-[120px]">{sr.room.name}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                      {sr.room.type} · {sr.lights.length} light{sr.lights.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onLoad(sr)}
                      className="text-gray-400 hover:text-amber-400 transition-colors p-0.5"
                      title={`Load "${sr.room.name}" – ${formatDate(sr.savedAt)}`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sr.id)}
                      className={`p-0.5 rounded transition-colors ${
                        confirmDelete === sr.id
                          ? 'text-red-400'
                          : 'text-gray-500 hover:text-red-400'
                      }`}
                      title={confirmDelete === sr.id ? 'Click again to confirm delete' : 'Delete saved room'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onSave}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
          title="Save current room"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
      </div>
    </div>
  );
}
