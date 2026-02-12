---
title: Error Handling & Retry Strategies
description: Build robust LLM applications with proper error handling, retries, and fallbacks
category: production
difficulty: advanced
pitfalls:
  - Retrying forever without backoff or limits
  - Not distinguishing between retryable and non-retryable errors
  - Ignoring rate limit errors
  - Not logging errors for debugging
  - Retrying the exact same prompt that failed
checklist:
  - Implement exponential backoff for retries
  - Set maximum retry attempts
  - Distinguish transient vs permanent errors
  - Handle rate limits with appropriate delays
  - Log all errors with context
  - Implement circuit breakers for repeated failures
  - Have fallback strategies for critical paths
  - Monitor error rates and alert on spikes
---

## Problem

LLM APIs can fail due to rate limits, timeouts, server errors, or content policy violations. Production systems need robust error handling to maintain reliability.

## When to Use

**Implement robust error handling for:**
- Production applications
- Customer-facing systems
- High-availability requirements
- Systems processing valuable data
- Any application where failures cost money/trust
- Batch processing pipelines

**Critical for:**
- Mission-critical applications
- Financial services
- Healthcare systems
- E-commerce platforms
- Enterprise SaaS products

## Pros

✅ **Reliability** - Systems recover from transient failures automatically  
✅ **Better UX** - Users don't see temporary API issues  
✅ **Cost efficiency** - Avoid wasting work from failed requests  
✅ **Graceful degradation** - Fall back to alternatives when primary fails  
✅ **Observability** - Error tracking provides system health insights  
✅ **Prevents cascading failures** - Circuit breakers stop overload

## Cons

❌ **Complexity** - Significant code for retry logic, fallbacks, monitoring  
❌ **Latency** - Retries add delay to responses  
❌ **Cost** - Retrying failed requests costs tokens  
❌ **Testing difficulty** - Hard to simulate all failure scenarios  
❌ **Over-engineering risk** - Can be overkill for simple use cases  
❌ **False confidence** - Good error handling can mask underlying issues

## Error Types

### 1. Transient Errors (Retry)
- `503 Service Unavailable`: API temporarily down
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Temporary API issue
- `Timeout`: Request took too long

### 2. Permanent Errors (Don't Retry)
- `400 Bad Request`: Malformed prompt
- `401 Unauthorized`: Invalid API key
- `403 Forbidden`: Content policy violation
- `404 Not Found`: Invalid endpoint

### 3. Partial Errors (Retry with Changes)
- Token limit exceeded: Truncate prompt
- Context too long: Compress context
- JSON parse failure: Request again with stricter format

## Exponential Backoff with Jitter

```python
import time
import random
from typing import Optional, Callable, TypeVar

T = TypeVar('T')

def retry_with_exponential_backoff(
    func: Callable[..., T],
    max_retries: int = 5,
    initial_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
) -> T:
    """
    Retry a function with exponential backoff.
    
    Args:
        func: Function to retry
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay between retries (seconds)
        max_delay: Maximum delay between retries (seconds)
        exponential_base: Base for exponential backoff
        jitter: Add randomization to prevent thundering herd
    """
    
    for attempt in range(max_retries + 1):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries:
                raise  # Give up after max retries
            
            # Check if error is retryable
            if not is_retryable_error(e):
                raise  # Don't retry permanent errors
            
            # Calculate delay with exponential backoff
            delay = min(initial_delay * (exponential_base ** attempt), max_delay)
            
            # Add jitter to prevent thundering herd
            if jitter:
                delay = delay * (0.5 + random.random())
            
            # Log and wait
            print(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay:.2f}s...")
            time.sleep(delay)

def is_retryable_error(error: Exception) -> bool:
    """Determine if an error should be retried."""
    error_str = str(error).lower()
    
    # Rate limit errors
    if "429" in error_str or "rate limit" in error_str:
        return True
    
    # Server errors
    if "500" in error_str or "503" in error_str:
        return True
    
    # Timeout errors
    if "timeout" in error_str:
        return True
    
    # Don't retry client errors (4xx except 429)
    if any(code in error_str for code in ["400", "401", "403", "404"]):
        return False
    
    # Default: retry
    return True

# Usage
def call_llm():
    return openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "Hello"}]
    )

response = retry_with_exponential_backoff(call_llm, max_retries=5)
```

## Production Error Handler

