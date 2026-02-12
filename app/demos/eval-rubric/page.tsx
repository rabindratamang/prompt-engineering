'use client'

import { useState } from 'react'
import { Callout } from '@/components/Callout'
import Link from 'next/link'

interface Criterion {
  id: string
  name: string
  description: string
  type: 'regex' | 'json' | 'length' | 'contains'
  config: string
}

interface TestCase {
  id: string
  input: string
  output: string
  expectedPass: boolean
}

const defaultCriteria: Criterion[] = [
  {
    id: '1',
    name: 'Valid JSON',
    description: 'Output must be valid JSON',
    type: 'json',
    config: ''
  },
  {
    id: '2',
    name: 'Has Required Fields',
    description: 'Must contain "name" and "priority" fields',
    type: 'contains',
    config: 'name,priority'
  }
]

const defaultTestCases: TestCase[] = [
  {
    id: '1',
    input: 'Create task: Fix login bug, high priority',
    output: '{"name": "Fix login bug", "priority": "high"}',
    expectedPass: true
  },
  {
    id: '2',
    input: 'Create task: Update docs',
    output: '{"name": "Update docs"}',
    expectedPass: false // Missing priority
  },
  {
    id: '3',
    input: 'Create task: Review code',
    output: 'The task is: Review code with priority medium',
    expectedPass: false // Not JSON
  }
]

function evaluateOutput(output: string, criteria: Criterion[]): {
  passed: boolean
  results: { criterion: string; passed: boolean; message: string }[]
} {
  const results = criteria.map(criterion => {
    switch (criterion.type) {
      case 'json':
        try {
          JSON.parse(output)
          return { criterion: criterion.name, passed: true, message: 'Valid JSON' }
        } catch {
          return { criterion: criterion.name, passed: false, message: 'Invalid JSON' }
        }
      
      case 'contains':
        const required = criterion.config.split(',').map(s => s.trim())
        const missing = required.filter(field => !output.includes(`"${field}"`))
        if (missing.length === 0) {
          return { criterion: criterion.name, passed: true, message: 'All required fields present' }
        } else {
          return { criterion: criterion.name, passed: false, message: `Missing: ${missing.join(', ')}` }
        }
      
      case 'regex':
        const regex = new RegExp(criterion.config)
        const matches = regex.test(output)
        return { 
          criterion: criterion.name, 
          passed: matches, 
          message: matches ? 'Pattern matched' : 'Pattern not found' 
        }
      
      case 'length':
        const [min, max] = criterion.config.split('-').map(Number)
        const length = output.length
        const inRange = length >= min && length <= max
        return {
          criterion: criterion.name,
          passed: inRange,
          message: inRange ? `Length ${length} in range` : `Length ${length} outside range ${min}-${max}`
        }
      
      default:
        return { criterion: criterion.name, passed: false, message: 'Unknown criterion type' }
    }
  })
  
  return {
    passed: results.every(r => r.passed),
    results
  }
}

