---
title: Tree of Thoughts (ToT)
description: Explore multiple reasoning paths and backtrack for complex problem-solving
category: advanced-techniques
difficulty: advanced
template: |
  Problem: {problem}
  
  I will explore multiple solution approaches systematically:
  
  Approach 1: {first_approach}
  Evaluation: {evaluate_approach_1}
  Promising: Yes/No
  
  Approach 2: {second_approach}
  Evaluation: {evaluate_approach_2}
  Promising: Yes/No
  
  Approach 3: {third_approach}
  Evaluation: {evaluate_approach_3}
  Promising: Yes/No
  
  Best approach: {selected_approach}
  Detailed solution using best approach: {solution}
pitfalls:
  - Generating too many branches (expensive, slow)
  - Poor evaluation of intermediate steps
  - Not actually exploring different approaches
  - Infinite loops when backtracking
  - Over-engineering simple problems
checklist:
  - Define clear evaluation criteria for each thought
  - Limit branch factor (3-5 approaches max)
  - Set depth limits to prevent infinite exploration
  - Implement backtracking when approach fails
  - Compare final solutions from different paths
  - Consider cost vs benefit (ToT uses many more tokens)
  - Test with problems that have multiple valid solutions
---

## Problem

Chain of Thought (CoT) follows a single linear reasoning path. If that path hits a dead end or makes an early mistake, there's no way to recover or explore alternatives.

## Solution

Tree of Thoughts enables exploration of multiple coherent reasoning branches, self-evaluation of each path, and backtracking to promising alternatives when one path fails.

## When to Use

**Use Tree of Thoughts when:**
- Problem has multiple valid solution approaches
- Early decisions significantly impact final outcome
- Solution requires strategic planning or search
- Cost of failure is high (need best possible answer)
- Problem involves games, puzzles, or optimization
- You need to compare multiple strategies

**Don't use when:**
- Problem has obvious single solution path
- Speed/cost is critical (ToT is expensive)
- Simple tasks that CoT handles well
- Streaming responses needed (ToT needs full exploration)

## Pros

✅ **Dramatically better accuracy** on complex problems (4% → 74% on Game of 24 puzzles)  
✅ **Explores alternatives** instead of committing to first path  
✅ **Self-correcting** through evaluation and backtracking  
✅ **Handles strategic problems** that require lookahead  
✅ **Transparent reasoning** showing why approaches were chosen/rejected  
✅ **Robust to early errors** by exploring multiple paths

## Cons

❌ **Very expensive** - 5-20x more tokens than CoT  
❌ **Much slower** - requires multiple sequential LLM calls  
❌ **Complex implementation** - needs orchestration logic  
❌ **Can be overkill** for simpler problems  
❌ **May explore poor paths** if evaluation is weak  
❌ **Requires good prompting** for effective evaluation

## Basic Tree of Thoughts

