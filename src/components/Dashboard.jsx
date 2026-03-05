import { BarChart3, Zap, Target, Thermometer } from 'lucide-react';
import { ROOM_TARGETS, getLightingStatus, kelvinToHex } from '../utils/lightUtils';

function StatCard({ icon, label, value, unit, color = 'text-white' }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-gray-400">{icon}</div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </div>
    </div>
  );
}

export default function Dashboard({ room, lights }) {
  const totalLumens = lights.reduce((sum, l) => sum + l.lumens, 0);
  const sqft = room.length * room.width;
  const density = sqft > 0 ? totalLumens / sqft : 0;
  const target = ROOM_TARGETS[room.type] || 20;
  const status = lights.length > 0 ? getLightingStatus(density, target) : 'under';
  const ratio = target > 0 ? density / target : 0;
  const progressPct = Math.min(100, Math.round(ratio * 100));

  const avgKelvin = lights.length > 0 && totalLumens > 0
    ? Math.round(lights.reduce((sum, l) => sum + l.kelvin * l.lumens, 0) / totalLumens)
    : 0;

  const statusConfig = {
    under: { label: 'Under-lit', color: 'text-blue-400', barColor: 'bg-blue-500', border: 'border-blue-800' },
    ideal: { label: 'Ideal', color: 'text-green-400', barColor: 'bg-green-500', border: 'border-green-800' },
    over: { label: 'Over-lit', color: 'text-orange-400', barColor: 'bg-orange-500', border: 'border-orange-800' },
  };
  const sc = statusConfig[status];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Total Lumens"
          value={totalLumens.toLocaleString()}
          unit="lm"
          color="text-amber-400"
        />
        <StatCard
          icon={<Target className="w-4 h-4" />}
          label="Square Footage"
          value={sqft.toLocaleString()}
          unit="ft²"
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="Lumen Density"
          value={density.toFixed(1)}
          unit="lm/ft²"
          color="text-purple-400"
        />
        <StatCard
          icon={<Target className="w-4 h-4" />}
          label="Target Density"
          value={target}
          unit="lm/ft²"
          color="text-green-400"
        />
      </div>

      {avgKelvin > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Avg Color Temperature</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: kelvinToHex(avgKelvin), boxShadow: `0 0 8px ${kelvinToHex(avgKelvin)}` }}
            />
            <span className="text-xl font-bold" style={{ color: kelvinToHex(avgKelvin) }}>
              {avgKelvin}K
            </span>
            <span className="text-xs text-gray-500">
              {avgKelvin < 3200 ? 'Warm' : avgKelvin < 4500 ? 'Neutral' : 'Cool'}
            </span>
          </div>
        </div>
      )}

      <div className={`bg-gray-800 border ${sc.border} rounded-xl p-4`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Lighting Status</span>
          <span className={`text-sm font-semibold ${sc.color}`}>{sc.label}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${sc.barColor}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span className="text-gray-400">{progressPct}% of target</span>
          <span>120%+</span>
        </div>
        <div className="flex gap-3 mt-3 text-xs flex-wrap" aria-label="Status legend">
          <span className="flex items-center gap-1 text-blue-400">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" aria-hidden="true" />
            [↓] Under-lit &lt;80%
          </span>
          <span className="flex items-center gap-1 text-green-400">
            <span className="inline-block w-3 h-3 rounded-sm bg-green-500" aria-hidden="true" />
            [✓] Ideal 80–120%
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <span className="inline-block w-3 h-3 rounded-sm bg-orange-500" aria-hidden="true" />
            [↑] Over-lit &gt;120%
          </span>
        </div>
      </div>
    </div>
  );
}
