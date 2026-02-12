import { CodeBlock } from '@/components/CodeBlock'
import { Callout } from '@/components/Callout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCode, 
  faLightbulb, 
  faExclamationTriangle,
  faCheckCircle,
  faRocket,
  faBrain,
  faComments,
  faList
} from '@fortawesome/free-solid-svg-icons'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vibe Coding: Prompt Engineering for AI Assistants',
  description: 'Master prompt engineering for AI-powered coding tools like Cursor, Claude, and GitHub Copilot. Learn best practices, techniques, and avoid common pitfalls.',
}

export default function VibeCodingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="mb-12 pb-8 border-b border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faCode} className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Vibe Coding
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Master prompt engineering for AI-powered coding assistants like <strong>Cursor</strong>, <strong>Claude</strong>, and <strong>GitHub Copilot</strong>. 
            Learn how to communicate effectively with AI to write better code faster.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-12 p-6 border rounded-lg bg-muted/30">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faList} className="w-5 h-5 text-primary" />
            Quick Navigation
          </h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#best-practices" className="text-primary hover:underline">→ Best Practices</a></li>
            <li><a href="#techniques" className="text-primary hover:underline">→ Core Techniques</a></li>
            <li><a href="#pitfalls" className="text-primary hover:underline">→ Common Pitfalls</a></li>
            <li><a href="#examples" className="text-primary hover:underline">→ Detailed Examples</a></li>
            <li><a href="#workflow" className="text-primary hover:underline">→ Recommended Workflow</a></li>
          </ul>
        </nav>

        {/* Best Practices Section */}
        <section id="best-practices" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
              Best Practices
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">1. Be Specific About Context</h3>
              <p className="text-muted-foreground mb-4">
                Always provide relevant context: project structure, tech stack, frameworks, and what you're trying to achieve.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">❌ Vague</p>
                  <CodeBlock 
                    code="Fix the bug in my code"
                    language="text"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">✓ Specific</p>
                  <CodeBlock 
                    code={`Fix the TypeScript type error in UserProfile.tsx. 
I'm using Next.js 14 with App Router. The error 
occurs when passing user props to the child component.`}
                    language="text"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">2. Reference Files with @</h3>
              <p className="text-muted-foreground mb-4">
                Use <code>@filename</code> or <code>@folder/</code> to give AI direct access to relevant code.
              </p>
              <CodeBlock 
                code={`Update @components/Button.tsx to accept a 'variant' prop.
The variants should follow the design system in @styles/tokens.ts`}
                language="text"
              />
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">3. Break Down Complex Tasks</h3>
              <p className="text-muted-foreground mb-4">
                Don't ask for everything at once. Work iteratively in logical steps.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">❌ Too Broad</p>
                  <CodeBlock 
                    code="Build a complete authentication system with OAuth, 2FA, password reset, email verification, and admin dashboard"
                    language="text"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">✓ Iterative</p>
                  <CodeBlock 
                    code={`Step 1: Create basic user login with email/password
Step 2: Add JWT token generation and validation
Step 3: Implement password reset flow
(Continue after each step works)`}
                    language="text"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">4. Specify Coding Standards</h3>
              <p className="text-muted-foreground mb-4">
                Be explicit about style, conventions, and patterns you want followed.
              </p>
              <CodeBlock 
                code={`Create a user service following these conventions:
- Use async/await (not .then)
- Implement error handling with try/catch
- Add JSDoc comments for public methods
- Use TypeScript strict mode
- Follow repository pattern`}
                language="text"
              />
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">5. Ask for Explanations</h3>
              <p className="text-muted-foreground mb-4">
                Request explanations to learn and verify the AI understands correctly.
              </p>
              <CodeBlock 
                code={`Refactor this component to use React hooks.
Explain why each hook is needed and what it replaces.`}
                language="text"
              />
            </div>
          </div>
        </section>

        {/* Techniques Section */}
        <section id="techniques" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              <FontAwesomeIcon icon={faBrain} className="w-6 h-6 mr-2 text-primary" />
              Core Techniques
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faRocket} className="w-5 h-5 text-primary" />
                Technique #1: The Task-Context-Constraints Pattern
              </h3>
              <p className="text-muted-foreground mb-4">
                Structure your prompts with clear task, context, and constraints.
              </p>
              <CodeBlock 
                code={`TASK: Add pagination to the user list table

CONTEXT:
- Using React with TanStack Table v8
- Backend API returns { data, total, page, limit }
- Component is in @components/UserTable.tsx

CONSTRAINTS:
- Keep existing filtering functionality
- Show 10, 25, 50, 100 per page options
- Add "Go to page" input
- Use existing Button component for navigation`}
                language="text"
              />
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faComments} className="w-5 h-5 text-primary" />
                Technique #2: Conversational Refinement
              </h3>
              <p className="text-muted-foreground mb-4">
                Start broad, then refine through follow-up prompts.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">First Prompt:</p>
                  <CodeBlock 
                    code="Create a reusable form input component in React"
                    language="text"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Follow-up 1:</p>
                  <CodeBlock 
                    code="Add error state with red border and error message"
                    language="text"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Follow-up 2:</p>
                  <CodeBlock 
                    code="Add label, placeholder, and make it work with react-hook-form"
                    language="text"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                Technique #3: Example-Driven Prompts
              </h3>
              <p className="text-muted-foreground mb-4">
                Show examples of input/output or existing patterns to follow.
              </p>
              <CodeBlock 
                code={`Create a new API route following the same pattern as @app/api/users/route.ts

The new route should be for 'posts' and include:
- GET (list with pagination)
- POST (create new)
- Same error handling pattern
- Same response format
- Same validation approach`}
                language="text"
              />
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">Technique #4: Incremental Feature Building</h3>
              <p className="text-muted-foreground mb-4">
                Build features in layers, testing each layer before moving on.
              </p>
              <CodeBlock 
                code={`Layer 1: Create basic search input component
[Test it works]

Layer 2: Add debouncing to prevent excessive API calls
[Test debounce works]

Layer 3: Add loading state while searching
[Test loading indicator]

Layer 4: Add keyboard navigation (↑↓ arrows)
[Test keyboard controls]`}
                language="text"
              />
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">Technique #5: The Debug-Fix-Explain Pattern</h3>
              <p className="text-muted-foreground mb-4">
                When debugging, ask AI to explain the issue before fixing.
              </p>
              <CodeBlock 
                code={`I'm getting "Cannot read property 'map' of undefined" in UserList.tsx

Before fixing:
1. Explain what's causing this error
2. Show me where the issue is in my code
3. Then provide the fix with explanation`}
                language="text"
              />
            </div>
          </div>
        </section>

        {/* Pitfalls Section */}
        <section id="pitfalls" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-red-500 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
              Common Pitfalls
            </h2>
          </div>

          <div className="space-y-4">
            <Callout type="error">
              <div>
                <h4 className="font-bold mb-2">❌ Pitfall #1: Assuming AI Knows Your Codebase</h4>
                <p className="mb-2">
                  Don't assume the AI remembers or knows your project structure, even within the same conversation.
                </p>
                <p className="text-sm">
                  <strong>Fix:</strong> Always reference files with @ or provide context about file locations and dependencies.
                </p>
              </div>
            </Callout>

            <Callout type="error">
              <div>
                <h4 className="font-bold mb-2">❌ Pitfall #2: Accepting Code Without Review</h4>
                <p className="mb-2">
                  Blindly accepting AI-generated code can introduce bugs, security issues, or technical debt.
                </p>
                <p className="text-sm">
                  <strong>Fix:</strong> Always review generated code. Ask "explain this code" if you don't understand it.
                </p>
              </div>
            </Callout>

            <Callout type="error">
              <div>
                <h4 className="font-bold mb-2">❌ Pitfall #3: Over-Complicating Prompts</h4>
                <p className="mb-2">
                  Writing overly long prompts with too many requirements at once leads to confusion.
                </p>
                <p className="text-sm">
                  <strong>Fix:</strong> Break down complex tasks. Start simple, iterate.
                </p>
              </div>
            </Callout>

            <Callout type="error">
              <div>
                <h4 className="font-bold mb-2">❌ Pitfall #4: Not Testing Incrementally</h4>
                <p className="mb-2">
                  Requesting many changes at once without testing in between leads to hard-to-debug issues.
                </p>
                <p className="text-sm">
                  <strong>Fix:</strong> Test after each significant change. Use "only make this one change" in prompts.
                </p>
              </div>
            </Callout>

            <Callout type="error">
              <div>
                <h4 className="font-bold mb-2">❌ Pitfall #5: Vague Error Descriptions</h4>
                <p className="mb-2">
                  "It's not working" or "there's a bug" doesn't give AI enough information.
                </p>
                <p className="text-sm">
                  <strong>Fix:</strong> Include error messages, stack traces, expected vs actual behavior.
                </p>
              </div>
            </Callout>

            <Callout type="error">
              <div>
                <h4 className="font-bold mb-2">❌ Pitfall #6: Ignoring Type Safety</h4>
                <p className="mb-2">
                  Accepting code that uses 'any' types or bypasses TypeScript checks.
                </p>
                <p className="text-sm">
                  <strong>Fix:</strong> Explicitly request "use proper TypeScript types, no 'any'" in your prompts.
                </p>
              </div>
            </Callout>

            <Callout type="error">
              <div>
                <h4 className="font-bold mb-2">❌ Pitfall #7: Not Specifying Performance Requirements</h4>
                <p className="mb-2">
                  AI might generate working but inefficient code (N+1 queries, unnecessary re-renders).
                </p>
                <p className="text-sm">
                  <strong>Fix:</strong> Mention performance concerns: "optimize for performance", "avoid unnecessary re-renders".
                </p>
              </div>
            </Callout>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold">Detailed Examples</h2>
          </div>

          <div className="space-y-8">
            {/* Example 1 */}
            <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/30">
              <h3 className="text-xl font-bold mb-4 text-primary">Example 1: Building a Feature from Scratch</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Initial Prompt:</p>
                  <CodeBlock 
                    code={`I need to add a dark mode toggle to my Next.js 14 app.

Tech stack:
- Next.js 14 (App Router)
- Tailwind CSS
- Currently using system preference only

Requirements:
- Toggle button in navbar
- Persist user preference in localStorage
- Support: light, dark, system
- Use next-themes if suitable

Start with setting up the theme provider.`}
                    language="text"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Follow-up Prompt:</p>
                  <CodeBlock 
                    code={`Now create the ThemeToggle component in @components/
It should:
- Show sun/moon icons
- Display current theme on hover
- Have smooth transition animation
- Work with the theme provider we just set up`}
                    language="text"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Refinement Prompt:</p>
                  <CodeBlock 
                    code={`The toggle looks good but:
1. Icons are too small on mobile - make them larger
2. Add a dropdown menu to show all three options (light/dark/system)
3. Highlight the currently selected option`}
                    language="text"
                  />
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/30">
              <h3 className="text-xl font-bold mb-4 text-primary">Example 2: Debugging an Issue</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Problem Description:</p>
                  <CodeBlock 
                    code={`I'm getting hydration errors in my Next.js app.

Error message:
"Text content does not match server-rendered HTML"

It happens in @components/UserProfile.tsx when displaying
the formatted date. The date shows correctly, but console
has hydration warnings.

Here's the component: @components/UserProfile.tsx`}
                    language="text"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Follow-up:</p>
                  <CodeBlock 
                    code={`That fixed it! Can you explain:
1. Why did using Date.toLocaleDateString cause hydration issues?
2. How does your solution prevent this?
3. Are there other common patterns that cause hydration errors?`}
                    language="text"
                  />
                </div>
              </div>
            </div>

            {/* Example 3 */}
            <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/30">
              <h3 className="text-xl font-bold mb-4 text-primary">Example 3: Refactoring for Better Patterns</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Refactor Request:</p>
                  <CodeBlock 
                    code={`The file @app/api/users/route.ts has grown to 500 lines
and handles too many responsibilities.

Please refactor following these principles:
1. Separate business logic from route handlers
2. Create a UserService class for business logic
3. Create a UserRepository for database access
4. Add proper error handling with custom error classes
5. Keep route handlers thin (just validation + service calls)

Start by showing me the proposed file structure,
then we'll implement each part.`}
                    language="text"
                  />
                </div>
              </div>
            </div>

            {/* Example 4 */}
            <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/30">
              <h3 className="text-xl font-bold mb-4 text-primary">Example 4: Performance Optimization</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Optimization Request:</p>
                  <CodeBlock 
                    code={`The dashboard page @app/dashboard/page.tsx is slow.

Issues:
- Initial load takes 3+ seconds
- Re-renders on every state change
- Fetches all data on mount (even off-screen data)

Profile: @app/dashboard/page.tsx

Optimize by:
1. Identifying unnecessary re-renders
2. Implementing data fetching best practices
3. Adding proper memoization
4. Lazy loading off-screen components

Show me the performance bottlenecks first,
then suggest fixes with explanations.`}
                    language="text"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold">Recommended Workflow</h2>
          </div>

          <div className="border rounded-lg p-6 bg-background">
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Plan Before Prompting</h4>
                  <p className="text-muted-foreground text-sm">
                    Outline what you want to build. Break it into logical steps. Know your tech stack and constraints.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Start with Foundation</h4>
                  <p className="text-muted-foreground text-sm">
                    Build core functionality first. Get the basic version working before adding features.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Iterate and Refine</h4>
                  <p className="text-muted-foreground text-sm">
                    Use conversational prompts to refine. "Make X bigger", "Add Y feature", "Change Z behavior".
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Test Frequently</h4>
                  <p className="text-muted-foreground text-sm">
                    Test after each change. Don't accumulate untested changes. Catch issues early.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Review and Understand</h4>
                  <p className="text-muted-foreground text-sm">
                    Read generated code. Ask for explanations. Learn patterns. Don't just copy-paste.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Refactor for Quality</h4>
                  <p className="text-muted-foreground text-sm">
                    Once it works, ask AI to improve code quality, add types, optimize performance, improve readability.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="mb-16">
          <Callout type="success">
            <div>
              <h3 className="font-bold text-lg mb-3">⚡ Quick Tips for Success</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Use @ to reference files - AI can read them directly</li>
                <li>✓ Be specific about versions (React 18, Next.js 14, etc.)</li>
                <li>✓ Mention your coding standards upfront</li>
                <li>✓ Ask "why" and "explain" to learn, not just get code</li>
                <li>✓ Test each change before moving forward</li>
                <li>✓ Break big tasks into small, testable chunks</li>
                <li>✓ Provide error messages and stack traces when debugging</li>
                <li>✓ Request TypeScript types explicitly</li>
                <li>✓ Iterate conversationally - refine through follow-ups</li>
                <li>✓ Review all generated code before committing</li>
              </ul>
            </div>
          </Callout>
        </section>

        {/* Advanced Industry Techniques (2026) */}
        <section id="advanced-techniques" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              <FontAwesomeIcon icon={faRocket} className="w-6 h-6 mr-2 text-primary" />
              Advanced Industry Techniques (2026)
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">Test-Driven Development with AI</h3>
              <p className="text-muted-foreground mb-4">
                TDD is the <strong>highest-leverage technique</strong> for reliable AI output. Tests provide machine-verifiable specs instead of ambiguous natural language.
              </p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-primary">The AI-TDD Workflow:</p>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li><strong>Write tests first</strong> - Define expected behavior through tests, or collaborate with AI to generate them</li>
                    <li><strong>Confirm failure</strong> - Run tests to verify they fail (proves test harness works)</li>
                    <li><strong>AI implements</strong> - Ask AI to write code making tests pass. AI iterates automatically until passing</li>
                    <li><strong>Refactor with safety</strong> - AI refactors while maintaining test coverage</li>
                  </ol>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Real Example: Rate Limiter Middleware</p>
                  <CodeBlock 
                    code={`Step 1 - Your prompt:
"Write comprehensive tests for a rate limiter middleware with these requirements:
- 100 requests per minute per API key
- Handle concurrent requests correctly
- Return 429 status when limit exceeded
- Include edge cases for: concurrent bursts, key expiration, invalid keys

DO NOT implement yet - just write the tests."

Step 2 - Review AI's tests, then:
"Now implement the middleware to pass these tests."

Step 3 - AI runs tests, fixes failures, iterates until green.`}
                    language="text"
                  />
                </div>

                <Callout type="info">
                  <p className="text-sm">
                    <strong>Why TDD works with AI:</strong> Tests catch hallucinations immediately. AI becomes self-QA instead of requiring external validation. Complex problems become incremental solve-and-verify cycles.
                  </p>
                </Callout>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">Context Window Management</h3>
              <p className="text-muted-foreground mb-4">
                Better developers aren't better prompters—they're better at <strong>managing context</strong>. Performance degrades as context fills.
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold mb-2">Quality Zones</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><span className="text-green-600 dark:text-green-400">0-40% fill:</span> High quality - Clean code, exact rule-following</li>
                    <li><span className="text-yellow-600 dark:text-yellow-400">40-70% fill:</span> Medium quality - Details skipped, quality drops</li>
                    <li><span className="text-red-600 dark:text-red-400">70%+ fill:</span> Low quality - Sloppy output, instructions ignored</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-primary">Critical Best Practices:</p>
                  <CodeBlock 
                    code={`✓ One session per task - Clear context between tasks
  Don't accumulate unrelated changes in one chat

✓ Monitor token usage - Watch status bar, restart at 80% fill

✓ Use retrieval discipline - Don't dump entire repos
  Use semantic search, dependency graphs, recent edits

✓ Leverage persistent context - Use .cursor/rules/ 
  for project standards that load automatically

✓ Choose context carefully - Smaller, focused context 
  often beats larger unfocused context`}
                    language="text"
                  />
                </div>

                <Callout type="warning">
                  <p className="text-sm">
                    <strong>Avoid this mistake:</strong> Continuing long sessions past 70% context. Each token must attend to every other token (quadratic complexity), so accumulated context becomes noise that degrades output quality.
                  </p>
                </Callout>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">Agent Mode vs Inline Edit: When to Use Each</h3>
              <p className="text-muted-foreground mb-4">
                Choosing the right mode dramatically impacts productivity. Each mode has optimal use cases.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-4 bg-primary/5">
                  <h4 className="font-bold mb-2 text-primary">🤖 Agent Mode (Chat)</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Best for: Multi-file changes, complex refactoring, autonomous exploration
                  </p>
                  <p className="text-sm mb-2"><strong>Use when:</strong></p>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Task spans multiple files</li>
                    <li>Need to understand bigger picture</li>
                    <li>Refactoring architecture</li>
                    <li>Want AI to explore solutions</li>
                    <li>Adding new features</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-bold mb-2">✏️ Inline Edit</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Best for: Quick in-place edits, fast precise tweaks
                  </p>
                  <p className="text-sm mb-2"><strong>Use when:</strong></p>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Fixing single function</li>
                    <li>Quick bug squashing</li>
                    <li>Localchanges only</li>
                    <li>Don't want context switch</li>
                    <li>Applying consistent pattern</li>
                  </ul>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2 text-primary">The Strategic Workflow:</p>
                <CodeBlock 
                  code={`1. Start in Ask Mode (for planning)
   - Explore the problem space
   - Understand requirements
   - Align on approach

2. Switch to Agent Mode (for execution)
   - Implement across multiple files
   - Let AI handle interconnected changes
   - Review and approve each move

3. Use Inline Edit (for polish)
   - Quick fixes to individual functions
   - Consistent pattern application
   - Fast iteration without context switch`}
                  language="text"
                />
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">Cursor Rules: Persistent Project Standards</h3>
              <p className="text-muted-foreground mb-4">
                Rules files inject project-specific standards at the prompt level, ensuring consistent AI behavior across all sessions.
              </p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-primary">Modern Structure (.cursor/rules/):</p>
                  <CodeBlock 
                    code={`.cursor/
  rules/
    core.md          # Global standards (priority 10-20)
    architecture.md  # System design patterns (30-40)
    backend.md       # API conventions (40-50)
    frontend.md      # UI component standards (40-50)
    testing.md       # Test patterns (50-60)
    security.md      # Security requirements (priority 100)`}
                    language="text"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Example Rule File (MDC format):</p>
                  <CodeBlock 
                    code={`---
description: React component best practices
globs: ["**/*.tsx", "**/*.jsx"]
priority: 40
---

# React Component Rules

## Hooks
- Use functional components with hooks over class components
- Call hooks at top level only
- Extract complex logic into custom hooks

## Props
- Use TypeScript interfaces for props
- Destructure props in function signature
- Provide default values for optional props

## Example:
\`\`\`tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  onClick, 
  children 
}: ButtonProps) {
  return <button className={styles[variant]} onClick={onClick}>
    {children}
  </button>
}
\`\`\``}
                    language="markdown"
                  />
                </div>

                <Callout type="success">
                  <div>
                    <p className="text-sm mb-2"><strong>Best Practices for Rules:</strong></p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Keep rules under 500 lines per file</li>
                      <li>Use glob patterns to scope rules to specific files</li>
                      <li>Include concrete code examples, not generic advice</li>
                      <li>Version control rules and document changes</li>
                      <li>Review rules when AI makes repeated mistakes</li>
                      <li>Use priority levels (10=global, 100=security override)</li>
                    </ul>
                  </div>
                </Callout>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">Advanced Debugging Patterns</h3>
              <p className="text-muted-foreground mb-4">
                Modern AI assistants employ systematic debugging workflows that go beyond simple error messages.
              </p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-primary">The Four-Step Systematic Approach:</p>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">1</span>
                      <div>
                        <strong>Provide Full Error Context</strong>
                        <p className="text-muted-foreground">Include stack traces, trigger conditions, request payloads—not just bare error messages</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">2</span>
                      <div>
                        <strong>Let AI Trace Execution Path</strong>
                        <p className="text-muted-foreground">AI reads all relevant files, traces request flow through service layers and database queries</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">3</span>
                      <div>
                        <strong>Verify Diagnosis First</strong>
                        <p className="text-muted-foreground">Ask AI to explain root cause before applying fixes. Prevents incorrect solutions.</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">4</span>
                      <div>
                        <strong>Write Regression Test</strong>
                        <p className="text-muted-foreground">Create test reproducing exact bug scenario to prevent future regressions</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Advanced Debugging Prompts:</p>
                  <CodeBlock 
                    code={`# For Intermittent Race Conditions:
"Use ultrathink mode to analyze this race condition that fails 
under load. The error is: [error]. Trace all async operations 
and identify timing dependencies."

# For Type Errors:
"This TypeScript error appears in FileA but I suspect the root 
cause is elsewhere. Trace the type through all transformations 
from the data source. Show the type shape at each step."

# For Production Errors:
"Here's a production stack trace: [trace]
1. Identify the exact line that threw
2. Trace the request flow from entry point
3. Show data shape at each transformation
4. Explain root cause
5. Suggest fix with regression test"`}
                    language="text"
                  />
                </div>

                <Callout type="info">
                  <p className="text-sm">
                    <strong>Pro tip:</strong> Use Esc-Esc to revert changes instantly if debugging enters a cascading "fix-the-fix" loop. Modern AI assistants include checkpoint systems to break bad debugging cycles.
                  </p>
                </Callout>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-bold mb-3">The Structured Prompt Framework (4 Questions)</h3>
              <p className="text-muted-foreground mb-4">
                Research shows structured prompts dramatically reduce developer-AI iterations. Use this framework for consistent results.
              </p>
              
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-bold mb-1">1. What needs to change?</h4>
                    <p className="text-sm text-muted-foreground">Specific feature, bug fix, refactor—be precise</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-bold mb-1">2. Where in the codebase?</h4>
                    <p className="text-sm text-muted-foreground">File paths, function names, line ranges</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-bold mb-1">3. Why (constraint/requirement)?</h4>
                    <p className="text-sm text-muted-foreground">Business logic, performance needs, compatibility</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-bold mb-1">4. How to verify results?</h4>
                    <p className="text-sm text-muted-foreground">Acceptance criteria, test cases, expected behavior</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-primary">Template in Action:</p>
                  <CodeBlock 
                    code={`WHAT: Add email validation to user registration

WHERE: 
- File: @app/api/auth/register/route.ts
- Function: validateUserInput()
- Lines: 45-67

WHY:
- Prevent invalid emails in database
- Meet GDPR requirements for valid contact info
- Reduce bounce rate from notification system

HOW TO VERIFY:
- Test: valid emails pass (user@example.com)
- Test: invalid formats rejected (user@, @example)
- Test: returns clear error messages
- Test: doesn't break existing auth flow

CONSTRAINTS:
- Don't change existing password validation
- Use existing error handling pattern
- Keep response time under 100ms`}
                    language="text"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Real-World Examples */}
        <section id="more-examples" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold">More Real-World Examples</h2>
          </div>

          <div className="space-y-8">
            {/* Example: Context Management */}
            <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/30">
              <h3 className="text-xl font-bold mb-4 text-primary">Example 5: Effective Context Management</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-red-600 dark:text-red-400">❌ Poor Context (leads to hallucination):</p>
                  <CodeBlock 
                    code="Update the payment processing to handle subscriptions"
                    language="text"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Problem: No context about current implementation, requirements, or constraints</p>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">✓ Excellent Context:</p>
                  <CodeBlock 
                    code={`CONTEXT:
Current: @app/api/payment/route.ts handles one-time payments via Stripe
Stack: Next.js 14, Stripe SDK v15, PostgreSQL
Architecture: Service layer pattern (@services/PaymentService.ts)

TASK:
Add subscription support to existing payment flow

REQUIREMENTS:
- Support monthly/yearly billing cycles
- Handle failed payment retries (use Stripe webhooks)
- Prorate when users upgrade mid-cycle
- Store subscription status in users table

CONSTRAINTS:
- Don't break existing one-time payment flow
- Reuse existing PaymentService class pattern
- Use existing error handling (@lib/errors.ts)
- Add types to @types/payment.ts

FILES TO MODIFY:
- @app/api/payment/route.ts
- @services/PaymentService.ts  
- @types/payment.ts

Start by showing me the proposed changes to PaymentService class`}
                    language="text"
                  />
                </div>
              </div>
            </div>

            {/* Example: TDD in Practice */}
            <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/30">
              <h3 className="text-xl font-bold mb-4 text-primary">Example 6: TDD for Complex Feature</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Building a caching layer with TDD:</p>
                  <CodeBlock 
                    code={`Step 1: Define behavior through tests first
"Create comprehensive tests for a Redis-based cache service:

Requirements:
- get(key) returns cached value or null
- set(key, value, ttl) stores with expiration  
- delete(key) removes entry
- clear() flushes all cache
- Handle Redis connection errors gracefully
- Support JSON serialization

Write the test suite but DO NOT implement CacheService yet.
Include edge cases:
- Expired keys return null
- Invalid JSON throws TypeError
- Redis down returns null (doesn't crash)
- Concurrent access to same key
- TTL of 0 means no expiration"

Step 2: Review tests, then implement
"Now implement CacheService to pass all these tests.
Use ioredis library and follow the service pattern in @services/"

Step 3: AI auto-iterates
- Runs tests
- Sees failures
- Fixes implementation
- Reruns until all pass`}
                    language="text"
                  />
                </div>

                <Callout type="success">
                  <p className="text-sm">
                    <strong>Result:</strong> First-time implementation success rate increases dramatically. Tests catch edge cases AI typically misses. Implementation matches exact requirements.
                  </p>
                </Callout>
              </div>
            </div>

            {/* Example: Debugging Race Condition */}
            <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/30">
              <h3 className="text-xl font-bold mb-4 text-primary">Example 7: Debugging Production Race Condition</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Systematic debugging prompt:</p>
                  <CodeBlock 
                    code={`We're seeing duplicate order confirmations in production (1-2% of orders).

ERROR DETAILS:
- Occurs only under high load (>100 req/sec)
- Database shows duplicate order_confirmations rows
- Same orderId, different timestamps ~50-200ms apart
- Happens in @app/api/orders/confirm/route.ts

CURRENT IMPLEMENTATION: @app/api/orders/confirm/route.ts

TRACE REQUEST:
1. User clicks "Confirm Order"
2. Frontend calls POST /api/orders/confirm
3. Route checks order exists
4. Updates order status to 'confirmed'
5. Creates order_confirmation record
6. Sends email

QUESTION:
Use ultrathink mode to analyze this race condition.
1. Identify where concurrent requests can interleave
2. Show the exact timing that causes duplicates
3. Explain why it only happens under load
4. Propose fix with database-level protection

Then write a test that reproduces this race condition.`}
                    language="text"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">AI traces the problem:</p>
                  <CodeBlock 
                    code={`AI Response:

RACE CONDITION IDENTIFIED:
Between checking order exists (line 23) and creating confirmation 
(line 45), two concurrent requests can both pass the existence check 
before either creates the confirmation.

Timeline:
T0ms:  Request A checks order exists ✓
T10ms: Request B checks order exists ✓  
T50ms: Request A creates confirmation
T75ms: Request B creates confirmation (duplicate!)

FIX: Add unique constraint + error handling
- Database: UNIQUE(order_id) on order_confirmations table
- Code: Catch unique constraint violation, treat as success
- Idempotent: Multiple calls produce same result safely

REGRESSION TEST:
Simulate concurrent POST requests to same order ID...`}
                    language="typescript"
                  />
                </div>
              </div>
            </div>

            {/* Example: Using Rules Files */}
            <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/30">
              <h3 className="text-xl font-bold mb-4 text-primary">Example 8: Project-Wide Consistency with Rules</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Setup: Create .cursor/rules/api-standards.md</p>
                  <CodeBlock 
                    code={`---
description: API route standards
globs: ["**/api/**/route.ts"]
priority: 50
---

# API Route Standards

## Structure
Every API route must follow this structure:

\`\`\`typescript
export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body = await request.json()
    const validated = ApiSchema.parse(body)
    
    // 2. Call service layer
    const result = await UserService.createUser(validated)
    
    // 3. Return success response
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    // 4. Handle errors consistently
    return handleApiError(error)
  }
}
\`\`\`

## Error Handling
- Use @lib/errors/handleApiError.ts
- Never expose internal error messages to client
- Always log errors with request context

## Validation
- Use Zod schemas from @lib/schemas/
- Validate before calling services
- Return 400 for validation errors

## Services
- Never write business logic in routes
- All logic goes in @services/ layer
- Routes are thin: validate → call service → return`}
                    language="markdown"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Now every prompt automatically follows these standards:</p>
                  <CodeBlock 
                    code={`Your prompt: "Create a new API route for deleting users"

AI automatically:
✓ Uses the 4-part structure (parse, service, response, error)
✓ Calls UserService instead of inline logic
✓ Uses handleApiError() from lib
✓ Adds Zod validation
✓ Returns proper status codes

No need to repeat these instructions every time!`}
                    language="text"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Standards Checklist */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold">2026 Industry Standards Checklist</h2>
          </div>

          <div className="border rounded-lg p-6 bg-background">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-3 text-primary">✅ Essential Practices</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>Use TDD for critical features and bug fixes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>Monitor context window fill (restart at 80%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>Maintain .cursor/rules/ for project standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>Use Agent mode for multi-file, Inline for single-file</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>Provide 4-part context (What/Where/Why/How to verify)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>Ask AI to list assumptions before coding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>Use structured prompts over paragraph text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>Include acceptance criteria in every prompt</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-3 text-red-600 dark:text-red-400">❌ Anti-Patterns to Avoid</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                    <span>Continuing sessions past 70% context fill</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                    <span>Dumping entire codebase as context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                    <span>Accepting code without understanding it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                    <span>Using vague prompts ("fix the bug", "make it better")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                    <span>Requesting many changes without testing between</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                    <span>Ignoring AI hallucinations (verify output always)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                    <span>Using Agent mode for simple single-line changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                    <span>Skipping test coverage on AI-generated code</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
