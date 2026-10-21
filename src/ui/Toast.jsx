import { useEffect } from 'react'

export default function Toast({ message, undo, onClose }) {
  // Each toast is remounted via `key`, so the timer starts once per message
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      role="status"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-3 bg-gray-900/95 text-white text-sm rounded-xl border border-purple-500/40 shadow-2xl max-w-[calc(100vw-2rem)]"
    >
      <span className="truncate">{message}</span>
      {undo && (
        <button
          onClick={() => {
            undo()
            onClose()
          }}
          className="font-semibold text-purple-300 hover:text-white"
        >
          Undo
        </button>
      )}
    </div>
  )
}
