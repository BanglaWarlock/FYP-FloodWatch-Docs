import { useEffect, useRef, useState } from 'react'
import { CodeTabs } from './components/CodeBlock'
import LiveDemo from './components/LiveDemo'

// ── Theme ──────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('fw-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('fw-theme', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, setDark]
}

// ── Navigation ─────────────────────────────────────────────────
const NAV = [
  { group: 'Getting Started', items: [
    { id: 'overview',     label: 'Overview' },
    { id: 'base-url',     label: 'Base URL' },
    { id: 'cors',         label: 'CORS & Auth' },
    { id: 'sample-data',  label: 'Sample Data' },
  ]},
  { group: 'REST Endpoints', items: [
    { id: 'ep-stats',     label: 'Global stats',       badge: 'GET' },
    { id: 'ep-villages',  label: 'Villages',            badge: 'GET' },
    { id: 'ep-masters',   label: 'Masters',             badge: 'GET' },
    { id: 'ep-nodes',     label: 'Nodes',               badge: 'GET' },
    { id: 'ep-readings',  label: 'Reading history',     badge: 'GET' },
    { id: 'ep-alerts',    label: 'Alerts',              badge: 'GET' },
    { id: 'ep-weather',   label: 'Weather',             badge: 'GET' },
    { id: 'ep-summaries', label: 'Summaries',           badge: 'GET' },
    { id: 'ep-events',    label: 'Event history',       badge: 'GET' },
  ]},
  { group: 'Server-Sent Events', items: [
    { id: 'sse-overview', label: 'Overview',            badge: 'SSE' },
    { id: 'ev-heartbeat', label: 'heartbeat' },
    { id: 'ev-flood',     label: 'flood_level' },
    { id: 'ev-alert',     label: 'alert' },
    { id: 'ev-weather',   label: 'weather_update' },
    { id: 'sse-live',     label: 'Live Demo' },
  ]},
  { group: 'Schema', items: [
    { id: 'schema-node',    label: 'Node object' },
    { id: 'schema-village', label: 'Village object' },
    { id: 'schema-alert',   label: 'Alert object' },
  ]},
]

// ── UI primitives ──────────────────────────────────────────────
function Section({ id, children }) {
  return <section id={id} className="mb-16 scroll-mt-6">{children}</section>
}

function H2({ children }) {
  return (
    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3 pb-3 border-b border-gray-200 dark:border-slate-800">
      {children}
    </h2>
  )
}

function H3({ children }) {
  return <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-2 mt-5">{children}</h3>
}

function P({ children }) {
  return <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-3">{children}</p>
}

function InlineCode({ children }) {
  return (
    <code className="bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-xs px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}

function Callout({ children, variant = 'blue' }) {
  const colors = {
    blue:   'border-blue-500/50  bg-blue-50   dark:bg-blue-950/30  text-gray-700 dark:text-slate-300',
    amber:  'border-amber-500/50 bg-amber-50  dark:bg-amber-950/30 text-gray-700 dark:text-slate-300',
    green:  'border-green-500/50 bg-green-50  dark:bg-green-950/30 text-gray-700 dark:text-slate-300',
    violet: 'border-violet-500/50 bg-violet-50 dark:bg-violet-950/30 text-gray-700 dark:text-slate-300',
  }
  return (
    <div className={`border-l-2 rounded-r-lg px-4 py-3 my-4 text-sm leading-relaxed ${colors[variant]}`}>
      {children}
    </div>
  )
}

function MethodBadge({ method }) {
  if (method === 'SSE') return (
    <span className="bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-800/60 font-mono text-xs font-semibold px-2 py-0.5 rounded">SSE</span>
  )
  return (
    <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60 font-mono text-xs font-semibold px-2 py-0.5 rounded">GET</span>
  )
}

function EndpointCard({ method = 'GET', path, description, children }) {
  const parts = path.split(/(\{[^}]+\})/)
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 mb-6">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-gray-800 dark:text-slate-200">
          {parts.map((p, i) =>
            p.startsWith('{')
              ? <span key={i} className="text-amber-600 dark:text-amber-400">{p}</span>
              : <span key={i}>{p}</span>
          )}
        </code>
      </div>
      <div className="px-4 py-4 bg-white dark:bg-slate-950/50">
        <P>{description}</P>
        {children}
      </div>
    </div>
  )
}

