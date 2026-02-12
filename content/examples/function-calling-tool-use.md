---
title: Function Calling & Tool Use
description: Enable LLMs to call external functions and APIs with structured parameters
category: integration
difficulty: advanced
template: |
  You have access to the following functions:
  
  ```json
  {
    "name": "function_name",
    "description": "What this function does",
    "parameters": {
      "type": "object",
      "properties": {
        "param1": {"type": "string", "description": "..."},
        "param2": {"type": "number", "description": "..."}
      },
      "required": ["param1"]
    }
  }
  ```
  
  User request: {user_input}
  
  If you need to call a function, respond with:
  ```json
  {
    "function": "function_name",
    "arguments": { "param1": "value" }
  }
  ```
pitfalls:
  - Not validating function call parameters before execution
  - Allowing arbitrary function execution (security risk)
  - Poor error messages when functions fail
  - Not handling multiple sequential function calls
  - Missing function descriptions or parameter docs
checklist:
  - Define clear function schemas with types and descriptions
  - Validate all function arguments before execution
  - Whitelist allowed functions (never eval arbitrary code)
  - Handle function errors gracefully with useful messages
  - Support multi-turn conversations with function results
  - Log all function calls for debugging and auditing
  - Set timeouts for long-running functions
  - Consider rate limiting and cost controls
---

## Problem

LLMs can't directly interact with external systems, databases, or APIs. They need a structured way to request actions and receive results.

## Solution

Define a function calling protocol where the LLM outputs structured function calls, your code executes them, and you feed results back to the LLM.

## When to Use

**Use function calling for:**
- Connecting LLM to external APIs/databases
- Performing calculations or data lookups
- Taking actions (sending emails, creating tickets)
- Building autonomous agents
- Extending LLM capabilities beyond text
- Integrating with existing systems

**Essential for:**
- RAG systems (retrieval tools)
- Task automation
- Data analysis workflows
- Multi-tool agents
- Production integrations

## Pros

✅ **Extends capabilities** - LLMs can interact with real systems  
✅ **Structured interface** - Clear contract between LLM and code  
✅ **Validation** - Can verify parameters before execution  
✅ **Safety** - Whitelist allowed functions  
✅ **Native API support** - OpenAI, Anthropic have built-in support  
✅ **Composable** - Chain multiple tool calls together

## Cons

❌ **Security critical** - Must validate and whitelist carefully  
❌ **Complex orchestration** - Managing multi-step tool use is hard  
❌ **Latency** - Each tool call adds round-trip time  
❌ **Error handling** - Tools can fail in many ways  
❌ **Cost** - Multiple LLM calls for tool selection and synthesis  
❌ **Reliability** - Dependent on both LLM and tool availability

## API-Native Function Calling

Modern LLM APIs support function calling natively:

```python
import openai
import json

# Define available functions
functions = [
    {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name, e.g., 'San Francisco'"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"]
                }
            },
            "required": ["location"]
        }
    }
]

response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "What's the weather in NYC?"}],
    functions=functions,
    function_call="auto"
)

# Execute if function was called
if response.choices[0].message.function_call:
    function_name = response.choices[0].message.function_call.name
    arguments = json.loads(response.choices[0].message.function_call.arguments)
    result = execute_function(function_name, arguments)
```

## Production Function Executor

```python
from typing import Dict, Any, Callable
import logging

class FunctionExecutor:
    def __init__(self):
        self.functions: Dict[str, Callable] = {}
        self.schemas: Dict[str, dict] = {}
        
    def register(self, name: str, schema: dict, handler: Callable):
        """Register a function with its schema and handler."""
        self.functions[name] = handler
        self.schemas[name] = schema
        
    def execute(self, function_call: dict) -> Dict[str, Any]:
        """Safely execute a function call with validation."""
        func_name = function_call.get("function")
        arguments = function_call.get("arguments", {})
        
        # Validate function exists
        if func_name not in self.functions:
            return {
                "success": False,
                "error": f"Unknown function: {func_name}",
                "available": list(self.functions.keys())
            }
        
        # Validate required parameters
        schema = self.schemas[func_name]
        required = schema.get("parameters", {}).get("required", [])
        missing = [r for r in required if r not in arguments]
        
        if missing:
            return {
                "success": False,
                "error": f"Missing required parameters: {missing}"
            }
        
        # Execute with error handling
        try:
            logging.info(f"Executing {func_name} with {arguments}")
            result = self.functions[func_name](**arguments)
            return {
                "success": True,
                "result": result
            }
        except Exception as e:
            logging.error(f"Function {func_name} failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

# Usage
executor = FunctionExecutor()

executor.register(
    name="search_products",
    schema={
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "limit": {"type": "integer"}
            },
            "required": ["query"]
        }
    },
    handler=lambda query, limit=10: search_db(query, limit)
)

# Execute LLM function call
result = executor.execute({
    "function": "search_products",
    "arguments": {"query": "laptop", "limit": 5}
})
```

## Multi-Step Function Calling

Handle workflows requiring multiple function calls:

