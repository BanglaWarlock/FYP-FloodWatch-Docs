import { useState, useRef } from 'react'

const EVENT_COLORS = {
  heartbeat:    { dot: 'bg-green-500',  text: 'text-green-400',  ring: 'ring-green-500/20' },
  flood_level:  { dot: 'bg-red-500',    text: 'text-red-400',    ring: 'ring-red-500/20' },
  battery_low:  { dot: 'bg-amber-500',  text: 'text-amber-400',  ring: 'ring-amber-500/20' },
  node_offline: { dot: 'bg-slate-500',  text: 'text-slate-400',  ring: 'ring-slate-500/20' },
  error:        { dot: 'bg-red-900',    text: 'text-red-600',    ring: '' },
}

const ALL_TYPES = ['heartbeat', 'flood_level', 'battery_low', 'node_offline']

export default function LiveDemo() {
  const [url, setUrl]       = useState('http://localhost:8000/api/v1/events/stream')
  const [status, setStatus] = useState('disconnected')
  const [events, setEvents] = useState([])
  const [filters, setFilters] = useState(
    Object.fromEntries(ALL_TYPES.map(t => [t, true]))
  )
  const esRef = useRef(null)

  function connect() {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    setStatus('connecting')

    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => setStatus('connected')

    es.onerror = () => {
      setStatus('disconnected')
      addEvent('error', { message: 'Connection lost — EventSource will retry' })
    }

    ALL_TYPES.forEach(type => {
      es.addEventListener(type, e => {
        addEvent(type, JSON.parse(e.data))
      })
    })
  }

  function disconnect() {
    esRef.current?.close()
    esRef.current = null
    setStatus('disconnected')
  }

  function addEvent(type, data) {
    const entry = {
      id:   Date.now() + Math.random(),
      type,
      data,
      ts:   new Date().toLocaleTimeString('en-GB', { hour12: false }),
    }
    setEvents(prev => [entry, ...prev].slice(0, 100))
  }

  const filtered = events.filter(e => e.type === 'error' || filters[e.type])

  const statusConfig = {
    connected:    { dot: 'bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]', label: 'Connected',    btn: 'bg-slate-700 hover:bg-slate-600 text-slate-200', action: disconnect, btnLabel: 'Disconnect' },
    connecting:   { dot: 'bg-amber-500', label: 'Connecting…', btn: 'bg-blue-600 hover:bg-blue-500 text-white', action: connect, btnLabel: 'Connect' },
    disconnected: { dot: 'bg-slate-700', label: 'Disconnected', btn: 'bg-blue-600 hover:bg-blue-500 text-white', action: connect, btnLabel: 'Connect' },
  }[status]

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-surface-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="flex-1 min-w-48 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30"
          placeholder="http://<API_HOST>:8000/api/v1/events"
        />
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${statusConfig.dot}`} />
          <span className="text-xs text-slate-400">{statusConfig.label}</span>
        </div>
        <button
          onClick={statusConfig.action}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${statusConfig.btn}`}
        >
          {statusConfig.btnLabel}
        </button>
        <button
          onClick={() => setEvents([])}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 px-4 py-2 bg-slate-900/50 border-b border-slate-800">
        {ALL_TYPES.map(type => {
          const c = EVENT_COLORS[type]
          return (
            <label key={type} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters[type]}
                onChange={e => setFilters(f => ({ ...f, [type]: e.target.checked }))}
                className="accent-blue-500"
              />
              <span className={`text-xs font-mono font-medium ${c.text}`}>{type}</span>
            </label>
          )
        })}
      </div>

      {/* Event log */}
      <div className="h-80 overflow-y-auto p-3 flex flex-col gap-1.5 font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            {status === 'disconnected' ? 'Connect to see live events' : 'Waiting for events…'}
          </div>
        ) : (
          filtered.map(entry => {
            const c = EVENT_COLORS[entry.type] ?? EVENT_COLORS.error
            return (
              <div
                key={entry.id}
                className={`flex gap-3 items-start px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 animate-fade-in`}
              >
                <span className="text-slate-600 whitespace-nowrap">{entry.ts}</span>
                <span className={`whitespace-nowrap font-semibold ${c.text}`}>{entry.type}</span>
                <span className="text-slate-400 break-all">
                  {entry.type === 'error'
                    ? entry.data.message
                    : JSON.stringify(entry.data)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
