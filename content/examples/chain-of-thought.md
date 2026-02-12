---
title: Chain of Thought (CoT)
description: Elicit step-by-step reasoning to improve accuracy on complex tasks
category: advanced-techniques
difficulty: intermediate
template: |
  Solve this problem step by step. Show your reasoning before giving the final answer.
  
  Problem: {problem}
  
  Let's approach this systematically:
  1. First, let me identify the key information
  2. Then, I'll work through the logic
  3. Finally, I'll provide the answer
  
  Reasoning:
pitfalls:
  - Using CoT for simple tasks where it adds unnecessary overhead
  - Not providing examples of the reasoning format you want
  - Accepting first-pass reasoning without verification
  - Forgetting to extract the final answer from the reasoning
checklist:
  - Add explicit instruction to think step-by-step
  - Provide 1-2 examples showing the reasoning format
  - Structure the reasoning steps (numbered or labeled)
  - Separate reasoning from final answer
  - Consider using delimiters around reasoning sections
  - Test with problems that benefit from multi-step thinking
---

## Problem

Complex reasoning tasks (math, logic, planning) often fail with direct question-answering. The model jumps to conclusions without working through the logic.

## Solution

Explicitly instruct the model to show its reasoning step-by-step before providing the final answer. This improves accuracy significantly on tasks requiring multi-step logic.

## When to Use

**Use Chain of Thought for:**
- Math word problems
- Multi-step reasoning tasks
- Logical deduction
- Planning and strategy
- Debugging complex code
- Situations where "showing your work" improves accuracy

**Skip CoT for:**
- Simple factual questions
- Direct lookups or classification
- When speed matters more than accuracy
- Token budget is constrained
- Tasks model handles well without reasoning

## Pros

✅ **10-50% accuracy improvement** on complex reasoning  
✅ **Transparent reasoning** - See how model arrived at answer  
✅ **Catches errors** - Step-by-step reveals logical mistakes  
✅ **Better for math** - Dramatic improvement on calculations  
✅ **Debuggable** - Can identify where reasoning went wrong  
✅ **Simple to implement** - Just add "let's think step by step"

## Cons

❌ **2-5x more tokens** - Reasoning uses input/output tokens  
❌ **Slower responses** - More generation time  
❌ **Higher costs** - More tokens = higher API bills  
❌ **Overkill for simple tasks** - Adds unnecessary overhead  
❌ **Can be verbose** - Long reasoning for simple problems  
❌ **Need to parse** - Extract final answer from reasoning

## Basic Chain of Thought

```
Problem: A bakery makes 12 batches of cookies per day. Each batch has 24 cookies. 
They sell cookies in boxes of 6. How many boxes can they fill per day?

Think through this step by step:
1. First, calculate total cookies made
2. Then, calculate how many boxes that fills

Solution:
```

## Few-Shot CoT (More Effective)

Showing examples of the reasoning process is more powerful:

```
Solve these math word problems. Show your work step by step.

Example 1:
Problem: A store has 45 apples. They sell them in bags of 5. How many bags can they make?
Reasoning:
- Total apples: 45
- Apples per bag: 5
- Number of bags: 45 ÷ 5 = 9
Answer: 9 bags

Example 2:
Problem: John runs 3 miles per day for 5 days, then 5 miles per day for 2 days. 
How many total miles?
Reasoning:
- First period: 3 miles × 5 days = 15 miles
- Second period: 5 miles × 2 days = 10 miles
- Total: 15 + 10 = 25 miles
Answer: 25 miles

Now solve:
Problem: {user_problem}
Reasoning:
```

## Zero-Shot CoT (Simple Trigger)

Research shows that simply adding "Let's think step by step" can trigger CoT reasoning:

```
{complex_question}

Let's think step by step.
```

This simple phrase activates reasoning behavior without examples.

## Structured CoT for Production

For production systems, structure the reasoning explicitly:

```
Analyze this customer support ticket and determine the next action.

Ticket: {ticket_content}

Analysis Process:
1. Issue Classification:
   - What is the primary issue?
   - What category does it fall into?

2. Urgency Assessment:
   - Is this time-sensitive?
   - What's the impact on the customer?

3. Required Information:
   - What additional info do we need?
   - Can we resolve this immediately?

4. Recommended Action:
   - What should we do next?
   - Who should handle this?

Provide your analysis following this structure, then give the final recommendation.
```

## Verification Step

Add a verification step to catch errors:

```
Problem: {problem}

Step 1: Solve the problem step by step
[Model shows reasoning]

Step 2: Verify your answer
- Does this answer make sense?
- Check your math/logic
- Are there any errors?

Step 3: Final answer
[Model provides verified answer]
```

## Extracting Structured Results

In production code, parse the reasoning and extract the final answer:

```python
def solve_with_cot(problem: str) -> dict:
    prompt = f"""
    Solve this problem step by step.
    
    Problem: {problem}
    
    Reasoning: [Show your step-by-step thinking]
    
    Final Answer: [Give only the final answer in this format]
    """
    
    response = llm.complete(prompt)
    
    # Parse reasoning and answer
    parts = response.split("Final Answer:")
    reasoning = parts[0].replace("Reasoning:", "").strip()
    answer = parts[1].strip() if len(parts) > 1 else ""
    
    return {
        "reasoning": reasoning,
        "answer": answer,
        "raw_response": response
    }
```

## When to Use CoT

**Good for:**
- Mathematical reasoning
- Logical deduction
- Multi-step planning
- Debugging code
- Complex decision-making

**Not needed for:**
- Simple factual questions
- Direct lookups
- Tasks the model can do instantly
- When you need fast responses (CoT increases tokens/latency)

## Self-Consistency Enhancement

For critical decisions, run CoT multiple times and take the majority answer:

```python
def solve_with_self_consistency(problem: str, n: int = 5) -> str:
    answers = []
    for _ in range(n):
        result = solve_with_cot(problem)
        answers.append(result["answer"])
    
    # Return most common answer
    from collections import Counter
    return Counter(answers).most_common(1)[0][0]
```

## Performance Considerations

- **Token cost**: CoT uses 2-5x more tokens than direct answers
- **Latency**: Takes longer to generate reasoning + answer
- **Accuracy gain**: 10-50% improvement on complex reasoning tasks
- **Trade-off**: Use CoT for accuracy-critical tasks, skip for speed-critical ones

## Real-World Example: Code Review

```
Review this code and identify any issues.

Code:
```python
{code_snippet}
```

Review Process:
1. Correctness: Does it work as intended?
2. Edge cases: What could break it?
3. Performance: Any inefficiencies?
4. Security: Any vulnerabilities?
5. Style: Does it follow best practices?

Walk through each point systematically, then provide your final verdict.
```

The structured reasoning catches issues that direct "is this good?" questions miss.