```python
from enum import Enum
from dataclasses import dataclass
from typing import Optional
import logging

class ErrorSeverity(Enum):
    TRANSIENT = "transient"  # Retry automatically
    RECOVERABLE = "recoverable"  # Retry with modifications
    PERMANENT = "permanent"  # Don't retry

@dataclass
class LLMError:
    severity: ErrorSeverity
    message: str
    retry_after: Optional[float] = None
    suggestion: Optional[str] = None

class LLMErrorHandler:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def classify_error(self, error: Exception) -> LLMError:
        """Classify error and provide recovery strategy."""
        error_msg = str(error).lower()
        
        # Rate limit
        if "429" in error_msg or "rate limit" in error_msg:
            retry_after = self.extract_retry_after(error)
            return LLMError(
                severity=ErrorSeverity.TRANSIENT,
                message="Rate limit exceeded",
                retry_after=retry_after or 60.0,
                suggestion="Wait before retrying or reduce request rate"
            )
        
        # Token limit
        if "token" in error_msg and "limit" in error_msg:
            return LLMError(
                severity=ErrorSeverity.RECOVERABLE,
                message="Token limit exceeded",
                suggestion="Truncate prompt or split into smaller requests"
            )
        
        # Content policy
        if "content" in error_msg and ("policy" in error_msg or "filter" in error_msg):
            return LLMError(
                severity=ErrorSeverity.PERMANENT,
                message="Content policy violation",
                suggestion="Review and modify prompt to comply with policies"
            )
        
        # Invalid API key
        if "401" in error_msg or "unauthorized" in error_msg:
            return LLMError(
                severity=ErrorSeverity.PERMANENT,
                message="Invalid API key",
                suggestion="Check API key configuration"
            )
        
        # Server errors
        if any(code in error_msg for code in ["500", "502", "503"]):
            return LLMError(
                severity=ErrorSeverity.TRANSIENT,
                message="Server error",
                retry_after=5.0,
                suggestion="Retry with backoff"
            )
        
        # Timeout
        if "timeout" in error_msg:
            return LLMError(
                severity=ErrorSeverity.TRANSIENT,
                message="Request timeout",
                retry_after=2.0,
                suggestion="Retry or use streaming"
            )
        
        # Unknown error - assume transient
        return LLMError(
            severity=ErrorSeverity.TRANSIENT,
            message=f"Unknown error: {error}",
            retry_after=5.0
        )
    
    def extract_retry_after(self, error: Exception) -> Optional[float]:
        """Extract retry-after header if present."""
        # Implementation depends on your HTTP library
        # For openai library, check error.response.headers
        try:
            if hasattr(error, 'response') and error.response:
                retry_after = error.response.headers.get('retry-after')
                if retry_after:
                    return float(retry_after)
        except:
            pass
        return None
    
    def handle_error(self, error: Exception, context: dict) -> LLMError:
        """Handle error with logging and classification."""
        classified = self.classify_error(error)
        
        # Log with context
        self.logger.error(
            f"LLM API error: {classified.message}",
            extra={
                "severity": classified.severity.value,
                "suggestion": classified.suggestion,
                "context": context
            }
        )
        
        return classified

# Usage
handler = LLMErrorHandler()

try:
    response = openai.chat.completions.create(...)
except Exception as e:
    error_info = handler.handle_error(e, {"prompt": prompt, "user_id": user_id})
    
    if error_info.severity == ErrorSeverity.TRANSIENT:
        time.sleep(error_info.retry_after or 5.0)
        # Retry
    elif error_info.severity == ErrorSeverity.RECOVERABLE:
        # Modify request and retry
        prompt = truncate_prompt(prompt)
    else:
        # Permanent error - return error to user
        raise
```

## Circuit Breaker Pattern

Prevent cascading failures by stopping requests after repeated failures:

```python
from datetime import datetime, timedelta
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Too many failures, block requests
    HALF_OPEN = "half_open"  # Testing if service recovered

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        success_threshold: int = 2
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[datetime] = None
        
    def call(self, func: Callable[..., T], *args, **kwargs) -> T:
        """Execute function through circuit breaker."""
        
        # Check if circuit should transition to HALF_OPEN
        if (self.state == CircuitState.OPEN and 
            self.last_failure_time and
            datetime.now() - self.last_failure_time > timedelta(seconds=self.recovery_timeout)):
            self.state = CircuitState.HALF_OPEN
            self.success_count = 0
        
        # Block if circuit is OPEN
        if self.state == CircuitState.OPEN:
            raise Exception("Circuit breaker is OPEN - too many failures")
        
        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise
    
    def on_success(self):
        """Handle successful call."""
        self.failure_count = 0
        
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
                logging.info("Circuit breaker closed - service recovered")
    
    def on_failure(self):
        """Handle failed call."""
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logging.error(f"Circuit breaker opened after {self.failure_count} failures")
    
    def reset(self):
        """Manually reset circuit breaker."""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None

# Usage
breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60.0)

def call_llm_with_breaker(prompt: str):
    return breaker.call(lambda: openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    ))

# Automatically blocks requests if too many failures
try:
    response = call_llm_with_breaker("Hello")
except Exception as e:
    if "Circuit breaker" in str(e):
        # Use fallback strategy
        response = fallback_response()
```

## Fallback Strategies

