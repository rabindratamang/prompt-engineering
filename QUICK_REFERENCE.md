# Prompt Engineering - Quick Reference Guide

## 🎯 Quick Decision Tree

```
Need to choose a technique?
│
├─ Is it a SECURITY concern? 
│  └─ Yes → Role Separation + Delimiters + Constitutional AI
│
├─ Is it a PRODUCTION system?
│  ├─ Cost matters? → Token Optimization + Model Routing
│  ├─ Reliability matters? → Error Handling + Circuit Breakers
│  └─ Long conversations? → Context Window Management
│
├─ Is the task COMPLEX?
│  ├─ Multi-step process? → Prompt Chaining
│  ├─ Multiple approaches? → Tree of Thoughts
│  ├─ Different subtasks? → Meta-Prompting
│  └─ Needs reasoning? → Chain of Thought
│
├─ Need STRUCTURE?
│  ├─ Specific format? → Few-Shot Examples
│  ├─ Parseable output? → JSON Schema
│  └─ External actions? → Function Calling
│
└─ Need QUALITY assurance?
   └─ Eval Rubrics + Test Cases
```

## 📊 Technique Comparison Matrix

| Technique | Cost | Latency | Accuracy | Complexity | Best For |
|-----------|------|---------|----------|------------|----------|
| **Role Separation** | Low | None | N/A | Low | Security baseline |
| **Delimiters** | Low | None | +10% | Low | Injection defense |
| **Few-Shot** | Medium | Low | +30% | Low | Format control |
| **JSON Output** | Low | None | N/A | Low | Structured data |
| **Eval Rubrics** | Medium | None | N/A | Medium | Quality measurement |
| **Chain of Thought** | High (2-5x) | Medium | +40% | Low | Math/reasoning |
| **Prompt Chaining** | High | High | +30% | High | Complex workflows |
| **Tree of Thoughts** | Very High (5-20x) | Very High | +70% | High | Critical decisions |
| **Meta-Prompting** | Variable | High | +20% | High | Cost optimization |
| **Function Calling** | Medium | Medium | N/A | Medium | System integration |
| **Token Optimization** | -60-90% | Faster | Same | Medium | Scale/cost |
| **Error Handling** | +10% | +10% | N/A | High | Reliability |
| **Context Management** | Medium | Medium | N/A | High | Long conversations |
| **Constitutional AI** | High (2-3x) | High | N/A | High | Safety-critical |

## 💰 Cost Impact Quick Reference

### 🟢 Cost Reducers (-60% to -90%)
- Token Optimization (remove redundancy)
- Model Routing (cheap for simple tasks)
- Prompt Caching (reuse prefixes)
- Meta-Prompting (smart orchestration)

### 🟡 Neutral/Low Cost (+0% to +20%)
- Role Separation
- Delimiters  
- Few-Shot Examples
- JSON Output
- Function Calling

### 🔴 Cost Increasers (+100% to +500%)
- Chain of Thought (2-5x)
- Tree of Thoughts (5-20x)
- Constitutional AI (2-3x)
- Prompt Chaining (2-10x depending on steps)

## ⚡ Speed Impact

### Fast (No added latency)
- Role Separation
- Delimiters
- JSON Output

### Medium (+100-300ms)
- Few-Shot Examples (longer prompt)
- Function Calling (1 extra round-trip)
- Chain of Thought

### Slow (+1-5 seconds)
- Prompt Chaining (multiple calls)
- Constitutional AI (critique + revision)
- Context Summarization

### Very Slow (+5-30 seconds)
- Tree of Thoughts (exploring branches)
- Meta-Prompting (decomposition + execution)

## 🎯 By Use Case

### Building a Chatbot
1. **Baseline**: Role Separation + Delimiters
2. **Quality**: Few-Shot Examples + Eval Rubrics
3. **Production**: Error Handling + Context Management
4. **Safety**: Constitutional AI

### Processing Documents  
1. **Structure**: JSON Output + Delimiters
2. **Scale**: RAG (in Context Management)
3. **Cost**: Token Optimization + Model Routing
4. **Quality**: Eval Rubrics

### Complex Analysis
1. **Reasoning**: Chain of Thought
2. **Critical**: Tree of Thoughts
3. **Multi-step**: Prompt Chaining
4. **Orchestration**: Meta-Prompting

### Building Agents
1. **Actions**: Function Calling
2. **Workflows**: Prompt Chaining
3. **Safety**: Constitutional AI
4. **Reliability**: Error Handling

