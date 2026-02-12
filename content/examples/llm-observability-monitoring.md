---
title: LLM Observability & Monitoring
description: Track, debug, and optimize LLM applications with traces, metrics, and alerts in production
category: frameworks
difficulty: advanced
pitfalls:
  - Not tracking costs until bill arrives
  - Missing silent failures (hallucinations, bad outputs)
  - No visibility into multi-step chains
  - Treating 200 OK as success
  - Not logging prompts and outputs
checklist:
  - Implement request/response logging
  - Track token usage and costs
  - Monitor latency and errors
  - Set up alerts for anomalies
  - Trace multi-step workflows
  - Log prompt versions used
  - Monitor output quality metrics
  - Implement cost budgets and alerts
---

## Problem

Traditional APM tools fail at the LLM boundary. HTTP 200 doesn't mean success—the model might hallucinate, refuse requests, or produce low-quality output. Costs explode silently. Multi-agent traces are impossible to debug. You need LLM-specific observability.

## Solution

Use specialized LLM observability platforms (Langfuse, Helicone, Arize) that understand prompts, tokens, traces, and LLM-specific failure modes. Implement comprehensive logging, tracing, and alerting.

## When to Use

**Essential for:**
- Production LLM applications
- Customer-facing systems
- Any system where costs matter
- Multi-step LLM workflows
- Agent systems
- RAG applications
- Systems requiring compliance/audits

**Critical when:**
- Running at scale (>1000 requests/day)
- Using expensive models (GPT-4, Claude Opus)
- Building agent systems
- Regulatory requirements exist
- Cost optimization matters

## Pros

✅ **Cost visibility** - Track spending in real-time  
✅ **Quality monitoring** - Catch hallucinations and bad outputs  
✅ **Debug complex flows** - Trace multi-step agent runs  
✅ **Performance optimization** - Identify bottlenecks  
✅ **Prompt analytics** - See which prompts work best  
✅ **Compliance** - Audit trail for regulations  
✅ **Early warning** - Alerts before major issues

## Cons

❌ **Additional cost** - Observability platforms charge fees  
❌ **Latency overhead** - Logging adds ~10-50ms  
❌ **Privacy concerns** - Logs contain user data  
❌ **Setup complexity** - Integration takes time  
❌ **Storage costs** - Logs consume space  
❌ **Information overload** - Too much data to analyze

## Critical Metrics to Track

### 1. Cost Metrics
- Total token usage (input + output)
- Cost per request
- Cost per user/tenant
- Daily/monthly spend
- Cost by model
- Cost by prompt version

### 2. Performance Metrics
- Request latency (p50, p95, p99)
- Time to first token (streaming)
- Tokens per second
- Error rate
- Timeout rate
- Retry rate

### 3. Quality Metrics
- User feedback scores
- Output validation pass rate
- Hallucination detection rate
- Format compliance rate
- Task completion rate
- User satisfaction (CSAT)

### 4. Usage Metrics
- Requests per day/hour
- Active users
- Most used features
- Peak usage times
- Model distribution

## Langfuse: Open-Source Platform

### Basic Integration

```python
from langfuse import Langfuse

# Initialize
langfuse = Langfuse(
    public_key="pk_...",
    secret_key="sk_...",
    host="https://cloud.langfuse.com"
)

# Trace a simple completion
trace = langfuse.trace(name="email_classification")

generation = trace.generation(
    name="classify",
    model="gpt-4",
    model_parameters={
        "temperature": 0.0,
        "max_tokens": 10
    },
    input="Classify: You won $1M!",
    metadata={"user_id": "user_123"}
)

# ... make API call ...

generation.end(
    output="spam",
    usage={
        "input": 20,
        "output": 1,
        "total": 21
    },
    level="INFO",
    status_message="Success"
)
```

### Tracing Multi-Step Workflows

```python
# Trace complex RAG pipeline
trace = langfuse.trace(
    name="rag_query",
    user_id="user_123",
    session_id="session_456"
)

# Step 1: Retrieval
retrieval_span = trace.span(name="retrieve_documents")
documents = retrieve(query)
retrieval_span.end(
    output={"num_docs": len(documents)},
    metadata={"query": query}
)

# Step 2: Rerank
rerank_span = trace.span(name="rerank")
ranked_docs = rerank(documents, query)
rerank_span.end(output={"top_doc_id": ranked_docs[0].id})

# Step 3: Generate
generation = trace.generation(
    name="generate_answer",
    model="gpt-4",
    input=[
        {"role": "system", "content": "Answer based on context"},
        {"role": "user", "content": f"Context: {ranked_docs}\n\nQ: {query}"}
    ]
)

response = openai.chat.completions.create(...)

generation.end(
    output=response.choices[0].message.content,
    usage={
        "input": response.usage.prompt_tokens,
        "output": response.usage.completion_tokens,
        "total": response.usage.total_tokens
    }
)

# Collect user feedback
trace.score(
    name="user_rating",
    value=4,  # 1-5 stars
    comment="Good answer!"
)
```