function EventCard({ name, color, description, children }) {
  const colors = {
    green:  'text-green-700 dark:text-green-400  border-green-200 dark:border-green-900/60  bg-green-50  dark:bg-green-950/20',
    red:    'text-red-700   dark:text-red-400    border-red-200   dark:border-red-900/60    bg-red-50    dark:bg-red-950/20',
    amber:  'text-amber-700 dark:text-amber-400  border-amber-200 dark:border-amber-900/60  bg-amber-50  dark:bg-amber-950/20',
    sky:    'text-sky-700   dark:text-sky-400    border-sky-200   dark:border-sky-900/60    bg-sky-50    dark:bg-sky-950/20',
    slate:  'text-gray-600  dark:text-slate-400  border-gray-200  dark:border-slate-800     bg-gray-50   dark:bg-slate-900/30',
  }
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 mb-6">
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${colors[color]}`}>
        <span className="font-mono font-bold text-sm">{name}</span>
      </div>
      <div className="px-4 py-4 bg-white dark:bg-slate-950/30">
        <P>{description}</P>
        {children}
      </div>
    </div>
  )
}

function SchemaTable({ rows }) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 mt-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-500 uppercase text-[0.65rem] tracking-wider">
            <th className="text-left px-4 py-2.5 font-semibold">Field / Param</th>
            <th className="text-left px-4 py-2.5 font-semibold">Type</th>
            <th className="text-left px-4 py-2.5 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([field, type, desc, nullable], i) => (
            <tr key={i} className="border-t border-gray-100 dark:border-slate-800">
              <td className="px-4 py-2.5 font-mono text-gray-800 dark:text-slate-200">{field}</td>
              <td className="px-4 py-2.5 font-mono text-violet-600 dark:text-violet-400 whitespace-nowrap">
                {type}{nullable && <span className="text-amber-500 dark:text-amber-600 ml-1">?</span>}
              </td>
              <td className="px-4 py-2.5 text-gray-600 dark:text-slate-400">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Code snippets ──────────────────────────────────────────────
const HOST = '159.223.70.28'

const tabs = {
  stats: [
    { label: 'curl', lang: 'bash', code: `curl http://${HOST}/api/v1/stats` },
    { label: 'Response', lang: 'json', code: `{\n  "total_villages":    2,\n  "total_river_nodes": 8,\n  "nodes_online":      6,\n  "nodes_offline":     2,\n  "total_alerts":      143,\n  "last_updated":      "2026-05-14T06:12:00Z",\n  "dataset":           "real"\n}` },
  ],
  villages: [
    { label: 'curl', lang: 'bash', code: `# Real villages only (default)\ncurl http://${HOST}/api/v1/villages\n\n# Include sample villages\ncurl "http://${HOST}/api/v1/villages?dataset=all"` },
    { label: 'Response', lang: 'json', code: `[\n  {\n    "village_id": "PITAS-SOSOP",\n    "name":       "Kg. Sosop Pitas",\n    "lat":        6.6490674,\n    "lng":        117.0712744,\n    "district":   "Pitas",\n    "state":      "Sabah",\n    "total_nodes": 5,\n    "nodes_online": 4,\n    "last_seen":   "2026-05-14T06:10:32Z",\n    "weather": {\n      "temperature_c":    29.8,\n      "rain_mm":          2.1,\n      "weather_code":     51\n    }\n  }\n]` },
  ],
  village: [
    { label: 'curl', lang: 'bash', code: `curl http://${HOST}/api/v1/villages/PITAS-SOSOP` },
    { label: 'Response', lang: 'json', code: `{\n  "village_id": "PITAS-SOSOP",\n  "name":       "Kg. Sosop Pitas",\n  "topology": {\n    "master":     "SOS-MASTER-01",\n    "node_count": 5,\n    "chains": [\n      { "id": "A", "nodes": ["SOS-A1","SOS-A2","SOS-A3"] },\n      { "id": "B", "nodes": ["SOS-B1","SOS-B2"] }\n    ]\n  },\n  "weather": { "temperature_c": 29.8, "humidity_pct": 82, "rain_mm": 2.1 },\n  "weather_forecast": [ { "hour": "2026-05-14T07:00:00Z", "precip_prob_pct": 65 } ]\n}` },
  ],
  nodes: [
    { label: 'curl', lang: 'bash', code: `# All nodes\ncurl http://${HOST}/api/v1/nodes\n\n# Filter by village\ncurl "http://${HOST}/api/v1/nodes?village_id=PITAS-SOSOP"\n\n# Nodes for a specific dataset\ncurl "http://${HOST}/api/v1/nodes?dataset=sample"` },
    { label: 'Response', lang: 'json', code: `[\n  {\n    "node_id":         "SOS-A1",\n    "village_id":      "PITAS-SOSOP",\n    "parent_id":       "SOS-MASTER-01",\n    "depth":           1,\n    "status":          "online",\n    "last_seen":       "2026-05-14T06:10:32Z",\n    "water_level":     1,\n    "float_bits":      1,\n    "battery_voltage": 4.02,\n    "gps_fix":         true,\n    "lat":             6.6492,\n    "lng":             117.0700,\n    "rssi":            -78,\n    "snr":             8.4\n  }\n]` },
  ],
  readings: [
    { label: 'curl', lang: 'bash', code: `# Latest 50 readings\ncurl "http://${HOST}/api/v1/nodes/SOS-A1/readings"\n\n# GPS readings only for today\ncurl "http://${HOST}/api/v1/nodes/SOS-A1/readings?gps_only=true&from=2026-05-14T00:00:00Z"\n\n# Custom date range\ncurl "http://${HOST}/api/v1/nodes/SOS-A1/readings?from=2026-05-01T00:00:00Z&to=2026-05-14T00:00:00Z"` },
    { label: 'Response', lang: 'json', code: `{\n  "node_id":   "SOS-A1",\n  "page":      1,\n  "page_size": 50,\n  "total":     248,\n  "data": [\n    {\n      "timestamp":       "2026-05-14T06:10:32Z",\n      "water_level":     1,\n      "float_bits":      1,\n      "battery_voltage": 4.02,\n      "gps_fix":         true,\n      "lat":             6.6492,\n      "lng":             117.0700,\n      "rssi":            -78,\n      "snr":             8.4\n    }\n  ]\n}` },
  ],
  alerts: [
    { label: 'curl', lang: 'bash', code: `# All alerts\ncurl http://${HOST}/api/v1/alerts\n\n# Flood alerts for one village\ncurl "http://${HOST}/api/v1/alerts?village_id=PITAS-SOSOP&alert_type=flood"\n\n# Battery alerts this week\ncurl "http://${HOST}/api/v1/alerts?alert_type=battery_low&from=2026-05-07T00:00:00Z"` },
    { label: 'Response', lang: 'json', code: `{\n  "page": 1,\n  "page_size": 50,\n  "data": [\n    {\n      "node_id":          "SOS-C3",\n      "village_id":       "PITAS-SOSOP",\n      "timestamp":        "2026-05-14T04:22:11Z",\n      "alert_type":       "flood",\n      "level":            3,\n      "water_level":      3,\n      "battery_voltage":  3.72,\n      "gps_fix":          true,\n      "lat":              6.6482,\n      "lng":              117.0750,\n      "weather_at_alert": { "temperature_c": 27.1, "rain_mm": 8.4 }\n    }\n  ]\n}` },
  ],
  weather: [
    { label: 'History', lang: 'bash', code: `# Weather history for a village\ncurl "http://${HOST}/api/v1/weather/PITAS-SOSOP?from=2026-05-01T00:00:00Z"` },
    { label: 'Point-in-time', lang: 'bash', code: `# Last-known-value at a past moment\ncurl "http://${HOST}/api/v1/weather/PITAS-SOSOP/at?t=2026-05-10T12:00:00Z"` },
    { label: 'Response', lang: 'json', code: `{\n  "village_id":       "PITAS-SOSOP",\n  "timestamp":        "2026-05-14T06:00:00Z",\n  "temperature_c":    29.8,\n  "humidity_pct":     82,\n  "precipitation_mm": 2.1,\n  "rain_mm":          2.1,\n  "weather_code":     51,\n  "cloud_cover_pct":  70,\n  "wind_speed_kmh":   12.4,\n  "wind_gusts_kmh":   22.1\n}` },
  ],
  nodeSummary: [
    { label: 'curl', lang: 'bash', code: `# This month\ncurl "http://${HOST}/api/v1/nodes/SOS-A1/summary?period=month"\n\n# Custom range\ncurl "http://${HOST}/api/v1/nodes/SOS-A1/summary?from=2026-05-01T00:00:00Z&to=2026-05-14T00:00:00Z"\n\n# Sample data\ncurl "http://${HOST}/api/v1/nodes/SIM-SOS-A1/summary?dataset=sample"` },
    { label: 'Response', lang: 'json', code: `{\n  "node_id": "SOS-A1",\n  "period":  "month",\n  "from":    "2026-05-01T00:00:00Z",\n  "to":      "2026-05-14T06:12:00Z",\n  "readings": {\n    "count":           672,\n    "avg_water_level": 1.4,\n    "max_water_level": 3,\n    "avg_battery_v":   3.88,\n    "min_battery_v":   3.30\n  },\n  "alerts_by_type": { "flood": 4, "battery_low": 2 }\n}` },
  ],
  globalSummary: [
    { label: 'curl', lang: 'bash', code: `# Today across all real nodes\ncurl "http://${HOST}/api/v1/stats/summary?period=today"\n\n# Past week\ncurl "http://${HOST}/api/v1/stats/summary?period=week"\n\n# Include sample nodes\ncurl "http://${HOST}/api/v1/stats/summary?period=week&dataset=all"` },
    { label: 'Response', lang: 'json', code: `{\n  "period": "week",\n  "from":   "2026-05-07T00:00:00Z",\n  "to":     "2026-05-14T06:12:00Z",\n  "peak_water_level":  3,\n  "total_readings":    4482,\n  "total_alerts":      27,\n  "top_nodes": [\n    { "node_id": "SOS-C3", "avg_water_level": 2.6, "count": 338 }\n  ],\n  "top_villages": [\n    { "village_id": "PITAS-SOSOP", "total_alerts": 19 }\n  ]\n}` },
  ],
  sseJs: [
    { label: 'JavaScript', lang: 'javascript', code:
`const es = new EventSource("http://${HOST}/api/v1/events/stream");

// Every heartbeat from any node
es.addEventListener("heartbeat", e => {
  const { node_id, water_level, bat, timestamp } = JSON.parse(e.data);
  console.log(\`[\${node_id}] wl=\${water_level} bat=\${bat}V\`);
});

// Water level changed
es.addEventListener("flood_level", e => {
  const { node_id, water_level, water_level_prev } = JSON.parse(e.data);
  console.warn(\`[\${node_id}] \${water_level_prev} → \${water_level}\`);
});

// Flood / battery / GPS movement alerts
es.addEventListener("alert", e => {
  const { node_id, alert_type, level, bat } = JSON.parse(e.data);
  console.error(\`[\${node_id}] ALERT \${alert_type} level=\${level}\`);
});

// Village weather refresh
es.addEventListener("weather_update", e => {
  const { village_id, temperature_c, rain_mm } = JSON.parse(e.data);
  console.log(\`[\${village_id}] \${temperature_c}°C rain=\${rain_mm}mm\`);
});

es.onerror = err => console.error("SSE error", err);` },
    { label: 'React hook', lang: 'javascript', code:
`import { useEffect } from "react";

const EVENT_TYPES = ["heartbeat", "flood_level", "alert", "weather_update", "node_announce"];

export function useFloodWatch(apiBase, dataset = "real", onEvent) {
  useEffect(() => {
    const url = \`\${apiBase}/api/v1/events/stream?dataset=\${dataset}\`;
    const es  = new EventSource(url);
    EVENT_TYPES.forEach(type =>
      es.addEventListener(type, e => onEvent(type, JSON.parse(e.data)))
    );
    return () => es.close();
  }, [apiBase, dataset]);
}

// Usage:
// useFloodWatch("http://${HOST}", "real", (type, data) => {
//   if (type === "flood_level" && data.water_level >= 3) showFloodAlert(data);
//   if (type === "alert" && data.alert_type === "battery_critical") notifyMaintenance(data);
// });` },
    { label: 'curl', lang: 'bash', code:
`# All events
curl -N http://${HOST}/api/v1/events/stream

# Flood and alert events only
curl -N "http://${HOST}/api/v1/events/stream?types=flood_level,alert"

# Sample data events
curl -N "http://${HOST}/api/v1/events/stream?dataset=sample"` },
    { label: 'Python', lang: 'python', code:
`import httpx, json

url = "http://${HOST}/api/v1/events/stream"
with httpx.stream("GET", url, timeout=None) as r:
    for line in r.iter_lines():
        if line.startswith("data:"):
            event = json.loads(line[5:].strip())
            print(event["type"], event.get("node_id"))` },
  ],
}