```python
def tree_of_thoughts(problem: str, max_depth: int = 3, branch_factor: int = 3) -> str:
    """
    Explore multiple reasoning paths with evaluation and backtracking.
    """
    
    def generate_thoughts(state: str, depth: int) -> list[str]:
        """Generate possible next thoughts from current state."""
        prompt = f"""
        Problem: {problem}
        Current reasoning state: {state}
        
        Generate {branch_factor} different next steps or approaches to solve this.
        Make them diverse and creative.
        
        Format each as:
        Thought N: [your thought]
        """
        response = llm.complete(prompt)
        return parse_thoughts(response)
    
    def evaluate_thought(thought: str, depth: int) -> float:
        """Evaluate how promising a thought is (0-1)."""
        prompt = f"""
        Problem: {problem}
        Proposed thought/approach: {thought}
        
        Evaluate this thought on a scale of 0-1:
        - 1.0: Very promising, likely leads to solution
        - 0.5: Uncertain, might work
        - 0.0: Dead end, won't work
        
        Consider:
        - Does it address the problem correctly?
        - Is it logically sound?
        - Does it avoid obvious pitfalls?
        
        Score (0.0-1.0):
        """
        response = llm.complete(prompt)
        return float(response.strip())
    
    def search(state: str, depth: int) -> tuple[str, float]:
        """DFS with pruning and evaluation."""
        
        if depth >= max_depth:
            # Reached max depth, evaluate final solution
            return state, evaluate_thought(state, depth)
        
        # Generate possible next thoughts
        thoughts = generate_thoughts(state, depth)
        
        # Evaluate each thought
        evaluated = [(t, evaluate_thought(t, depth)) for t in thoughts]
        
        # Sort by score (best first)
        evaluated.sort(key=lambda x: x[1], reverse=True)
        
        # Explore top thoughts
        best_solution = None
        best_score = 0.0
        
        for thought, score in evaluated:
            if score < 0.3:  # Prune low-scoring branches
                continue
            
            # Recursively explore this branch
            new_state = state + "\n" + thought
            solution, final_score = search(new_state, depth + 1)
            
            if final_score > best_score:
                best_solution = solution
                best_score = final_score
        
        return best_solution, best_score
    
    # Start search from initial problem
    solution, score = search(problem, 0)
    return solution
```

## Game of 24 Example

Classic problem: Use four numbers and basic operations to make 24.

**CoT approach (single path):**
```
Numbers: 4, 9, 10, 13

Try: (10 - 4) × (13 - 9) = 6 × 4 = 24 ✓
```
Works if you get lucky on first try.

**ToT approach (explores alternatives):**
```
Numbers: 4, 9, 10, 13

Branch 1: Start with largest numbers
  Thought: 13 × 10 = 130
  Evaluation: Too large, unlikely to reach 24. Score: 0.2

Branch 2: Look for factors of 24
  Thought: 24 = 6 × 4, can we make 6?
  Evaluation: Promising! 10 - 4 = 6. Score: 0.9
  Continue: (10 - 4) × ? = 24, need factor 4
  Thought: 13 - 9 = 4 ✓
  Solution: (10 - 4) × (13 - 9) = 24

Branch 3: Try addition combinations
  Thought: 13 + 10 + 4 - 9 = 18
  Evaluation: Close but no way to reach 24. Score: 0.4

Best: Branch 2 with score 0.9
```

## Strategic Planning Example

```python
def plan_vacation_with_tot(constraints: dict):
    """Use ToT for multi-constraint optimization."""
    
    prompt = f"""
    Plan a 7-day vacation with these constraints:
    - Budget: ${constraints['budget']}
    - Interests: {constraints['interests']}
    - Season: {constraints['season']}
    - Travel from: {constraints['origin']}
    
    I will explore 3 different destination strategies:
    
    STRATEGY 1: Beach destination
    Destination: {beach_option}
    Pros: {pros}
    Cons: {cons}
    Budget fit: {budget_analysis}
    Score (0-10): {score}
    
    STRATEGY 2: Mountain/adventure destination
    Destination: {mountain_option}
    Pros: {pros}
    Cons: {cons}
    Budget fit: {budget_analysis}
    Score (0-10): {score}
    
    STRATEGY 3: City/culture destination
    Destination: {city_option}
    Pros: {pros}
    Cons: {cons}
    Budget fit: {budget_analysis}
    Score (0-10): {score}
    
    Best strategy: [Select highest scoring option]
    
    Now develop detailed 7-day itinerary for best option:
    Day 1: ...
    Day 2: ...
    """
    
    return llm.complete(prompt)
```

## BFS vs DFS Exploration

```python
from collections import deque

def breadth_first_tot(problem: str) -> str:
    """Explore all branches at same depth before going deeper."""
    queue = deque([(problem, 0)])  # (state, depth)
    best_solution = None
    best_score = 0.0
    
    while queue:
        state, depth = queue.popleft()
        
        if depth >= max_depth:
            score = evaluate_final(state)
            if score > best_score:
                best_solution = state
                best_score = score
            continue
        
        # Generate and evaluate next thoughts
        thoughts = generate_thoughts(state)
        for thought in thoughts:
            score = evaluate_thought(thought)
            if score > 0.3:  # Prune weak branches
                queue.append((state + "\n" + thought, depth + 1))
    
    return best_solution
```

