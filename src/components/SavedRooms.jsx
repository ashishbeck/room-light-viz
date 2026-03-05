import { useState } from 'react';
import { FolderOpen, Save, Trash2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function SavedRooms({ savedRooms, onSave, onLoad, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSave = () => {
    onSave();
    setExpanded(true);
  };

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Saved Rooms</h3>
          {savedRooms.length > 0 && (
            <span className="bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-0.5">
              {savedRooms.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
            title="Save current room"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label={expanded ? 'Collapse saved rooms' : 'Expand saved rooms'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-700">
          {savedRooms.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <Lightbulb className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">No saved rooms yet. Click "Save" to store the current design.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {savedRooms.map((sr) => (
                <li key={sr.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{sr.room.name}</p>
                    <p className="text-xs text-gray-500">
                      {sr.room.type} · {sr.room.length}×{sr.room.width} ft · {sr.lights.length} light{sr.lights.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-600">{formatDate(sr.savedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onLoad(sr)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg px-2.5 py-1 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(sr.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        confirmDelete === sr.id
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                          : 'text-gray-500 hover:text-red-400 hover:bg-gray-700'
                      }`}
                      title={confirmDelete === sr.id ? 'Click again to confirm delete' : 'Delete saved room'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