export default function EvalRubric() {
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria)
  const [testCases, setTestCases] = useState<TestCase[]>(defaultTestCases)
  const [results, setResults] = useState<any>(null)

  const runEvaluation = () => {
    const testResults = testCases.map(testCase => {
      const evaluation = evaluateOutput(testCase.output, criteria)
      return {
        testCase,
        evaluation,
        correct: evaluation.passed === testCase.expectedPass
      }
    })
    
    const passCount = testResults.filter(r => r.evaluation.passed).length
    const correctCount = testResults.filter(r => r.correct).length
    
    setResults({
      testResults,
      summary: {
        total: testResults.length,
        passed: passCount,
        passRate: ((passCount / testResults.length) * 100).toFixed(1),
        accuracy: ((correctCount / testResults.length) * 100).toFixed(1)
      }
    })
  }

  const addCriterion = () => {
    setCriteria([...criteria, {
      id: Date.now().toString(),
      name: 'New Criterion',
      description: '',
      type: 'contains',
      config: ''
    }])
  }

  const addTestCase = () => {
    setTestCases([...testCases, {
      id: Date.now().toString(),
      input: '',
      output: '',
      expectedPass: true
    }])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        href="/demos/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
      >
        ← Back to demos
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Eval Rubric Builder</h1>
        <p className="text-lg text-muted-foreground">
          Define success criteria and test cases. Score outputs against your rubric to measure prompt quality.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Evaluation Criteria</h2>
            <button
              onClick={addCriterion}
              className="px-4 py-2 border border-border bg-background text-foreground rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              + Add Criterion
            </button>
          </div>
          <div className="space-y-3">
            {criteria.map((criterion, idx) => (
              <div key={criterion.id} className="border rounded-lg p-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <input
                    value={criterion.name}
                    onChange={(e) => {
                      const updated = [...criteria]
                      updated[idx].name = e.target.value
                      setCriteria(updated)
                    }}
                    className="px-3 py-2 border rounded bg-background text-sm font-medium"
                    placeholder="Criterion name"
                  />
                  <select
                    value={criterion.type}
                    onChange={(e) => {
                      const updated = [...criteria]
                      updated[idx].type = e.target.value as any
                      setCriteria(updated)
                    }}
                    className="px-3 py-2 border rounded bg-background text-sm"
                  >
                    <option value="json">Valid JSON</option>
                    <option value="contains">Contains Text</option>
                    <option value="regex">Regex Match</option>
                    <option value="length">Length Range</option>
                  </select>
                  <input
                    value={criterion.config}
                    onChange={(e) => {
                      const updated = [...criteria]
                      updated[idx].config = e.target.value
                      setCriteria(updated)
                    }}
                    className="px-3 py-2 border rounded bg-background text-sm font-mono"
                    placeholder={
                      criterion.type === 'contains' ? 'field1,field2' :
                      criterion.type === 'regex' ? 'pattern' :
                      criterion.type === 'length' ? 'min-max' :
                      'n/a'
                    }
                  />
                  <button
                    onClick={() => setCriteria(criteria.filter(c => c.id !== criterion.id))}
                    className="px-3 py-2 border rounded hover:border-red-600 hover:text-red-600 dark:hover:border-red-400 dark:hover:text-red-400 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={criterion.description}
                  onChange={(e) => {
                    const updated = [...criteria]
                    updated[idx].description = e.target.value
                    setCriteria(updated)
                  }}
                  className="w-full mt-2 px-3 py-2 border rounded bg-background text-sm"
                  placeholder="Description (optional)"
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Test Cases</h2>
            <button
              onClick={addTestCase}
              className="px-4 py-2 border border-border bg-background text-foreground rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              + Add Test Case
            </button>
          </div>
          <div className="space-y-4">
            {testCases.map((testCase, idx) => (
              <div key={testCase.id} className="border rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Input</label>
                    <input
                      value={testCase.input}
                      onChange={(e) => {
                        const updated = [...testCases]
                        updated[idx].input = e.target.value
                        setTestCases(updated)
                      }}
                      className="w-full px-3 py-2 border rounded bg-background text-sm"
                      placeholder="Test input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Expected Output</label>
                    <input
                      value={testCase.output}
                      onChange={(e) => {
                        const updated = [...testCases]
                        updated[idx].output = e.target.value
                        setTestCases(updated)
                      }}
                      className="w-full px-3 py-2 border rounded bg-background text-sm font-mono"
                      placeholder="Expected output"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={testCase.expectedPass}
                      onChange={(e) => {
                        const updated = [...testCases]
                        updated[idx].expectedPass = e.target.checked
                        setTestCases(updated)
                      }}
                    />
                    Should pass all criteria
                  </label>
                  <button
                    onClick={() => setTestCases(testCases.filter(t => t.id !== testCase.id))}
                    className="px-3 py-1 border rounded hover:border-red-600 hover:text-red-600 dark:hover:border-red-400 dark:hover:text-red-400 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div>
          <button
            onClick={runEvaluation}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Run Evaluation
          </button>
        </div>

        {results && (
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-primary">{results.summary.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">{results.summary.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{results.summary.passRate}%</div>
                <div className="text-sm text-muted-foreground">Pass Rate</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{results.summary.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            <div className="space-y-3">
              {results.testResults.map((result: any, idx: number) => (
                <div key={idx} className={`border rounded-lg p-4 ${
                  result.evaluation.passed ? 'bg-green-50 text-green-900 dark:bg-green-950/20 dark:text-green-100' : 'bg-red-50 text-red-900 dark:bg-red-950/20 dark:text-red-100'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {result.evaluation.passed ? '✓' : '✗'} Test Case {idx + 1}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Input: {result.testCase.input}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      result.correct ? 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100' : 
                      'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100'
                    }`}>
                      {result.correct ? 'As Expected' : 'Unexpected'}
                    </div>
                  </div>
                  <div className="text-xs space-y-1 ml-6">
                    {result.evaluation.results.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span>{r.passed ? '✓' : '✗'}</span>
                        <span className="font-medium">{r.criterion}:</span>
                        <span className="text-muted-foreground">{r.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Callout type="info" title="Building Effective Rubrics">
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Start with clear, measurable criteria</li>
          <li>Include both positive and negative test cases</li>
          <li>Test edge cases and adversarial inputs</li>
          <li>Track results over time as you iterate on prompts</li>
          <li>Automate evaluation in your development workflow</li>
        </ul>
      </Callout>
    </div>
  )
}
