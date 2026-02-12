'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBullseye, 
  faPalette, 
  faCheckCircle, 
  faRocket, 
  faPlug, 
  faIndustry, 
  faTools
} from '@fortawesome/free-solid-svg-icons'

interface Example {
  slug: string
  title: string
  description: string
  category: string
  difficulty: string
}

interface Props {
  examples: Example[]
}

const categoryInfo = {
  'fundamentals': { icon: faBullseye, color: 'blue', order: 1 },
  'techniques': { icon: faPalette, color: 'purple', order: 2 },
  'evaluation': { icon: faCheckCircle, color: 'green', order: 2 },
  'advanced-techniques': { icon: faRocket, color: 'orange', order: 3 },
  'integration': { icon: faPlug, color: 'teal', order: 4 },
  'production': { icon: faIndustry, color: 'red', order: 5 },
  'frameworks': { icon: faTools, color: 'indigo', order: 6 }
}

const difficultyColors = {
  'beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'intermediate': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  'advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
}

export function ExamplesFilter({ examples }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredExamples = useMemo(() => {
    return examples.filter(example => {
      const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'all' || example.difficulty === selectedDifficulty
      const matchesSearch = searchQuery === '' || 
        example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        example.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesDifficulty && matchesSearch
    })
  }, [examples, selectedCategory, selectedDifficulty, searchQuery])

  const byCategory = filteredExamples.reduce((acc, example) => {
    if (!acc[example.category]) {
      acc[example.category] = []
    }
    acc[example.category].push(example)
    return acc
  }, {} as Record<string, Example[]>)

  const sortedCategories = Object.entries(byCategory).sort((a, b) => {
    const orderA = categoryInfo[a[0] as keyof typeof categoryInfo]?.order || 999
    const orderB = categoryInfo[b[0] as keyof typeof categoryInfo]?.order || 999
    return orderA - orderB
  })

  const categories = Array.from(new Set(examples.map(e => e.category)))
  const difficulties = Array.from(new Set(examples.map(e => e.difficulty)))

  return (
    <>
      {/* Filters */}
      <div className="mb-6 sm:mb-8 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search examples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-96 px-3 sm:px-4 py-2 border rounded-lg bg-background text-sm sm:text-base"
          />
        </div>

        {/* Category & Difficulty Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-xs sm:text-sm font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors font-medium ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-border bg-background text-foreground hover:border-primary hover:bg-primary/5'
                }`}
              >
                All ({examples.length})
              </button>
              {categories.map(cat => {
                const count = examples.filter(e => e.category === cat).length
                const info = categoryInfo[cat as keyof typeof categoryInfo]
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors font-medium flex items-center gap-2 ${
                      selectedCategory === cat 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'border-border bg-background text-foreground hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <FontAwesomeIcon icon={info?.icon} className="hidden sm:inline w-3 h-3" />
                    {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-xs sm:text-sm font-medium mb-2">Difficulty</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedDifficulty('all')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors font-medium ${
                  selectedDifficulty === 'all' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-border bg-background text-foreground hover:border-primary hover:bg-primary/5'
                }`}
              >
                All
              </button>
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors capitalize font-medium ${
                    selectedDifficulty === diff 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-border bg-background text-foreground hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters indicator */}
        {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            Showing {filteredExamples.length} of {examples.length} examples
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSelectedDifficulty('all')
                setSearchQuery('')
              }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Examples Grid */}
      {filteredExamples.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">No examples match your filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('all')
              setSelectedDifficulty('all')
              setSearchQuery('')
            }}
            className="text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedCategories.map(([category, categoryExamples]) => {
            const info = categoryInfo[category as keyof typeof categoryInfo]
            return (
              <section key={category} id={category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-primary w-6 h-6">
                    <FontAwesomeIcon icon={info?.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold capitalize">
                      {category.split('-').join(' ')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {categoryExamples.length} {categoryExamples.length === 1 ? 'example' : 'examples'}
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {categoryExamples.map(example => (
                    <Link
                      key={example.slug}
                      href={`/examples/${example.slug}/`}
                      className="group border rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all bg-background"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors flex-1">
                          {example.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {example.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded capitalize font-medium ${
                          difficultyColors[example.difficulty as keyof typeof difficultyColors]
                        }`}>
                          {example.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Quick Navigation */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryInfo).map(([cat, info]) => {
            const count = examples.filter(e => e.category === cat).length
            if (count === 0) return null
            return (
              <a
                key={cat}
                href={`#${cat}`}
                className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <div className="text-primary w-5 h-5">
                  <FontAwesomeIcon icon={info.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium capitalize text-sm">
                    {cat.split('-').join(' ')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {count} {count === 1 ? 'example' : 'examples'}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </>
  )
}
