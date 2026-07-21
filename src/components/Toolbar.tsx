'use client'
import React from 'react'

export default function Toolbar({ onNew, onExport, onExportCSV, onImport }: {
  onNew: () => void,
  onExport: () => void,
  onExportCSV: () => void,
  onImport: (f: File) => void,
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button className="btn-primary" onClick={onNew}>
        <span className="text-lg leading-none">+</span> Nuevo incidente
      </button>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-ghost" onClick={onExportCSV}>Exportar CSV</button>
        <button className="btn-ghost" onClick={onExport}>Exportar JSON</button>
        <button className="btn-ghost" onClick={() => inputRef.current?.click()}>Importar JSON</button>
        <input ref={inputRef} type="file" accept="application/json" hidden onChange={(e)=>{
          const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''
        }}/>
      </div>
    </div>
  )
}
