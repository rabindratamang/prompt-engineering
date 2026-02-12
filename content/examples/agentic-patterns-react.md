---
title: Agentic Patterns (ReAct & Autonomous Agents)
description: Build agents that reason, act, and learn from their environment iteratively
category: frameworks
difficulty: advanced
pitfalls:
  - Infinite loops from poor stop conditions
  - Expensive token usage from too many iterations
  - Brittle prompts that break on unexpected tool outputs
  - Security risks from unrestricted tool access
  - No safeguards against harmful actions
checklist:
  - Set maximum iteration limits
  - Implement stop conditions and success criteria
  - Validate tool inputs/outputs
  - Add error recovery mechanisms
  - Monitor token usage per agent run
  - Implement approval gates for sensitive actions
  - Log all agent decisions and actions
  - Test with adversarial goals
---

## Problem

Traditional prompts are stateless—they respond once and forget. Complex tasks require iteration: gathering information, trying approaches, learning from failures, and adapting strategies based on results.

## Solution

Agentic patterns enable LLMs to operate in continuous loops of reasoning, action, and observation. The agent decides what to do, executes actions, observes results, and adapts its strategy until the goal is achieved.

## When to Use

**Use agentic patterns for:**
- Multi-step problem solving
- Tasks requiring tool use (search, APIs, databases)
- Open-ended exploration (research, data analysis)
- Tasks with uncertain solution paths
- Long-running autonomous workflows
- Situations requiring adaptive strategies

**Don't use for:**
- Simple, single-shot queries
- When deterministic workflows are better
- Budget-constrained scenarios (agents are expensive)
- Real-time applications (agents add latency)
- High-risk actions without human oversight
- Tasks with clear, direct solutions

## Pros

✅ **Autonomy** - Solves complex problems without constant human input  
✅ **Adaptability** - Adjusts strategy based on feedback  
✅ **Tool use** - Can search, calculate, query databases  
✅ **Multi-step** - Handles tasks beyond single LLM call  
✅ **Exploratory** - Can discover novel solution paths  
✅ **Composable** - Agents can use other agents as tools

## Cons

❌ **Expensive** - Multiple LLM calls, can cost 10-100x single query  
❌ **Slow** - Sequential tool use adds significant latency  
❌ **Unpredictable** - May take unexpected paths  
❌ **Brittle** - Can get stuck in loops or fail to converge  
❌ **Security risk** - Unrestricted tool access is dangerous  
❌ **Hard to debug** - Complex execution traces

## ReAct Pattern (Reasoning + Acting)

### Core Loop

```
1. Thought: [Reasoning about what to do next]
2. Action: [Tool to call with arguments]
3. Observation: [Result from tool]
4. ... repeat until done ...
5. Final Answer: [Solution]
```

### Basic Implementation

```python
class ReActAgent:
    def __init__(self, tools: dict, max_iterations: int = 10):
        self.tools = tools
        self.max_iterations = max_iterations
        self.history = []
    
    def run(self, goal: str) -> str:
        """Execute ReAct loop until goal achieved."""
        
        system_prompt = f"""
You are an autonomous agent that solves problems step by step.

Available tools:
{self._format_tools()}

Use this format:
Thought: [reasoning about what to do]
Action: tool_name(arg1="value1", arg2="value2")
Observation: [you will see result here]
... repeat as needed ...
Final Answer: [when done, provide final answer]

Goal: {goal}
"""
        
        for i in range(self.max_iterations):
            # Generate thought and action
            response = llm.complete(system_prompt + self._format_history())
            
            # Parse action
            if "Final Answer:" in response:
                return self._extract_final_answer(response)
            
            thought, action = self._parse_response(response)
            
            # Execute action
            try:
                observation = self._execute_action(action)
            except Exception as e:
                observation = f"Error: {str(e)}"
            
            # Add to history
            self.history.append({
                "iteration": i + 1,
                "thought": thought,
                "action": action,
                "observation": observation
            })
            
            # Check stop conditions
            if self._should_stop(observation):
                break
        
        return "Maximum iterations reached. Task incomplete."
    
    def _execute_action(self, action: str) -> str:
        """Execute tool and return observation."""
        # Parse: tool_name(arg1="value1")
        tool_name, args = self._parse_action(action)
        
        if tool_name not in self.tools:
            return f"Error: Unknown tool '{tool_name}'"
        
        return self.tools[tool_name](**args)
    
    def _format_history(self) -> str:
        """Format execution history for context."""
        history_str = ""
        for h in self.history:
            history_str += f"\nThought: {h['thought']}"
            history_str += f"\nAction: {h['action']}"
            history_str += f"\nObservation: {h['observation']}\n"
        return history_str

# Example usage
tools = {
    "search": lambda query: web_search(query),
    "calculate": lambda expression: eval(expression),
    "get_current_date": lambda: datetime.now().isoformat()
}

agent = ReActAgent(tools, max_iterations=10)
result = agent.run("What's the population of the largest city founded in the 1800s?")
```

