import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

// Custom theme matching the app's dark palette
const theme = {
  'code[class*="language-"]': { color: '#cbd5e1', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' },
  'token.comment': { color: '#475569', fontStyle: 'italic' },
  'token.string': { color: '#86efac' },
  'token.number': { color: '#fdba74' },
  'token.keyword': { color: '#93c5fd' },
  'token.function': { color: '#c4b5fd' },
  'token.operator': { color: '#94a3b8' },
  'token.punctuation': { color: '#64748b' },
  'token.boolean': { color: '#fdba74' },
  'token.class-name': { color: '#67e8f9' },
  'token.property': { color: '#93c5fd' },
  'token.attr-name': { color: '#93c5fd' },
  'token.attr-value': { color: '#86efac' },
  'token.tag': { color: '#f87171' },
  'token.parameter': { color: '#fdba74' },
}

function CodeBlock({ code, language = 'bash' }) {
  return (
    <SyntaxHighlighter
      language={language}
      style={theme}
      customStyle={{
        background: '#0f172a',
        padding: '1rem 1.25rem',
        borderRadius: 0,
        margin: 0,
        lineHeight: '1.7',
      }}
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  )
}

export function CodeTabs({ tabs }) {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(tabs[active].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden border border-slate-800 mt-4">
      {/* Tab bar */}
      <div className="flex items-center bg-slate-900 border-b border-slate-800 pl-1 pr-3">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              active === i
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={copy}
          className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <><CheckIcon /> Copied</>
          ) : (
            <><CopyIcon /> Copy</>
          )}
        </button>
      </div>
      <CodeBlock code={tabs[active].code} language={tabs[active].lang ?? 'bash'} />
    </div>
  )
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