### Production System
1. **Cost**: Token Optimization
2. **Reliability**: Error Handling + Circuit Breakers
3. **Quality**: Eval Rubrics + Monitoring
4. **Safety**: Constitutional AI + Role Separation

## 🏆 Accuracy Improvements (Research-Backed)

| Technique | Improvement | Task Type |
|-----------|-------------|-----------|
| Few-Shot | +30% | Classification |
| Chain of Thought | +10-50% | Reasoning |
| Tree of Thoughts | +70% | Game of 24 puzzles |
| Self-Consistency | +15-25% | Multi-step problems |
| Meta-Prompting | +20% | Complex workflows |
| Constitutional AI | +90% | Safety metrics |

## 🚦 Traffic Light System

### 🟢 Always Use (Production Baseline)
- Role Separation (security)
- Delimiters (injection defense)
- Error Handling (reliability)
- Eval Rubrics (quality)

### 🟡 Use When Appropriate
- Few-Shot Examples (format control)
- JSON Output (structured data)
- Chain of Thought (complex reasoning)
- Function Calling (system integration)
- Token Optimization (scale)
- Context Management (long sessions)

### 🔴 Use Sparingly (High Cost/Complexity)
- Tree of Thoughts (critical decisions only)
- Constitutional AI (safety-critical only)
- Meta-Prompting (complex problems only)
- Prompt Chaining (when simpler approaches fail)

## 📝 Template Checklist

### For Any Production Prompt:
- [ ] Role separation implemented
- [ ] User input delimited
- [ ] Output format specified
- [ ] Error handling in code
- [ ] Token usage tracked
- [ ] Eval rubric defined
- [ ] Test cases created
- [ ] Cost budget set
- [ ] Monitoring in place

### For Customer-Facing Apps:
- [ ] All production checklist items
- [ ] Constitutional AI (or similar safety)
- [ ] Content filtering
- [ ] Rate limiting
- [ ] Fallback responses
- [ ] Adversarial testing done

### For High-Stakes Decisions:
- [ ] All customer-facing items
- [ ] Tree of Thoughts (or equivalent)
- [ ] Multiple validation steps
- [ ] Human review integration
- [ ] Audit logging
- [ ] Compliance verification

## 🔗 Quick Links

### By Skill Level
- **Beginner**: Start with [Role Separation](/examples/role-separation/)
- **Intermediate**: Learn [Chain of Thought](/examples/chain-of-thought/)
- **Advanced**: Master [Tree of Thoughts](/examples/tree-of-thoughts/)
- **Production**: Implement [Error Handling](/examples/error-handling-retries/)

### By Goal
- **Save Money**: [Token Optimization](/examples/token-optimization/)
- **Improve Accuracy**: [Tree of Thoughts](/examples/tree-of-thoughts/)
- **Increase Safety**: [Constitutional AI](/examples/constitutional-ai/)
- **Build Agents**: [Function Calling](/examples/function-calling-tool-use/)
- **Scale System**: [Context Management](/examples/context-window-management/)

### Interactive Learning
- [Template Playground](/demos/template-playground/) - Build & score prompts
- [JSON Validator](/demos/output-validator/) - Test schemas
- [Injection Sandbox](/demos/injection-sandbox/) - Test defenses
- [Eval Rubric Builder](/demos/eval-rubric/) - Create test cases

## 💡 Pro Tips

1. **Start Simple**: Try single prompt before chaining
2. **Measure First**: Track costs before optimizing
3. **Test Adversarially**: Try to break your prompts
4. **Layer Defenses**: Use multiple security techniques
5. **Monitor Production**: Track errors, costs, quality
6. **Iterate on Rubrics**: Update based on failures
7. **Consider Trade-offs**: Cost vs accuracy vs speed
8. **Document Decisions**: Why you chose each technique

## 🎓 Learning Path

### Week 1: Foundations
- Day 1-2: Role Separation + Delimiters
- Day 3-4: Few-Shot Examples
- Day 5: JSON Output
- Weekend: Practice with demos

### Week 2: Quality & Testing
- Day 1-3: Eval Rubrics
- Day 4-5: Chain of Thought
- Weekend: Build test suite for your use case

### Week 3: Production Patterns
- Day 1-2: Error Handling
- Day 3-4: Token Optimization
- Day 5: Context Management
- Weekend: Production readiness checklist

### Week 4: Advanced Techniques
- Day 1-2: Prompt Chaining
- Day 3: Function Calling
- Day 4: Tree of Thoughts or Meta-Prompting
- Day 5: Constitutional AI
- Weekend: Integrate into your project

---

**Remember**: The best technique is the simplest one that solves your problem.
