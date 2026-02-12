---
title: Context Window Management
description: Handle long conversations and documents within token limits effectively
category: production
difficulty: advanced
pitfalls:
  - Letting context grow unbounded until it hits limits
  - Truncating important information
  - Not tracking token usage across conversation
  - Losing critical context in multi-turn chats
  - Poor summarization that removes key details
checklist:
  - Track token count for all messages in conversation
  - Set token budgets for different parts (system, history, user input)
  - Implement smart truncation strategies
  - Summarize old messages when appropriate
  - Keep critical context (system prompt, recent messages)
  - Test with edge cases (very long conversations)
  - Monitor and alert when approaching limits
  - Have fallback strategies for limit exceeded errors
---

## Problem

LLMs have fixed context window sizes (4k-128k tokens). Long conversations or large documents can exceed these limits, causing failures or requiring expensive API calls.

## When to Use

**Implement context management for:**
- Conversational AI (chat, assistants)
- Long document processing
- Multi-turn interactions
- Applications with conversation history
- Systems processing large texts
- Session-based applications

**Critical for:**
- Customer support chatbots
- Code assistants with large codebases
- Document Q&A systems
- Long-running conversations
- Anything exceeding 4k-8k tokens

## Pros

✅ **Handles any length** - Conversation never stops  
✅ **Cost control** - Avoid expensive large context calls  
✅ **Better relevance** - Focus on important parts  
✅ **Faster responses** - Smaller context = quicker generation  
✅ **Works with any model** - Even small context models  
✅ **Prevents failures** - Never hit hard limits

## Cons

❌ **Loses information** - Old context may be important  
❌ **Complex logic** - Truncation/summarization strategies are hard  
❌ **Latency for summarization** - Generating summaries takes time  
❌ **Quality risk** - Poor summarization loses key details  
❌ **Testing difficulty** - Hard to verify what was kept/dropped  
❌ **Engineering overhead** - Requires token tracking infrastructure

## Context Window Sizes

| Model | Context Window | Notes |
|-------|---------------|-------|
| GPT-3.5-turbo | 4k-16k | Varies by version |
| GPT-4 | 8k-128k | Varies by version |
| Claude 2/3 | 100k-200k | Large context support |
| Gemini Pro | 32k-1M | Massive context windows |

## Token Counting

```python
import tiktoken

class TokenCounter:
    def __init__(self, model: str = "gpt-4"):
        self.encoding = tiktoken.encoding_for_model(model)
        
    def count(self, text: str) -> int:
        """Count tokens in text."""
        return len(self.encoding.encode(text))
    
    def count_messages(self, messages: list[dict]) -> int:
        """Count tokens in message list (OpenAI format)."""
        # Rough approximation - actual count includes message formatting overhead
        total = 0
        for msg in messages:
            # Each message has ~4 tokens of overhead
            total += 4
            total += self.count(msg.get("content", ""))
            if "name" in msg:
                total += self.count(msg["name"])
        total += 2  # Every reply is primed with assistant message
        return total
    
    def truncate_to_limit(self, text: str, max_tokens: int) -> str:
        """Truncate text to fit within token limit."""
        tokens = self.encoding.encode(text)
        if len(tokens) <= max_tokens:
            return text
        
        truncated_tokens = tokens[:max_tokens]
        return self.encoding.decode(truncated_tokens)

counter = TokenCounter()
```

## Strategy 1: Sliding Window

Keep only recent messages:

