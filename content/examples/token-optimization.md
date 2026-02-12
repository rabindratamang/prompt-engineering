---
title: Token Optimization & Cost Management
description: Reduce API costs while maintaining output quality through efficient prompting
category: production
difficulty: advanced
pitfalls:
  - Over-optimizing at the expense of quality
  - Not measuring token usage before optimizing
  - Removing context that's actually important
  - Using short variable names that hurt readability
  - Not considering the cost-quality trade-off
checklist:
  - Measure baseline token usage and costs
  - Set token budgets for different operations
  - Remove redundant context and repetition
  - Use shorter models for simple tasks
  - Implement prompt caching where available
  - Stream responses to show progress
  - Monitor costs per request type
  - A/B test optimizations to ensure quality
---

## Problem

LLM API costs scale with token usage. Production systems can quickly become expensive without optimization strategies.

## When to Use

**Optimize tokens when:**
- Running at scale (thousands+ requests/day)
- Operating on tight budgets
- Cost is significant business concern
- Using expensive models (GPT-4, Claude Opus)
- Processing large documents or conversations
- Cost per request matters

**Priority optimization areas:**
- High-volume production systems
- Batch processing pipelines
- Conversational AI with long sessions
- Document processing at scale
- Cost-sensitive use cases

## Pros

✅ **60-90% cost reduction** possible with aggressive optimization  
✅ **Faster responses** - Fewer tokens = quicker generation  
✅ **Scale economics** - Cost savings multiply at volume  
✅ **Budget predictability** - Set and enforce token limits  
✅ **Enables cheaper models** - Smart prompting + small model = good results  
✅ **Better UX** - Faster, more concise responses

## Cons

❌ **Time investment** - Optimization takes engineering effort  
❌ **Quality risk** - Over-optimization can hurt accuracy  
❌ **Maintenance** - Optimizations need updates as models evolve  
❌ **Complexity** - More code for caching, compression, routing  
❌ **Premature optimization** - May optimize before knowing what matters  
❌ **Testing overhead** - Must verify optimizations don't break quality

## Token Basics

- **Input tokens**: Your prompt + conversation history
- **Output tokens**: Generated response
- **Cost**: Input tokens are usually 1/3 to 1/2 the cost of output tokens
- **Typical pricing**: $0.50-$5 per 1M tokens for input, $1.50-$15 per 1M for output

## Measuring Token Usage

```python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """Count tokens in a text string."""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def estimate_cost(prompt: str, expected_output_tokens: int, model: str = "gpt-4") -> float:
    """Estimate API call cost."""
    input_tokens = count_tokens(prompt, model)
    
    # Example pricing (adjust for your model)
    input_cost_per_1m = 30.0  # $30/1M tokens
    output_cost_per_1m = 60.0  # $60/1M tokens
    
    input_cost = (input_tokens / 1_000_000) * input_cost_per_1m
    output_cost = (expected_output_tokens / 1_000_000) * output_cost_per_1m
    
    return input_cost + output_cost

# Usage
prompt = "Analyze this long document..."
tokens = count_tokens(prompt)
cost = estimate_cost(prompt, expected_output_tokens=500)
print(f"Tokens: {tokens}, Est. cost: ${cost:.4f}")
```

## Strategy 1: Remove Redundancy

**Before** (verbose):
```
You are a helpful AI assistant. Your job is to help users with their questions.
Please be helpful, accurate, and concise in your responses. Always make sure
to answer the question fully and completely. If you don't know something,
say so. Be polite and professional at all times.

User question: What is 2+2?
```

**After** (concise):
```
Answer this question accurately and concisely:

What is 2+2?
```

**Savings**: ~80 tokens → ~15 tokens (4.3x reduction)

## Strategy 2: Use Right-Sized Models

Different tasks need different capabilities:

```python
class ModelRouter:
    def __init__(self):
        self.models = {
            "simple": {
                "name": "gpt-3.5-turbo",
                "cost_per_1m_in": 0.50,
                "cost_per_1m_out": 1.50
            },
            "complex": {
                "name": "gpt-4",
                "cost_per_1m_in": 30.0,
                "cost_per_1m_out": 60.0
            }
        }
    
    def route(self, task_type: str, prompt: str):
        """Route to appropriate model based on task."""
        # Simple tasks: classification, extraction, formatting
        if task_type in ["classify", "extract", "format"]:
            return self.models["simple"]
        
        # Complex tasks: reasoning, code generation, analysis
        elif task_type in ["reason", "code", "analyze"]:
            return self.models["complex"]
        
        # Auto-route based on prompt complexity
        else:
            tokens = count_tokens(prompt)
            has_examples = "Example:" in prompt or "Examples:" in prompt
            
            if tokens < 500 and not has_examples:
                return self.models["simple"]
            else:
                return self.models["complex"]

# Use cheaper model for simple tasks
router = ModelRouter()
model = router.route("classify", prompt)
# Can save 60x on cost for simple tasks!
```

