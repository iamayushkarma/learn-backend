# HTTP Status Codes Reference

## Overview

HTTP status codes are 3-digit numbers that indicate the result of an HTTP request. They're grouped into 5 categories based on the first digit.

### Categories

- **1xx** - Informational (request received, continuing process)
- **2xx** - Success (request successfully received, understood, and accepted)
- **3xx** - Redirection (further action needed to complete the request)
- **4xx** - Client Error (request contains bad syntax or cannot be fulfilled)
- **5xx** - Server Error (server failed to fulfill a valid request)

---

## 1xx - Informational (Rare in App Dev)

### What they are

- Indicate that the request was received and is being processed.
- Rarely encountered in typical application development.
- More common in low-level network protocols and streaming.

### Common codes

- **100 Continue** - Server received headers, client should send body
- **101 Switching Protocols** - Server is switching protocols (e.g., WebSocket upgrade)

### When you might see them

- Large file uploads (100 Continue)
- WebSocket handshake (101 Switching Protocols)
- Server-Sent Events (SSE)

**Example:**

```http
HTTP/1.1 100 Continue
```

### Key point

- **You typically don't handle these** in application code.
- Handled automatically by HTTP clients/servers.

---

## 2xx - Success

All 2xx codes indicate the request was successfully received, understood, and accepted.

### 200 OK

**Most common success response.**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "Alice"
}
```

**When to use:**

- Successful GET request with data
- Successful PUT/PATCH with response body
- Successful DELETE with response body
- Any successful operation that returns data

---

### 201 Created

**Resource successfully created.**

```http
HTTP/1.1 201 Created
Location: /api/users/456
Content-Type: application/json

{
  "id": 456,
  "name": "Bob",
  "email": "bob@example.com"
}
```

**Key points:**

- Use for **POST** requests that create resources.
- Should include **Location header** pointing to new resource.
- Response body typically contains the created resource.

**Example request:**

```http
POST /api/users HTTP/1.1
Content-Type: application/json

{"name": "Bob", "email": "bob@example.com"}
```

---

### 202 Accepted

**Request accepted for processing, but not completed yet.**

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "message": "Processing started",
  "jobId": "abc-123",
  "statusUrl": "/api/jobs/abc-123"
}
```

**When to use:**

- **Asynchronous processing** (background jobs, queues)
- Long-running operations
- Batch processing

**Use cases:**

- Video processing (upload accepted, processing in background)
- Bulk imports/exports
- Email sending (queued)
- Data analysis jobs

**Key point:**

- Client should poll status or wait for callback/webhook.

---

### 204 No Content

**Request successful, but no response body.**

```http
HTTP/1.1 204 No Content
```

**When to use:**

- Successful **DELETE** (resource removed, nothing to return)
- Successful **PUT/PATCH** where updated resource isn't needed
- Actions that don't require response data

**Example:**

```http
DELETE /api/users/123 HTTP/1.1

→

HTTP/1.1 204 No Content
```

**Key point:**

- **No response body** - saves bandwidth when data isn't needed.
- Still indicates success.

---

## 3xx - Redirection

Client must take additional action to complete the request.

### 301 Moved Permanently

**Resource permanently moved to new URL.**

```http
HTTP/1.1 301 Moved Permanently
Location: https://newsite.com/page
```

**Key points:**

- **Permanent redirect** - update bookmarks, search engines update.
- Browsers cache this redirect.
- Future requests should use new URL.

**Use cases:**

- Site migration (old domain → new domain)
- URL restructuring
- HTTPS enforcement (sometimes)

---

### 308 Permanent Redirect

**Like 301, but method must not change.**

```http
HTTP/1.1 308 Permanent Redirect
Location: https://api.example.com/v2/users
```

**Difference from 301:**

- **301**: POST → may become GET
- **308**: POST → stays POST

**When to use:**

- API versioning (redirect to new endpoint)
- When you need to preserve HTTP method

---

### 302 Found (Temporary Redirect)

**Resource temporarily at different URL.**

```http
HTTP/1.1 302 Found
Location: /temporary-page
```

**Key points:**