```python
class SlidingWindowConversation:
    def __init__(self, max_tokens: int = 4000, system_prompt: str = ""):
        self.max_tokens = max_tokens
        self.system_prompt = system_prompt
        self.messages = []
        self.counter = TokenCounter()
        
        # Reserve tokens for system prompt and response
        self.system_tokens = self.counter.count(system_prompt)
        self.response_budget = 1000  # Reserve for response
        self.available_tokens = max_tokens - self.system_tokens - self.response_budget
        
    def add_message(self, role: str, content: str):
        """Add message and truncate old ones if needed."""
        self.messages.append({"role": role, "content": content})
        self._truncate_to_fit()
        
    def _truncate_to_fit(self):
        """Remove old messages to stay within token limit."""
        while len(self.messages) > 0:
            current_tokens = self.counter.count_messages(self.messages)
            
            if current_tokens <= self.available_tokens:
                break
            
            # Remove oldest message (but keep recent ones)
            # Keep at least last 2 exchanges (4 messages)
            if len(self.messages) > 4:
                self.messages.pop(0)
            else:
                # If even recent messages exceed limit, truncate oldest message
                if len(self.messages) > 0:
                    old_content = self.messages[0]["content"]
                    self.messages[0]["content"] = old_content[:len(old_content)//2]
                break
    
    def get_messages_for_api(self) -> list[dict]:
        """Get messages formatted for API call."""
        messages = []
        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})
        messages.extend(self.messages)
        return messages

# Usage
conv = SlidingWindowConversation(
    max_tokens=4000,
    system_prompt="You are a helpful assistant."
)

conv.add_message("user", "What is Python?")
# ... model response ...
conv.add_message("assistant", "Python is a programming language...")
# ... more turns ...
# Old messages automatically removed
```

## Strategy 2: Hierarchical Summarization

Summarize old messages instead of dropping them:

```python
class SummarizingConversation:
    def __init__(self, max_tokens: int = 4000, summarize_threshold: int = 10):
        self.max_tokens = max_tokens
        self.summarize_threshold = summarize_threshold  # Messages before summarizing
        self.messages = []
        self.summary = ""
        self.counter = TokenCounter()
        
    def add_message(self, role: str, content: str):
        """Add message and manage context."""
        self.messages.append({"role": role, "content": content})
        
        # Check if we need to summarize
        if len(self.messages) >= self.summarize_threshold:
            tokens = self.counter.count_messages(self.messages)
            if tokens > self.max_tokens * 0.7:  # 70% threshold
                self._summarize_old_messages()
    
    def _summarize_old_messages(self):
        """Summarize older messages to save tokens."""
        # Keep last 4 messages (2 exchanges), summarize the rest
        messages_to_summarize = self.messages[:-4]
        
        if not messages_to_summarize:
            return
        
        # Create conversation text
        conversation_text = ""
        for msg in messages_to_summarize:
            conversation_text += f"{msg['role']}: {msg['content']}\n\n"
        
        # Generate summary
        summary_prompt = f"""
        Summarize this conversation history, preserving key information:
        
        {conversation_text}
        
        Previous summary (if any): {self.summary}
        
        Provide a concise summary that captures:
        1. Main topics discussed
        2. Important facts or decisions
        3. Ongoing context needed for future messages
        
        Summary:
        """
        
        new_summary = llm.complete(summary_prompt)
        self.summary = new_summary
        
        # Keep only recent messages
        self.messages = self.messages[-4:]
    
    def get_messages_for_api(self) -> list[dict]:
        """Get messages with summary prefix."""
        messages = []
        
        if self.summary:
            messages.append({
                "role": "system",
                "content": f"Conversation history summary: {self.summary}"
            })
        
        messages.extend(self.messages)
        return messages
```

## Strategy 3: Retrieval-Augmented Generation (RAG)

For very long documents, chunk and retrieve relevant parts:

