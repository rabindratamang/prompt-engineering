export interface ExampleMeta {
  slug: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface Example extends ExampleMeta {
  content: string
  template?: string
  pitfalls?: string[]
  checklist?: string[]
}
