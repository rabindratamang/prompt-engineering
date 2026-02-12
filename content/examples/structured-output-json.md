---
title: Structured Output (JSON)
description: Request parseable JSON output for reliable downstream processing
category: techniques
difficulty: intermediate
template: |
  Task: {describe what to extract or generate}
  
  Output format: Respond with valid JSON matching this schema:
  {
    "field1": "type and description",
    "field2": "type and description",
    "field3": ["array of items"]
  }
  
  Important: Respond ONLY with the JSON object. No markdown, no explanation.
  
  Input:
  {user_input}
  
  JSON:
pitfalls:
  - Not specifying "valid JSON only" (model adds explanation)
  - Undefined schema (model guesses structure)
  - Not handling null/missing values
  - Complex nested schemas without examples
  - Not validating output in your code
checklist:
  - Define exact JSON schema with types
  - Specify handling of missing/null values
  - Request "valid JSON only, no markdown"
  - Provide example output for complex schemas
  - Validate JSON in your application code
  - Handle malformed responses gracefully
  - Consider using JSON mode if API supports it
---

## Problem

Free-form text responses are hard to parse and use in applications. You need structured data that can be reliably processed by code.

## Solution

Explicitly request JSON output with a defined schema. Make it clear the model should respond with ONLY valid JSON.

## When to Use

**Use JSON output when:**
- Building APIs or microservices
- Need programmatic parsing of results
- Integrating LLM into larger systems
- Extracting structured data
- Feeding results to downstream processes
- Need validation and type safety

**Essential for:**
- Production applications
- Data extraction pipelines
- Automated workflows
- Integration with databases
- Multi-step processing chains

## Pros

✅ **Parseable** - Reliable programmatic access to data  
✅ **Validation** - Can verify schema compliance  
✅ **Type safety** - Define expected types  
✅ **Integration friendly** - Works with any system  
✅ **Error handling** - Catch malformed outputs  
✅ **API support** - Many models have JSON mode

## Cons

❌ **More complex prompting** - Must define schema clearly  
❌ **Still can fail** - Model may produce invalid JSON  
❌ **Need validation layer** - Always validate, never trust  
❌ **Verbose schemas** - Complex structures use many tokens  
❌ **Limited flexibility** - Rigid structure may miss nuance  
❌ **Debugging harder** - Errors less human-readable

## Basic JSON Extraction

```
Extract key information from this customer support ticket and format as JSON.

Required fields:
- customer_name (string)
- issue_category (string: "billing", "technical", or "general")
- priority (string: "low", "medium", "high")
- summary (string, max 100 chars)

Ticket:
---
{ticket_text}
---

Respond with ONLY valid JSON. No explanation or markdown.

JSON:
```

## Handling Optional Fields

```
Output JSON schema:
{
  "required_field": "always present",
  "optional_field": "string or null if not found",
  "list_field": ["empty array if none"]
}

Rules:
- Use null for missing optional fields
- Use empty array [] for missing lists
- Never omit fields from the schema
```

## Complex Nested Example

```
Extract product information and format as JSON.

Schema:
{
  "product": {
    "name": "string",
    "price": {
      "amount": number,
      "currency": "USD" | "EUR" | "GBP"
    },
    "features": ["array of strings"],
    "reviews": [
      {
        "rating": number (1-5),
        "comment": "string or null"
      }
    ]
  }
}

Product description:
{description}

Output valid JSON only:
```

## JSON Mode (API Feature)

Many LLM APIs now support a JSON mode parameter:

```json
{
  "model": "gpt-4",
  "response_format": { "type": "json_object" },
  "messages": [...]
}
```

This guarantees valid JSON, but you still need to:
1. Specify the schema in your prompt
2. Validate the schema matches your needs
3. Handle unexpected fields gracefully

## Validation in Your Code

Always validate the output:

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = {
  type: "object",
  required: ["name", "priority"],
  properties: {
    name: { type: "string" },
    priority: { type: "string", enum: ["low", "medium", "high"] }
  }
};

const validate = ajv.compile(schema);

// After getting LLM response:
const parsed = JSON.parse(response);
if (!validate(parsed)) {
  console.error("Invalid JSON:", validate.errors);
  // Handle error
}
```

## Formatting Tips

### ✓ Do:
- Request "valid JSON only"
- Define all fields explicitly
- Specify types and constraints
- Show example output for complex schemas
- Validate in your application

### ✗ Don't:
- Allow markdown code blocks (```json)
- Use undefined schemas
- Assume fields will be present
- Skip validation
- Ignore malformed responses

## Example: Article Metadata Extraction

```
Extract metadata from this article and output as JSON.

Schema (respond with ONLY this JSON, no other text):
{
  "title": "string",
  "author": "string or null",
  "publish_date": "YYYY-MM-DD or null",
  "topics": ["array of topic strings"],
  "summary": "string, max 200 chars",
  "word_count": number
}

Article:
---
{article_text}
---

JSON:
```
