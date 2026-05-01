'use client'

import { useState, useEffect } from 'react'
import { X, Command } from 'lucide-react'

const shortcuts = [
  { keys: ['Cmd/Ctrl', 'P'], description: 'Open projector view in new tab' },
  { keys: ['Cmd/Ctrl', 'K'], description: 'Focus search/filter' },
  { keys: ['Cmd/Ctrl', 'R'], description: 'Refresh event data' },
  { keys: ['/'], description: 'Focus search (when not typing)' },
  { keys: ['Enter'], description: 'Submit question or form' },
  { keys: ['Esc'], description: 'Close modals and dialogs' },
]

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
      const cmd = isMac ? e.metaKey : e.ctrlKey

      // Cmd/Ctrl + Shift + ? to open keyboard shortcuts
      if (cmd && e.shiftKey && e.key === '?') {
        e.preventDefault()
        setIsOpen(true)
      }

      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Keyboard shortcuts (Cmd+Shift+?)"
        className="fixed bottom-6 right-6 p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <Command size={16} />
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-96 overflow-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <h2 className="font-semibold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-600">{shortcut.description}</p>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <div key={j}>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono font-medium">
                      {key}
                    </span>
                    {j < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-gray-400 text-xs">+</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">Cmd+Shift+?</kbd> to toggle this menu
          </p>
        </div>
      </div>
    </div>
  )
}
