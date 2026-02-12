import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllExamples, getExample } from '@/lib/content/loader'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout } from '@/components/Callout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBullseye, 
  faPalette, 
  faCheckCircle, 
  faRocket, 
  faPlug, 
  faIndustry, 
  faTools,
  faInfoCircle,
  faLink,
  faBolt
} from '@fortawesome/free-solid-svg-icons'

export async function generateStaticParams() {
  const examples = getAllExamples()
  return examples.map(example => ({
    slug: example.slug,
  }))
}

interface Props {
  params: Promise<{ slug: string }>
}

const categoryInfo = {
  'fundamentals': { icon: faBullseye, label: 'Fundamentals' },
  'techniques': { icon: faPalette, label: 'Core Techniques' },
  'evaluation': { icon: faCheckCircle, label: 'Evaluation' },
  'advanced-techniques': { icon: faRocket, label: 'Advanced Techniques' },
  'integration': { icon: faPlug, label: 'Integration' },
  'production': { icon: faIndustry, label: 'Production' },
  'frameworks': { icon: faTools, label: 'Frameworks' }
}

const difficultyColors = {
  'beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'intermediate': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  'advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
}

export default async function ExamplePage({ params }: Props) {
  const { slug } = await params
  const example = getExample(slug)

  if (!example) {
    notFound()
  }

  const allExamples = getAllExamples()
  const relatedExamples = allExamples
    .filter(e => e.slug !== slug && (e.category === example.category || e.difficulty === example.difficulty))
    .slice(0, 3)

  const categoryInfo_ = categoryInfo[example.category as keyof typeof categoryInfo]
  const currentIndex = allExamples.findIndex(e => e.slug === slug)
  const prevExample = currentIndex > 0 ? allExamples[currentIndex - 1] : null
  const nextExample = currentIndex < allExamples.length - 1 ? allExamples[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-[1fr,280px] gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 overflow-x-auto">
              <Link href="/" className="hover:text-primary transition-colors font-medium whitespace-nowrap">Home</Link>
              <span className="text-muted-foreground/50">/</span>
              <Link href="/examples/" className="hover:text-primary transition-colors font-medium whitespace-nowrap">Examples</Link>
              <span className="text-muted-foreground/50 hidden sm:inline">/</span>
              <Link 
                href={`/examples/#${example.category}`}
                className="hover:text-primary transition-colors font-medium capitalize whitespace-nowrap hidden sm:inline flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={categoryInfo_?.icon} className="w-3 h-3" />
                {categoryInfo_?.label}
              </Link>
              <span className="text-muted-foreground/50 hidden sm:inline">/</span>
              <span className="text-foreground font-semibold truncate hidden sm:inline">{example.title}</span>
            </nav>

            {/* Hero Header Section */}
            <div className="mb-8 sm:mb-12 pb-8 sm:pb-12 border-b border-border/50">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded capitalize ${
                  difficultyColors[example.difficulty as keyof typeof difficultyColors]
                }`}>
                  {example.difficulty}
                </span>
                <span className="text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded bg-muted text-foreground capitalize flex items-center gap-2">
                  <FontAwesomeIcon icon={categoryInfo_?.icon} className="w-3 h-3" />
                  {categoryInfo_?.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {example.title}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground font-light">
                {example.description}
              </p>
            </div>

            {/* Template Section */}
            {example.template && (
              <section className="mb-12 sm:mb-16">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="h-6 sm:h-8 w-1 bg-primary rounded-full"></div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Template</h2>
                </div>
                <div className="rounded-xl overflow-hidden border-2 border-primary/10 shadow-sm">
                  <CodeBlock code={example.template} language="text" />
                </div>
              </section>
            )}

            {/* Main Content Section */}
            <article className="mb-12 sm:mb-16">
              <div 
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:scroll-mt-20 
                  prose-headings:font-bold 
                  prose-headings:tracking-tight
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border/50
                  prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                  prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3
                  prose-p:text-base prose-p:leading-relaxed prose-p:mb-6
                  prose-li:text-base prose-li:leading-relaxed prose-li:my-2
                  prose-ul:my-6 prose-ol:my-6
                  prose-pre:bg-muted prose-pre:border-2 prose-pre:border-border/50 prose-pre:shadow-sm prose-pre:my-6
                  prose-code:text-primary prose-code:font-semibold prose-code:text-sm
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:my-6"
                dangerouslySetInnerHTML={{ __html: example.content }}
              />
            </article>

            {/* Pitfalls Section */}
            {example.pitfalls && example.pitfalls.length > 0 && (
              <section className="mb-12 sm:mb-16">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="h-6 sm:h-8 w-1 bg-yellow-500 rounded-full"></div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Common Pitfalls</h2>
                </div>
                <Callout type="warning" title="⚠️ Watch out for these issues">
                  <ul className="space-y-3 mt-4">
                    {example.pitfalls.map((pitfall, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base leading-relaxed">
                        <span className="text-yellow-700 dark:text-yellow-300 font-bold mt-0.5 flex-shrink-0">•</span>
                        <span>{pitfall}</span>
                      </li>
                    ))}
                  </ul>
                </Callout>
              </section>
            )}

            {/* Checklist Section */}
            {example.checklist && example.checklist.length > 0 && (
              <section className="mb-12 sm:mb-16">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="h-6 sm:h-8 w-1 bg-green-500 rounded-full"></div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Implementation Checklist</h2>
                </div>
                <div className="border-2 border-green-500/20 rounded-xl p-8 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/10 dark:to-background shadow-sm">
                  <ul className="space-y-4">
                    {example.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4 group">
                        <span className="text-2xl text-green-700 dark:text-green-300 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">
                          □
                        </span>
                        <span className="text-base leading-relaxed pt-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Navigation Section */}
            <nav className="border-t-2 border-border/50 pt-6 sm:pt-10 mt-12 sm:mt-16">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {prevExample ? (
                  <Link
                    href={`/examples/${prevExample.slug}/`}
                    className="group p-6 border-2 border-border/50 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all bg-gradient-to-br from-background to-muted/30"
                  >
                    <div className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                      <span className="group-hover:-translate-x-1 transition-transform">←</span>
                      <span>PREVIOUS</span>
                    </div>
                    <div className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {prevExample.title}
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                
                {nextExample ? (
                  <Link
                    href={`/examples/${nextExample.slug}/`}
                    className="group p-6 border-2 border-border/50 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all bg-gradient-to-br from-background to-muted/30 text-right"
                  >
                    <div className="text-sm font-bold text-primary mb-2 flex items-center justify-end gap-2">
                      <span>NEXT</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <div className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {nextExample.title}
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </nav>
          </div>

        {/* Enhanced Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            {/* Quick Info Card */}
            <div className="border-2 border-primary/10 rounded-xl p-6 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg">
              <h3 className="font-bold text-base mb-5 text-primary tracking-wide uppercase flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
                Quick Info
              </h3>
              <dl className="space-y-4">
                <div className="pb-4 border-b border-border/30">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</dt>
                  <dd className="font-bold text-base capitalize flex items-center gap-2">
                    <FontAwesomeIcon icon={categoryInfo_?.icon} className="text-primary w-4 h-4" />
                    {categoryInfo_?.label}
                  </dd>
                </div>
                <div className="pb-4 border-b border-border/30">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Difficulty</dt>
                  <dd className="font-bold text-base capitalize">{example.difficulty}</dd>
                </div>
                {example.pitfalls && (
                  <div className="pb-4 border-b border-border/30">
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pitfalls</dt>
                    <dd className="font-bold text-base">{example.pitfalls.length} documented</dd>
                  </div>
                )}
                {example.checklist && (
                  <div>
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Checklist</dt>
                    <dd className="font-bold text-base">{example.checklist.length} steps</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Related Examples Card */}
            {relatedExamples.length > 0 && (
              <div className="border-2 border-border/50 rounded-xl p-6 bg-gradient-to-br from-background to-muted/20 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-base mb-5 tracking-wide uppercase flex items-center gap-2">
                  <FontAwesomeIcon icon={faLink} className="w-4 h-4" />
                  Related Examples
                </h3>
                <div className="space-y-4">
                  {relatedExamples.map(related => (
                    <Link
                      key={related.slug}
                      href={`/examples/${related.slug}/`}
                      className="block group p-4 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="text-sm font-bold group-hover:text-primary transition-colors mb-1 line-clamp-2">
                        {related.title}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize font-semibold">
                        {related.difficulty}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Card */}
            <div className="border-2 border-border/50 rounded-xl p-6 bg-gradient-to-br from-background to-muted/20 shadow-md">
              <h3 className="font-bold text-base mb-5 tracking-wide uppercase flex items-center gap-2">
                <FontAwesomeIcon icon={faBolt} className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/examples/"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="text-primary group-hover:-translate-x-1 transition-transform font-bold">←</span>
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">All Examples</span>
                </Link>
                <Link
                  href="/demos/"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors flex-1">Try Demos</span>
                  <span className="text-primary group-hover:translate-x-1 transition-transform font-bold">→</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
    </div>
  )
}
