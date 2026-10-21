import { useState } from 'react'
import { Brain, Download, Link, Minimize2, Pause, Play, Plus, Save, Share2, Trash2, ZoomIn, ZoomOut } from 'lucide-react'

const SHORTCUTS = [
  ['Edit thought', 'Double-click / tap'],
  ['Pause / Play', 'Space'],
  ['Delete selected', 'Del'],
  ['Save', 'Ctrl/⌘ + S'],
  ['Zoom', 'Scroll'],
  ['Pan', 'Drag empty space'],
  ['Select / nudge', 'Tab / Arrows'],
]

const toolClass =
  'px-3 py-2.5 rounded-lg border text-white text-sm flex items-center justify-center gap-2 transition-colors'

export default function ControlPanel({
  open,
  onOpenChange,
  zones,
  onAdd,
  running,
  onTogglePause,
  onClear,
  zoom,
  onZoom,
  onResetView,
  showLinks,
  onToggleLinks,
  onExport,
  onShare,
  onSave,
}) {
  const [text, setText] = useState('')
  const [zone, setZone] = useState('')

  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="absolute top-4 left-4 w-14 h-14 flex items-center justify-center rounded-full text-white bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400/50 shadow-2xl hover:scale-110 transition-transform"
        aria-label="Open control panel"
      >
        <Brain className="w-7 h-7" />
      </button>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    if (onAdd(text, zone || null)) setText('')
  }

  return (
    <div className="absolute z-10 top-4 left-4 w-[340px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar bg-gray-900/95 rounded-2xl shadow-2xl border border-purple-500/30 backdrop-blur-lg">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-purple-500/30">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold text-lg">
            Mind Palace
          </h1>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded"
          aria-label="Minimize control panel"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <form onSubmit={submit} className="space-y-2">
          <label htmlFor="thought" className="text-gray-300 text-sm block">
            Add Thought
          </label>
          <div className="flex gap-2">
            <input
              id="thought"
              value={text}
              maxLength={80}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. happy, deep work…"
              className="flex-1 min-w-0 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded" aria-label="Add thought">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            aria-label="Zone"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
          >
            <option value="">Free floating</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.icon} {z.name}
              </option>
            ))}
          </select>
        </form>

        <div className="flex gap-2">
          <button
            onClick={onTogglePause}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pause' : 'Play'}
          </button>
          <button onClick={onClear} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg" aria-label="Clear all thoughts" title="Clear all (undoable)">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onZoom(zoom - 0.1)} className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg" aria-label="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={onResetView} className="flex-1 bg-gray-700/30 hover:bg-gray-600/40 rounded-lg px-3 py-2 text-white text-sm" title="Reset zoom and pan">
            {Math.round(zoom * 100)}% · Reset view
          </button>
          <button onClick={() => onZoom(zoom + 0.1)} className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg" aria-label="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleLinks}
            aria-pressed={showLinks}
            className={`${toolClass} ${showLinks ? 'bg-purple-600/60 border-purple-400' : 'bg-purple-600/20 hover:bg-purple-600/40 border-purple-500/30'}`}
          >
            <Link className="w-4 h-4" /> Links
          </button>
          <button onClick={onExport} className={`${toolClass} bg-gray-700/50 hover:bg-gray-600/50 border-transparent`}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={onShare} className={`${toolClass} bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30`}>
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={onSave} className={`${toolClass} bg-green-600/20 hover:bg-green-600/40 border-green-500/30`}>
            <Save className="w-4 h-4" /> Save
          </button>
        </div>

        <div className="hidden md:block p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 text-xs">
          <h2 className="font-semibold text-purple-400 mb-2">⌨️ Controls</h2>
          <dl className="space-y-1 text-gray-400">
            {SHORTCUTS.map(([action, key]) => (
              <div key={action} className="flex justify-between">
                <dt>{action}</dt>
                <dd className="text-gray-300 font-mono">{key}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ul className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20 text-xs text-gray-400 space-y-1">
          <li>💡 Opposites attract: happy ↔ sad, chaos ↔ calm</li>
          <li>🎯 Drop a thought into a zone to move it there</li>
          <li>🔗 Links shows zone groups and opposite pairs</li>
          <li>💾 Your layout autosaves when you leave</li>
        </ul>
      </div>
    </div>
  )
}