## Strategy 3: Prompt Caching

Some APIs cache repeated prefixes to reduce costs:

```python
# Structure prompts with cacheable prefix
SYSTEM_INSTRUCTIONS = """
You are a code review assistant with expertise in Python, JavaScript, and Go.

Review guidelines:
1. Check for correctness and edge cases
2. Identify security vulnerabilities
3. Suggest performance improvements
4. Enforce style consistency

[... long guidelines that don't change ...]
"""  # This part gets cached

def review_code(code: str) -> str:
    # Cached part (only charged once)
    prompt = SYSTEM_INSTRUCTIONS
    
    # New part (charged each time)
    prompt += f"\n\nCode to review:\n{code}\n\nReview:"
    
    return llm.complete(prompt)

# First call: pays for full prompt
# Subsequent calls: only pays for the code snippet!
# Savings: 50-90% on repeated calls with same prefix
```

## Strategy 4: Limit Output Tokens

Control maximum response length:

```python
def query_llm(prompt: str, max_tokens: int = 150):
    """Enforce output token limits."""
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,  # Hard limit
        temperature=0.7
    )
    return response.choices[0].message.content

# For summaries, classifications, etc.
result = query_llm(
    "Classify this review as positive/negative/neutral: ...",
    max_tokens=10  # Only need "positive", "negative", or "neutral"
)
```

## Strategy 5: Compress Context

When dealing with long documents:

```python
def compress_document(doc: str, max_tokens: int = 2000) -> str:
    """Intelligently compress document to fit token budget."""
    current_tokens = count_tokens(doc)
    
    if current_tokens <= max_tokens:
        return doc
    
    # Strategy 1: Extract key paragraphs
    paragraphs = doc.split('\n\n')
    # Use extractive summarization or embeddings
    key_paragraphs = extract_important_paragraphs(paragraphs, max_tokens)
    
    compressed = '\n\n'.join(key_paragraphs)
    
    # Strategy 2: If still too long, summarize
    if count_tokens(compressed) > max_tokens:
        summary = summarize_with_llm(compressed, target_tokens=max_tokens * 0.8)
        return summary
    
    return compressed

# Use compressed version
doc = load_document("long_file.txt")
compressed = compress_document(doc, max_tokens=2000)
result = analyze_document(compressed)  # Much cheaper!
```

## Strategy 6: Batch Processing

Process multiple items in one call:

```python
# Inefficient: Multiple calls
for review in reviews:
    sentiment = classify_sentiment(review)  # 1 API call each
# Cost: N calls × cost_per_call

# Efficient: Batch call
def classify_batch(reviews: list[str]) -> list[str]:
    prompt = "Classify each review as positive/negative/neutral:\n\n"
    for i, review in enumerate(reviews, 1):
        prompt += f"{i}. {review}\n"
    prompt += "\nProvide answers as: 1. [sentiment], 2. [sentiment], ..."
    
    response = llm.complete(prompt)
    return parse_batch_response(response)

sentiments = classify_batch(reviews)  # 1 API call
# Cost: 1 call × larger_cost (but usually much cheaper than N calls)
```

## Strategy 7: Smart Truncation

For very long inputs, truncate intelligently:

```python
def smart_truncate(text: str, max_tokens: int, strategy: str = "middle") -> str:
    """Truncate text while preserving important parts."""
    tokens = count_tokens(text)
    
    if tokens <= max_tokens:
        return text
    
    if strategy == "start":
        # Keep beginning (good for instructions)
        encoding = tiktoken.encoding_for_model("gpt-4")
        tokens = encoding.encode(text)[:max_tokens]
        return encoding.decode(tokens)
    
    elif strategy == "end":
        # Keep end (good for recent history)
        encoding = tiktoken.encoding_for_model("gpt-4")
        tokens = encoding.encode(text)[-max_tokens:]
        return encoding.decode(tokens)
    
    elif strategy == "middle":
        # Keep start + end, remove middle (good for context + recent)
        half = max_tokens // 2
        encoding = tiktoken.encoding_for_model("gpt-4")
        all_tokens = encoding.encode(text)
        
        start_tokens = all_tokens[:half]
        end_tokens = all_tokens[-half:]
        
        return encoding.decode(start_tokens) + "\n\n[...]\n\n" + encoding.decode(end_tokens)
```