```python
from typing import List
import numpy as np

class RAGContextManager:
    def __init__(self, max_context_tokens: int = 3000):
        self.max_context_tokens = max_context_tokens
        self.chunks = []
        self.embeddings = []
        self.counter = TokenCounter()
        
    def add_document(self, document: str, chunk_size: int = 500):
        """Split document into chunks and compute embeddings."""
        # Split into chunks
        chunks = self._chunk_document(document, chunk_size)
        self.chunks.extend(chunks)
        
        # Compute embeddings (use your embedding model)
        for chunk in chunks:
            embedding = self._get_embedding(chunk)
            self.embeddings.append(embedding)
    
    def _chunk_document(self, document: str, chunk_size: int) -> List[str]:
        """Split document into token-sized chunks with overlap."""
        tokens = self.counter.encoding.encode(document)
        chunks = []
        overlap = chunk_size // 4  # 25% overlap
        
        for i in range(0, len(tokens), chunk_size - overlap):
            chunk_tokens = tokens[i:i + chunk_size]
            chunk_text = self.counter.encoding.decode(chunk_tokens)
            chunks.append(chunk_text)
        
        return chunks
    
    def _get_embedding(self, text: str) -> np.ndarray:
        """Get embedding for text (placeholder - use actual embedding model)."""
        # Use OpenAI embeddings, sentence-transformers, etc.
        response = openai.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return np.array(response.data[0].embedding)
    
    def retrieve_relevant_chunks(self, query: str, top_k: int = 5) -> List[str]:
        """Retrieve most relevant chunks for query."""
        query_embedding = self._get_embedding(query)
        
        # Compute similarity scores
        scores = []
        for chunk_embedding in self.embeddings:
            # Cosine similarity
            score = np.dot(query_embedding, chunk_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
            )
            scores.append(score)
        
        # Get top-k chunks
        top_indices = np.argsort(scores)[-top_k:][::-1]
        return [self.chunks[i] for i in top_indices]
    
    def build_context(self, query: str) -> str:
        """Build context that fits within token limit."""
        relevant_chunks = self.retrieve_relevant_chunks(query, top_k=10)
        
        # Add chunks until we hit token limit
        context_parts = []
        current_tokens = 0
        
        for chunk in relevant_chunks:
            chunk_tokens = self.counter.count(chunk)
            if current_tokens + chunk_tokens > self.max_context_tokens:
                break
            context_parts.append(chunk)
            current_tokens += chunk_tokens
        
        return "\n\n---\n\n".join(context_parts)

# Usage
rag = RAGContextManager(max_context_tokens=3000)

# Add long document
long_document = load_document("war_and_peace.txt")
rag.add_document(long_document)

# Query with relevant context only
query = "What happens to Pierre?"
context = rag.build_context(query)

prompt = f"""
Based on this context:

{context}

Answer: {query}
"""

response = llm.complete(prompt)
```

## Strategy 4: Semantic Compression

Compress repetitive or less important information:

```python
def compress_conversation(messages: list[dict], target_ratio: float = 0.5) -> list[dict]:
    """
    Compress conversation to target_ratio of original tokens.
    
    Strategies:
    1. Remove filler words and redundancy
    2. Compress older messages more aggressively
    3. Keep recent messages intact
    """
    compressed_messages = []
    
    for i, msg in enumerate(messages):
        # How old is this message? (0 = most recent)
        age = len(messages) - i - 1
        
        # Compress older messages more
        if age > 5:  # Compress messages older than 5 turns
            compression_prompt = f"""
            Compress this message to 50% of its length while preserving key information:
            
            {msg['content']}
            
            Compressed version:
            """
            compressed_content = llm.complete(compression_prompt)
            compressed_messages.append({
                "role": msg["role"],
                "content": compressed_content
            })
        elif age > 2:  # Mild compression
            # Remove filler words
            compressed_content = remove_filler_words(msg['content'])
            compressed_messages.append({
                "role": msg["role"],
                "content": compressed_content
            })
        else:  # Keep recent messages intact
            compressed_messages.append(msg)
    
    return compressed_messages

def remove_filler_words(text: str) -> str:
    """Remove common filler words to save tokens."""
    fillers = ["actually", "basically", "literally", "you know", "I mean", 
               "kind of", "sort of", "like", "um", "uh"]
    
    for filler in fillers:
        text = text.replace(f" {filler} ", " ")
    
    # Remove extra whitespace
    text = " ".join(text.split())
    
    return text
```

