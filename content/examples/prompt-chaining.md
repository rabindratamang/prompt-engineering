---
title: Prompt Chaining & Workflows
description: Break complex tasks into sequential steps for better accuracy and control
category: advanced-techniques
difficulty: advanced
template: |
  # Multi-step workflow
  
  Step 1: {first_task}
  Result 1: {result_from_step_1}
  
  Step 2: Based on Result 1, {second_task}
  Result 2: {result_from_step_2}
  
  Step 3: Combine Results 1 and 2 to {final_task}
  Final Output: {final_result}
pitfalls:
  - Making steps too granular (overhead without benefit)
  - Not validating intermediate outputs
  - Poor error handling in multi-step chains
  - Losing important context between steps
  - Not making chains debuggable and monitorable
checklist:
  - Break task into logical, sequential steps
  - Validate output of each step before proceeding
  - Pass necessary context forward
  - Handle errors at each step gracefully
  - Log intermediate results for debugging
  - Make steps idempotent where possible
  - Consider parallelizing independent steps
  - Test the full chain end-to-end
---

## Problem

Complex tasks often fail when attempted in a single prompt. The model tries to do too much at once, leading to poor quality, missed requirements, or hallucinations.

## Solution

Break the task into a chain of simpler prompts, where each step focuses on one thing and passes its output to the next step.

## When to Use

**Use prompt chaining for:**
- Complex multi-faceted tasks
- Tasks requiring different types of processing
- When single prompt produces poor results
- Need to validate intermediate outputs
- Different steps need different prompting strategies
- Debugging where failures occur

**Good for:**
- Multi-step analysis (extract → classify → respond)
- Content pipelines (generate → review → refine)
- Decision workflows (gather → analyze → decide)
- Data processing (extract → transform → summarize)

## Pros

✅ **Better quality** - Each step optimized for one task  
✅ **Debuggable** - Know which step failed  
✅ **Validation** - Check output before next step  
✅ **Flexibility** - Different strategies per step  
✅ **Parallel execution** - Independent steps run concurrently  
✅ **Clear structure** - Easy to understand and maintain

## Cons

❌ **Multiple API calls** - Higher cost and latency  
❌ **Complexity** - More code to orchestrate steps  
❌ **Context passing** - Must thread necessary info forward  
❌ **Error propagation** - Failed step blocks entire chain  
❌ **Over-engineering** - Can be overkill for simple tasks  
❌ **Testing overhead** - Must test entire chain end-to-end

## Basic Chain

```python
def analyze_customer_feedback(feedback: str) -> dict:
    """
    Multi-step analysis:
    1. Extract key issues
    2. Classify sentiment
    3. Generate response
    """
    
    # Step 1: Extract issues
    extraction_prompt = f"""
    Extract the main issues from this customer feedback:
    
    {feedback}
    
    List each issue on a separate line.
    """
    issues = llm.complete(extraction_prompt)
    
    # Step 2: Classify sentiment for each issue
    sentiment_prompt = f"""
    For each issue below, classify the sentiment (positive/negative/neutral):
    
    {issues}
    
    Format: issue | sentiment
    """
    sentiments = llm.complete(sentiment_prompt)
    
    # Step 3: Generate response addressing each issue
    response_prompt = f"""
    Original feedback: {feedback}
    
    Issues and sentiments:
    {sentiments}
    
    Write a professional response that:
    1. Acknowledges each issue
    2. Addresses negative points with solutions
    3. Thanks for positive feedback
    4. Keeps a helpful, empathetic tone
    """
    response = llm.complete(response_prompt)
    
    return {
        "issues": issues,
        "sentiments": sentiments,
        "response": response
    }
```

**Why this works:**
- Each step is simple and focused
- Model can concentrate on one task at a time
- Intermediate results can be validated
- Failures are isolated to specific steps

## Production Chain Framework

