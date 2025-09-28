'use client';
import { useState } from 'react';

export default function BrainAdmin() {
  const [body, setBody] = useState(JSON.stringify({
    type: "GENERATE",
    parameters: { 
      subjects: ["matemáticas"], 
      gradeLevel: [4], 
      quantity: 2, 
      language: "es", 
      culturalContext: "dominican" 
    }
  }, null, 2));
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const call = async (path: string, method = 'POST') => {
    setLoading(true);
    try {
      const r = await fetch(path, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: method === 'GET' ? undefined : body 
      });
      const j = await r.json();
      setOut(j);
    } catch (error) {
      setOut({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const presetConfigs = [
    {
      name: 'RD Primary',
      value: {
        subjects: ["matemáticas", "ciencias"],
        gradeLevel: [3, 4, 5],
        language: "es",
        culturalContext: "dominican",
        difficulty: "adaptive",
        quantity: 3
      }
    },
    {
      name: 'RD Secondary',
      value: {
        subjects: ["matemáticas", "lengua", "ciencias"],
        gradeLevel: [6, 7, 8],
        language: "es",
        culturalContext: "dominican",
        difficulty: "adaptive",
        quantity: 4
      }
    }
  ];

  const loadPreset = (preset: any) => {
    setBody(JSON.stringify({
      type: "GENERATE",
      parameters: preset.value
    }, null, 2));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Brain Engine Admin</h1>
        <div className="text-sm text-gray-600">
          Sistema de generación de juegos educativos con IA
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Request Editor</h2>
            <div className="flex gap-2">
              {presetConfigs.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          <textarea 
            className="w-full h-80 p-4 border rounded-lg font-mono text-sm" 
            value={body} 
            onChange={e => setBody(e.target.value)}
            placeholder="Enter JSON request..."
          />
        </div>

        {/* Response Viewer */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Response</h2>
          <pre className="w-full h-80 p-4 border rounded-lg overflow-auto bg-gray-50 text-sm">
            {loading ? 'Loading...' : JSON.stringify(out, null, 2)}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button 
          onClick={() => call('/api/brain/generate')} 
          disabled={loading}
          className="px-4 py-3 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
        >
          🎮 Run Generate
        </button>
        
        <button 
          onClick={() => call('/api/brain/status', 'GET')} 
          disabled={loading}
          className="px-4 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          📊 Status
        </button>
        
        <button 
          onClick={() => call('/api/brain/schedulers/generate-weekly', 'GET')} 
          disabled={loading}
          className="px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          📅 Enqueue Weekly
        </button>
        
        <button 
          onClick={() => call('/api/brain/worker', 'GET')} 
          disabled={loading}
          className="px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          ⚙️ Run Worker
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <button 
          onClick={() => call('/api/brain/configure', 'GET')} 
          disabled={loading}
          className="px-4 py-2 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50"
        >
          🔧 Get Configs
        </button>
        
        <button 
          onClick={() => {
            setBody(JSON.stringify({
              name: 'test_preset',
              value: { subjects: ['matemáticas'], gradeLevel: [4], quantity: 1 }
            }, null, 2));
            call('/api/brain/configure');
          }}
          disabled={loading}
          className="px-4 py-2 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
        >
          💾 Save Config
        </button>
        
        <button 
          onClick={() => {
            setBody(JSON.stringify({
              type: "CONFIGURE",
              parameters: {}
            }, null, 2));
            call('/api/brain/generate');
          }}
          disabled={loading}
          className="px-4 py-2 rounded bg-teal-100 text-teal-700 hover:bg-teal-200 disabled:opacity-50"
        >
          ⚙️ Configure
        </button>
      </div>

      {/* Status Info */}
      {out && out.status && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">System Status</h3>
          <p className="text-green-700">Status: {out.status}</p>
          {out.total_games && <p className="text-green-700">Total Games: {out.total_games}</p>}
          {out.recent_jobs && <p className="text-green-700">Recent Jobs: {out.recent_jobs.length}</p>}
        </div>
      )}
    </div>
  );
}
