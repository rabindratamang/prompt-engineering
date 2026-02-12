import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faCheckCircle, faShield, faChartBar } from '@fortawesome/free-solid-svg-icons'

const demos = [
  {
    id: 'template-playground',
    title: 'Prompt Template Playground',
    description: 'Build and preview prompts with variables. Get instant feedback on prompt quality based on best practices.',
    icon: faPalette,
  },
  {
    id: 'output-validator',
    title: 'JSON Output Validator',
    description: 'Define JSON schemas and validate sample outputs. See common failure modes and how to fix them.',
    icon: faCheckCircle,
  },
  {
    id: 'injection-sandbox',
    title: 'Prompt Injection Sandbox',
    description: 'Test delimiter strategies and see how different approaches handle adversarial inputs.',
    icon: faShield,
  },
  {
    id: 'eval-rubric',
    title: 'Eval Rubric Builder',
    description: 'Create evaluation criteria and test cases. Score sample outputs against your rubric.',
    icon: faChartBar,
  },
]

export default function DemosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Interactive Demos</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Hands-on tools for learning and practicing prompt engineering. 
          All demos run entirely in your browser—no API keys or backend required.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {demos.map(demo => (
          <Link
            key={demo.id}
            href={`/demos/${demo.id}/`}
            className="group border rounded-lg p-8 hover:border-primary transition-colors"
          >
            <div className="text-primary mb-4 w-12 h-12">
              <FontAwesomeIcon icon={demo.icon} className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
              {demo.title}
            </h2>
            <p className="text-muted-foreground">
              {demo.description}
            </p>
            <div className="mt-4 text-primary font-medium">
              Try it →
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 border rounded-lg p-8 bg-muted/50">
        <h2 className="text-2xl font-semibold mb-4">Why Offline Demos?</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            These demos run entirely in your browser using deterministic logic and 
            validation libraries. No LLM API calls are made.
          </p>
          <p>
            This approach lets you:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Learn and experiment without API costs</li>
            <li>Get instant feedback without latency</li>
            <li>Focus on prompt structure and validation techniques</li>
            <li>Test security patterns without risk</li>
          </ul>
          <p>
            While these demos don't use real LLMs, the patterns and techniques you 
            practice here translate directly to production prompts.
          </p>
        </div>
      </div>
    </div>
  )
}
