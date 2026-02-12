---
title: Meta-Prompting & Orchestration
description: Use a conductor model to decompose problems and orchestrate expert models
category: advanced-techniques
difficulty: advanced
template: |
  CONDUCTOR MODEL:
  Problem: {complex_problem}
  
  Decompose this into subtasks and assign to specialized experts:
  
  Subtask 1: {subtask_1}
  Expert needed: {expert_type_1}
  
  Subtask 2: {subtask_2}
  Expert needed: {expert_type_2}
  
  Subtask 3: {subtask_3}
  Expert needed: {expert_type_3}
  
  ===
  
  EXPERT MODEL 1 ({expert_type_1}):
  Task: {subtask_1}
  Context: {relevant_context}
  Output: {expert_1_result}
  
  EXPERT MODEL 2 ({expert_type_2}):
  Task: {subtask_2}
  Context: {relevant_context}
  Output: {expert_2_result}
  
  ===
  
  CONDUCTOR MODEL (Synthesis):
  Combine expert results into final answer: {final_result}
pitfalls:
  - Over-decomposing simple problems
  - Poor subtask boundaries causing dependencies
  - Not passing necessary context between experts
  - Using same model for conductor and experts (loses benefit)
  - Expensive orchestration overhead
checklist:
  - Use stronger model for conductor, efficient models for experts
  - Define clear subtask boundaries with minimal dependencies
  - Pass only necessary context to each expert
  - Implement parallel execution where possible
  - Log orchestration flow for debugging
  - Monitor total cost (conductor + all experts)
  - Test with problems that benefit from decomposition
  - Consider simpler alternatives first (chaining, CoT)
---

## Problem

Single prompts struggle with complex multi-faceted problems. Traditional Chain of Thought pollutes context with irrelevant details and errors propagate forward. Using one model for everything is inefficient—simple subtasks don't need expensive models.

## Solution

Meta-prompting uses a "conductor" model to decompose problems into specialized subtasks, delegates to "expert" models, and synthesizes results. This enables: cognitive specialization, parallel execution, cost optimization, and error isolation.

## When to Use

**Use Meta-Prompting when:**
- Problem has distinct, separable subtasks
- Different subtasks need different expertise
- You want to optimize cost (cheap experts, smart conductor)
- Parts can be parallelized for speed
- Problem too complex for single prompt
- Need to orchestrate multiple tools/APIs

**Don't use when:**
- Problem is simple and unified
- Subtasks are highly interdependent
- Overhead exceeds benefit
- Single model handles it well
- Real-time response needed (latency overhead)

## Pros

✅ **Cost optimization** - Use cheap models for simple subtasks (1/20th cost possible)  
✅ **Better quality** - Specialized experts outperform generalists  
✅ **Parallel execution** - Independent subtasks run concurrently  
✅ **Error isolation** - Failed subtask doesn't corrupt entire flow  
✅ **Scalable complexity** - Handle arbitrarily complex problems  
✅ **Cleaner context** - Each expert gets only relevant information  
✅ **Reusable experts** - Same specialist handles similar subtasks

## Cons

❌ **Orchestration complexity** - Requires coordination logic  
❌ **Latency overhead** - Multiple sequential calls add delay  
❌ **Context passing** - Must carefully thread necessary info  
❌ **Over-engineering risk** - Can be overkill for simple problems  
❌ **Debugging difficulty** - More moving parts to trace  
❌ **Conductor dependency** - System fails if decomposition is poor

## Basic Meta-Prompting

