import { useEffect, useRef, useState } from 'react'
import { CodeTabs } from './components/CodeBlock'
import LiveDemo from './components/LiveDemo'

// ── Navigation ────────────────────────────────────────────────
const NAV = [
  { group: 'Getting Started', items: [
    { id: 'overview',    label: 'Overview' },
    { id: 'base-url',    label: 'Base URL' },
    { id: 'cors',        label: 'CORS & Auth' },
  ]},
  { group: 'REST Endpoints', items: [
    { id: 'ep-nodes',    label: 'List nodes',        badge: 'GET' },
    { id: 'ep-node',     label: 'Get node',          badge: 'GET' },
    { id: 'ep-readings', label: 'Reading history',   badge: 'GET' },
  ]},
  { group: 'Event Log (REST)', items: [
    { id: 'ep-event-history', label: 'Event history',  badge: 'GET' },
  ]},
  { group: 'Server-Sent Events', items: [
    { id: 'sse-overview',  label: 'Overview',       badge: 'SSE' },
    { id: 'ev-heartbeat',  label: 'heartbeat' },
    { id: 'ev-flood',      label: 'flood_level' },
    { id: 'ev-battery',    label: 'battery_low' },
    { id: 'ev-offline',    label: 'node_offline' },
    { id: 'sse-live',      label: 'Live Demo' },
  ]},
  { group: 'Schema', items: [
    { id: 'schema', label: 'Reading object' },
  ]},
]

// ── Helpers ───────────────────────────────────────────────────
function Section({ id, children }) {
  return <section id={id} className="mb-16 scroll-mt-6">{children}</section>
}

function H2({ children }) {
  return (
    <h2 className="text-xl font-bold text-slate-100 mb-3 pb-3 border-b border-slate-800">
      {children}
    </h2>
  )
}

function P({ children }) {
  return <p className="text-slate-400 text-sm leading-relaxed mb-3">{children}</p>
}

function InlineCode({ children }) {
  return <code className="bg-slate-800 text-blue-300 font-mono text-xs px-1.5 py-0.5 rounded">{children}</code>
}

function Callout({ children, variant = 'blue' }) {
  const colors = {
    blue:   'border-blue-600/50  bg-blue-950/30  text-slate-300',
    amber:  'border-amber-600/50 bg-amber-950/30 text-slate-300',
    green:  'border-green-600/50 bg-green-950/30 text-slate-300',
  }
  return (
    <div className={`border-l-2 rounded-r-lg px-4 py-3 my-4 text-sm leading-relaxed ${colors[variant]}`}>
      {children}
    </div>
  )
}

function MethodBadge({ method }) {
  if (method === 'SSE') return (
    <span className="bg-violet-950 text-violet-300 border border-violet-800/60 font-mono text-xs font-semibold px-2 py-0.5 rounded">SSE</span>
  )
  return (
    <span className="bg-blue-950 text-blue-300 border border-blue-800/60 font-mono text-xs font-semibold px-2 py-0.5 rounded">GET</span>
  )
}

function EndpointCard({ method, path, description, children }) {
  const params = path.split('/').filter(p => p.startsWith('{'))
  const parts  = path.split(/(\{[^}]+\})/)
  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 mb-6">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-slate-200">
          {parts.map((p, i) =>
            p.startsWith('{')
              ? <span key={i} className="text-amber-400">{p}</span>
              : <span key={i}>{p}</span>
          )}
        </code>
      </div>
      <div className="px-4 py-4 bg-surface-950/50">
        <P>{description}</P>
        {children}
      </div>
    </div>
  )
}

