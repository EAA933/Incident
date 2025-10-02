'use client'
import React from 'react'

export default function Toolbar({ onNew, onExport, onImport }: { onNew: () => void, onExport: () => void, onImport: (f: File) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <button className="rounded-xl px-3 py-2 bg-black text-white" onClick={onNew}>
          Nuevo incidente
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-xl px-3 py-2 border" onClick={onExport}>Exportar JSON</button>
        <button className="rounded-xl px-3 py-2 border" onClick={() => inputRef.current?.click()}>Importar JSON</button>
        <input ref={inputRef} type="file" accept="application/json" hidden onChange={(e)=>{
          const f = e.target.files?.[0]; if (f) onImport(f)
        }}/>
      </div>
    </div>
  )
}