- **Temporary redirect** - don't update bookmarks.
- Original URL should be used in future.
- Browsers don't cache (or cache short time).

**Use cases:**

- A/B testing
- Maintenance mode redirects
- Temporary URL changes

---

### 307 Temporary Redirect

**Like 302, but method must not change.**

```http
HTTP/1.1 307 Temporary Redirect
Location: /api/users
```

**Difference from 302:**

- **302**: POST → may become GET
- **307**: POST → stays POST

**When to use:**

- Temporary API endpoint changes
- Load balancing redirects

---

### 304 Not Modified

**Resource hasn't changed (caching).**

```http
HTTP/1.1 304 Not Modified
ETag: "abc123"
```

**How it works:**

1. **Initial request:**

```http
GET /api/users/123 HTTP/1.1

→

HTTP/1.1 200 OK
ETag: "abc123"
Last-Modified: Mon, 20 Jan 2025 10:00:00 GMT

{"id": 123, "name": "Alice"}
```

2. **Subsequent request with cache validation:**

```http
GET /api/users/123 HTTP/1.1
If-None-Match: "abc123"
If-Modified-Since: Mon, 20 Jan 2025 10:00:00 GMT

→

HTTP/1.1 304 Not Modified
(no body - use cached version)
```

**Key points:**

- **No response body** - client uses cached version.
- Saves bandwidth and improves performance.
- Requires cache headers (ETag, Last-Modified).

---

## 4xx - Client Errors

The request contains bad syntax or cannot be fulfilled. The client should not retry without modification.

### 400 Bad Request

**Malformed request or validation error.**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid request format",
  "details": "Missing required field: email"
}
```

**When to use:**

- **Invalid JSON** syntax
- **Missing required fields**
- **Wrong data types** (string instead of number)
- **Malformed URLs** or parameters

**Example causes:**

```json
// Missing required field
{"name": "Alice"}  // email required

// Invalid JSON
{name: "Alice"}  // missing quotes

// Wrong type
{"age": "thirty"}  // should be number
```

---

### 401 Unauthorized

**Authentication required or failed.**

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="API"
Content-Type: application/json

{
  "error": "Authentication required",
  "message": "Please provide a valid token"
}
```

**When to use:**

- **No credentials** provided
- **Invalid credentials** (wrong password)
- **Expired token**
- **Missing Authorization header**

**Note:** Despite the name, this is about **authentication** (who are you?), not authorization.

**Example:**

```http
GET /api/protected HTTP/1.1
(no Authorization header)

→

HTTP/1.1 401 Unauthorized
```

---

### 403 Forbidden

**Authenticated but not authorized.**

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "Access denied",
  "message": "You don't have permission to access this resource"
}
```

**When to use:**

- User **is authenticated** but lacks permissions
- Resource requires specific role/privilege
- IP address blocked
- Account suspended

**401 vs 403:**

- **401**: "I don't know who you are" → provide credentials
- **403**: "I know who you are, but you can't do this" → don't retry

**Example:**

```http
DELETE /api/admin/users/123 HTTP/1.1
Authorization: Bearer <regular-user-token>

→

HTTP/1.1 403 Forbidden
```

---

### 404 Not Found

**Resource doesn't exist.**

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Not found",
  "message": "User with ID 999 does not exist"
}
```

**When to use:**

- **Resource ID doesn't exist**
- **Invalid URL/endpoint**
- **Deleted resource** accessed

**Example:**

```http
GET /api/users/999 HTTP/1.1

→

HTTP/1.1 404 Not Found
```

**Key point:**

- Use 404 for **missing resources**, not for empty search results.
- Empty search → 200 OK with empty array.

---

### 405 Method Not Allowed

**HTTP method not supported for this resource.**

```http
HTTP/1.1 405 Method Not Allowed
Allow: GET, POST
Content-Type: application/json

{
  "error": "Method not allowed",
  "message": "DELETE is not supported for this endpoint"
}
```

**When to use:**

- Endpoint exists but doesn't support this method
- Should include **Allow header** with supported methods

**Example:**