## Cost Monitoring

```python
from dataclasses import dataclass
from datetime import datetime
import logging

@dataclass
class UsageStats:
    timestamp: datetime
    model: str
    input_tokens: int
    output_tokens: int
    cost: float
    endpoint: str

class CostTracker:
    def __init__(self):
        self.usage: list[UsageStats] = []
        self.budgets = {}  # endpoint -> daily budget
        
    def track(self, model: str, input_tokens: int, output_tokens: int, endpoint: str):
        """Track API usage and cost."""
        cost = self.calculate_cost(model, input_tokens, output_tokens)
        
        stats = UsageStats(
            timestamp=datetime.now(),
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=cost,
            endpoint=endpoint
        )
        
        self.usage.append(stats)
        
        # Check budget
        daily_total = self.get_daily_total(endpoint)
        if endpoint in self.budgets and daily_total > self.budgets[endpoint]:
            logging.warning(f"Budget exceeded for {endpoint}: ${daily_total:.2f}")
        
        return stats
    
    def get_daily_total(self, endpoint: str) -> float:
        """Get total cost for endpoint today."""
        today = datetime.now().date()
        return sum(
            s.cost for s in self.usage
            if s.endpoint == endpoint and s.timestamp.date() == today
        )
    
    def report(self):
        """Generate cost report."""
        total_cost = sum(s.cost for s in self.usage)
        total_input_tokens = sum(s.input_tokens for s in self.usage)
        total_output_tokens = sum(s.output_tokens for s in self.usage)
        
        print(f"Total cost: ${total_cost:.2f}")
        print(f"Input tokens: {total_input_tokens:,}")
        print(f"Output tokens: {total_output_tokens:,}")
        print(f"Total tokens: {total_input_tokens + total_output_tokens:,}")
        
        # Per-endpoint breakdown
        by_endpoint = {}
        for stat in self.usage:
            if stat.endpoint not in by_endpoint:
                by_endpoint[stat.endpoint] = 0
            by_endpoint[stat.endpoint] += stat.cost
        
        print("\nBy endpoint:")
        for endpoint, cost in sorted(by_endpoint.items(), key=lambda x: -x[1]):
            print(f"  {endpoint}: ${cost:.2f}")

# Usage
tracker = CostTracker()
tracker.budgets["chat"] = 100.0  # $100/day budget

# Track each call
stats = tracker.track(
    model="gpt-4",
    input_tokens=1500,
    output_tokens=300,
    endpoint="chat"
)

# Daily report
tracker.report()
```

## Cost-Quality Trade-offs

Always measure the impact of optimizations:

```python
def ab_test_optimization(test_cases: list, original_prompt: callable, optimized_prompt: callable):
    """Compare original vs optimized prompt."""
    results = {
        "original": {"cost": 0, "quality_score": 0},
        "optimized": {"cost": 0, "quality_score": 0}
    }
    
    for test_case in test_cases:
        # Test original
        orig_response, orig_cost = run_with_cost_tracking(original_prompt, test_case)
        orig_quality = evaluate_quality(orig_response, test_case.expected)
        results["original"]["cost"] += orig_cost
        results["original"]["quality_score"] += orig_quality
        
        # Test optimized
        opt_response, opt_cost = run_with_cost_tracking(optimized_prompt, test_case)
        opt_quality = evaluate_quality(opt_response, test_case.expected)
        results["optimized"]["cost"] += opt_cost
        results["optimized"]["quality_score"] += opt_quality
    
    # Report
    print(f"Original: ${results['original']['cost']:.2f}, quality: {results['original']['quality_score']}")
    print(f"Optimized: ${results['optimized']['cost']:.2f}, quality: {results['optimized']['quality_score']}")
    
    cost_reduction = (1 - results['optimized']['cost'] / results['original']['cost']) * 100
    quality_change = results['optimized']['quality_score'] - results['original']['quality_score']
    
    print(f"\nCost reduction: {cost_reduction:.1f}%")
    print(f"Quality change: {quality_change:+.2f}")
```

## Best Practices Summary

1. **Measure first**: Track token usage and costs before optimizing
2. **Right-size models**: Use cheaper models for simple tasks
3. **Cache when possible**: Structure prompts for caching
4. **Limit outputs**: Set `max_tokens` appropriately
5. **Batch operations**: Process multiple items together
6. **Compress context**: Intelligently truncate long inputs
7. **Monitor continuously**: Set budgets and alerts
8. **Test changes**: Ensure optimizations don't hurt quality