### Prompt Management

```python
# Create versioned prompt
langfuse.create_prompt(
    name="email_classifier",
    prompt="Classify this email:\n\n{{email}}\n\nClassification:",
    config={
        "model": "gpt-4",
        "temperature": 0.0
    },
    labels=["production"]
)

# Use in production
prompt = langfuse.get_prompt("email_classifier")
filled_prompt = prompt.compile(email=user_email)

# Track which version was used
generation = trace.generation(
    name="classify",
    prompt=prompt  # Links to prompt version
)
```

## Helicone: Fast Integration

### One-Line Setup

```python
# Just change base URL
import openai

openai.api_base = "https://oai.helicone.ai/v1"
openai.default_headers = {
    "Helicone-Auth": f"Bearer {HELICONE_API_KEY}"
}

# All requests now logged automatically
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)
```

### Advanced Tracking

```python
# Add custom properties
openai.default_headers = {
    "Helicone-Auth": f"Bearer {HELICONE_API_KEY}",
    "Helicone-User-Id": user_id,
    "Helicone-Session-Id": session_id,
    "Helicone-Property-Environment": "production",
    "Helicone-Property-Prompt-Version": "v2.0"
}

# Prompt caching (saves costs)
openai.default_headers["Helicone-Cache-Enabled"] = "true"

# Request retry logic
openai.default_headers["Helicone-Retry-Enabled"] = "true"
```

## Custom Observability

### Build Your Own Logger

```python
import time
from datetime import datetime
import json

class LLMObserver:
    def __init__(self, db):
        self.db = db
    
    def log_request(self, **kwargs):
        """Log LLM request with full context."""
        request_id = str(uuid.uuid4())
        
        log_entry = {
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": kwargs.get("user_id"),
            "session_id": kwargs.get("session_id"),
            "model": kwargs["model"],
            "prompt_version": kwargs.get("prompt_version"),
            "input": kwargs["input"],
            "input_tokens": count_tokens(kwargs["input"]),
            "metadata": kwargs.get("metadata", {})
        }
        
        self.db.insert("llm_requests", log_entry)
        return request_id
    
    def log_response(self, request_id: str, **kwargs):
        """Log LLM response."""
        update = {
            "output": kwargs["output"],
            "output_tokens": kwargs["output_tokens"],
            "total_tokens": kwargs["input_tokens"] + kwargs["output_tokens"],
            "latency_ms": kwargs["latency_ms"],
            "cost": self.calculate_cost(
                kwargs["model"],
                kwargs["input_tokens"],
                kwargs["output_tokens"]
            ),
            "success": kwargs.get("success", True),
            "error": kwargs.get("error"),
            "completed_at": datetime.utcnow().isoformat()
        }
        
        self.db.update("llm_requests", request_id, update)
    
    def log_feedback(self, request_id: str, score: int, comment: str = None):
        """Log user feedback."""
        self.db.insert("llm_feedback", {
            "request_id": request_id,
            "score": score,
            "comment": comment,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    @staticmethod
    def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate request cost."""
        pricing = {
            "gpt-4": {"input": 30, "output": 60},  # per 1M tokens
            "gpt-3.5-turbo": {"input": 0.5, "output": 1.5}
        }
        
        price = pricing.get(model, {"input": 0, "output": 0})
        return (
            (input_tokens / 1_000_000 * price["input"]) +
            (output_tokens / 1_000_000 * price["output"])
        )

# Usage
observer = LLMObserver(database)

start = time.time()
request_id = observer.log_request(
    user_id="user_123",
    model="gpt-4",
    input=prompt,
    prompt_version="v2.0"
)

try:
    response = openai.chat.completions.create(...)
    
    observer.log_response(
        request_id=request_id,
        output=response.choices[0].message.content,
        input_tokens=response.usage.prompt_tokens,
        output_tokens=response.usage.completion_tokens,
        latency_ms=(time.time() - start) * 1000,
        success=True
    )
except Exception as e:
    observer.log_response(
        request_id=request_id,
        output=None,
        input_tokens=0,
        output_tokens=0,
        latency_ms=(time.time() - start) * 1000,
        success=False,
        error=str(e)
    )
```

## Real-Time Alerting