```python
def run_agent_loop(user_message: str, max_iterations: int = 10):
    messages = [{"role": "user", "content": user_message}]
    
    for i in range(max_iterations):
        response = llm.complete(messages, functions=tool_schemas)
        
        # Check if done
        if not response.function_call:
            return response.content  # Final answer
        
        # Execute function
        func_name = response.function_call.name
        arguments = json.loads(response.function_call.arguments)
        result = executor.execute({"function": func_name, "arguments": arguments})
        
        # Add function result to conversation
        messages.append({
            "role": "assistant",
            "content": None,
            "function_call": {"name": func_name, "arguments": json.dumps(arguments)}
        })
        messages.append({
            "role": "function",
            "name": func_name,
            "content": json.dumps(result)
        })
    
    raise Exception("Max iterations reached without final answer")
```

## ReAct Pattern (Reasoning + Acting)

Combine reasoning with tool use:

```
You are a helpful assistant that can use tools to answer questions.

Available tools:
- search(query: str): Search the knowledge base
- calculate(expression: str): Evaluate math expressions
- get_current_date(): Get today's date

For each user question, follow this process:

Thought: [Reasoning about what to do]
Action: [Tool call in JSON format]
Observation: [Tool result - provided by system]
Thought: [Reasoning about the result]
Action: [Next tool call if needed, or "Answer"]
Answer: [Final answer to user]

Example:
User: How many days until Christmas?

Thought: I need to know today's date and calculate days until Dec 25
Action: {"function": "get_current_date", "arguments": {}}
Observation: {"date": "2024-03-15"}
Thought: Now I need to calculate days between March 15 and December 25
Action: {"function": "calculate", "arguments": {"expression": "days_between('2024-03-15', '2024-12-25')"}}
Observation: {"result": 285}
Thought: I have the answer
Answer: There are 285 days until Christmas.

Now handle this request:
User: {user_question}
```

## Security Best Practices

```python
# 1. Never use eval() or exec()
# BAD:
def execute_function(name, args):
    return eval(f"{name}({args})")  # DANGEROUS!

# GOOD:
ALLOWED_FUNCTIONS = {
    "search": search_handler,
    "calculate": safe_calculate,
}

def execute_function(name, args):
    if name not in ALLOWED_FUNCTIONS:
        raise ValueError(f"Function {name} not allowed")
    return ALLOWED_FUNCTIONS[name](**args)

# 2. Validate all inputs
from pydantic import BaseModel, validator

class SearchArgs(BaseModel):
    query: str
    limit: int = 10
    
    @validator('limit')
    def limit_must_be_reasonable(cls, v):
        if v > 100:
            raise ValueError('Limit cannot exceed 100')
        return v

# 3. Set timeouts
import signal
from contextlib import contextmanager

@contextmanager
def timeout(seconds):
    def handler(signum, frame):
        raise TimeoutError("Function execution timeout")
    signal.signal(signal.SIGALRM, handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)

def execute_with_timeout(func, args, timeout_seconds=5):
    with timeout(timeout_seconds):
        return func(**args)
```

## Error Handling

Provide useful error messages to the LLM:

```python
def execute_function_with_context(func_name: str, args: dict) -> str:
    try:
        result = executor.execute({"function": func_name, "arguments": args})
        if result["success"]:
            return json.dumps(result["result"])
        else:
            # Give LLM actionable error info
            return json.dumps({
                "error": result["error"],
                "suggestion": "Please check the parameters and try again",
                "schema": executor.schemas[func_name]
            })
    except Exception as e:
        return json.dumps({
            "error": "Internal error",
            "message": str(e),
            "recoverable": True
        })
```

## Cost and Rate Limiting

```python
from collections import defaultdict
import time

class RateLimitedExecutor(FunctionExecutor):
    def __init__(self):
        super().__init__()
        self.call_counts = defaultdict(int)
        self.limits = {}  # function_name -> calls_per_minute
        self.windows = {}  # function_name -> window_start_time
        
    def set_rate_limit(self, func_name: str, calls_per_minute: int):
        self.limits[func_name] = calls_per_minute
        
    def execute(self, function_call: dict) -> dict:
        func_name = function_call.get("function")
        
        # Check rate limit
        if func_name in self.limits:
            now = time.time()
            window_start = self.windows.get(func_name, now)
            
            # Reset window if 60 seconds passed
            if now - window_start > 60:
                self.call_counts[func_name] = 0
                self.windows[func_name] = now
            
            # Check limit
            if self.call_counts[func_name] >= self.limits[func_name]:
                return {
                    "success": False,
                    "error": f"Rate limit exceeded for {func_name}",
                    "retry_after": 60 - (now - window_start)
                }
            
            self.call_counts[func_name] += 1
        
        return super().execute(function_call)
```

## When to Use Function Calling

**Good for:**
- Database queries
- API integrations
- Calculations
- File operations
- Data transformations

**Not good for:**
- Tasks the LLM can do directly (text generation, analysis)
- Simple logic (use prompts instead)
- Real-time streaming (function calls add latency)