```python
class MetaPrompter:
    def __init__(self):
        self.conductor = "gpt-4"  # Strong reasoning model
        self.experts = {
            "code": "gpt-3.5-turbo",  # Cheap for code tasks
            "math": "gpt-3.5-turbo",
            "analysis": "gpt-4-turbo",  # Quality for analysis
            "writing": "claude-3-sonnet"
        }
    
    def solve(self, problem: str) -> str:
        """Orchestrate problem solving via meta-prompting."""
        
        # Phase 1: Conductor decomposes problem
        decomposition = self._decompose(problem)
        
        # Phase 2: Execute subtasks (parallel where possible)
        results = self._execute_subtasks(decomposition)
        
        # Phase 3: Conductor synthesizes final answer
        final = self._synthesize(problem, results)
        
        return final
    
    def _decompose(self, problem: str) -> dict:
        """Conductor breaks down problem."""
        prompt = f"""
        You are a meta-cognitive orchestrator. Break this problem into 
        clear, independent subtasks.
        
        Problem: {problem}
        
        For each subtask, specify:
        1. Description
        2. Expert type needed (code/math/analysis/writing)
        3. Dependencies (which subtasks must complete first)
        4. Context needed
        
        Format as JSON:
        {{
          "subtasks": [
            {{
              "id": "task1",
              "description": "...",
              "expert": "code",
              "depends_on": [],
              "context_needed": ["..."]
            }}
          ]
        }}
        """
        
        response = llm.complete(prompt, model=self.conductor)
        return json.loads(response)
    
    def _execute_subtasks(self, decomposition: dict) -> dict:
        """Execute subtasks using appropriate experts."""
        results = {}
        completed = set()
        
        # Topological sort for dependency order
        tasks = decomposition["subtasks"]
        
        while len(completed) < len(tasks):
            # Find tasks ready to execute (dependencies met)
            ready = [
                t for t in tasks 
                if t["id"] not in completed 
                and all(dep in completed for dep in t["depends_on"])
            ]
            
            # Execute in parallel
            batch_results = self._execute_parallel(ready, results)
            results.update(batch_results)
            completed.update(batch_results.keys())
        
        return results
    
    def _execute_parallel(self, tasks: list, previous_results: dict) -> dict:
        """Execute independent tasks in parallel."""
        import concurrent.futures
        
        def run_task(task):
            # Build context from dependencies
            context = ""
            for dep_id in task["depends_on"]:
                if dep_id in previous_results:
                    context += f"\n{dep_id}: {previous_results[dep_id]}\n"
            
            # Call appropriate expert
            expert_model = self.experts[task["expert"]]
            prompt = f"""
            Task: {task["description"]}
            
            Context: {context}
            
            Provide a clear, focused answer.
            """
            
            result = llm.complete(prompt, model=expert_model)
            return task["id"], result
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(run_task, t) for t in tasks]
            return dict([f.result() for f in futures])
    
    def _synthesize(self, problem: str, results: dict) -> str:
        """Conductor combines results into final answer."""
        prompt = f"""
        Original problem: {problem}
        
        Expert results:
        {json.dumps(results, indent=2)}
        
        Synthesize these into a coherent final answer.
        """
        
        return llm.complete(prompt, model=self.conductor)
```

## Real-World Example: Code Review

```python
def meta_prompt_code_review(code: str, requirements: str):
    """Multi-expert code review."""
    
    # Conductor decomposes review
    decomposition = {
        "subtasks": [
            {
                "id": "correctness",
                "description": f"Check if code meets requirements: {requirements}",
                "expert": "code",
                "depends_on": []
            },
            {
                "id": "performance",
                "description": "Identify performance issues and suggest optimizations",
                "expert": "code",
                "depends_on": []
            },
            {
                "id": "security",
                "description": "Check for security vulnerabilities",
                "expert": "analysis",  # Use stronger model for security
                "depends_on": []
            },
            {
                "id": "style",
                "description": "Check code style and best practices",
                "expert": "code",
                "depends_on": []
            },
            {
                "id": "summary",
                "description": "Write professional review summary",
                "expert": "writing",
                "depends_on": ["correctness", "performance", "security", "style"]
            }
        ]
    }
    
    # Execute (first 4 in parallel, then summary)
    meta = MetaPrompter()
    results = meta._execute_subtasks(decomposition)
    
    return results["summary"]
```

## 2026 Production Pattern: Hierarchical Prompting

```python
class HierarchicalPromptSystem:
    """Modern 2026 approach using reasoning models to write production prompts."""
    
    def __init__(self):
        self.meta_model = "o1-preview"  # High reasoning
        self.prod_model = "gpt-4.1-mini"  # Fast, cheap
        self.prompt_cache = {}
    
    def generate_system_prompt(self, task_description: str, 
                               examples: list) -> str:
        """Use meta-model to craft optimal system prompt."""
        
        meta_prompt = f"""
        You are an expert prompt engineer. Create an optimal system prompt 
        for this task:
        
        Task: {task_description}
        
        Target model: {self.prod_model}
        
        Examples of input/output:
        {json.dumps(examples, indent=2)}
        
        Create a system prompt that:
        1. Clearly defines the task
        2. Specifies output format
        3. Includes necessary constraints
        4. Prevents common errors
        5. Is optimized for {self.prod_model}
        
        Return ONLY the system prompt text.
        """
        
        system_prompt = llm.complete(meta_prompt, model=self.meta_model)
        return system_prompt
    
    def run_task(self, task_description: str, user_input: str, 
                 examples: list = None) -> str:
        """Run task with meta-generated prompt."""
        
        # Check cache
        cache_key = hash(task_description)
        if cache_key not in self.prompt_cache and examples:
            # Generate optimized prompt once
            self.prompt_cache[cache_key] = self.generate_system_prompt(
                task_description, examples
            )
        
        system_prompt = self.prompt_cache.get(cache_key, task_description)
        
        # Execute with cheap model using optimized prompt
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]
        
        return llm.complete(messages, model=self.prod_model)

# Usage - 1/20th the cost with better adherence
system = HierarchicalPromptSystem()

# One-time: Generate optimal prompt with expensive model
examples = [
    {"input": "...", "output": "..."},
    # ... more examples
]

# Many times: Use cheap model with optimized prompt
result = system.run_task(
    task_description="Classify customer sentiment",
    user_input="This product is amazing!",
    examples=examples
)
```