```python
from typing import Callable, Any, Optional, List
from dataclasses import dataclass
import logging

@dataclass
class ChainStep:
    name: str
    function: Callable[[dict], Any]
    validate: Optional[Callable[[Any], bool]] = None
    required_inputs: List[str] = None
    output_key: str = None
    
    def __post_init__(self):
        if self.required_inputs is None:
            self.required_inputs = []
        if self.output_key is None:
            self.output_key = self.name

class ChainExecutor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def run(self, steps: List[ChainStep], initial_context: dict) -> dict:
        """Execute a chain of steps with validation and error handling."""
        context = initial_context.copy()
        
        for i, step in enumerate(steps):
            self.logger.info(f"Executing step {i+1}/{len(steps)}: {step.name}")
            
            try:
                # Validate required inputs are present
                missing = [key for key in step.required_inputs if key not in context]
                if missing:
                    raise ValueError(f"Missing required inputs for {step.name}: {missing}")
                
                # Execute step
                result = step.function(context)
                
                # Validate output if validator provided
                if step.validate and not step.validate(result):
                    raise ValueError(f"Validation failed for step {step.name}")
                
                # Add result to context
                context[step.output_key] = result
                self.logger.info(f"Step {step.name} completed successfully")
                
            except Exception as e:
                self.logger.error(f"Step {step.name} failed: {e}")
                raise ChainExecutionError(
                    step=step.name,
                    step_index=i,
                    context=context,
                    error=e
                )
        
        return context

class ChainExecutionError(Exception):
    def __init__(self, step: str, step_index: int, context: dict, error: Exception):
        self.step = step
        self.step_index = step_index
        self.context = context
        self.original_error = error
        super().__init__(f"Chain failed at step {step_index} ({step}): {error}")
```

## Real-World Example: Code Review Chain

```python
def create_code_review_chain():
    """Multi-step code review process."""
    
    def extract_changes(ctx: dict) -> dict:
        """Step 1: Extract and summarize changes."""
        prompt = f"""
        Analyze this code diff and extract:
        1. Files changed
        2. Functions added/modified
        3. Key changes summary
        
        Diff:
        {ctx['diff']}
        
        Format as JSON:
        {{"files": [...], "functions": [...], "summary": "..."}}
        """
        return json.loads(llm.complete(prompt))
    
    def check_correctness(ctx: dict) -> dict:
        """Step 2: Check for logical errors."""
        changes = ctx['changes_summary']
        prompt = f"""
        Review these code changes for correctness:
        {json.dumps(changes, indent=2)}
        
        Original code:
        {ctx['original_code']}
        
        New code:
        {ctx['new_code']}
        
        Identify:
        1. Logical errors
        2. Edge cases not handled
        3. Potential bugs
        
        Format as JSON: {{"errors": [...], "edge_cases": [...], "bugs": [...]}}
        """
        return json.loads(llm.complete(prompt))
    
    def check_performance(ctx: dict) -> dict:
        """Step 3: Check for performance issues."""
        prompt = f"""
        Analyze performance implications:
        
        Code:
        {ctx['new_code']}
        
        Look for:
        1. Inefficient algorithms (O(n²) where O(n) possible)
        2. Unnecessary loops or operations
        3. Memory inefficiencies
        
        Format as JSON: {{"issues": [...], "suggestions": [...]}}
        """
        return json.loads(llm.complete(prompt))
    
    def check_security(ctx: dict) -> dict:
        """Step 4: Check for security issues."""
        prompt = f"""
        Security review:
        
        Code:
        {ctx['new_code']}
        
        Check for:
        1. SQL injection vulnerabilities
        2. XSS vulnerabilities
        3. Authentication/authorization issues
        4. Sensitive data exposure
        
        Format as JSON: {{"vulnerabilities": [...], "severity": "low|medium|high"}}
        """
        return json.loads(llm.complete(prompt))
    
    def generate_summary(ctx: dict) -> str:
        """Step 5: Generate final review summary."""
        prompt = f"""
        Generate a code review summary based on these analyses:
        
        Changes: {json.dumps(ctx['changes_summary'])}
        Correctness: {json.dumps(ctx['correctness_check'])}
        Performance: {json.dumps(ctx['performance_check'])}
        Security: {json.dumps(ctx['security_check'])}
        
        Provide:
        1. Overall verdict (APPROVE/REQUEST_CHANGES/REJECT)
        2. Critical issues (must fix)
        3. Suggestions (nice to have)
        4. Positive aspects
        
        Keep it professional and constructive.
        """
        return llm.complete(prompt)
    
    # Define chain
    steps = [
        ChainStep(
            name="extract_changes",
            function=extract_changes,
            required_inputs=["diff"],
            output_key="changes_summary",
            validate=lambda x: isinstance(x, dict) and "files" in x
        ),
        ChainStep(
            name="check_correctness",
            function=check_correctness,
            required_inputs=["changes_summary", "original_code", "new_code"],
            output_key="correctness_check"
        ),
        ChainStep(
            name="check_performance",
            function=check_performance,
            required_inputs=["new_code"],
            output_key="performance_check"
        ),
        ChainStep(
            name="check_security",
            function=check_security,
            required_inputs=["new_code"],
            output_key="security_check"
        ),
        ChainStep(
            name="generate_summary",
            function=generate_summary,
            required_inputs=["changes_summary", "correctness_check", 
                           "performance_check", "security_check"],
            output_key="final_review"
        )
    ]
    
    return steps

# Usage
executor = ChainExecutor()
steps = create_code_review_chain()

result = executor.run(steps, {
    "diff": diff_content,
    "original_code": old_code,
    "new_code": new_code
})

print(result["final_review"])
```

