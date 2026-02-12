import { getAllExamples } from '@/lib/content/loader'
import { ExamplesFilter } from '@/components/ExamplesFilter'

export default function ExamplesPage() {
  const examples = getAllExamples()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Prompt Engineering Examples</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {examples.length} curated patterns and best practices for designing effective prompts. 
          Each example includes When to Use, Pros & Cons, templates, and implementation checklists.
        </p>
      </div>

      <ExamplesFilter examples={examples} />
    </div>
  )
}