### Production ReAct with Safety

```python
class ProductionReActAgent:
    def __init__(self, tools: dict, max_iterations: int = 10, 
                 require_approval: list = None):
        self.tools = tools
        self.max_iterations = max_iterations
        self.require_approval = require_approval or []
        self.token_count = 0
        self.token_budget = 10000
        
    def run(self, goal: str) -> dict:
        """Execute with safety checks and monitoring."""
        
        if not self._is_safe_goal(goal):
            return {"error": "Goal rejected by safety filter", "result": None}
        
        start_time = time.time()
        self.history = []
        
        for i in range(self.max_iterations):
            # Check budget
            if self.token_count > self.token_budget:
                return {
                    "error": "Token budget exceeded",
                    "result": None,
                    "tokens_used": self.token_count
                }
            
            # Generate next step
            response = self._generate_step()
            self.token_count += count_tokens(response)
            
            # Check for completion
            if "Final Answer:" in response:
                return {
                    "success": True,
                    "result": self._extract_final_answer(response),
                    "iterations": i + 1,
                    "tokens_used": self.token_count,
                    "duration_seconds": time.time() - start_time,
                    "history": self.history
                }
            
            # Parse and validate action
            thought, action = self._parse_response(response)
            
            if not self._is_safe_action(action):
                observation = "Action rejected by safety filter"
            else:
                # Check if approval needed
                if self._needs_approval(action):
                    approved = self._request_human_approval(action)
                    if not approved:
                        observation = "Action rejected by human reviewer"
                    else:
                        observation = self._execute_with_timeout(action, timeout=30)
                else:
                    observation = self._execute_with_timeout(action, timeout=30)
            
            self.history.append({
                "iteration": i + 1,
                "thought": thought,
                "action": action,
                "observation": observation,
                "timestamp": time.time()
            })
        
        return {
            "error": "Maximum iterations reached",
            "result": None,
            "iterations": self.max_iterations,
            "tokens_used": self.token_count,
            "history": self.history
        }
    
    def _is_safe_goal(self, goal: str) -> bool:
        """Check if goal is safe to pursue."""
        unsafe_patterns = [
            "hack", "break into", "steal", "manipulate",
            "harm", "illegal", "exploit"
        ]
        return not any(p in goal.lower() for p in unsafe_patterns)
    
    def _is_safe_action(self, action: str) -> bool:
        """Validate action is safe to execute."""
        tool_name = action.split("(")[0]
        
        # Whitelist only
        if tool_name not in self.tools:
            return False
        
        # Check for dangerous patterns
        dangerous = ["rm ", "delete", "drop table", "sudo", "eval"]
        return not any(d in action.lower() for d in dangerous)
    
    def _needs_approval(self, action: str) -> bool:
        """Check if action requires human approval."""
        tool_name = action.split("(")[0]
        return tool_name in self.require_approval
    
    def _execute_with_timeout(self, action: str, timeout: int) -> str:
        """Execute action with timeout."""
        try:
            with time_limit(timeout):
                return self._execute_action(action)
        except TimeoutError:
            return f"Action timed out after {timeout} seconds"
        except Exception as e:
            return f"Error: {str(e)}"
```

## Advanced Agentic Patterns

### SELF-ASK: Decomposition

```python
class SelfAskAgent:
    """
    Agent that decomposes complex questions into subquestions.
    """
    
    def solve(self, question: str) -> str:
        prompt = f"""
Question: {question}

Are follow up questions needed? If yes, list them:
Follow up: [subquestion 1]
Follow up: [subquestion 2]
...

If no follow ups needed, answer directly.
"""
        
        response = llm.complete(prompt)
        
        if "Follow up:" in response:
            # Recursively solve subquestions
            subquestions = self._extract_subquestions(response)
            subanswers = []
            
            for sq in subquestions:
                answer = self.solve(sq)  # Recursive
                subanswers.append(f"Q: {sq}\nA: {answer}")
            
            # Combine subanswers for final answer
            final_prompt = f"""
Original question: {question}

Subquestions and answers:
{chr(10).join(subanswers)}

Now answer the original question:
"""
            return llm.complete(final_prompt)
        else:
            # Direct answer
            return response
```

### Plan-and-Execute

