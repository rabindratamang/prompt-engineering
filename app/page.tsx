import Link from 'next/link'
import { getAllExamples } from '@/lib/content/loader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBullseye, 
  faPalette, 
  faCheckCircle, 
  faRocket, 
  faPlug, 
  faIndustry, 
  faTools,
  faBook,
  faFlask,
  faCode
} from '@fortawesome/free-solid-svg-icons'

const categoryInfo = {
  'fundamentals': { icon: faBullseye, label: 'Fundamentals', desc: 'Core concepts and security basics' },
  'techniques': { icon: faPalette, label: 'Core Techniques', desc: 'Essential patterns and formats' },
  'evaluation': { icon: faCheckCircle, label: 'Evaluation', desc: 'Testing and quality measurement' },
  'advanced-techniques': { icon: faRocket, label: 'Advanced Techniques', desc: 'Complex reasoning and workflows' },
  'integration': { icon: faPlug, label: 'Integration', desc: 'Connecting to external systems' },
  'production': { icon: faIndustry, label: 'Production', desc: 'Scale, reliability, and cost' },
  'frameworks': { icon: faTools, label: 'Frameworks', desc: 'Tools and infrastructure' }
}

export default function Home() {
  const examples = getAllExamples()
  
  const categoryStats = examples.reduce((acc, example) => {
    acc[example.category] = (acc[example.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
          Prompt Engineering Examples & Demos
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 px-4">
          Learn prompt engineering through interactive offline demos and {examples.length} curated examples. 
          No API keys required—everything runs in your browser.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <Link 
            href="/examples/"
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-center"
          >
            Browse {examples.length} Examples
          </Link>
          <Link 
            href="/demos/"
            className="w-full sm:w-auto px-6 py-3 border border-border bg-background rounded-lg font-medium hover:border-primary transition-colors text-center"
          >
            Try Demos
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="border rounded-lg p-6 text-center bg-muted/50">
          <div className="text-3xl font-bold text-primary mb-1">{examples.length}</div>
          <div className="text-sm text-muted-foreground">Examples</div>
        </div>
        <div className="border rounded-lg p-6 text-center bg-muted/50">
          <div className="text-3xl font-bold text-primary mb-1">6</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="border rounded-lg p-6 text-center bg-muted/50">
          <div className="text-3xl font-bold text-primary mb-1">4</div>
          <div className="text-sm text-muted-foreground">Live Demos</div>
        </div>
        <div className="border rounded-lg p-6 text-center bg-muted/50">
          <div className="text-3xl font-bold text-primary mb-1">100%</div>
          <div className="text-sm text-muted-foreground">Offline</div>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Explore by Category</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryInfo).map(([key, info]) => {
            const count = categoryStats[key] || 0
            if (count === 0) return null
            return (
              <Link
                key={key}
                href={`/examples/#${key}`}
                className="group border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-primary w-6 h-6">
                    <FontAwesomeIcon icon={info.icon} className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {info.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? 'example' : 'examples'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {info.desc}
                </p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Featured: Vibe Coding */}
      <div className="mb-8 sm:mb-12">
        <Link 
          href="/vibe-coding/"
          className="group block p-8 border-2 border-primary/30 rounded-xl hover:border-primary transition-all hover:shadow-xl bg-gradient-to-br from-primary/5 to-background relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-bl-lg">
            NEW
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-primary transition-colors flex items-center gap-3">
            <FontAwesomeIcon icon={faCode} className="text-primary w-7 h-7" />
            Vibe Coding Guide
          </h2>
          <p className="text-muted-foreground mb-4 text-base sm:text-lg">
            Master prompt engineering for AI coding assistants like Cursor, Claude, and GitHub Copilot. 
            Learn best practices, techniques, avoid common pitfalls, and see detailed examples.
          </p>
          <span className="text-primary font-bold text-lg">
            Start coding smarter →
          </span>
        </Link>
      </div>

      {/* Main CTAs */}
      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
        <Link 
          href="/examples/"
          className="group p-8 border rounded-lg hover:border-primary transition-all hover:shadow-lg bg-gradient-to-br from-background to-muted/30"
        >
          <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors flex items-center gap-3">
            <FontAwesomeIcon icon={faBook} className="text-primary w-6 h-6" />
            Browse All Examples
          </h2>
          <p className="text-muted-foreground mb-4">
            From beginner templates to advanced production patterns. 
            Learn role separation, Tree of Thoughts, meta-prompting, cost optimization, and more.
          </p>
          <span className="text-primary font-medium">
            Explore {examples.length} examples →
          </span>
        </Link>

        <Link 
          href="/demos/"
          className="group p-8 border rounded-lg hover:border-primary transition-all hover:shadow-lg bg-gradient-to-br from-background to-muted/30"
        >
          <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors flex items-center gap-3">
            <FontAwesomeIcon icon={faFlask} className="text-primary w-6 h-6" />
            Try Interactive Demos
          </h2>
          <p className="text-muted-foreground mb-4">
            Hands-on playground tools for building and testing prompts. 
            Template builder, output validator, injection sandbox, and eval rubrics.
          </p>
          <span className="text-primary font-medium">
            Try 4 live demos →
          </span>
        </Link>
      </div>

      {/* What is Prompt Engineering */}
      <div className="bg-muted/50 border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">What is Prompt Engineering?</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Prompt engineering is the practice of designing and optimizing instructions 
            for large language models (LLMs) to achieve reliable, accurate, and useful outputs.
          </p>
          <p>
            Good prompts are clear, specific, and structured. They use techniques like:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Prompt templates</strong>: structured frameworks (BAB, RACE, CO-STAR)</li>
            <li><strong>Role separation</strong>: distinguishing system instructions from user input</li>
            <li><strong>Delimiters</strong>: marking untrusted content to prevent injection attacks</li>
            <li><strong>Few-shot examples</strong>: showing the model what you want through examples</li>
            <li><strong>Structured output</strong>: requesting JSON, XML, or other parseable formats</li>
            <li><strong>Evaluation rubrics</strong>: defining clear criteria for success</li>
          </ul>
          <p>
            This site provides interactive, offline tools to practice these patterns without 
            needing API access or spending tokens. Perfect for learning and experimentation.
          </p>
        </div>
      </div>
    </div>
  )
}
