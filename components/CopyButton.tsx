'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-md hover:bg-accent hover:border-primary transition-colors shadow-sm flex items-center gap-2"
      title="Copy to clipboard"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="w-3 h-3" />
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  )
}
