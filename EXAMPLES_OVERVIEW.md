# Prompt Engineering Examples - Complete Overview

This site now contains **11 comprehensive examples** covering beginner to advanced prompt engineering techniques that senior software engineers need for production systems.

## Fundamentals (3 examples)

### 1. Role Separation
- **Difficulty**: Beginner
- **Category**: Fundamentals
- **What**: Distinguish system instructions from user input
- **Why**: Prevents prompt injection and clarifies model behavior
- **Key concepts**: System/user separation, untrusted content marking

### 2. Delimiters and Untrusted Text
- **Difficulty**: Beginner
- **Category**: Fundamentals
- **What**: Use clear boundaries to mark and protect against malicious input
- **Why**: Defense against prompt injection attacks
- **Key concepts**: Delimiter choices, defense in depth, testing strategies

### 3. Few-Shot Examples
- **Difficulty**: Beginner
- **Category**: Techniques
- **What**: Show the model what you want through concrete examples
- **Why**: Improves consistency and accuracy vs zero-shot
- **Key concepts**: Example selection, ordering, diversity, format consistency

## Core Techniques (2 examples)

### 4. Structured Output (JSON)
- **Difficulty**: Intermediate
- **Category**: Techniques
- **What**: Request parseable JSON output with schemas
- **Why**: Enable reliable downstream processing
- **Key concepts**: Schema definition, validation, JSON mode, error handling

### 5. Eval Rubrics and Test Cases
- **Difficulty**: Intermediate
- **Category**: Evaluation
- **What**: Define clear success criteria and systematic testing
- **Why**: Measure and improve prompt quality over time
- **Key concepts**: Rubric design, test diversity, automation, regression testing

## Advanced Techniques (2 examples)

### 6. Chain of Thought (CoT)
- **Difficulty**: Intermediate
- **Category**: Advanced Techniques
- **What**: Elicit step-by-step reasoning for complex tasks
- **Why**: Dramatically improves accuracy on multi-step problems
- **Key concepts**: Zero-shot CoT, few-shot CoT, self-consistency, verification
- **Production considerations**: 2-5x token cost, latency increase, accuracy gains

### 7. Prompt Chaining & Workflows
- **Difficulty**: Advanced
- **Category**: Advanced Techniques
- **What**: Break complex tasks into sequential focused steps
- **Why**: Better quality, debugging, and validation per step
- **Key concepts**: Chain execution, validation, error handling, parallel chains
- **Production patterns**: Multi-step reviews, conditional branching, monitoring

## Integration Patterns (1 example)

### 8. Function Calling & Tool Use
- **Difficulty**: Advanced
- **Category**: Integration
- **What**: Enable LLMs to call external functions and APIs
- **Why**: Extend capabilities beyond text generation
- **Key concepts**: Function schemas, parameter validation, ReAct pattern
- **Security**: Input validation, whitelisting, timeouts, rate limits
- **Production code**: Function executor, error handling, multi-step agents

## Production Systems (3 examples)

### 9. Token Optimization & Cost Management
- **Difficulty**: Advanced
- **Category**: Production
- **What**: Reduce API costs while maintaining quality
- **Why**: Production systems can quickly become expensive
- **Key concepts**: Token counting, model routing, caching, batching
- **Strategies**: 
  - Remove redundancy (4x reduction possible)
  - Right-size models (60x cost savings on simple tasks)
  - Prompt caching (50-90% savings on repeated prefixes)
  - Output limits, compression, smart truncation
- **Includes**: Cost tracking, budgeting, A/B testing, monitoring

### 10. Error Handling & Retry Strategies
- **Difficulty**: Advanced
- **Category**: Production
- **What**: Build robust applications with proper error handling
- **Why**: APIs fail - systems need resilience
- **Key concepts**: Error classification, exponential backoff, circuit breakers
- **Error types**: Transient (retry), permanent (don't retry), recoverable (modify & retry)
- **Production patterns**:
  - Exponential backoff with jitter
  - Circuit breaker pattern
  - Fallback strategies (backup models, cache, defaults)
  - Graceful degradation
  - Monitoring and alerting
- **Includes**: Full production-ready error handler class

### 11. Context Window Management
- **Difficulty**: Advanced
- **Category**: Production
- **What**: Handle long conversations within token limits
- **Why**: Context windows are finite, conversations/documents can be long
- **Key concepts**: Token counting, truncation strategies, summarization
- **Strategies**:
  - Sliding window (keep recent messages)
  - Hierarchical summarization (preserve old context)
  - RAG (retrieve relevant chunks for documents)
  - Semantic compression
  - Dynamic token budgeting
- **Includes**: Full implementations for each strategy, monitoring

## Summary by Engineering Level

### Junior → Mid-Level Engineers
Start with **Fundamentals** (1-3):
- Role Separation
- Delimiters
- Few-Shot Examples

Add **Core Techniques** (4-5):
- Structured Output
- Eval Rubrics

### Senior Engineers
Master all **Production Systems** patterns (9-11):
- Token Optimization (cost control)
- Error Handling (reliability)
- Context Management (scale)

Learn **Advanced Techniques** (6-7):
- Chain of Thought (quality)
- Prompt Chaining (complex workflows)

Understand **Integration** (8):
- Function Calling (extensibility)

## Production Readiness Checklist

For production LLM applications, senior engineers should implement:

- [ ] **Cost Management**: Token counting, budgets, monitoring (Example 9)
- [ ] **Reliability**: Retry logic, circuit breakers, fallbacks (Example 10)
- [ ] **Scale**: Context window management for long conversations (Example 11)
- [ ] **Quality**: Eval rubrics, systematic testing, A/B testing (Example 5)
- [ ] **Security**: Prompt injection defense, input validation (Examples 2, 8)
- [ ] **Performance**: Model routing, caching, batching (Example 9)
- [ ] **Observability**: Logging, monitoring, alerting (Examples 9, 10, 11)
- [ ] **Maintainability**: Prompt versioning, documentation (Example 5)

## Interactive Demos

The site also includes **4 hands-on demos**:

1. **Template Playground**: Build prompts, get quality scores
2. **JSON Validator**: Test schema validation with Ajv
3. **Injection Sandbox**: Test defensive strategies against attacks  
4. **Eval Rubric Builder**: Create criteria and run test cases

All demos run 100% offline in the browser - no API keys needed.

## Quick Start

```bash
# Run development server
npm run dev

# Open http://localhost:3000

# Build static site
npm run build

# Deploy the out/ directory
```

## File Sizes

Total content: ~132KB across 11 markdown files
- Largest: Error Handling (18KB), Prompt Chaining (17KB), Context Management (17KB)
- Most comprehensive production examples with full code implementations
- All examples include templates, pitfalls, checklists, and production code

## Next Steps

1. **Read examples** in order of your experience level
2. **Try demos** to practice concepts interactively
3. **Implement patterns** in your own projects
4. **Add new examples** as you discover production patterns
5. **Contribute** improvements and additional techniques

---

Built with Next.js, TypeScript, and Tailwind CSS. Fully static, deployable anywhere.
