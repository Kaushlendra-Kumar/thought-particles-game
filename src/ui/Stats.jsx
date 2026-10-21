function Stat({ icon, label, value, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <div>
        <div className="text-gray-400 text-xs">{label}</div>
        <div className="text-white font-bold">{value}</div>
      </div>
    </div>
  )
}

export default function Stats({ thoughts, particles, zoom, running }) {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-4 text-sm bg-gray-900/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-purple-500/20 shadow-lg pointer-events-none">
      {!running && <span className="text-yellow-300 font-semibold">⏸ Paused</span>}
      <Stat icon="💭" label="Thoughts" value={thoughts} />
      <Stat icon="✨" label="Particles" value={particles} className="hidden sm:flex" />
      <Stat icon="🔍" label="Zoom" value={`${Math.round(zoom * 100)}%`} />
    </div>
  )
}
