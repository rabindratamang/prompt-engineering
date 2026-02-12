import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { Example, ExampleMeta } from './types'

const contentDir = path.join(process.cwd(), 'content/examples')

export function getAllExamples(): ExampleMeta[] {
  if (!fs.existsSync(contentDir)) {
    return []
  }

  const files = fs.readdirSync(contentDir)
  
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const slug = file.replace(/\.md$/, '')
      const fullPath = path.join(contentDir, file)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        category: data.category || 'general',
        difficulty: data.difficulty || 'beginner',
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

function replaceProsConsIcons(html: string): string {
  // Replace checkmarks with Font Awesome check icon HTML
  html = html.replace(/✅/g, '<i class="fa-solid fa-check text-green-600 dark:text-green-400"></i>')
  
  // Replace X marks with Font Awesome xmark icon HTML
  html = html.replace(/❌/g, '<i class="fa-solid fa-xmark text-red-600 dark:text-red-400"></i>')
  
  return html
}

export function getExample(slug: string): Example | null {
  try {
    const fullPath = path.join(contentDir, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    let htmlContent = marked(content) as string
    
    // Replace emoji icons with Font Awesome icons
    htmlContent = replaceProsConsIcons(htmlContent)
    
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      category: data.category || 'general',
      difficulty: data.difficulty || 'beginner',
      content: htmlContent,
      template: data.template,
      pitfalls: data.pitfalls || [],
      checklist: data.checklist || [],
    }
  } catch (error) {
    return null
  }
}