function EventCard({ name, color, description, children }) {
  const colors = {
    green:  'text-green-400 border-green-900/60 bg-green-950/20',
    red:    'text-red-400   border-red-900/60   bg-red-950/20',
    amber:  'text-amber-400 border-amber-900/60 bg-amber-950/20',
    slate:  'text-slate-400 border-slate-800    bg-slate-900/30',
  }
  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 mb-6">
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${colors[color]}`}>
        <span className="font-mono font-bold text-sm">{name}</span>
      </div>
      <div className="px-4 py-4">
        <P>{description}</P>
        {children}
      </div>
    </div>
  )
}

function SchemaTable({ rows }) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-800 mt-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-900 text-slate-500 uppercase text-[0.65rem] tracking-wider">
            <th className="text-left px-4 py-2.5 font-semibold">Field</th>
            <th className="text-left px-4 py-2.5 font-semibold">Type</th>
            <th className="text-left px-4 py-2.5 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([field, type, desc, nullable], i) => (
            <tr key={i} className="border-t border-slate-800">
              <td className="px-4 py-2.5 font-mono text-slate-200">{field}</td>
              <td className="px-4 py-2.5 font-mono text-violet-400 whitespace-nowrap">
                {type}
                {nullable && <span className="text-amber-600 ml-1">?</span>}
              </td>
              <td className="px-4 py-2.5 text-slate-400">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Code snippets ─────────────────────────────────────────────
const HOST = '<API_HOST>:8000'

const tabs = {
  listNodes: [
    { label: 'curl',       lang: 'bash',       code: `curl http://${HOST}/api/v1/nodes` },
    { label: 'JavaScript', lang: 'javascript',  code: `const nodes = await fetch("http://${HOST}/api/v1/nodes").then(r => r.json());\nnodes.forEach(n => console.log(n.node_id, "→ level", n.water_level));` },
    { label: 'Python',     lang: 'python',      code: `import httpx\nnodes = httpx.get("http://${HOST}/api/v1/nodes").json()\nfor n in nodes:\n    print(n["node_id"], "→ level", n["water_level"])` },
    { label: 'Response',   lang: 'json',        code: `[\n  {\n    "node_id":     "SUTS_White",\n    "lat":         1.559200,\n    "lng":         110.359000,\n    "float_bits":  "010",\n    "water_level": 2,\n    "voltage":     12.43,\n    "raw_adc":     1861,\n    "rssi":        -87,\n    "timestamp":   "2026-05-06T14:32:11.045000+00:00"\n  }\n]` },
  ],
  getNode: [
    { label: 'curl',       lang: 'bash',       code: `curl http://${HOST}/api/v1/nodes/SUTS_White` },
    { label: 'JavaScript', lang: 'javascript',  code: `const node = await fetch("http://${HOST}/api/v1/nodes/SUTS_White").then(r => r.json());\nconsole.log("Water level:", node.water_level);` },
    { label: 'Response',   lang: 'json',        code: `{\n  "node_id":     "SUTS_White",\n  "lat":         1.559200,\n  "lng":         110.359000,\n  "float_bits":  "010",\n  "water_level": 2,\n  "voltage":     12.43,\n  "raw_adc":     1861,\n  "rssi":        -87,\n  "timestamp":   "2026-05-06T14:32:11.045000+00:00"\n}` },
  ],
  readings: [
    { label: 'curl',       lang: 'bash',       code: `curl "http://${HOST}/api/v1/nodes/SUTS_White/readings?page=1&page_size=20"` },
    { label: 'JavaScript', lang: 'javascript',  code: `const { data } = await fetch(\n  "http://${HOST}/api/v1/nodes/SUTS_White/readings?page=1&page_size=20"\n).then(r => r.json());` },
    { label: 'Response',   lang: 'json',        code: `{\n  "node_id":   "SUTS_White",\n  "page":      1,\n  "page_size": 20,\n  "data": [ { ... } ]\n}` },
  ],
  sseJs: [
    {
      label: 'JavaScript',
      lang:  'javascript',
      code:
`const es = new EventSource("http://${HOST}/api/v1/events/stream");

es.addEventListener("heartbeat", e => {
  const { node_id, timestamp } = JSON.parse(e.data);
  console.log(\`[\${node_id}] alive at \${timestamp}\`);
});

es.addEventListener("flood_level", e => {
  const { node_id, water_level, water_level_prev, lat, lng } = JSON.parse(e.data);
  console.warn(\`[\${node_id}] level \${water_level_prev} → \${water_level}\`);
});

es.addEventListener("battery_low", e => {
  const { node_id, voltage } = JSON.parse(e.data);
  console.warn(\`[\${node_id}] battery \${voltage}V\`);
});

es.addEventListener("node_offline", e => {
  const { node_id, last_seen } = JSON.parse(e.data);
  console.error(\`[\${node_id}] offline, last seen \${last_seen}\`);
});

// EventSource reconnects automatically on error
es.onerror = err => console.error("SSE error", err);`,
    },
    {
      label: 'React hook',
      lang:  'javascript',
      code:
`import { useEffect } from "react";

const ALL_EVENTS = ["heartbeat", "flood_level", "battery_low", "node_offline"];

export function useFloodWatch(apiBase, onEvent) {
  useEffect(() => {
    const es = new EventSource(\`\${apiBase}/api/v1/events/stream\`);
    ALL_EVENTS.forEach(type =>
      es.addEventListener(type, e => onEvent(type, JSON.parse(e.data)))
    );
    return () => es.close();
  }, [apiBase]);
}

// Usage:
// useFloodWatch("http://${HOST}", (type, data) => {
//   if (type === "flood_level") showFloodAlert(data);
// });`,
    },
    {
      label: 'curl',
      lang:  'bash',
      code:
`# Stream all events
curl -N http://${HOST}/api/v1/events/stream

# Flood + offline only
curl -N "http://${HOST}/api/v1/events/stream?types=flood_level,node_offline"`,
    },
    {
      label: 'Python',
      lang:  'python',
      code:
`import httpx

with httpx.stream("GET", "http://${HOST}/api/v1/events") as r:
    for line in r.iter_lines():
        if line.startswith("data:"):
            print(line[5:].strip())`,
    },
  ],
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ active }) {
  const badgeStyle = {
    GET: 'bg-blue-950 text-blue-400 border border-blue-900/60',
    SSE: 'bg-violet-950 text-violet-400 border border-violet-900/60',
  }

  return (
    <aside className="w-60 min-w-60 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 leading-none">FloodWatch</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">API v1.0.0</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 flex-1">
        {NAV.map(group => (
          <div key={group.group} className="mb-5">
            <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              {group.group}
            </div>
            {group.items.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] transition-colors ${
                  active === item.id
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
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
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-[11px] text-slate-600">SUTS FYP · IoT Flood Monitor</p>
        <p className="text-[11px] text-slate-700 mt-0.5">Sarawak, Malaysia · 2026</p>
      </div>
    </aside>
  )
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const mainRef = useRef(null)

  // Scroll spy
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar active={activeSection} />

      <main ref={mainRef} className="flex-1 max-w-3xl px-10 py-12 overflow-x-hidden">

        {/* ── Overview ── */}
        <Section id="overview">
          <H2>Overview</H2>
          <P>
            The FloodWatch API exposes real-time flood sensor data collected from ESP32 river nodes
            deployed in Sarawak, Malaysia. Nodes report battery voltage, GPS location, and water
            level via LoRa 433 MHz to a master gateway, which publishes readings to an MQTT broker
            (Fly.io Singapore). A parser service writes every reading to MongoDB Atlas.
          </P>
          <P>
            There are two ways to consume data:{' '}
            <strong className="text-slate-200">REST</strong> for querying stored history, and{' '}
            <strong className="text-slate-200">Server-Sent Events (SSE)</strong> for receiving
            live pushes the moment a reading is processed.
          </P>
          <Callout>
            <strong className="text-slate-200">How SSE works internally</strong><br />
            The parser detects changes (water level shifts, low battery) and publishes them to a
            Redis Pub/Sub channel. The API subscribes to Redis and fans each message instantly to
            all connected SSE clients. Any backend service with <InlineCode>REDIS_URL</InlineCode>{' '}
            can inject events — no changes to the API needed.
          </Callout>
        </Section>

        {/* ── Base URL ── */}
        <Section id="base-url">
          <H2>Base URL</H2>
          <Callout>
            <strong className="text-slate-200 block mb-2">Staging (DigitalOcean droplet)</strong>
            <InlineCode>http://&lt;DO_DROPLET_IP&gt;:8000</InlineCode>
            <br /><br />
            <strong className="text-slate-200 block mb-2">Interactive Swagger UI</strong>
            <InlineCode>http://&lt;DO_DROPLET_IP&gt;:8000/docs</InlineCode>
          </Callout>
          <P>
            The Swagger UI auto-generated by FastAPI lets you try every endpoint in the browser
            without writing any code.
          </P>
        </Section>

        {/* ── CORS ── */}
        <Section id="cors">
          <H2>CORS &amp; Auth</H2>
          <P>
            All endpoints accept requests from any origin{' '}
            (<InlineCode>Access-Control-Allow-Origin: *</InlineCode>). No API key or
            authentication is required — all data is publicly readable.
          </P>
        </Section>

        {/* ── List nodes ── */}
        <Section id="ep-nodes">
          <H2>List nodes</H2>
          <EndpointCard
            method="GET"
            path="/api/v1/nodes"
            description="Returns every known node with its most recent reading. Use this to populate a map or dashboard summary."
          >
            <CodeTabs tabs={tabs.listNodes} />
          </EndpointCard>
        </Section>

        {/* ── Get node ── */}
        <Section id="ep-node">
          <H2>Get node</H2>
          <EndpointCard
            method="GET"
            path="/api/v1/nodes/{node_id}"
            description="Returns the single most recent reading for a given node. Returns 404 if the node ID has never sent a reading."
          >
            <CodeTabs tabs={tabs.getNode} />
          </EndpointCard>
        </Section>

        {/* ── Reading history ── */}
        <Section id="ep-readings">
          <H2>Reading history</H2>
          <EndpointCard
            method="GET"
            path="/api/v1/nodes/{node_id}/readings"
            description="Paginated history of all readings for a node, newest first."
          >
            <SchemaTable rows={[
              ['page',      'integer', '1-based page number (default: 1)'],
              ['page_size', 'integer', 'Results per page, max 200 (default: 50)'],
            ]} />
            <CodeTabs tabs={tabs.readings} />
          </EndpointCard>
        </Section>

        {/* ── Event history ── */}
        <Section id="ep-event-history">
          <H2>Event history</H2>
          <EndpointCard
            method="GET"
            path="/api/v1/events/history"
            description="Paginated log of all events emitted by any service (parser, health-checker, etc.), newest first. Events are retained for 30 days then auto-deleted by MongoDB TTL."
          >
            <SchemaTable rows={[
              ['type',      'string',  'Filter by event type: heartbeat, flood_level, battery_low, node_offline'],
              ['node_id',   'string',  'Filter by node ID'],
              ['page',      'integer', '1-based page number (default: 1)'],
              ['page_size', 'integer', 'Results per page, max 200 (default: 50)'],
            ]} />
            <CodeTabs tabs={[
              { label: 'curl', lang: 'bash',
                code: `# All flood events\ncurl "http://${HOST}/api/v1/events/history?type=flood_level"\n\n# All events for one node\ncurl "http://${HOST}/api/v1/events/history?node_id=SUTS_White"` },
              { label: 'Response', lang: 'json',
                code: `{\n  "page": 1,\n  "page_size": 50,\n  "filters": { "type": "flood_level", "node_id": null },\n  "data": [\n    {\n      "type":             "flood_level",\n      "node_id":          "SUTS_White",\n      "water_level":      2,\n      "water_level_prev": 0,\n      "float_bits":       "010",\n      "lat":              1.559200,\n      "lng":              110.359000,\n      "timestamp":        "2026-05-06T14:32:11.045000+00:00"\n    }\n  ]\n}` },
            ]} />
          </EndpointCard>
        </Section>

        {/* ── SSE Overview ── */}
        <Section id="sse-overview">
          <H2>Server-Sent Events</H2>
          <P>
            Connect to <InlineCode>/api/v1/events/stream</InlineCode> using the browser&apos;s built-in{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/EventSource" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              EventSource API
            </a>{' '}
            — no library needed. The <InlineCode>types</InlineCode> query parameter filters which
            event types you receive.
          </P>
          <Callout>
            <strong className="text-slate-200">Endpoint</strong><br />
            <InlineCode>GET /api/v1/events/stream?types=heartbeat,flood_level,battery_low,node_offline</InlineCode>
          </Callout>
          <CodeTabs tabs={tabs.sseJs} />
        </Section>

        {/* ── heartbeat ── */}
        <Section id="ev-heartbeat">
          <H2>Event: heartbeat</H2>
          <EventCard name="heartbeat" color="green" description="Emitted for every new reading received from any node. Use this to confirm a node is alive and sending.">
            <CodeTabs tabs={[{
              label: 'Payload', lang: 'json',
              code: `event: heartbeat\ndata: {\n  "type":      "heartbeat",\n  "node_id":   "SUTS_White",\n  "timestamp": "2026-05-06T14:32:11.045000+00:00"\n}`,
            }]} />
            <SchemaTable rows={[
              ['node_id',   'string',   'Node identifier'],
              ['timestamp', 'ISO 8601', 'UTC time the reading was stored by the parser'],
            ]} />
          </EventCard>
        </Section>

        {/* ── flood_level ── */}
        <Section id="ev-flood">
          <H2>Event: flood_level</H2>
          <EventCard name="flood_level" color="red" description="Emitted when a node's water_level changes — including when flooding clears (level drops back to 0). Published by the parser the instant it detects a change.">
            <CodeTabs tabs={[{
              label: 'Payload', lang: 'json',
              code: `event: flood_level\ndata: {\n  "type":             "flood_level",\n  "node_id":          "SUTS_White",\n  "water_level":      2,\n  "water_level_prev": 0,\n  "float_bits":       "010",\n  "lat":              1.559200,\n  "lng":              110.359000,\n  "timestamp":        "2026-05-06T14:32:11.045000+00:00"\n}`,
            }]} />
            <SchemaTable rows={[
              ['water_level',      '0|1|2|3',        'New water level — 0 means flooding cleared'],
              ['water_level_prev', '0|1|2|3|null',   'Previous level (null = first reading from this node)'],
              ['float_bits',       'string',          'Raw 3-bit state: bit0=3ft, bit1=2ft, bit2=1ft'],
              ['lat / lng',        'number',          'GPS coordinates (0.0 if no GPS fix)'],
            ]} />
          </EventCard>
        </Section>

        {/* ── battery_low ── */}
        <Section id="ev-battery">
          <H2>Event: battery_low</H2>
          <EventCard name="battery_low" color="amber" description="Emitted when a node reports a voltage below 11.5 V (configurable). Nodes send voltage with every reading.">
            <CodeTabs tabs={[{
              label: 'Payload', lang: 'json',
              code: `event: battery_low\ndata: {\n  "type":      "battery_low",\n  "node_id":   "SUTS_White",\n  "voltage":   10.82,\n  "threshold": 11.5,\n  "timestamp": "2026-05-06T14:32:11.045000+00:00"\n}`,
            }]} />
            <SchemaTable rows={[
              ['voltage',   'number', 'Measured battery voltage in volts'],
              ['threshold', 'number', 'Configured low-voltage threshold (default 11.5 V)'],
            ]} />
          </EventCard>
        </Section>

        {/* ── node_offline ── */}
        <Section id="ev-offline">
          <H2>Event: node_offline</H2>
          <EventCard name="node_offline" color="slate" description="Emitted by the health-checker service when a node that was previously active stops sending readings for more than 1 minute. Published to the same Redis channel — the API forwards it to SSE clients automatically.">
            <CodeTabs tabs={[{
              label: 'Payload', lang: 'json',
              code: `event: node_offline\ndata: {\n  "type":      "node_offline",\n  "node_id":   "SUTS_White",\n  "last_seen": "2026-05-06T14:32:11.045000+00:00",\n  "timestamp": "2026-05-06T14:33:15.000000+00:00"\n}`,
            }]} />
            <SchemaTable rows={[
              ['last_seen', 'ISO 8601', 'Timestamp of the last reading before silence'],
              ['timestamp', 'ISO 8601', 'UTC time the health-checker detected the outage'],
            ]} />
          </EventCard>
        </Section>

        {/* ── Live Demo ── */}
        <Section id="sse-live">
          <H2>Live Demo</H2>
          <P>Enter your API host URL and click Connect to see events stream in real time.</P>
          <LiveDemo />
        </Section>

        {/* ── Schema ── */}
        <Section id="schema">
          <H2>Reading object</H2>
          <P>All REST endpoints return reading objects with the following fields.</P>
          <SchemaTable rows={[
            ['node_id',     'string',        'Unique node identifier stored in ESP32 flash',           false],
            ['lat',         'number',        'GPS latitude — 0.0 if no fix yet',                      false],
            ['lng',         'number',        'GPS longitude — 0.0 if no fix yet',                     false],
            ['float_bits',  'string',        '3-char binary: "101" means 3ft + 1ft active',           true],
            ['water_level', '0|1|2|3',       'Highest active float sensor (0 = no water)',            true],
            ['voltage',     'number',        'Battery voltage in volts (12V lead-acid system)',        false],
            ['raw_adc',     'integer',       'Raw 12-bit ADC reading (0–4095)',                        false],
            ['rssi',        'integer',       'LoRa signal strength in dBm — appended by master',      true],
            ['timestamp',   'ISO 8601',      'UTC time the parser stored the reading',                 false],
          ]} />
          <Callout variant="blue">
            <strong className="text-slate-200">float_bits vs water_level</strong><br />
            <InlineCode>float_bits</InlineCode> is the raw 3-bit string (<InlineCode>&quot;bit2 bit1 bit0&quot;</InlineCode> = 3ft/2ft/1ft).
            {' '}<InlineCode>water_level</InlineCode> is the computed integer — highest triggered sensor.
            Both are <InlineCode>null</InlineCode> for nodes with no float sensors.
          </Callout>
        </Section>

      </main>
    </div>
  )
}