## Production Implementation

```python
class TreeOfThoughts:
    def __init__(self, max_depth: int = 3, branch_factor: int = 3, 
                 prune_threshold: float = 0.3):
        self.max_depth = max_depth
        self.branch_factor = branch_factor
        self.prune_threshold = prune_threshold
        self.call_count = 0
        
    def solve(self, problem: str) -> dict:
        """Solve problem with full ToT exploration."""
        self.call_count = 0
        
        solution, score, path = self._search(problem, 0, [])
        
        return {
            "solution": solution,
            "confidence": score,
            "exploration_path": path,
            "llm_calls": self.call_count,
            "cost_estimate": self.call_count * 0.01  # $0.01 per call
        }
    
    def _search(self, state: str, depth: int, path: list) -> tuple:
        """Recursive search with tracking."""
        if depth >= self.max_depth:
            score = self._evaluate(state)
            self.call_count += 1
            return state, score, path + [(state, score)]
        
        # Generate branches
        thoughts = self._generate_thoughts(state, depth)
        self.call_count += 1
        
        best_solution = None
        best_score = 0.0
        best_path = []
        
        for thought in thoughts:
            # Evaluate branch
            score = self._evaluate(thought)
            self.call_count += 1
            
            if score < self.prune_threshold:
                continue  # Prune
            
            # Explore branch
            new_state = f"{state}\nStep {depth+1}: {thought}"
            solution, final_score, branch_path = self._search(
                new_state, depth + 1, path + [(thought, score)]
            )
            
            if final_score > best_score:
                best_solution = solution
                best_score = final_score
                best_path = branch_path
        
        return best_solution, best_score, best_path
    
    def _generate_thoughts(self, state: str, depth: int) -> list[str]:
        """Generate candidate next thoughts."""
        # Implementation details...
        pass
    
    def _evaluate(self, thought: str) -> float:
        """Evaluate promise of thought."""
        # Implementation details...
        pass

# Usage
tot = TreeOfThoughts(max_depth=3, branch_factor=3)
result = tot.solve("Make 24 using 4, 9, 10, 13")

print(f"Solution: {result['solution']}")
print(f"Confidence: {result['confidence']}")
print(f"Cost: ${result['cost_estimate']:.2f} ({result['llm_calls']} calls)")
```

## Research Results

From "Tree of Thoughts: Deliberate Problem Solving with Large Language Models":

| Task | Standard Prompting | CoT | ToT |
|------|-------------------|-----|-----|
| Game of 24 | 7.3% | 4.0% | **74%** |
| Creative Writing | 37.5% | 49.6% | **56%** |
| Crosswords | 15.6% | 60.6% | **78%** |

## Cost-Benefit Analysis

**When ToT is worth it:**
- Critical decisions (hiring, architecture choices)
- Complex puzzles or games
- Strategic planning
- Creative tasks with multiple approaches
- When accuracy matters more than speed

**When to skip ToT:**
- Simple classification or extraction
- Real-time applications
- Budget-constrained scenarios
- When CoT already works well

**Cost multiplier:** 5-20x compared to single CoT call

## Best Practices

1. **Set depth limits** - Typically 3-4 levels is optimal
2. **Prune aggressively** - Don't explore obviously bad paths
3. **Cache evaluations** - Reuse scores when possible
4. **Monitor costs** - Track LLM calls and token usage
5. **Use for right problems** - Don't over-engineer
6. **Combine with CoT** - Use ToT for planning, CoT for execution
7. **Implement timeouts** - Prevent infinite exploration
8. **Log exploration** - Debug which paths were tried