## Parallel Chains

Execute independent steps in parallel:

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def run_parallel_chain(steps: dict, context: dict) -> dict:
    """
    Execute independent steps in parallel.
    
    steps: {"step_name": {"function": fn, "inputs": [...]}}
    """
    async def run_step(name: str, config: dict):
        # Extract required inputs
        inputs = {k: context[k] for k in config["inputs"]}
        # Run in thread pool (for blocking LLM calls)
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as pool:
            result = await loop.run_in_executor(
                pool, config["function"], inputs
            )
        return name, result
    
    # Run all steps concurrently
    tasks = [run_step(name, config) for name, config in steps.items()]
    results = await asyncio.gather(*tasks)
    
    # Merge results into context
    for name, result in results:
        context[name] = result
    
    return context

# Example: Analyze document from multiple angles simultaneously
async def analyze_document_parallel(document: str):
    steps = {
        "extract_entities": {
            "function": lambda ctx: extract_entities(ctx["document"]),
            "inputs": ["document"]
        },
        "classify_topic": {
            "function": lambda ctx: classify_topic(ctx["document"]),
            "inputs": ["document"]
        },
        "assess_sentiment": {
            "function": lambda ctx: assess_sentiment(ctx["document"]),
            "inputs": ["document"]
        },
        "extract_keywords": {
            "function": lambda ctx: extract_keywords(ctx["document"]),
            "inputs": ["document"]
        }
    }
    
    context = {"document": document}
    result = await run_parallel_chain(steps, context)
    
    # All analyses complete, now synthesize
    final_summary = synthesize_analyses(result)
    return final_summary
```

## Conditional Chains

Branch based on intermediate results:

```python
def run_conditional_chain(context: dict) -> dict:
    """Execute different paths based on conditions."""
    
    # Step 1: Classify the request
    classification = classify_request(context["user_input"])
    context["classification"] = classification
    
    # Branch based on classification
    if classification == "technical_support":
        # Technical support chain
        context = handle_technical_support(context)
    elif classification == "billing":
        # Billing chain
        context = handle_billing(context)
    elif classification == "general_inquiry":
        # General inquiry chain
        context = handle_general_inquiry(context)
    else:
        # Fallback
        context["response"] = "I'm not sure how to help with that."
    
    return context