// ── Sidebar ────────────────────────────────────────────────────
function Sidebar({ active, dark, setDark }) {
  const badgeStyle = {
    GET: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-900/60',
    SSE: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 border border-violet-300 dark:border-violet-900/60',
  }

  return (
    <aside className="w-60 min-w-60 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen sticky top-0 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-none">FloodWatch</div>
              <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 font-mono">API v1</div>
            </div>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="p-1.5 rounded-md text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 flex-1">
        {NAV.map(group => (
          <div key={group.group} className="mb-5">
            <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-600">
              {group.group}
            </div>
            {group.items.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] transition-colors ${
                  active === item.id
                    ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-slate-100'
                    : 'text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeStyle[item.badge]}`}>
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-200 dark:border-slate-800">
        <p className="text-[11px] text-gray-400 dark:text-slate-600">SUTS FYP · IoT Flood Monitor</p>
        <p className="text-[11px] text-gray-300 dark:text-slate-700 mt-0.5">Pitas, Sabah · 2026</p>
      </div>
    </aside>
  )
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [dark, setDark] = useTheme()
  const mainRef = useRef(null)

  useEffect(() => {
    const allIds = NAV.flatMap(g => g.items.map(i => i.id))
    const observers = allIds.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-20% 0px -70% 0px' }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans">
      <Sidebar active={activeSection} dark={dark} setDark={setDark} />

      <main ref={mainRef} className="flex-1 max-w-3xl px-10 py-12 overflow-x-hidden">

        {/* ── Overview ── */}
        <Section id="overview">
          <H2>Overview</H2>
          <P>
            The FloodWatch API exposes real-time flood sensor data from ESP32 river nodes deployed
            in Pitas, Sabah, Malaysia. Nodes report battery voltage, GPS location, and water level
            via LoRa 433 MHz to a master gateway, which publishes readings over MQTT. A parser
            service writes every reading to MongoDB Atlas.
          </P>
          <P>
            Two consumption patterns are available:{' '}
            <strong className="text-gray-800 dark:text-slate-200">REST</strong> for querying history and aggregates, and{' '}
            <strong className="text-gray-800 dark:text-slate-200">Server-Sent Events (SSE)</strong> for
            live push the moment a reading is processed.
          </P>
          <Callout>
            <strong className="text-gray-900 dark:text-slate-200">How real-time works internally</strong><br />
            The parser publishes events to a Redis Pub/Sub channel. The API subscribes to Redis and
            fans each message to all connected SSE clients with sub-millisecond overhead. Any backend
            service (health-checker, simulator) can inject events by publishing to the same channel
            with no changes to the API.
          </Callout>
        </Section>

        {/* ── Base URL ── */}
        <Section id="base-url">
          <H2>Base URL</H2>
          <Callout>
            <strong className="text-gray-900 dark:text-slate-200 block mb-1.5">Staging</strong>
            <InlineCode>http://{HOST}</InlineCode>
            <br /><br />
            <strong className="text-gray-900 dark:text-slate-200 block mb-1.5">Interactive Swagger UI</strong>
            <InlineCode>http://{HOST}/docs</InlineCode>
            <br />
            <span className="text-xs text-gray-500 dark:text-slate-500 mt-1 block">
              FastAPI auto-generates the Swagger UI — try every endpoint in-browser without writing code.
            </span>
          </Callout>
        </Section>

        {/* ── CORS ── */}
        <Section id="cors">
          <H2>CORS &amp; Auth</H2>
          <P>
            All endpoints accept requests from any origin{' '}
            (<InlineCode>Access-Control-Allow-Origin: *</InlineCode>). No API key or authentication
            required — all data is publicly readable.
          </P>
        </Section>

        {/* ── Sample Data ── */}
        <Section id="sample-data">
          <H2>Sample Data</H2>
          <P>
            Every data endpoint accepts a <InlineCode>?dataset=</InlineCode> query parameter to
            control which data is returned. This lets you demonstrate the system with pre-generated
            demo data alongside — or instead of — live sensor data.
          </P>
          <SchemaTable rows={[
            ['dataset=real',   'default', 'Live sensor data only — documents without is_sample flag'],
            ['dataset=sample', 'string',  'Pre-generated demo data from the IoT simulator'],
            ['dataset=all',    'string',  'Both real and sample combined'],
          ]} />
          <Callout variant="green">
            <strong className="text-gray-900 dark:text-slate-200">Demo villages</strong><br />
            The simulator populates two sample villages — <InlineCode>SIM-PITAS-SOSOP</InlineCode> and{' '}
            <InlineCode>SIM-PITAS-MANDAMAI</InlineCode> — with 22 personality-driven nodes that
            continuously send water level and battery events. Use <InlineCode>?dataset=sample</InlineCode>{' '}
            to query them, or connect the SSE playground with <strong>dataset = sample</strong> to
            see live events without physical hardware.
          </Callout>
          <Callout variant="amber">
            Summary endpoints (<InlineCode>/summary</InlineCode>, <InlineCode>/stats/summary</InlineCode>)
            compute aggregates live — they always respect the <InlineCode>?dataset=</InlineCode> param.
            The global <InlineCode>/stats</InlineCode> endpoint uses a pre-computed document for{' '}
            <InlineCode>dataset=real</InlineCode> and computes live for <InlineCode>sample</InlineCode>{' '}
            or <InlineCode>all</InlineCode>.
          </Callout>
        </Section>

        {/* ── Global Stats ── */}
        <Section id="ep-stats">
          <H2>Global stats</H2>
          <EndpointCard
            path="/api/v1/stats"
            description="System-wide totals: villages, nodes online/offline, total alerts."
          >
            <SchemaTable rows={[
              ['dataset', 'real|sample|all', 'Which data to count (default: real)'],
            ]} />
            <CodeTabs tabs={tabs.stats} />
          </EndpointCard>
        </Section>

        {/* ── Villages ── */}
        <Section id="ep-villages">
          <H2>Villages</H2>
          <EndpointCard
            path="/api/v1/villages"
            description="List all villages with current weather snapshot. Excludes topology and 24-hour forecast to keep the list lightweight."
          >
            <SchemaTable rows={[
              ['dataset', 'real|sample|all', 'Filter by data source (default: real)'],
            ]} />
            <CodeTabs tabs={tabs.villages} />
          </EndpointCard>
          <EndpointCard
            path="/api/v1/villages/{village_id}"
            description="Full village document including network topology, current weather, and 24-hour hourly forecast."
          >
            <CodeTabs tabs={tabs.village} />
          </EndpointCard>
        </Section>

        {/* ── Masters ── */}
        <Section id="ep-masters">
          <H2>Masters</H2>
          <EndpointCard
            path="/api/v1/masters"
            description="List all master gateway nodes. Masters bridge LoRa ↔ MQTT and do not have float sensors."
          >
            <SchemaTable rows={[
              ['village_id', 'string',          'Filter by village (optional)'],
              ['dataset',    'real|sample|all', 'Filter by data source (default: real)'],
            ]} />
            <CodeTabs tabs={[
              { label: 'curl', lang: 'bash', code: `curl "http://${HOST}/api/v1/masters?village_id=PITAS-SOSOP"` },
              { label: 'Response', lang: 'json', code: `[\n  {\n    "node_id":    "SOS-MASTER-01",\n    "village_id": "PITAS-SOSOP",\n    "status":     "online",\n    "last_seen":  "2026-05-14T06:10:32Z"\n  }\n]` },
            ]} />
          </EndpointCard>
        </Section>

        {/* ── Nodes ── */}
        <Section id="ep-nodes">
          <H2>Nodes</H2>
          <EndpointCard
            path="/api/v1/nodes"
            description="List all river sensor nodes with their latest reading. Use village_id to scope to one deployment."
          >
            <SchemaTable rows={[
              ['village_id', 'string',          'Filter to one village (optional)'],
              ['dataset',    'real|sample|all', 'Filter by data source (default: real)'],
            ]} />
            <CodeTabs tabs={tabs.nodes} />
          </EndpointCard>
          <EndpointCard
            path="/api/v1/nodes/{node_id}"
            description="Single node with full live state. Returns 404 if the node has never sent a reading."
          >
            <SchemaTable rows={[
              ['dataset', 'real|sample|all', 'Allows querying sample nodes by ID (default: real)'],
            ]} />
          </EndpointCard>
        </Section>

        {/* ── Reading history ── */}
        <Section id="ep-readings">
          <H2>Reading history</H2>
          <EndpointCard
            path="/api/v1/nodes/{node_id}/readings"
            description="Paginated heartbeat history for a node, newest first. Heartbeats are retained for 30 days by MongoDB TTL."
          >
            <SchemaTable rows={[
              ['from',      'ISO 8601', 'Start of time window (inclusive, optional)'],
              ['to',        'ISO 8601', 'End of time window (exclusive, optional)'],
              ['gps_only',  'boolean',  'Only return readings with a valid GPS fix (default: false)'],
              ['page',      'integer',  '1-based page (default: 1)'],
              ['page_size', 'integer',  'Max 200 (default: 50)'],
              ['dataset',   'real|sample|all', 'Data source (default: real)'],
            ]} />
            <CodeTabs tabs={tabs.readings} />
          </EndpointCard>
        </Section>

        {/* ── Alerts ── */}
        <Section id="ep-alerts">
          <H2>Alerts</H2>
          <EndpointCard
            path="/api/v1/alerts"
            description="Paginated alert history across all nodes. Each alert includes the village weather snapshot at the time it was triggered."
          >
            <SchemaTable rows={[
              ['village_id', 'string',   'Filter by village (optional)'],
              ['node_id',    'string',   'Filter by node (optional)'],
              ['alert_type', 'string',   'flood | water_fall | battery_low | battery_critical | gps_moved'],
              ['from',       'ISO 8601', 'Start of time window (optional)'],
              ['to',         'ISO 8601', 'End of time window (optional)'],
              ['page',       'integer',  '1-based page (default: 1)'],
              ['page_size',  'integer',  'Max 200 (default: 50)'],
              ['dataset',    'real|sample|all', 'Data source (default: real)'],
            ]} />
            <CodeTabs tabs={tabs.alerts} />
          </EndpointCard>
        </Section>

        {/* ── Weather ── */}
        <Section id="ep-weather">
          <H2>Weather</H2>
          <P>
            The weather poller fetches Open-Meteo every 30 minutes for each village and stores
            a snapshot. Sample villages use simulated weather (no API calls).
          </P>
          <EndpointCard
            path="/api/v1/weather/{village_id}/at"
            description="Returns the last-known-value weather snapshot at or before a given timestamp. Useful for correlating historical alerts with weather conditions."
          >
            <SchemaTable rows={[
              ['t',       'ISO 8601', 'Point-in-time to query (required)'],
              ['dataset', 'real|sample|all', 'Data source (default: real)'],
            ]} />
          </EndpointCard>
          <EndpointCard
            path="/api/v1/weather/{village_id}"
            description="Paginated weather history for a village, newest first. Retained 90 days."
          >
            <SchemaTable rows={[
              ['from',      'ISO 8601', 'Start of window (optional)'],
              ['to',        'ISO 8601', 'End of window (optional)'],
              ['page',      'integer',  '1-based page (default: 1)'],
              ['page_size', 'integer',  'Max 200 (default: 50)'],
              ['dataset',   'real|sample|all', 'Data source (default: real)'],
            ]} />
            <CodeTabs tabs={tabs.weather} />
          </EndpointCard>
        </Section>

        {/* ── Summaries ── */}
        <Section id="ep-summaries">
          <H2>Summaries</H2>
          <P>
            Aggregate endpoints compute average/min/max readings and alert breakdowns over a
            time window. Use the <InlineCode>period</InlineCode> shorthand or supply explicit
            <InlineCode>from</InlineCode> / <InlineCode>to</InlineCode> timestamps.
          </P>
          <SchemaTable rows={[
            ['period', 'today|week|month', 'Shorthand window relative to current UTC time'],
            ['from',   'ISO 8601',         'Explicit window start (overrides period)'],
            ['to',     'ISO 8601',         'Explicit window end'],
            ['dataset','real|sample|all',  'Data source (default: real)'],
          ]} />

          <H3>Node summary</H3>
          <EndpointCard
            path="/api/v1/nodes/{node_id}/summary"
            description="Average, min, max water level and battery for a single node, plus alert counts by type."
          >
            <CodeTabs tabs={tabs.nodeSummary} />
          </EndpointCard>

          <H3>Village summary</H3>
          <EndpointCard
            path="/api/v1/villages/{village_id}/summary"
            description="Per-node breakdown of all nodes in a village — the same stats as the node summary but returned as an array."
          >
            <CodeTabs tabs={[
              { label: 'curl', lang: 'bash', code: `curl "http://${HOST}/api/v1/villages/PITAS-SOSOP/summary?period=week"` },
              { label: 'Response', lang: 'json', code: `{\n  "village_id": "PITAS-SOSOP",\n  "period": "week",\n  "nodes": [\n    {\n      "node_id": "SOS-A1",\n      "avg_water_level": 1.1,\n      "max_water_level": 2,\n      "alert_counts": { "flood": 0, "battery_low": 1 }\n    }\n  ]\n}` },
            ]} />
          </EndpointCard>

          <H3>Global summary</H3>
          <EndpointCard
            path="/api/v1/stats/summary"
            description="System-wide aggregate: peak level, total readings, top 5 most active nodes and most-alerted villages."
          >
            <CodeTabs tabs={tabs.globalSummary} />
          </EndpointCard>
        </Section>

        {/* ── Event history ── */}
        <Section id="ep-events">
          <H2>Event history</H2>
          <EndpointCard
            path="/api/v1/events/history"
            description="Paginated log of all events (announce, heartbeat, flood_level, alert). Retained 30 days by TTL."
          >
            <SchemaTable rows={[
              ['village_id', 'string',          'Filter by village (optional)'],
              ['node_id',    'string',           'Filter by node (optional)'],
              ['event_type', 'string',           'Filter by event type (optional)'],
              ['from',       'ISO 8601',         'Start of window (optional)'],
              ['to',         'ISO 8601',         'End of window (optional)'],
              ['page',       'integer',          '1-based page (default: 1)'],
              ['page_size',  'integer',          'Max 200 (default: 50)'],
              ['dataset',    'real|sample|all',  'Data source (default: real)'],
            ]} />
            <CodeTabs tabs={[
              { label: 'curl', lang: 'bash', code: `curl "http://${HOST}/api/v1/events/history?event_type=announce&page_size=10"` },
              { label: 'Response', lang: 'json', code: `{\n  "page": 1,\n  "page_size": 10,\n  "data": [\n    {\n      "event_type": "announce",\n      "node_id":    "SOS-A1",\n      "village_id": "PITAS-SOSOP",\n      "timestamp":  "2026-05-12T08:00:00Z",\n      "data": { "depth": 1, "parent": "SOS-MASTER-01", "lat": 6.6492, "lng": 117.0700 }\n    }\n  ]\n}` },
            ]} />
          </EndpointCard>
        </Section>

        {/* ── SSE Overview ── */}
        <Section id="sse-overview">
          <H2>Server-Sent Events</H2>
          <P>
            Connect to <InlineCode>/api/v1/events/stream</InlineCode> using the browser's built-in{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/EventSource" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              EventSource API
            </a>.
            Named event types let you register handlers for exactly what you care about.
            The <InlineCode>types</InlineCode> parameter limits the event types the server sends.
            The <InlineCode>dataset</InlineCode> parameter controls whether real, sample, or both
            event streams are forwarded.
          </P>
          <Callout>
            <strong className="text-gray-900 dark:text-slate-200">Endpoint</strong><br />
            <InlineCode>GET /api/v1/events/stream?types=heartbeat,flood_level,alert&amp;dataset=real</InlineCode>
          </Callout>
          <CodeTabs tabs={tabs.sseJs} />
        </Section>

        {/* ── heartbeat ── */}
        <Section id="ev-heartbeat">
          <H2>Event: heartbeat</H2>
          <EventCard name="heartbeat" color="green" description="Emitted for every heartbeat received from any river node. ~30 second cadence per node.">
            <CodeTabs tabs={[{ label: 'Payload', lang: 'json', code:
`event: heartbeat
data: {
  "type":       "heartbeat",
  "node_id":    "SOS-A1",
  "village_id": "PITAS-SOSOP",
  "water_level": 1,
  "float_bits":  1,
  "bat":         4.02,
  "gps_fix":     true,
  "lat":         6.6492,
  "lng":         117.0700,
  "depth":       1,
  "parent":      "SOS-MASTER-01",
  "rssi":        -78,
  "snr":         8.4,
  "timestamp":   "2026-05-14T06:10:32Z"
}` }]} />
            <SchemaTable rows={[
              ['node_id',    'string',   'Node identifier'],
              ['water_level','0|1|2|3',  '0 = dry, 3 = all sensors submerged'],
              ['float_bits', 'integer',  'Raw bitmask: bit0=low, bit1=mid, bit2=high sensor'],
              ['bat',        'number',   'Battery voltage in volts (Li-Ion: 3.3–4.2 V)'],
              ['gps_fix',    'boolean',  'Whether GPS coordinates are valid'],
              ['lat / lng',  'number',   'GPS position (null if gps_fix is false)', true],
              ['depth',      'integer',  'Hops from master in the LoRa mesh'],
            ]} />
          </EventCard>
        </Section>

        {/* ── flood_level ── */}
        <Section id="ev-flood">
          <H2>Event: flood_level</H2>
          <EventCard name="flood_level" color="red" description="Emitted when water_level changes — both when flooding starts and when it clears.">
            <CodeTabs tabs={[{ label: 'Payload', lang: 'json', code:
`event: flood_level
data: {
  "type":             "flood_level",
  "node_id":          "SOS-C3",
  "village_id":       "PITAS-SOSOP",
  "water_level":      3,
  "water_level_prev": 2,
  "float_bits":       7,
  "gps_fix":          true,
  "lat":              6.6482,
  "lng":              117.0750,
  "timestamp":        "2026-05-14T04:22:11Z"
}` }]} />
            <SchemaTable rows={[
              ['water_level',      '0|1|2|3',       'New level — 0 means flooding cleared'],
              ['water_level_prev', '0|1|2|3|null',  'Level before this change (null = first reading)', true],
            ]} />
          </EventCard>
        </Section>

        {/* ── alert ── */}
        <Section id="ev-alert">
          <H2>Event: alert</H2>
          <EventCard name="alert" color="amber" description="Emitted for every node alert. Check alert_type to distinguish flood events from battery and GPS alerts.">
            <CodeTabs tabs={[{ label: 'Payload', lang: 'json', code:
`event: alert
data: {
  "type":       "alert",
  "node_id":    "SOS-C3",
  "village_id": "PITAS-SOSOP",
  "alert_type": "flood",        // flood | water_fall | battery_low | battery_critical | gps_moved
  "level":      3,              // water level at time of alert (flood only)
  "float_bits": 7,
  "bat":        3.72,
  "gps_fix":    true,
  "lat":        6.6482,
  "lng":        117.0750,
  "dist_m":     null,           // metres from install position (gps_moved only)
  "home_lat":   null,           // install position (gps_moved only)
  "home_lng":   null,
  "rssi":       -81,
  "timestamp":  "2026-05-14T04:22:11Z"
}` }]} />
            <SchemaTable rows={[
              ['alert_type', 'string',  'flood | water_fall | battery_low | battery_critical | gps_moved'],
              ['level',      '0|1|2|3','Water level at alert time (flood events only)', true],
              ['bat',        'number',  'Battery voltage at alert time'],
              ['dist_m',     'number',  'Distance from install GPS in metres (gps_moved only)', true],
              ['home_lat/lng','number', 'Install-position GPS (gps_moved only)', true],
            ]} />
          </EventCard>
        </Section>

        {/* ── weather_update ── */}
        <Section id="ev-weather">
          <H2>Event: weather_update</H2>
          <EventCard name="weather_update" color="sky" description="Published when village weather is refreshed (~30 min cadence for real villages; faster for sample villages from the simulator).">
            <CodeTabs tabs={[{ label: 'Payload', lang: 'json', code:
`event: weather_update
data: {
  "type":             "weather_update",
  "village_id":       "PITAS-SOSOP",
  "temperature_c":    29.8,
  "humidity_pct":     82,
  "precipitation_mm": 2.1,
  "rain_mm":          2.1,
  "weather_code":     51,
  "cloud_cover_pct":  68,
  "wind_speed_kmh":   12.4,
  "wind_gusts_kmh":   22.1,
  "is_day":           true,
  "timestamp":        "2026-05-14T06:00:00Z"
}` }]} />
            <SchemaTable rows={[
              ['temperature_c',     'number', 'Air temperature at 2 m (°C)'],
              ['humidity_pct',      'integer','Relative humidity (%)'],
              ['precipitation_mm',  'number', 'Total precipitation this hour (mm)'],
              ['weather_code',      'integer', 'WMO weather interpretation code'],
              ['wind_speed_kmh',    'number', 'Wind speed at 10 m (km/h)'],
            ]} />
          </EventCard>
        </Section>

        {/* ── Live Demo ── */}
        <Section id="sse-live">
          <H2>Live Demo</H2>
          <P>
            Connect to the live event stream below. Select <strong>sample</strong> dataset to
            see events from the simulator without needing physical hardware. Alert events are
            labelled <InlineCode>alert:flood</InlineCode>, <InlineCode>alert:battery_low</InlineCode>, etc.
          </P>
          <LiveDemo />
        </Section>

        {/* ── Schema: Node ── */}
        <Section id="schema-node">
          <H2>Node object</H2>
          <P>Returned by <InlineCode>/api/v1/nodes</InlineCode> and <InlineCode>/api/v1/nodes/{'{node_id}'}</InlineCode>.</P>
          <SchemaTable rows={[
            ['node_id',         'string',   'Unique identifier stored in ESP32 flash',          false],
            ['village_id',      'string',   'Parent village identifier',                         false],
            ['parent_id',       'string',   'Direct LoRa relay (master or another node)',        false],
            ['depth',           'integer',  'Hop count from master (1 = direct)',                false],
            ['status',          'online|offline', 'Derived from last_seen recency',             false],
            ['water_level',     '0|1|2|3',  '0 = dry, 3 = high sensor submerged',               false],
            ['float_bits',      'integer',  'Raw bitmask: bit0=low, bit1=mid, bit2=high',        false],
            ['battery_voltage', 'number',   'Volts (Li-Ion range: 3.3–4.2 V)',                  false],
            ['gps_fix',         'boolean',  'Whether lat/lng are valid',                         false],
            ['lat / lng',       'number',   'GPS position (null if no fix)',                     true],
            ['install_lat/lng', 'number',   'Calibrated install position from GPS announce',     true],
            ['rssi',            'integer',  'LoRa received signal strength (dBm)',               true],
            ['snr',             'number',   'LoRa signal-to-noise ratio (dB)',                   true],
            ['last_seen',       'ISO 8601', 'UTC time of last heartbeat',                        false],
            ['first_seen',      'ISO 8601', 'UTC time of first ever reading',                    false],
          ]} />
          <Callout variant="blue">
            <strong className="text-gray-900 dark:text-slate-200">float_bits encoding</strong><br />
            The 3-bit integer mirrors the firmware float-switch bitmask. Bit 0 (value 1) = low
            sensor, bit 1 (value 2) = mid, bit 2 (value 4) = high. Level 3 = all bits set = 7 (0b111).
            <InlineCode>water_level</InlineCode> is the highest active bit index (0–3).
          </Callout>
        </Section>

        {/* ── Schema: Village ── */}
        <Section id="schema-village">
          <H2>Village object</H2>
          <P>Core fields on every village document.</P>
          <SchemaTable rows={[
            ['village_id',     'string',   'Unique identifier',                                  false],
            ['name',           'string',   'Human-readable name',                                false],
            ['lat / lng',      'number',   'Village centroid GPS',                               true],
            ['district',       'string',   'Administrative district',                            true],
            ['state',          'string',   'Malaysian state',                                    true],
            ['total_nodes',    'integer',  'River nodes registered to this village',             false],
            ['total_alerts',   'integer',  'All-time alert count',                               false],
            ['alerts_by_type', 'object',   'Alert counts keyed by alert_type',                  false],
            ['weather',        'object',   'Latest weather snapshot (see weather_update event)', true],
            ['weather_forecast','array',   '24-hour hourly forecast (list endpoint excludes)',   true],
            ['topology',       'object',   'Master + chain layout (detail endpoint only)',       true],
            ['last_seen',      'ISO 8601', 'Most recent heartbeat from any node',                false],
          ]} />
        </Section>

        {/* ── Schema: Alert ── */}
        <Section id="schema-alert">
          <H2>Alert object</H2>
          <P>Stored in the <InlineCode>alerts</InlineCode> collection and returned by <InlineCode>/api/v1/alerts</InlineCode>. Retained 90 days.</P>
          <SchemaTable rows={[
            ['node_id',         'string',   'Node that triggered the alert',                     false],
            ['village_id',      'string',   'Village of the node',                               false],
            ['timestamp',       'ISO 8601', 'UTC time the alert was processed',                  false],
            ['alert_type',      'string',   'flood | water_fall | battery_low | battery_critical | gps_moved', false],
            ['level',           '0|1|2|3',  'Water level (flood alerts only)',                   true],
            ['float_bits',      'integer',  'Float bitmask (flood alerts only)',                 true],
            ['battery_voltage', 'number',   'Battery voltage at alert time',                     false],
            ['gps_fix',         'boolean',  'Whether lat/lng are valid',                         false],
            ['lat / lng',       'number',   'GPS at alert time',                                 true],
            ['dist_m',          'number',   'Metres from install position (gps_moved only)',     true],
            ['home_lat/lng',    'number',   'Install position GPS (gps_moved only)',             true],
            ['weather_at_alert','object',   'Village weather snapshot at alert time',            true],
          ]} />
        </Section>

      </main>
    </div>
  )
}