## Dynamic Token Budgeting

```python
class DynamicTokenBudget:
    def __init__(self, total_tokens: int):
        self.total_tokens = total_tokens
        self.budgets = {
            "system": 0.1,      # 10% for system prompt
            "history": 0.5,     # 50% for conversation history
            "user_input": 0.2,  # 20% for current user input
            "response": 0.2     # 20% reserved for response
        }
    
    def allocate(self, system_prompt: str, messages: list[dict], user_input: str) -> dict:
        """Dynamically allocate tokens based on actual usage."""
        counter = TokenCounter()
        
        system_tokens = counter.count(system_prompt)
        user_tokens = counter.count(user_input)
        history_tokens = counter.count_messages(messages)
        
        # Calculate budgets
        response_budget = int(self.total_tokens * self.budgets["response"])
        available = self.total_tokens - response_budget
        
        # If everything fits, use as-is
        total_used = system_tokens + user_tokens + history_tokens
        if total_used <= available:
            return {
                "system": system_prompt,
                "messages": messages,
                "user_input": user_input,
                "fits": True
            }
        
        # Need to compress - prioritize recent messages
        # 1. Keep system prompt
        remaining = available - system_tokens
        
        # 2. Keep full user input if possible
        if user_tokens <= remaining * 0.3:  # Use up to 30% for user input
            remaining -= user_tokens
        else:
            # Truncate user input
            user_input = counter.truncate_to_limit(user_input, int(remaining * 0.3))
            remaining = int(remaining * 0.7)
        
        # 3. Compress history to fit remaining
        compressed_messages = self._compress_history(messages, remaining)
        
        return {
            "system": system_prompt,
            "messages": compressed_messages,
            "user_input": user_input,
            "fits": False,
            "compressed": True
        }
    
    def _compress_history(self, messages: list[dict], target_tokens: int) -> list[dict]:
        """Compress message history to fit target tokens."""
        counter = TokenCounter()
        
        # Strategy: Keep recent messages, summarize or drop old ones
        compressed = []
        current_tokens = 0
        
        # Start from most recent
        for msg in reversed(messages):
            msg_tokens = counter.count(msg["content"])
            
            if current_tokens + msg_tokens <= target_tokens:
                compressed.insert(0, msg)
                current_tokens += msg_tokens
            else:
                # No more room - done
                break
        
        return compressed
```

## Monitoring and Alerting

```python
class ContextMonitor:
    def __init__(self, warning_threshold: float = 0.8):
        self.warning_threshold = warning_threshold
        self.counter = TokenCounter()
        
    def check_usage(self, messages: list[dict], max_tokens: int):
        """Check token usage and alert if approaching limit."""
        current_tokens = self.counter.count_messages(messages)
        usage_ratio = current_tokens / max_tokens
        
        if usage_ratio > self.warning_threshold:
            logging.warning(
                f"Context usage at {usage_ratio:.1%} "
                f"({current_tokens}/{max_tokens} tokens)"
            )
            
            return {
                "warning": True,
                "usage_ratio": usage_ratio,
                "tokens_used": current_tokens,
                "tokens_remaining": max_tokens - current_tokens
            }
        
        return {
            "warning": False,
            "usage_ratio": usage_ratio,
            "tokens_used": current_tokens,
            "tokens_remaining": max_tokens - current_tokens
        }
```

## Best Practices

1. **Always track tokens**: Don't wait for API errors
2. **Reserve budget for response**: Model needs tokens to respond
3. **Keep recent context**: Prioritize latest messages
4. **Summarize, don't drop**: Preserve information when possible
5. **Use RAG for documents**: Don't stuff everything in context
6. **Test edge cases**: Very long conversations, large documents
7. **Monitor usage**: Alert before hitting limits
8. **Have fallbacks**: Handle gracefully when limits exceeded
9. **Consider cost**: Larger contexts cost more
10. **Use right model**: Match context needs to model capabilities