## Multi-Model Orchestra

```python
class ModelOrchestra:
    """Orchestrate multiple specialized models."""
    
    def __init__(self):
        self.models = {
            "planner": "gpt-4",          # Strategic planning
            "coder": "gpt-3.5-turbo",    # Code generation
            "reviewer": "claude-3",       # Code review
            "writer": "claude-3-sonnet", # Documentation
            "analyst": "gpt-4-turbo"     # Data analysis
        }
    
    def build_feature(self, feature_spec: str) -> dict:
        """Coordinate models to build a feature."""
        
        # 1. Planner: Break down feature
        plan = self._call_model("planner", f"""
        Create implementation plan for: {feature_spec}
        
        Break into:
        - Core logic files needed
        - Tests to write
        - Documentation needed
        """)
        
        # 2. Coder: Implement each part (parallel)
        code_tasks = parse_code_tasks(plan)
        code_results = self._parallel_execute("coder", code_tasks)
        
        # 3. Reviewer: Review all code
        review = self._call_model("reviewer", f"""
        Review this implementation:
        {json.dumps(code_results, indent=2)}
        
        Check: correctness, performance, security, style
        """)
        
        # 4. Coder: Fix issues
        if has_issues(review):
            fixes = self._call_model("coder", f"""
            Fix these issues: {review}
            Original code: {code_results}
            """)
            code_results = apply_fixes(fixes)
        
        # 5. Writer: Generate documentation
        docs = self._call_model("writer", f"""
        Write comprehensive documentation for:
        {code_results}
        
        Include: API docs, usage examples, architecture overview
        """)
        
        return {
            "plan": plan,
            "code": code_results,
            "review": review,
            "docs": docs,
            "cost": self._calculate_cost()
        }
    
    def _call_model(self, role: str, prompt: str) -> str:
        """Call specific model by role."""
        model = self.models[role]
        return llm.complete(prompt, model=model)
    
    def _parallel_execute(self, role: str, tasks: list) -> dict:
        """Execute multiple tasks with same model in parallel."""
        import concurrent.futures
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = {
                executor.submit(self._call_model, role, task): task 
                for task in tasks
            }
            return {
                task: future.result() 
                for future, task in futures.items()
            }
```

## Cost Comparison

**Traditional approach** (GPT-4 for everything):
- Planning: 1,000 tokens × $0.03 = $0.03
- Coding (5 files): 5,000 tokens × $0.03 = $0.15
- Review: 1,000 tokens × $0.03 = $0.03
- Docs: 2,000 tokens × $0.03 = $0.06
- **Total: $0.27**

**Meta-prompting approach**:
- Planning (GPT-4): 1,000 tokens × $0.03 = $0.03
- Coding (GPT-3.5): 5,000 tokens × $0.0015 = $0.0075
- Review (Claude-3): 1,000 tokens × $0.015 = $0.015
- Docs (Claude Sonnet): 2,000 tokens × $0.003 = $0.006
- **Total: $0.0585 (78% savings!)**

## Best Practices

1. **Right model for right task** - Expensive models only for complex reasoning
2. **Parallel where possible** - Execute independent subtasks concurrently
3. **Cache conductor outputs** - Reuse decompositions for similar problems
4. **Monitor costs** - Track per-model usage and total orchestration cost
5. **Start simple** - Try single prompt first, add orchestration if needed
6. **Clear boundaries** - Make subtasks as independent as possible
7. **Test components** - Validate each expert works correctly in isolation
8. **Log orchestration** - Track decomposition and execution flow for debugging

## When NOT to Use

- Single, focused task
- Real-time applications (latency sensitive)
- Budget extremely constrained
- Simple problem that one prompt handles
- Subtasks are too interdependent