```http
DELETE /api/search HTTP/1.1
(search endpoint only supports GET)

→

HTTP/1.1 405 Method Not Allowed
Allow: GET
```

---

### 409 Conflict

**Request conflicts with current state.**

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": "Conflict",
  "message": "User with email alice@example.com already exists"
}
```

**When to use:**

- **Duplicate resources** (unique constraint violation)
- **Version conflicts** (optimistic locking)
- **Concurrent updates** (race conditions)
- **Business rule violations**

**Common scenarios:**

```http
// Duplicate email
POST /api/users
{"email": "alice@example.com"}
→ 409 Conflict (email already exists)

// Concurrent update
PUT /api/users/123
If-Match: "v1"
→ 409 Conflict (resource version is now v2)

// Business rule
POST /api/orders/123/ship
→ 409 Conflict (order already shipped)
```

---

### 415 Unsupported Media Type

**Server doesn't support request content type.**

```http
HTTP/1.1 415 Unsupported Media Type
Content-Type: application/json

{
  "error": "Unsupported media type",
  "message": "Server only accepts application/json"
}
```

**When to use:**

- Wrong **Content-Type header**
- Server expects JSON but receives XML
- Missing Content-Type header for request with body

**Example:**

```http
POST /api/users HTTP/1.1
Content-Type: text/plain

alice,alice@example.com

→

HTTP/1.1 415 Unsupported Media Type
```

---

### 422 Unprocessable Entity

**Request is well-formed but semantically incorrect.**

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": "Validation failed",
  "errors": [
    {"field": "age", "message": "Age must be between 0 and 120"},
    {"field": "email", "message": "Email format is invalid"}
  ]
}
```

**When to use:**

- **Semantic validation errors** (business logic)
- Request syntax is valid but data doesn't make sense
- Field-level validation failures

**400 vs 422:**

- **400**: Syntax error (malformed JSON, wrong type)
- **422**: Semantic error (valid JSON, but age = -5)

**Example:**

```http
POST /api/users HTTP/1.1
Content-Type: application/json

{
  "name": "Alice",
  "email": "not-an-email",
  "age": -5
}

→

HTTP/1.1 422 Unprocessable Entity
```

**Note:** Some APIs use 400 for all validation errors (422 is optional).

---

### 429 Too Many Requests

**Rate limit exceeded.**

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642680000
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "message": "Try again in 60 seconds"
}
```

**When to use:**

- Client exceeded **API rate limits**
- Too many requests in time window

**Key headers:**

- **Retry-After**: Seconds to wait before retrying
- **X-RateLimit-Limit**: Max requests allowed
- **X-RateLimit-Remaining**: Requests remaining
- **X-RateLimit-Reset**: Timestamp when limit resets

**Example rate limit:**

- 100 requests per minute
- Request 101 → 429 Too Many Requests

---

## 5xx - Server Errors

The server failed to fulfill a valid request. Client can retry (with caution).

### 500 Internal Server Error

**Generic server error.**

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

**When it happens:**

- **Uncaught exceptions** in server code
- **Database errors**
- **Null pointer exceptions**
- **Any unhandled error**

**Key points:**

- **Don't expose stack traces** to clients (security risk)
- Log detailed errors server-side
- Show generic message to clients
- Client can retry (might be temporary)

**Example causes:**

- Database connection failure
- Unhandled null reference
- Missing configuration
- Third-party service failure

---

### 502 Bad Gateway

**Invalid response from upstream server.**

```http
HTTP/1.1 502 Bad Gateway
Content-Type: application/json

{
  "error": "Bad gateway",
  "message": "Unable to reach upstream service"
}
```

**When it happens:**

- **Reverse proxy** can't reach backend server
- **Load balancer** gets invalid response
- **API gateway** receives bad data from service

**Common scenarios:**

```
Browser → Nginx (proxy) → App Server (down)
                ↓
          502 Bad Gateway

Browser → API Gateway → Microservice (crashed)
                ↓
          502 Bad Gateway
```

**Key point:**

- Problem is with **upstream dependency**, not your app directly.

---

### 503 Service Unavailable

**Server temporarily unavailable.**

```http
HTTP/1.1 503 Service Unavailable
Retry-After: 120
Content-Type: application/json

