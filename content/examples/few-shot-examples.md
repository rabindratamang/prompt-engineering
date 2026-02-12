---
title: Few-Shot Examples
description: Show the model what you want through concrete input-output examples
category: techniques
difficulty: beginner
template: |
  Task: {describe the task clearly}
  
  Examples:
  
  Input: {example_1_input}
  Output: {example_1_output}
  
  Input: {example_2_input}
  Output: {example_2_output}
  
  Input: {example_3_input}
  Output: {example_3_output}
  
  Now, process this:
  Input: {actual_user_input}
  Output:
pitfalls:
  - Too few examples (1-2 may not establish the pattern)
  - Examples that are too similar (doesn't show range)
  - Examples with inconsistent formatting
  - Not covering edge cases in examples
  - Examples that contradict each other
checklist:
  - Provide 3-5 diverse examples
  - Ensure consistent format across all examples
  - Cover common cases and at least one edge case
  - Match example complexity to task complexity
  - Test with inputs similar to your examples
  - Verify output format matches example format
---

## Problem

Zero-shot prompts (just describing what you want) often produce inconsistent or incorrect outputs. The model benefits from seeing concrete examples of the desired behavior.

## Solution

Provide 2-5 input-output pairs that demonstrate the pattern you want. The model learns from these examples to handle new inputs.

## When to Use

**Use few-shot examples when:**
- Output format must be very specific
- Task has nuanced requirements hard to describe
- You need consistent behavior across inputs
- Zero-shot prompting gives inconsistent results
- Teaching a pattern or style
- Classification with clear categories

**Skip few-shot when:**
- Task is simple and well-known
- Token budget is tight (examples use tokens)
- You have enough data to fine-tune
- Zero-shot already works well

## Pros

✅ **Dramatically improves consistency** - Model follows established pattern  
✅ **No fine-tuning needed** - Works with any model immediately  
✅ **Easy to iterate** - Just change examples to adjust behavior  
✅ **Great for format control** - Shows exact output structure wanted  
✅ **Handles edge cases** - Examples can demonstrate tricky scenarios  
✅ **Quick to implement** - Faster than building training datasets

## Cons

❌ **Token overhead** - Examples consume input tokens  
❌ **Example quality matters** - Bad examples = bad outputs  
❌ **Can overfit** - Model might match examples too literally  
❌ **Limited by context** - Can only fit 3-10 examples typically  
❌ **Selection is critical** - Wrong examples mislead the model  
❌ **Not as powerful as fine-tuning** - For complex domains, fine-tuning better

## How Many Examples?

- **Zero-shot**: Just instructions (works for simple, well-known tasks)
- **One-shot**: Single example (risky, might overfit)
- **Few-shot**: 3-5 examples (sweet spot for most tasks)
- **Many-shot**: 10+ examples (diminishing returns, tokens expensive)

## Example: Sentiment Classification

```
Classify the sentiment of customer reviews as positive, negative, or neutral.

Examples:

Review: "This product exceeded my expectations! Great quality and fast shipping."
Sentiment: positive

Review: "Completely useless. Broke after one day. Don't waste your money."
Sentiment: negative

Review: "It's okay. Does what it says but nothing special."
Sentiment: neutral

Review: "Arrived on time. Haven't used it yet but looks fine."
Sentiment: neutral

Now classify:
Review: "Best purchase I've made this year! Highly recommend to everyone."
Sentiment:
```

## Choosing Good Examples

### Diversity
Cover different scenarios:
- Common cases
- Edge cases
- Ambiguous cases
- Different lengths/styles

### Consistency
Keep formatting identical:
```
# Good - consistent format
Input: text A | Output: result A
Input: text B | Output: result B

# Bad - inconsistent format
Input: text A -> result A
Q: text B
A: result B
```

### Relevance
Examples should match your actual use case:
```
# Bad: formal examples, informal use case
Input: "Greetings, I require assistance." | Output: formal_tone

Actual use: "hey can u help me" | Model confused!

# Good: informal examples, informal use case
Input: "hey need help here" | Output: casual_response
```

## Ordering Matters

Models are influenced by recent examples more than earlier ones. Put your most important pattern last:

```
# If you want concise outputs, show concise examples last:
Input: query A | Output: detailed explanation...
Input: query B | Output: medium length...
Input: query C | Output: short answer

Actual input: {query} | Output: [likely short]
```

## Few-Shot with Chain of Thought

Combine examples with reasoning steps:

```
Solve these math word problems:

Problem: John has 5 apples. He gives 2 to Mary. How many does he have?
Reasoning: Started with 5, gave away 2, so 5 - 2 = 3
Answer: 3 apples

Problem: A store has 20 items. They sell half. How many remain?
Reasoning: Half of 20 is 20 ÷ 2 = 10
Answer: 10 items

Now solve:
Problem: {user_problem}
Reasoning:
```
