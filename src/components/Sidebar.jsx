import { Lightbulb, Trash2, Copy, ClipboardPaste } from 'lucide-react';
import { kelvinToHex } from '../utils/lightUtils';

export default function Sidebar({ light, selectedCount, onUpdate, onDelete, onDeleteSelected, onCopyProperties, onPasteProperties, propertyClipboard, pushUndoSnapshot }) {
  if (selectedCount > 1) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Multiple Selected</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">{selectedCount} lights selected. Use Ctrl/⌘+Click to adjust selection.</p>
        <div className="space-y-2">
          {propertyClipboard && (
            <button
              onClick={onPasteProperties}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 rounded-lg py-2 text-sm transition-colors"
              title={`Paste: ${propertyClipboard.lumens} lm, ${propertyClipboard.kelvin}K`}
            >
              <ClipboardPaste className="w-4 h-4" />
              Paste Properties to All
            </button>
          )}
          <button
            onClick={onDeleteSelected}
            className="w-full flex items-center justify-center gap-2 border border-red-800 hover:border-red-600 text-red-400 hover:text-red-300 rounded-lg py-2 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Selected
          </button>
        </div>
      </div>
    );
  }

  if (!light) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-white">Light Properties</h2>
        </div>
        <p className="text-gray-500 text-sm">Select a light fixture to edit its properties.</p>
      </div>
    );
  }

  const colorHex = kelvinToHex(light.kelvin);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ background: colorHex, boxShadow: `0 0 8px ${colorHex}` }}
          />
          <h2 className="text-lg font-semibold text-white">Light Properties</h2>
        </div>
        <button
          onClick={() => onDelete(light.id)}
          className="text-red-400 hover:text-red-300 transition-colors p-1"
          title="Delete light"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Label</label>
          <input
            type="text"
            value={light.label}
            onFocus={pushUndoSnapshot}
            onChange={(e) => onUpdate({ ...light, label: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Lumen Output</label>
            <span className="text-sm font-mono text-amber-400">{light.lumens} lm</span>
          </div>
          <input
            type="range"
            min="200"
            max="5000"
            step="50"
            value={light.lumens}
            onPointerDown={pushUndoSnapshot}
            onChange={(e) => onUpdate({ ...light, lumens: Number(e.target.value) })}
            className="w-full accent-amber-400"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>200 lm</span>
            <span>5000 lm</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Color Temperature</label>
            <span className="text-sm font-mono" style={{ color: colorHex }}>{light.kelvin}K</span>
          </div>
          <input
            type="range"
            min="2700"
            max="6500"
            step="100"
            value={light.kelvin}
            onPointerDown={pushUndoSnapshot}
            onChange={(e) => onUpdate({ ...light, kelvin: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: colorHex }}
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>2700K warm</span>
            <span>6500K cool</span>
          </div>
          <div
            className="mt-2 h-3 rounded-full"
            style={{
              background: 'linear-gradient(to right, rgb(255,197,90), rgb(255,244,220), rgb(200,225,255))',
            }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCopyProperties}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 rounded-lg py-2 text-sm transition-colors"
            title="Copy lumens and color temperature"
          >
            <Copy className="w-4 h-4" />
            Copy Props
          </button>
          <button
            onClick={onPasteProperties}
            disabled={!propertyClipboard}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-2 text-sm transition-colors"
            title={propertyClipboard ? `Paste: ${propertyClipboard.lumens} lm, ${propertyClipboard.kelvin}K` : 'No properties copied'}
          >
            <ClipboardPaste className="w-4 h-4" />
            Paste Props
          </button>
        </div>

        <button
          onClick={() => onDelete(light.id)}
          className="w-full flex items-center justify-center gap-2 border border-red-800 hover:border-red-600 text-red-400 hover:text-red-300 rounded-lg py-2 text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Light
        </button>
      </div>
    </div>
  );
}
