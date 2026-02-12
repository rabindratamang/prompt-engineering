'use client'

import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
}

export function CodeBlock({ code, language = 'text', title }: CodeBlockProps) {
  return (
    <div className="relative group rounded-lg border border-border bg-muted/30 my-4 overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-border bg-muted/50 text-sm font-medium text-foreground">
          {title}
        </div>
      )}
      <div className="relative">
        <pre className="p-4 sm:p-6 overflow-x-auto">
          <code className={`language-${language} text-xs sm:text-sm leading-relaxed font-mono text-foreground`}>
            {code}
          </code>
        </pre>
        <div className="absolute top-3 right-3">
          <CopyButton text={code} />
        </div>
      </div>
    </div>
  )
}