```python
from typing import Optional, List, Callable

class LLMClient:
    def __init__(self):
        self.error_handler = LLMErrorHandler()
        self.circuit_breaker = CircuitBreaker()
        
    def complete_with_fallbacks(
        self,
        prompt: str,
        strategies: List[Callable] = None
    ) -> str:
        """Try multiple strategies with fallbacks."""
        
        if strategies is None:
            strategies = [
                lambda: self.call_primary_model(prompt),
                lambda: self.call_backup_model(prompt),
                lambda: self.call_cached_response(prompt),
                lambda: self.get_default_response()
            ]
        
        last_error = None
        
        for i, strategy in enumerate(strategies):
            try:
                return strategy()
            except Exception as e:
                last_error = e
                logging.warning(f"Strategy {i+1} failed: {e}")
                continue
        
        # All strategies failed
        raise Exception(f"All fallback strategies failed. Last error: {last_error}")
    
    def call_primary_model(self, prompt: str) -> str:
        """Primary model (best quality)."""
        return self.circuit_breaker.call(
            lambda: openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            ).choices[0].message.content
        )
    
    def call_backup_model(self, prompt: str) -> str:
        """Backup model (cheaper/faster)."""
        return openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        ).choices[0].message.content
    
    def call_cached_response(self, prompt: str) -> Optional[str]:
        """Try to return cached response."""
        cache_key = hashlib.sha256(prompt.encode()).hexdigest()
        cached = redis.get(f"llm_cache:{cache_key}")
        if cached:
            logging.info("Returning cached response")
            return cached.decode()
        raise Exception("No cached response")
    
    def get_default_response(self) -> str:
        """Safe default response."""
        return "I'm having trouble processing your request right now. Please try again later."

# Usage
client = LLMClient()
response = client.complete_with_fallbacks("Translate this to French: Hello")
# Tries: GPT-4 → GPT-3.5 → Cache → Default
```

## Graceful Degradation

```python
class DegradedResponse:
    """Marker for degraded responses."""
    def __init__(self, content: str, reason: str):
        self.content = content
        self.reason = reason
        self.is_degraded = True

def smart_completion(prompt: str, quality_tier: str = "high") -> str:
    """Automatically degrade quality if needed."""
    
    try:
        if quality_tier == "high":
            return call_gpt4(prompt)
    except Exception as e:
        logging.warning(f"High quality model failed: {e}")
        
        try:
            # Degrade to medium quality
            if quality_tier in ["high", "medium"]:
                result = call_gpt35(prompt)
                return DegradedResponse(
                    content=result,
                    reason="Primary model unavailable, used backup"
                )
        except Exception as e:
            logging.error(f"Medium quality model failed: {e}")
            
            # Final fallback
            return DegradedResponse(
                content="Service temporarily unavailable. Please try again.",
                reason="All models unavailable"
            )
```

## Monitoring and Alerting

```python
from dataclasses import dataclass
from collections import defaultdict
import time

@dataclass
class ErrorMetrics:
    total_errors: int = 0
    errors_by_type: dict = None
    error_rate: float = 0.0
    
    def __post_init__(self):
        if self.errors_by_type is None:
            self.errors_by_type = defaultdict(int)

class ErrorMonitor:
    def __init__(self, alert_threshold: float = 0.1):
        self.metrics = ErrorMetrics()
        self.total_requests = 0
        self.alert_threshold = alert_threshold
        self.window_start = time.time()
        
    def record_error(self, error_type: str):
        """Record an error occurrence."""
        self.metrics.total_errors += 1
        self.metrics.errors_by_type[error_type] += 1
        self.update_error_rate()
        
        if self.metrics.error_rate > self.alert_threshold:
            self.send_alert()
    
    def record_success(self):
        """Record successful request."""
        self.total_requests += 1
        self.update_error_rate()
    
    def update_error_rate(self):
        """Calculate current error rate."""
        if self.total_requests > 0:
            self.metrics.error_rate = self.metrics.total_errors / self.total_requests
    
    def send_alert(self):
        """Send alert when error rate is too high."""
        logging.critical(
            f"ERROR RATE ALERT: {self.metrics.error_rate:.1%} "
            f"({self.metrics.total_errors}/{self.total_requests} requests failed)"
        )
        # Integrate with PagerDuty, Slack, etc.
    
    def get_report(self) -> dict:
        """Get error metrics report."""
        return {
            "total_requests": self.total_requests,
            "total_errors": self.metrics.total_errors,
            "error_rate": f"{self.metrics.error_rate:.2%}",
            "errors_by_type": dict(self.metrics.errors_by_type),
            "uptime_seconds": time.time() - self.window_start
        }

# Usage
monitor = ErrorMonitor(alert_threshold=0.1)  # Alert if >10% errors

try:
    response = call_llm(prompt)
    monitor.record_success()
except Exception as e:
    error_type = classify_error(e)
    monitor.record_error(error_type)
    
# Periodic reporting
print(monitor.get_report())
```

## Best Practices

1. **Always retry transient errors** with exponential backoff
2. **Respect rate limits** - extract and honor retry-after headers
3. **Log errors with context** - include prompt, user, timestamp
4. **Implement circuit breakers** for repeated failures
5. **Have fallback strategies** - backup models, cached responses, defaults
6. **Monitor error rates** and alert on spikes
7. **Test error paths** - simulate failures in tests
8. **Document error handling** - team should know what happens when things fail
