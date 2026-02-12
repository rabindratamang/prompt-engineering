---
title: Prompting Frameworks (DSPy vs LangChain)
description: Choose between prompt programming (DSPy) and prompt orchestration (LangChain) frameworks
category: frameworks
difficulty: advanced
pitfalls:
  - Using framework overhead for simple prompts
  - Not understanding optimization requirements (DSPy needs eval data)
  - Over-engineering with frameworks when simple API calls suffice
  - Mixing frameworks without clear boundaries
  - Ignoring framework-specific best practices
checklist:
  - Evaluate if you need a framework at all
  - Choose based on use case (optimization vs orchestration)
  - Have evaluation data ready (for DSPy)
  - Set up version control for prompts
  - Define clear module boundaries
  - Test framework overhead vs benefits
  - Monitor performance in production
  - Keep escape hatch to raw API calls
---

## Problem

Hand-crafting prompts is time-consuming, brittle across model versions, and hard to optimize. You need systematic approaches to building, testing, and deploying LLM applications at scale.

## Solution

Use prompting frameworks that provide abstractions, optimization, and orchestration capabilities. The choice depends on whether you need **optimization** (DSPy) or **orchestration** (LangChain).

## When to Use

**Use DSPy when:**
- You have evaluation data to optimize against
- Prompt iteration is a major bottleneck
- You switch models frequently
- You need reproducible, version-controlled prompts
- Building complex multi-step reasoning
- Scientific/systematic approach to prompting

**Use LangChain when:**
- Rapid prototyping is priority
- Need extensive tool/database integrations
- Building agent workflows
- Want large ecosystem of pre-built components
- Manual prompt control is acceptable
- Quick deployment matters

**Use neither when:**
- Simple, single-shot prompts
- Direct API calls are sufficient
- No complex workflows needed
- Framework overhead exceeds benefit

## Pros

### DSPy Pros
✅ **Automatic optimization** - Finds best prompts for your metric  
✅ **Model-agnostic** - Migrate between models easily  
✅ **Reproducible** - Prompts are code, not strings  
✅ **Composable** - Build complex programs from modules  
✅ **Version controlled** - Standard code versioning  
✅ **Type-safe** - Signatures define contracts

### LangChain Pros
✅ **Rich ecosystem** - 100+ integrations  
✅ **Rapid prototyping** - Quick to get started  
✅ **Agent support** - Pre-built agent frameworks  
✅ **Memory management** - Conversation history handling  
✅ **Community** - Large user base, many examples  
✅ **Flexibility** - Manual control when needed

## Cons

### DSPy Cons
❌ **Requires eval data** - Can't optimize without metrics  
❌ **Learning curve** - New paradigm to learn  
❌ **Optimization time** - Can take minutes/hours  
❌ **Less mature** - Smaller ecosystem than LangChain  
❌ **Overhead** - May be overkill for simple tasks  
❌ **Documentation** - Still evolving

### LangChain Cons
❌ **Manual optimization** - You tune prompts by hand  
❌ **Complexity** - Large API surface  
❌ **Abstraction leaks** - Hard to debug when things fail  
❌ **Version fragility** - Breaking changes between versions  
❌ **Performance overhead** - Extra layers add latency  
❌ **Lock-in risk** - Hard to migrate away

## DSPy: Prompt Programming

### Core Concepts

```python
import dspy

# 1. Configure language model
lm = dspy.OpenAI(model='gpt-4', max_tokens=300)
dspy.settings.configure(lm=lm)

# 2. Define signature (what you want, not how)
class QuestionAnswer(dspy.Signature):
    """Answer questions based on context."""
    context = dspy.InputField(desc="relevant information")
    question = dspy.InputField()
    answer = dspy.OutputField(desc="concise answer")

# 3. Use module (how to achieve it)
class RAG(dspy.Module):
    def __init__(self):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=3)
        self.generate = dspy.ChainOfThought(QuestionAnswer)
    
    def forward(self, question):
        context = self.retrieve(question).passages
        return self.generate(context=context, question=question)

# 4. Compile/optimize the program
from dspy.teleprompt import BootstrapFewShot

# Provide training examples
trainset = [
    dspy.Example(question="What is Python?", answer="Python is a programming language").with_inputs('question'),
    # ... more examples
]

# Optimize
teleprompter = BootstrapFewShot(metric=answer_accuracy)
compiled_rag = teleprompter.compile(RAG(), trainset=trainset)

# 5. Use optimized program
answer = compiled_rag(question="What is machine learning?")
```

### Key Advantages

**Automatic Few-Shot Generation**: DSPy automatically finds the best demonstrations from your training set.

**Model Portability**: Same code works across GPT-4, Claude, Llama, etc. - just change the LM config.

**Optimization Strategies**: Multiple optimizers available:
- `BootstrapFewShot` - Generate and select demonstrations
- `BootstrapFewShotWithRandomSearch` - Random search over demos
- `MIPRO` - Multi-stage instruction/prompt/reasoning optimization
- `SignatureOptimizer` - Optimize field descriptions

### Production Pattern

```python
class ProductionRAG(dspy.Module):
    def __init__(self):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=5)
        self.generate = dspy.ChainOfThought(QuestionAnswer)
        
        # Add validation
        self.validate = dspy.Assert(
            lambda x: len(x.answer) > 10,
            "Answer too short"
        )
    
    def forward(self, question):
        context = self.retrieve(question).passages
        prediction = self.generate(context=context, question=question)
        
        # Validate output
        self.validate(prediction)
        
        return prediction

# Compile with production metric
def production_metric(example, prediction, trace=None):
    # Custom metric: accuracy + quality checks
    accurate = example.answer.lower() in prediction.answer.lower()
    not_too_long = len(prediction.answer) < 500
    has_context = any(p in prediction.answer for p in example.context)
    
    return (accurate and not_too_long and has_context)

teleprompter = BootstrapFewShot(
    metric=production_metric,
    max_bootstrapped_demos=8,
    max_labeled_demos=4
)

optimized = teleprompter.compile(
    ProductionRAG(),
    trainset=training_examples,
    valset=validation_examples
)

# Save compiled program
optimized.save('production_rag.json')

# Load in production
loaded = ProductionRAG()
loaded.load('production_rag.json')
```