{
  "error": "Service unavailable",
  "message": "Server is temporarily down for maintenance"
}
```

**When to use:**

- **Planned maintenance**
- **Server overload** (too many requests)
- **Temporary shutdown**
- **Resource exhaustion**

**Key points:**

- Should include **Retry-After header** (seconds or HTTP date)
- Indicates **temporary** condition
- Client should retry later

**Example scenarios:**

- Database maintenance window
- Server at max capacity
- Deploying new version
- Circuit breaker opened

---

### 504 Gateway Timeout

**Upstream server didn't respond in time.**

```http
HTTP/1.1 504 Gateway Timeout
Content-Type: application/json

{
  "error": "Gateway timeout",
  "message": "Upstream service did not respond in time"
}
```

**When it happens:**

- **Proxy/gateway** waiting for backend
- **Backend takes too long** to respond
- **Network timeout** to upstream service

**502 vs 504:**

- **502**: Upstream gave **bad/invalid response**
- **504**: Upstream **didn't respond** within timeout

**Common causes:**

- Slow database query
- External API timeout
- Network latency
- Deadlock in backend

**Example:**

```
Browser → API Gateway (30s timeout) → Microservice (60s processing)
                ↓
    504 Gateway Timeout (after 30s)
```

---

## Quick Reference Table

| Code | Name                   | Category | Meaning                               |
| ---- | ---------------------- | -------- | ------------------------------------- |
| 100  | Continue               | Info     | Continue sending request body         |
| 101  | Switching Protocols    | Info     | Switching to different protocol       |
| 200  | OK                     | Success  | Request successful, response has data |
| 201  | Created                | Success  | Resource created successfully         |
| 202  | Accepted               | Success  | Async processing started              |
| 204  | No Content             | Success  | Success, no response body             |
| 301  | Moved Permanently      | Redirect | Permanent redirect, update links      |
| 302  | Found                  | Redirect | Temporary redirect                    |
| 304  | Not Modified           | Redirect | Use cached version                    |
| 307  | Temporary Redirect     | Redirect | Temporary, preserve method            |
| 308  | Permanent Redirect     | Redirect | Permanent, preserve method            |
| 400  | Bad Request            | Client   | Malformed request/validation error    |
| 401  | Unauthorized           | Client   | Authentication required/failed        |
| 403  | Forbidden              | Client   | Authenticated but not authorized      |
| 404  | Not Found              | Client   | Resource doesn't exist                |
| 405  | Method Not Allowed     | Client   | HTTP method not supported             |
| 409  | Conflict               | Client   | Duplicate/version conflict            |
| 415  | Unsupported Media Type | Client   | Wrong Content-Type                    |
| 422  | Unprocessable Entity   | Client   | Semantic validation error             |
| 429  | Too Many Requests      | Client   | Rate limit exceeded                   |
| 500  | Internal Server Error  | Server   | Generic server error                  |
| 502  | Bad Gateway            | Server   | Invalid upstream response             |
| 503  | Service Unavailable    | Server   | Temporarily unavailable               |
| 504  | Gateway Timeout        | Server   | Upstream timeout                      |

---

## Common Patterns

### Success patterns

- **GET** → 200 (with data) or 404 (not found)
- **POST** → 201 (created) + Location header
- **PUT/PATCH** → 200 (with body) or 204 (no body)
- **DELETE** → 204 (no body) or 200 (with confirmation)

### Error patterns

- **Validation** → 400 (syntax) or 422 (semantics)
- **Auth** → 401 (who?) or 403 (permission denied)
- **Not found** → 404
- **Conflict** → 409
- **Server error** → 500 (app) or 502/503/504 (infrastructure)

### Retry logic

**Should retry (possibly transient):**

- 408 Request Timeout
- 429 Too Many Requests (after delay)
- 500 Internal Server Error (with backoff)
- 502 Bad Gateway
- 503 Service Unavailable (check Retry-After)
- 504 Gateway Timeout

**Should NOT retry:**

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 405 Method Not Allowed
- 409 Conflict
- 422 Unprocessable Entity
