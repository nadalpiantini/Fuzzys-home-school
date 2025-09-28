'use client';
import { useState } from 'react';

export default function BrainAdmin() {
  const [body, setBody] = useState(JSON.stringify({
    type: "GENERATE",
    parameters: { subjects:["matemáticas"], gradeLevel:[4], quantity:2, language:"es", culturalContext:"dominican" }
  }, null, 2));
  const [out, setOut] = useState<any>(null);

  const call = async (path: string, method='POST') => {
    const r = await fetch(path, { method, headers:{'Content-Type':'application/json'}, body: method==='GET'?undefined:body });
    const j = await r.json();
    setOut(j);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Brain Engine Admin</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea className="w-full h-64 p-3 border rounded" value={body} onChange={e=>setBody(e.target.value)} />
        <pre className="w-full h-64 p-3 border rounded overflow-auto">{JSON.stringify(out, null, 2)}</pre>
      </div>
      <div className="flex gap-3">
        <button onClick={()=>call('/api/brain/generate')} className="px-3 py-2 rounded bg-black text-white">Run Generate</button>
        <button onClick={()=>call('/api/brain/status','GET')} className="px-3 py-2 rounded bg-gray-800 text-white">Status</button>
        <button onClick={()=>call('/api/brain/schedulers/generate-weekly','GET')} className="px-3 py-2 rounded bg-emerald-600 text-white">Enqueue Weekly</button>
        <button onClick={()=>call('/api/brain/worker','GET')} className="px-3 py-2 rounded bg-indigo-600 text-white">Run Worker</button>
      </div>
    </div>
  );
}