## LangChain: Prompt Orchestration

### Core Concepts

```python
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.schema import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough

# 1. Define prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that answers questions based on context."),
    ("human", """Context: {context}
    
Question: {question}

Provide a concise answer based only on the context.""")
])

# 2. Create chain
llm = ChatOpenAI(model="gpt-4")
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 3. Use chain
answer = chain.invoke("What is machine learning?")
```

### Agent Pattern

```python
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType

# Define tools
tools = [
    Tool(
        name="Search",
        func=search_function,
        description="Search for information"
    ),
    Tool(
        name="Calculator",
        func=calculate,
        description="Perform mathematical calculations"
    ),
    Tool(
        name="Database",
        func=query_db,
        description="Query database for records"
    )
]

# Create agent
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    max_iterations=5
)

# Run agent
result = agent.run("Find the revenue for Q4 2023 and calculate growth vs Q3")
```

### Memory Management

```python
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain

# Keep last 5 exchanges
memory = ConversationBufferWindowMemory(k=5)

conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# Multi-turn conversation
response1 = conversation.predict(input="What is Python?")
response2 = conversation.predict(input="What are its main use cases?")
# Context from response1 is available
```

## Comparison Matrix

| Feature | DSPy | LangChain |
|---------|------|-----------|
| **Paradigm** | Prompt programming | Prompt orchestration |
| **Optimization** | Automatic | Manual |
| **Learning Curve** | Steep | Moderate |
| **Model Portability** | Excellent | Good |
| **Integrations** | Growing | Extensive |
| **Agent Support** | Basic | Advanced |
| **Performance** | Optimized | Variable |
| **Debugging** | Good | Challenging |
| **Best For** | Systematic optimization | Rapid prototyping |

## Hybrid Approach

You can use both frameworks together:

```python
# Use LangChain for tool integration
from langchain.tools import Tool
from langchain.retrievers import ...

# Use DSPy for optimized prompting
import dspy

class HybridRAG(dspy.Module):
    def __init__(self, langchain_retriever):
        super().__init__()
        # LangChain retriever
        self.retriever = langchain_retriever
        # DSPy optimized generation
        self.generate = dspy.ChainOfThought(QuestionAnswer)
    
    def forward(self, question):
        # Retrieve with LangChain
        docs = self.retriever.get_relevant_documents(question)
        context = "\n".join([d.page_content for d in docs])
        
        # Generate with DSPy
        return self.generate(context=context, question=question)
```

## Framework Selection Flowchart

```
Do you need a framework?
├─ No → Use OpenAI/Anthropic SDK directly
│
└─ Yes
   │
   ├─ Have evaluation data?
   │  ├─ Yes → Consider DSPy
   │  │  ├─ Need systematic optimization? → DSPy
   │  │  └─ Prefer manual control? → LangChain
   │  │
   │  └─ No → LangChain (or build eval data first)
   │
   ├─ Need extensive integrations?
   │  └─ Yes → LangChain
   │
   ├─ Building agents?
   │  └─ Yes → LangChain (more mature)
   │
   └─ Want model portability?
      └─ Yes → DSPy
```

## Best Practices

### DSPy
1. **Start with good signatures** - Clear input/output definitions
2. **Collect eval data** - Need 20-100 examples minimum
3. **Choose right optimizer** - Match to your task complexity
4. **Version compiled programs** - Save and track optimized versions
5. **Monitor in production** - Track if optimizations hold
6. **Keep it simple** - Don't over-engineer module composition

### LangChain
1. **Use LCEL** (LangChain Expression Language) - Modern chain syntax
2. **Implement error handling** - Chains can fail in many ways
3. **Monitor token usage** - Track costs carefully
4. **Version your prompts** - Store templates in version control
5. **Test thoroughly** - Integration issues are common
6. **Keep escape hatches** - Be able to bypass framework

## Migration Strategy

### From Manual to Framework

```python
# Phase 1: Manual prompt
prompt = "Answer this question: {question}"

# Phase 2: Template (LangChain)
from langchain.prompts import PromptTemplate
prompt = PromptTemplate.from_template("Answer this question: {question}")

# Phase 3: Optimized (DSPy)
class QA(dspy.Signature):
    question = dspy.InputField()
    answer = dspy.OutputField()

qa = dspy.ChainOfThought(QA)
optimized_qa = teleprompter.compile(qa, trainset=examples)
```

### From LangChain to DSPy

1. Identify your prompt patterns
2. Convert to DSPy signatures
3. Collect eval data
4. Run optimization
5. Compare performance
6. Gradual migration (can coexist)

## Real-World Costs

**DSPy Optimization Cost**:
- One-time: $1-20 (depending on optimizer, examples)
- Saves: 10-30% per request through better prompts
- Breakeven: ~100-1000 requests

**Framework Overhead**:
- DSPy: ~10-50ms per request
- LangChain: ~20-100ms per request
- Worth it if you're doing optimization/orchestration anyway

## When NOT to Use Frameworks

- Single, simple prompt
- Direct API call is clearer
- No complex workflows
- Prototyping very early stage
- Team unfamiliar with frameworks
- Framework overhead > benefit

Start simple. Add frameworks when needed.
