# Prompt Engineering Examples & Demos

A static website featuring interactive examples and offline demos for learning prompt engineering patterns and best practices.

## Features

- **Curated Examples**: Comprehensive patterns including role separation, delimiters, few-shot learning, structured output, and evaluation strategies
- **Interactive Demos**: 
  - Prompt Template Playground with quality scoring
  - JSON Output Validator with schema validation
  - Prompt Injection Sandbox with defensive strategies
  - Eval Rubric Builder for systematic testing
- **100% Offline**: All demos run in the browser with no API calls required
- **Static Export**: Deploys as pure static files to any hosting service

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Generate a static export:

```bash
npm run build
```

This produces an `out/` directory containing all static assets.

### Deploy

The `out/` directory can be deployed to any static hosting service:

- **GitHub Pages**: Copy contents to `gh-pages` branch
- **Netlify**: Drag and drop the `out/` folder
- **Vercel**: Deploy as a static site
- **AWS S3**: Upload to S3 bucket with static website hosting
- **Cloudflare Pages**: Connect your repo or upload directly

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── examples/          # Example patterns
│   │   ├── page.tsx       # Examples index
│   │   └── [slug]/        # Individual example pages
│   └── demos/             # Interactive demos
│       ├── page.tsx       # Demos index
│       ├── template-playground/
│       ├── output-validator/
│       ├── injection-sandbox/
│       └── eval-rubric/
├── components/            # Shared React components
│   ├── Navigation.tsx
│   ├── CodeBlock.tsx
│   ├── CopyButton.tsx
│   ├── Callout.tsx
│   └── Tabs.tsx
├── content/               # Content source files
│   └── examples/         # 18 markdown files for examples
├── lib/                  # Utilities
│   └── content/          # Content loading and types
├── public/               # Static assets
└── next.config.js        # Next.js configuration (static export)
```

## Content Overview (18 Examples)

### Fundamentals (2)
- Role Separation
- Delimiters and Untrusted Text

### Core Techniques (3)
- Few-Shot Examples
- Structured Output (JSON)
- Eval Rubrics and Test Cases

### Advanced Techniques (4)
- Chain of Thought (CoT)
- Prompt Chaining & Workflows
- Tree of Thoughts (ToT)
- Meta-Prompting & Orchestration

### Integration (1)
- Function Calling & Tool Use

### Production (4)
- Token Optimization & Cost Management
- Error Handling & Retry Strategies
- Context Window Management
- Constitutional AI & Safety Alignment

### Frameworks (4) ⭐ NEW
- Prompting Frameworks (DSPy vs LangChain)
- Agentic Patterns (ReAct & Autonomous Agents)
- Prompt Testing, Versioning & CI/CD
- LLM Observability & Monitoring

## Adding Content

### Creating a New Example

1. Create a markdown file in `content/examples/`:

```markdown
---
title: Your Example Title
description: Brief description of the pattern
category: fundamentals | techniques | evaluation
difficulty: beginner | intermediate | advanced
template: |
  Your prompt template here
  Use {variables} for placeholders
pitfalls:
  - Common mistake 1
  - Common mistake 2
checklist:
  - Implementation step 1
  - Implementation step 2
---

## Your Content

Write your example content here in markdown.

### Sections

You can use standard markdown formatting.
```

2. Rebuild the site:

```bash
npm run build
```

The new example will automatically appear in the examples index.

### Content Best Practices

- **Be specific**: Show concrete examples, not just theory
- **Include templates**: Provide copy-pasteable prompt templates
- **Cover pitfalls**: Warn about common mistakes
- **Add checklists**: Give actionable implementation steps
- **Use code blocks**: Show before/after comparisons

## Technology Stack

- **Next.js 15**: React framework with App Router and static export
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Ajv**: JSON schema validation (for demos)
- **gray-matter**: Markdown frontmatter parsing
- **marked**: Markdown to HTML conversion

## Development Tips

### Hot Reload

Changes to pages, components, and styles reload automatically in development mode.

### Content Updates

Changes to markdown files in `content/` require a page refresh in development mode, or a rebuild for production.

### Adding Dependencies

```bash
npm install package-name
```

For demos, prefer browser-native APIs or lightweight libraries to keep the bundle size small.

### Linting

```bash
npm run lint
```

## Troubleshooting

### Build Fails

- Check that all imports are valid
- Ensure `content/examples/` directory exists
- Verify markdown frontmatter is properly formatted

### Images Not Loading

Make sure `images: { unoptimized: true }` is set in `next.config.js` for static export.

### Routing Issues

The site uses `trailingSlash: true` in Next.js config. Links should end with `/` for consistency.

## Contributing

This is a template project. Feel free to:

- Add more example patterns
- Create additional interactive demos
- Improve existing content
- Enhance UI/UX
- Add new features

## License

MIT License - feel free to use this for your own projects.

## Resources

- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
# prompt-engineering
