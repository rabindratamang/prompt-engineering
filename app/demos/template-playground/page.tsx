'use client'

import { useState } from 'react'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout } from '@/components/Callout'
import Link from 'next/link'

interface PromptScore {
  score: number
  strengths: string[]
  improvements: string[]
}

function analyzePrompt(template: string): PromptScore {
  const strengths: string[] = []
  const improvements: string[] = []
  let score = 50 // Base score
  
  // Check for role/system separation
  if (/system:|role:/i.test(template)) {
    strengths.push('Uses role/system separation')
    score += 10
  } else {
    improvements.push('Consider adding explicit role/system instructions')
  }
  
  // Check for delimiters
  if (/---|###|===|<.*>|```/.test(template)) {
    strengths.push('Uses delimiters to mark sections')
    score += 10
  } else {
    improvements.push('Add delimiters to separate instructions from data')
  }
  
  // Check for explicit format instructions
  if (/format:|output:|respond with|json|structure/i.test(template)) {
    strengths.push('Specifies output format')
    score += 10
  } else {
    improvements.push('Explicitly specify desired output format')
  }
  
  // Check for constraints/rules
  if (/never|don't|only|must|always|rules:|important:/i.test(template)) {
    strengths.push('Includes explicit constraints or rules')
    score += 10
  } else {
    improvements.push('Add explicit rules and constraints')
  }
  
  // Check for variables
  if (/{.*?}/g.test(template)) {
    strengths.push('Uses variable placeholders')
    score += 5
  }
  
  // Length check
  if (template.length > 100) {
    strengths.push('Detailed instructions')
    score += 5
  } else if (template.length < 30) {
    improvements.push('Prompt may be too brief - add more context')
  }
  
  return {
    score: Math.min(100, score),
    strengths,
    improvements
  }
}

export default function TemplatePlayground() {
  const [template, setTemplate] = useState(`SYSTEM:
You are a helpful assistant. Extract key information from user messages.

USER MESSAGE:
{user_input}

Extract the following:
- Main topic
- Action requested
- Urgency level`)

  const [variables, setVariables] = useState<Record<string, string>>({
    user_input: 'I need to schedule a meeting with the team ASAP to discuss the Q4 budget.'
  })

  const analysis = analyzePrompt(template)
  
  // Extract variables from template
  const templateVars = Array.from(new Set(template.match(/{(\w+)}/g)?.map(v => v.slice(1, -1)) || []))
  
  // Build final prompt
  let finalPrompt = template
  Object.entries(variables).forEach(([key, value]) => {
    finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), value)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        href="/demos/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
      >
        ← Back to demos
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Prompt Template Playground</h1>
        <p className="text-lg text-muted-foreground">
          Build prompts with variables and see quality feedback in real-time. 
          Use {'{variable_name}'} syntax for placeholders.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Prompt Template
            </label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full h-64 p-4 border rounded-lg font-mono text-sm bg-background"
              placeholder="Enter your prompt template with {variables}..."
            />
          </div>

          {templateVars.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-3">
                Variables
              </label>
              <div className="space-y-3">
                {templateVars.map(varName => (
                  <div key={varName}>
                    <label className="block text-xs text-muted-foreground mb-1">
                      {'{' + varName + '}'}
                    </label>
                    <input
                      type="text"
                      value={variables[varName] || ''}
                      onChange={(e) => setVariables({
                        ...variables,
                        [varName]: e.target.value
                      })}
                      className="w-full p-2 border rounded bg-background text-sm"
                      placeholder={`Value for ${varName}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Prompt Quality Score</h2>
            <div className="border rounded-lg p-6 bg-muted/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl font-bold text-primary">
                  {analysis.score}
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${analysis.score}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {analysis.score < 60 && 'Needs improvement'}
                    {analysis.score >= 60 && analysis.score < 80 && 'Good'}
                    {analysis.score >= 80 && 'Excellent'}
                  </div>
                </div>
              </div>

              {analysis.strengths.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    ✓ Strengths
                  </div>
                  <ul className="text-sm space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-muted-foreground">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.improvements.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                    ⚠ Suggestions
                  </div>
                  <ul className="text-sm space-y-1">
                    {analysis.improvements.map((i, idx) => (
                      <li key={idx} className="text-muted-foreground">• {i}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Final Prompt Preview</h2>
            <CodeBlock code={finalPrompt} language="text" />
          </div>
        </div>
      </div>

      <Callout type="info" title="How Scoring Works">
        The quality score checks for prompt engineering best practices:
        role separation, delimiters, format specifications, constraints, and sufficient detail.
        Higher scores indicate prompts more likely to produce consistent, reliable outputs.
      </Callout>
    </div>
  )
}