def handle_technical_support(context: dict) -> dict:
    """Multi-step technical support workflow."""
    # 1. Extract error details
    context["error_details"] = extract_error_details(context["user_input"])
    
    # 2. Search knowledge base
    context["kb_results"] = search_knowledge_base(context["error_details"])
    
    # 3. If solution found, return it
    if context["kb_results"]:
        context["response"] = format_solution(context["kb_results"])
    else:
        # 4. Otherwise, escalate with context
        context["response"] = create_escalation_ticket(context)
    
    return context
```

## Chain Monitoring and Debugging

```python
from datetime import datetime

class MonitoredChainExecutor(ChainExecutor):
    def __init__(self):
        super().__init__()
        self.execution_history = []
        
    def run(self, steps: List[ChainStep], initial_context: dict) -> dict:
        """Execute chain with detailed monitoring."""
        execution_id = datetime.now().isoformat()
        execution_log = {
            "id": execution_id,
            "start_time": datetime.now(),
            "steps": []
        }
        
        try:
            context = initial_context.copy()
            
            for i, step in enumerate(steps):
                step_start = datetime.now()
                
                try:
                    result = step.function(context)
                    context[step.output_key] = result
                    
                    execution_log["steps"].append({
                        "name": step.name,
                        "index": i,
                        "status": "success",
                        "duration_ms": (datetime.now() - step_start).total_seconds() * 1000,
                        "output_size": len(str(result))
                    })
                    
                except Exception as e:
                    execution_log["steps"].append({
                        "name": step.name,
                        "index": i,
                        "status": "failed",
                        "error": str(e),
                        "duration_ms": (datetime.now() - step_start).total_seconds() * 1000
                    })
                    raise
            
            execution_log["status"] = "success"
            execution_log["total_duration_ms"] = (
                datetime.now() - execution_log["start_time"]
            ).total_seconds() * 1000
            
        except Exception as e:
            execution_log["status"] = "failed"
            execution_log["error"] = str(e)
            raise
        finally:
            self.execution_history.append(execution_log)
            
        return context
    
    def get_execution_report(self, execution_id: str = None) -> dict:
        """Get detailed report of chain execution."""
        if execution_id:
            execution = next(
                (e for e in self.execution_history if e["id"] == execution_id),
                None
            )
        else:
            # Get most recent
            execution = self.execution_history[-1] if self.execution_history else None
        
        if not execution:
            return {"error": "Execution not found"}
        
        return {
            "id": execution["id"],
            "status": execution["status"],
            "total_duration_ms": execution.get("total_duration_ms", 0),
            "steps_completed": len([s for s in execution["steps"] if s["status"] == "success"]),
            "steps_failed": len([s for s in execution["steps"] if s["status"] == "failed"]),
            "steps_detail": execution["steps"]
        }
```

## Best Practices

1. **Keep steps focused**: Each step should do one thing well
2. **Validate between steps**: Don't propagate errors forward
3. **Pass forward what's needed**: Don't bloat context with unnecessary data
4. **Make steps idempotent**: Safe to retry without side effects
5. **Log everything**: Track execution for debugging
6. **Handle failures gracefully**: Plan for what happens if a step fails
7. **Test chains end-to-end**: Don't just test individual steps
8. **Monitor performance**: Track duration of each step
9. **Parallelize when possible**: Independent steps can run concurrently
10. **Consider cost**: More steps = more API calls = higher cost

## When to Use Chaining

**Use chaining when:**
- Task requires multiple distinct operations
- You need to validate intermediate results
- Different steps require different prompting strategies
- You want to debug which part is failing
- Quality improves with focused steps

**Skip chaining when:**
- Task is simple enough for one prompt
- Steps are too granular (overhead > benefit)
- Latency is critical (multiple API calls add delay)
- Cost is prohibitive
