import { useState, useRef } from 'react'

const EVENT_COLORS = {
  heartbeat:      { dot: 'bg-green-500',  text: 'text-green-600  dark:text-green-400' },
  flood_level:    { dot: 'bg-red-500',    text: 'text-red-600    dark:text-red-400' },
  alert:          { dot: 'bg-amber-500',  text: 'text-amber-600  dark:text-amber-400' },
  weather_update: { dot: 'bg-sky-500',    text: 'text-sky-600    dark:text-sky-400' },
  node_announce:  { dot: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' },
  node_offline:   { dot: 'bg-slate-400',  text: 'text-slate-500  dark:text-slate-400' },
  error:          { dot: 'bg-red-700',    text: 'text-red-700    dark:text-red-600' },
}

const ALL_TYPES = ['heartbeat', 'flood_level', 'alert', 'weather_update', 'node_announce', 'node_offline']

const BASE_HOST = '159.223.70.28'

export default function LiveDemo() {
  const [host, setHost]       = useState(BASE_HOST)
  const [dataset, setDataset] = useState('sample')
  const [status, setStatus]   = useState('disconnected')
  const [events, setEvents]   = useState([])
  const [filters, setFilters] = useState(Object.fromEntries(ALL_TYPES.map(t => [t, true])))
  const esRef = useRef(null)

  function buildUrl() {
    const params = new URLSearchParams()
    params.set('dataset', dataset)
    // Use a relative URL when the host matches the default — this lets the
    // Vite dev proxy (local) and Vercel rewrite (deployed) forward the request
    // over HTTPS, avoiding mixed-content blocks.
    const trimmed = host.trim()
    if (!trimmed || trimmed === BASE_HOST) {
      return `/api/v1/events/stream?${params}`
    }
    const base = trimmed.startsWith('http') ? trimmed : `http://${trimmed}`
    return `${base}/api/v1/events/stream?${params}`
  }

  function connect() {
    if (esRef.current) { esRef.current.close(); esRef.current = null }
    setEvents([])
    setStatus('connecting')

    let es
    try {
      es = new EventSource(buildUrl())
    } catch {
      addEvent('error', { message: 'Invalid URL' })
      setStatus('disconnected')
      return
    }
    esRef.current = es

    es.onopen  = () => setStatus('connected')
    es.onerror = () => {
      setStatus('error')
      addEvent('error', { message: 'Connection lost — EventSource will retry automatically' })
    }

    ALL_TYPES.forEach(type => {
      es.addEventListener(type, e => {
        try { addEvent(type, JSON.parse(e.data)) }
        catch { addEvent(type, { raw: e.data }) }
      })
    })
  }

  function disconnect() {
    esRef.current?.close()
    esRef.current = null
    setStatus('disconnected')
  }

  function addEvent(type, data) {
    setEvents(prev => [{
      id:   Date.now() + Math.random(),
      type,
      data,
      ts:   new Date().toLocaleTimeString('en-GB', { hour12: false }),
    }, ...prev].slice(0, 150))
  }

  const filtered = events.filter(e => e.type === 'error' || filters[e.type])

  const statusCfg = {
    connected:    { dot: 'bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]', label: 'Connected',    btnClass: 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200', action: disconnect, btnLabel: 'Disconnect' },
    connecting:   { dot: 'bg-amber-400 animate-pulse', label: 'Connecting…', btnClass: 'bg-blue-600 hover:bg-blue-500 text-white', action: connect,     btnLabel: 'Connect' },
    disconnected: { dot: 'bg-gray-300 dark:bg-slate-700', label: 'Disconnected', btnClass: 'bg-blue-600 hover:bg-blue-500 text-white', action: connect, btnLabel: 'Connect' },
    error:        { dot: 'bg-red-500', label: 'Error (retrying…)', btnClass: 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200', action: disconnect, btnLabel: 'Disconnect' },
  }[status] ?? {}

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <input
          value={host}
          onChange={e => setHost(e.target.value)}
          className="flex-1 min-w-40 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-gray-800 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
          placeholder="API host (e.g. 159.223.70.28)"
        />
        <select
          value={dataset}
          onChange={e => setDataset(e.target.value)}
          className="bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs text-gray-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="real">real</option>
          <option value="sample">sample</option>
          <option value="all">all</option>
        </select>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${statusCfg.dot}`} />
          <span className="text-xs text-gray-500 dark:text-slate-400">{statusCfg.label}</span>
        </div>
        <button onClick={statusCfg.action} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${statusCfg.btnClass}`}>
          {statusCfg.btnLabel}
        </button>
        <button onClick={() => setEvents([])} className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors">
          Clear
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 px-4 py-2 bg-gray-50/80 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
        {ALL_TYPES.map(type => {
          const c = EVENT_COLORS[type]
          return (
            <label key={type} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={filters[type]} onChange={e => setFilters(f => ({ ...f, [type]: e.target.checked }))} className="accent-blue-500" />
              <span className={`text-xs font-mono font-medium ${c.text}`}>{type}</span>
            </label>
          )
        })}
      </div>

      {/* Event log */}
      <div className="h-80 overflow-y-auto p-3 flex flex-col gap-1.5 font-mono text-xs bg-white dark:bg-slate-950">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-600 text-sm">
            {status === 'disconnected' ? 'Connect to start receiving events' : 'Waiting for events…'}
          </div>
        ) : (
          filtered.map(entry => {
            const c = EVENT_COLORS[entry.type] ?? EVENT_COLORS.error
            const label = entry.type === 'alert'
              ? `alert:${entry.data?.alert_type ?? '?'}`
              : entry.type
            return (
              <div key={entry.id} className="flex gap-3 items-start px-3 py-2 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 animate-fade-in">
                <span className="text-gray-400 dark:text-slate-600 whitespace-nowrap">{entry.ts}</span>
                <span className={`whitespace-nowrap font-semibold ${c.text}`}>{label}</span>
                <span className="text-gray-600 dark:text-slate-400 break-all">
                  {entry.type === 'error' ? entry.data.message : JSON.stringify(entry.data)}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Built URL hint */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
        <span className="text-[10px] font-mono text-gray-400 dark:text-slate-600">
          {buildUrl()}
        </span>
      </div>
    </div>
  )
}