```python
class PlanExecuteAgent:
    """
    Agent that creates a plan, then executes it step by step.
    """
    
    def run(self, goal: str) -> str:
        # Phase 1: Planning
        plan = self._create_plan(goal)
        
        # Phase 2: Execution
        results = []
        for step in plan["steps"]:
            result = self._execute_step(step, results)
            results.append(result)
            
            # Re-plan if step fails
            if result["status"] == "failed":
                plan = self._replan(goal, results)
        
        # Phase 3: Synthesis
        return self._synthesize(goal, results)
    
    def _create_plan(self, goal: str) -> dict:
        """Generate execution plan."""
        prompt = f"""
Goal: {goal}

Create a step-by-step plan to achieve this goal.

Format:
Step 1: [action]
Step 2: [action dependent on step 1]
...

Plan:
"""
        response = llm.complete(prompt)
        return self._parse_plan(response)
```

### Reflexion: Self-Reflection

```python
class ReflexionAgent:
    """
    Agent that reflects on failures and learns.
    """
    
    def __init__(self):
        self.memory = []  # Past attempts and reflections
    
    def run(self, task: str) -> str:
        max_attempts = 3
        
        for attempt in range(max_attempts):
            # Generate solution
            solution = self._generate_solution(task, self.memory)
            
            # Test solution
            success, feedback = self._test_solution(solution)
            
            if success:
                return solution
            
            # Reflect on failure
            reflection = self._reflect(task, solution, feedback)
            self.memory.append({
                "attempt": attempt + 1,
                "solution": solution,
                "feedback": feedback,
                "reflection": reflection
            })
        
        return "Failed after maximum attempts"
    
    def _reflect(self, task: str, solution: str, feedback: str) -> str:
        """Generate reflection on why solution failed."""
        prompt = f"""
Task: {task}
Attempted solution: {solution}
Feedback: {feedback}

Reflect on why this solution failed and what to try differently:
"""
        return llm.complete(prompt)
```

## Multi-Agent Systems

```python
class AgentOrchestrator:
    """
    Coordinates multiple specialized agents.
    """
    
    def __init__(self):
        self.agents = {
            "researcher": ResearchAgent(),
            "coder": CodingAgent(),
            "reviewer": ReviewAgent(),
            "writer": WritingAgent()
        }
    
    def solve(self, task: str) -> str:
        # Determine which agents are needed
        plan = self._plan_agent_workflow(task)
        
        # Execute workflow
        results = {}
        for step in plan:
            agent = self.agents[step["agent"]]
            context = {k: results[k] for k in step["inputs"]}
            results[step["output_key"]] = agent.run(step["task"], context)
        
        return results["final_output"]
```

## Monitoring and Debugging

```python
class AgentMonitor:
    """
    Monitor agent behavior and costs.
    """
    
    def __init__(self):
        self.runs = []
    
    def log_run(self, agent_id: str, run_data: dict):
        self.runs.append({
            "agent_id": agent_id,
            "timestamp": datetime.now(),
            **run_data
        })
    
    def get_stats(self) -> dict:
        """Analyze agent performance."""
        return {
            "total_runs": len(self.runs),
            "success_rate": sum(1 for r in self.runs if r.get("success")) / len(self.runs),
            "avg_iterations": np.mean([r["iterations"] for r in self.runs]),
            "avg_tokens": np.mean([r["tokens_used"] for r in self.runs]),
            "total_cost": sum(r["tokens_used"] * 0.00002 for r in self.runs),
            "avg_duration": np.mean([r["duration_seconds"] for r in self.runs])
        }
```

## Best Practices

1. **Set hard limits** - Max iterations, token budgets, timeouts
2. **Whitelist tools** - Only allow safe, approved tools
3. **Add approval gates** - Human review for sensitive actions
4. **Log everything** - Track all decisions and actions
5. **Test thoroughly** - Try adversarial goals and edge cases
6. **Monitor costs** - Agents can be expensive
7. **Implement fallbacks** - What if agent gets stuck?
8. **Version agent prompts** - Track what instructions changed
9. **Start simple** - Add autonomy gradually
10. **Have kill switch** - Ability to stop agent immediately

## Cost Analysis

**Typical ReAct Agent Run**:
- Iterations: 3-10
- Tokens per iteration: 500-2000
- Total tokens: 1,500-20,000
- Cost: $0.03-$0.60 per run (GPT-4)

**vs Single Prompt**:
- Tokens: 100-500
- Cost: $0.002-$0.015

**Agent is 10-40x more expensive but solves harder problems.**

## When NOT to Use Agents

- Simple, direct queries
- Time-sensitive applications
- Strict budget constraints
- High-risk domains without oversight
- When deterministic workflow is better
- Tasks that don't require multi-step reasoning

Agents are powerful but expensive. Use wisely.
