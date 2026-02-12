'use client'

import { useState } from 'react'
import Ajv, { ErrorObject } from 'ajv'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout } from '@/components/Callout'
import Link from 'next/link'

const ajv = new Ajv({ allErrors: true })

const exampleSchema = {
  type: "object",
  required: ["name", "priority"],
  properties: {
    name: { type: "string", minLength: 1 },
    priority: { 
      type: "string", 
      enum: ["low", "medium", "high"] 
    },
    tags: { 
      type: "array", 
      items: { type: "string" } 
    }
  },
  additionalProperties: false
}

const exampleOutput = `{
  "name": "Fix login bug",
  "priority": "high",
  "tags": ["bug", "urgent"]
}`

export default function OutputValidator() {
  const [schemaInput, setSchemaInput] = useState(JSON.stringify(exampleSchema, null, 2))
  const [output, setOutput] = useState(exampleOutput)
  const [validation, setValidation] = useState<{
    valid: boolean
    errors: ErrorObject[]
  } | null>(null)

  const validateOutput = () => {
    try {
      const schema = JSON.parse(schemaInput)
      const data = JSON.parse(output)
      
      const validate = ajv.compile(schema)
      const valid = validate(data)
      
      setValidation({
        valid,
        errors: validate.errors || []
      })
    } catch (err) {
      setValidation({
        valid: false,
        errors: [{
          instancePath: '',
          schemaPath: '',
          keyword: 'parse',
          params: {},
          message: err instanceof Error ? err.message : 'Parse error'
        } as ErrorObject]
      })
    }
  }

  const commonIssues = [
    {
      title: 'Missing Required Field',
      schema: '{"type": "object", "required": ["name"]}',
      output: '{}',
      explanation: 'Output is missing the required "name" field'
    },
    {
      title: 'Wrong Type',
      schema: '{"type": "object", "properties": {"count": {"type": "number"}}}',
      output: '{"count": "5"}',
      explanation: 'count should be a number, not a string'
    },
    {
      title: 'Invalid Enum Value',
      schema: '{"type": "object", "properties": {"status": {"enum": ["active", "inactive"]}}}',
      output: '{"status": "pending"}',
      explanation: 'status must be one of the allowed values'
    },
    {
      title: 'Markdown Code Block',
      schema: '{"type": "object"}',
      output: '```json\\n{"data": "value"}\\n```',
      explanation: 'LLM wrapped JSON in markdown - extract the actual JSON'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        href="/demos/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
      >
        ← Back to demos
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">JSON Output Validator</h1>
        <p className="text-lg text-muted-foreground">
          Define a JSON schema and validate sample outputs. See exactly what's wrong and how to fix it.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div>
          <label className="block text-sm font-medium mb-2">
            JSON Schema
          </label>
          <textarea
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            className="w-full h-80 p-4 border rounded-lg font-mono text-sm bg-background"
            placeholder="Enter JSON schema..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Output to Validate
          </label>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="w-full h-80 p-4 border rounded-lg font-mono text-sm bg-background"
            placeholder="Enter JSON output from LLM..."
          />
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={validateOutput}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Validate Output
        </button>
      </div>

      {validation && (
        <div className="mb-12">
          {validation.valid ? (
            <Callout type="success" title="Valid Output">
              The output matches the schema perfectly.
            </Callout>
          ) : (
            <Callout type="error" title="Validation Failed">
              <div className="space-y-2">
                {validation.errors.map((error, idx) => (
                  <div key={idx} className="text-sm">
                    <strong>{error.instancePath || '(root)'}</strong>: {error.message}
                    {error.keyword !== 'parse' && error.params && (
                      <div className="text-xs mt-1 opacity-75">
                        {JSON.stringify(error.params)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Callout>
          )}
        </div>
      )}

      <div className="border-t pt-12">
        <h2 className="text-2xl font-semibold mb-6">Common Failure Modes</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {commonIssues.map((issue, idx) => (
            <div key={idx} className="border rounded-lg p-6">
              <h3 className="font-semibold mb-3">{issue.title}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Schema</div>
                  <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                    {issue.schema}
                  </pre>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Output</div>
                  <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                    {issue.output}
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  {issue.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Callout type="info" title="Using in Your Prompts">
        <p className="mb-2">
          Always validate LLM JSON output in your application code. In your prompt:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Define the exact schema with types and constraints</li>
          <li>Request "valid JSON only, no markdown"</li>
          <li>Specify how to handle null/missing values</li>
          <li>Validate programmatically and handle errors gracefully</li>
        </ol>
      </Callout>
    </div>
  )
}