```python
class LLMAlertManager:
    def __init__(self, observer, thresholds):
        self.observer = observer
        self.thresholds = thresholds
        self.windows = {}  # Rolling windows
    
    def check_alerts(self):
        """Check all alert conditions."""
        current_hour = datetime.utcnow().hour
        
        # Cost alerts
        hourly_cost = self.get_hourly_cost()
        if hourly_cost > self.thresholds["max_hourly_cost"]:
            self.send_alert(
                "HIGH_COST",
                f"Hourly cost ${hourly_cost:.2f} exceeds threshold"
            )
        
        # Error rate alerts
        error_rate = self.get_error_rate(window_minutes=5)
        if error_rate > self.thresholds["max_error_rate"]:
            self.send_alert(
                "HIGH_ERROR_RATE",
                f"Error rate {error_rate:.1%} in last 5 minutes"
            )
        
        # Latency alerts
        p95_latency = self.get_latency_p95(window_minutes=5)
        if p95_latency > self.thresholds["max_p95_latency_ms"]:
            self.send_alert(
                "HIGH_LATENCY",
                f"P95 latency {p95_latency}ms exceeds threshold"
            )
        
        # Quality alerts
        low_scores = self.get_low_score_rate(window_minutes=60)
        if low_scores > self.thresholds["max_low_score_rate"]:
            self.send_alert(
                "LOW_QUALITY",
                f"{low_scores:.1%} of responses scored low in last hour"
            )
    
    def send_alert(self, alert_type: str, message: str):
        """Send alert via Slack/PagerDuty/email."""
        logging.error(f"ALERT [{alert_type}]: {message}")
        
        # Send to Slack
        requests.post(SLACK_WEBHOOK_URL, json={
            "text": f":rotating_light: *{alert_type}*\n{message}",
            "channel": "#llm-alerts"
        })
        
        # Could also send to PagerDuty, email, etc.
```

## Dashboard Queries

### Cost Analysis

```sql
-- Daily cost by model
SELECT 
    DATE(timestamp) as date,
    model,
    SUM(cost) as total_cost,
    COUNT(*) as num_requests,
    AVG(cost) as avg_cost_per_request
FROM llm_requests
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY date, model
ORDER BY date DESC, total_cost DESC;

-- Top users by cost
SELECT 
    user_id,
    SUM(cost) as total_cost,
    COUNT(*) as num_requests
FROM llm_requests
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY total_cost DESC
LIMIT 10;

-- Cost by prompt version
SELECT 
    prompt_version,
    COUNT(*) as requests,
    AVG(cost) as avg_cost,
    AVG(total_tokens) as avg_tokens,
    AVG(latency_ms) as avg_latency_ms
FROM llm_requests
GROUP BY prompt_version
ORDER BY requests DESC;
```

### Quality Analysis

```sql
-- Prompt version performance
SELECT 
    r.prompt_version,
    COUNT(*) as total_requests,
    AVG(f.score) as avg_score,
    SUM(CASE WHEN f.score >= 4 THEN 1 ELSE 0 END) / COUNT(*) as high_score_rate,
    AVG(r.cost) as avg_cost
FROM llm_requests r
LEFT JOIN llm_feedback f ON r.request_id = f.request_id
WHERE r.timestamp >= NOW() - INTERVAL '7 days'
GROUP BY r.prompt_version
ORDER BY avg_score DESC;
```

## Best Practices

1. **Log everything** - Prompts, outputs, tokens, costs, latency
2. **Add context** - User ID, session ID, version, environment
3. **Track feedback** - Collect user ratings on outputs
4. **Set budgets** - Daily/hourly cost limits with alerts
5. **Monitor quality** - Not just errors, but bad outputs
6. **Trace workflows** - Connect multi-step operations
7. **Version prompts** - Know which version produced which output
8. **Implement sampling** - Don't need to log 100% (expensive)
9. **Anonymize PII** - Comply with privacy regulations
10. **Review regularly** - Weekly dashboard review

## Privacy Considerations

```python
def anonymize_log(log_entry: dict) -> dict:
    """Remove or hash sensitive data before logging."""
    
    # Hash user IDs
    if "user_id" in log_entry:
        log_entry["user_id"] = hash_id(log_entry["user_id"])
    
    # Remove PII from prompts
    if "input" in log_entry:
        log_entry["input"] = remove_pii(log_entry["input"])
    
    if "output" in log_entry:
        log_entry["output"] = remove_pii(log_entry["output"])
    
    return log_entry

def remove_pii(text: str) -> str:
    """Remove emails, phone numbers, SSNs, etc."""
    # Email
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 
                  '[EMAIL]', text)
    # Phone
    text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
    # SSN
    text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', text)
    return text
```

## Cost Optimization Insights

Observability reveals optimization opportunities:

```python
# Find expensive prompts
expensive_prompts = db.query("""
    SELECT prompt_version, AVG(total_tokens), AVG(cost)
    FROM llm_requests
    GROUP BY prompt_version
    HAVING AVG(cost) > 0.10
    ORDER BY AVG(cost) DESC
""")

# Find slow operations
slow_operations = db.query("""
    SELECT operation_name, AVG(latency_ms), COUNT(*)
    FROM llm_traces
    WHERE latency_ms > 5000
    GROUP BY operation_name
    ORDER BY AVG(latency_ms) DESC
""")

# Identify retry patterns
retry_issues = db.query("""
    SELECT error, COUNT(*) as occurrences
    FROM llm_requests
    WHERE success = false
    GROUP BY error
    ORDER BY occurrences DESC
""")
```

## When NOT to Use

- Early prototyping (add later)
- Extremely cost-sensitive (logging costs money)
- No scale (< 100 requests/day)
- No quality requirements
- Fully internal tools

For production systems at scale, observability is non-negotiable.
