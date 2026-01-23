# HTTP Methods Guide

## 1) GET - Fetch Resources

### What it is

- Retrieves data from the server without modifying anything.
- The most common HTTP method (every webpage load, API data fetch).

### Properties

- ✅ **Safe**: Doesn't change server state
- ✅ **Idempotent**: Multiple identical requests = same result
- ✅ **Cacheable**: Responses can be cached by browsers/proxies

### Usage

```http
GET /api/users HTTP/1.1
Host: example.com
```

```http
GET /api/users/123 HTTP/1.1
Host: example.com
```

```http
GET /api/products?category=electronics&sort=price HTTP/1.1
Host: example.com
```

### Key points

- **No request body** (data goes in URL via query params).
- Used for reading/retrieving data only.
- Can be bookmarked, shared, cached.
- Should **never** modify server state (no side effects).

### Common use cases

- Loading web pages
- Fetching API data (list of users, product details)
- Searching/filtering (`?q=search&page=2`)
- Downloading files

---

## 2) POST - Create or Trigger Processing

### What it is

- Sends data to the server to create a new resource or trigger an action.
- The request body contains the data to be processed.

### Properties

- ❌ **Not safe**: Changes server state
- ❌ **Not idempotent**: Multiple requests create multiple resources
- ⚠️ **Not cacheable** (by default)

### Usage

**Creating a new user:**

```http
POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com"
}
```

**Submitting a form:**

```http
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

username=alice&password=secret123
```

**Triggering an action:**

```http
POST /api/orders/123/ship HTTP/1.1
Host: example.com
```

### Key points

- **Has a request body** with data to send.
- Each request typically creates a **new resource** (new ID).
- Calling POST 5 times = 5 new resources (not idempotent).
- Server usually returns `201 Created` with location of new resource.

### Common use cases

- Creating new records (users, posts, orders)
- Submitting forms (login, registration, contact)
- Uploading files
- Triggering actions (send email, process payment)

### Response example

```http
HTTP/1.1 201 Created
Location: /api/users/456
Content-Type: application/json

{
  "id": 456,
  "name": "Alice",
  "email": "alice@example.com"
}
```

---

## 3) PUT - Replace Full Resource

### What it is

- Replaces the **entire resource** at a specific URI.
- If the resource doesn't exist, it can create it (if allowed).

### Properties

- ❌ **Not safe**: Changes server state
- ✅ **Idempotent**: Same request multiple times = same final state
- ❌ **Not cacheable**

### Usage

**Update entire user (replace all fields):**

```http
PUT /api/users/123 HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "name": "Alice Updated",
  "email": "alice.new@example.com",
  "age": 30,
  "city": "New York"
}
```

### Key points

- **Requires full representation** of the resource.
- Missing fields may be set to `null` or defaults.
- **Idempotent**: Calling PUT 5 times with same data = same result.
- Client specifies the exact URI (`/users/123`).

### PUT vs POST

| Aspect         | PUT                             | POST                         |
| -------------- | ------------------------------- | ---------------------------- |
| URI            | Client specifies (`/users/123`) | Server assigns (`/users`)    |
| Idempotent     | ✅ Yes                          | ❌ No                        |
| Purpose        | Replace entire resource         | Create new or trigger action |
| Multiple calls | Same final state                | Multiple new resources       |

### Common use cases

- Replacing entire resource
- "Save" or "overwrite" operations
- Updating all fields of a record

### Response example

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "Alice Updated",
  "email": "alice.new@example.com",
  "age": 30,
  "city": "New York"
}
```

---

## 4) PATCH - Partial Update

### What it is

- Updates **part of a resource** without replacing the entire thing.
- Only sends the fields that need to change.

### Properties

- ❌ **Not safe**: Changes server state
- ⚠️ **Not necessarily idempotent**: Depends on implementation
- ❌ **Not cacheable**

### Usage

**Update only the email:**

```http
PATCH /api/users/123 HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "email": "alice.newemail@example.com"
}
```

**Update multiple fields:**

```http
PATCH /api/users/123 HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "age": 31,
  "city": "San Francisco"
}
```

### Key points

- **Only sends changed fields** (more efficient than PUT).
- Other fields remain unchanged.
- Can be idempotent if implemented carefully.
- Less standardized than PUT (implementation varies).

### Idempotency considerations

**Idempotent PATCH:**

```json
{ "age": 31 } // Set age to 31 (always same result)
```

**Non-idempotent PATCH:**

```json
{ "age_increment": 1 } // Increment age by 1 (different result each time)
```

### PATCH vs PUT

| Aspect         | PATCH               | PUT                |
| -------------- | ------------------- | ------------------ |
| Data sent      | Only changed fields | Full resource      |
| Efficiency     | More efficient      | Less efficient     |
| Missing fields | Remain unchanged    | May be set to null |
| Idempotent     | Sometimes           | Always             |

### Common use cases

- Updating specific fields (email, password, status)
- Profile updates (change avatar, bio)
- Toggling flags (active/inactive)

### Response example

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "Alice",
  "email": "alice.newemail@example.com",
  "age": 31,
  "city": "San Francisco"
}
```

---

## 5) DELETE - Remove Resource

### What it is

- Removes a resource from the server.
- After successful deletion, the resource no longer exists.

### Properties

- ❌ **Not safe**: Changes server state
- ✅ **Idempotent**: Deleting same resource multiple times = same result
- ❌ **Not cacheable**

### Usage

```http
DELETE /api/users/123 HTTP/1.1
Host: example.com
```

```http
DELETE /api/posts/456 HTTP/1.1
Host: example.com
Authorization: Bearer <token>
```

### Key points

- Usually **no request body** needed.
- First call: deletes resource (returns `200` or `204`).
- Subsequent calls: resource already gone (returns `404` or `204`).
- **Idempotent**: Final state is the same (resource doesn't exist).

### Response variations

**Successful deletion with body:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "User deleted successfully",
  "id": 123
}
```

**Successful deletion without body:**

```http
HTTP/1.1 204 No Content
```

**Resource already deleted:**

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "User not found"
}
```

**Or idempotent response:**

```http
HTTP/1.1 204 No Content
```

### Idempotency behavior

- **DELETE /users/123** first time → user deleted (`200`/`204`)
- **DELETE /users/123** second time → already gone (`404` or `204`)
- **Final state**: user 123 doesn't exist (idempotent ✅)

### Common use cases

- Deleting records (users, posts, comments)
- Removing items from cart
- Canceling subscriptions
- Clearing cache entries

---

## 6) HEAD - Like GET Without Body

### What it is

- Identical to GET but the server **doesn't return a response body**.
- Only returns headers (metadata).

### Properties

- ✅ **Safe**: Doesn't change server state
- ✅ **Idempotent**: Same request = same headers
- ✅ **Cacheable**

### Usage

```http
HEAD /api/users/123 HTTP/1.1
Host: example.com
```

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 245
Last-Modified: Mon, 20 Jan 2025 10:30:00 GMT
ETag: "abc123xyz"

(no body)
```

### Key points

- Same headers as GET would return.
- **No response body** (saves bandwidth).
- Useful for checking metadata without downloading content.

### Common use cases

- Check if a resource exists (status code)
- Get file size before downloading (`Content-Length`)
- Check last modification time (`Last-Modified`)
- Validate cache (`ETag`)
- Test API endpoints

### Example use case

**Check if large file exists before downloading:**

```http
HEAD /downloads/large-file.zip HTTP/1.1
Host: example.com
```

If `200 OK` → file exists, check `Content-Length` → decide to download.
If `404 Not Found` → don't attempt download.

---

## 7) OPTIONS - Discover Server Capabilities

### What it is

- Asks the server what HTTP methods and headers are allowed for a resource.
- **Critical for CORS** (Cross-Origin Resource Sharing).

### Properties

- ✅ **Safe**: Doesn't change server state
- ✅ **Idempotent**: Same request = same allowed methods
- ❌ **Not cacheable** (usually)

### Usage

```http
OPTIONS /api/users HTTP/1.1
Host: example.com
```

### Response

```http
HTTP/1.1 204 No Content
Allow: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### Key points

- Returns `Allow` header with supported methods.
- Used in **CORS preflight requests**.
- Helps clients discover what operations are possible.

### CORS Preflight Request

When a browser makes a cross-origin request with custom headers or non-simple methods (PUT, DELETE, PATCH), it first sends an OPTIONS request:

**Preflight request:**

```http
OPTIONS /api/users HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: Authorization
```

**Preflight response:**

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization
Access-Control-Max-Age: 3600
```

**Then the actual request:**

```http
DELETE /api/users/123 HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Authorization: Bearer <token>
```

### Common use cases

- **CORS preflight** (automatic by browsers)
- API discovery (what can I do here?)
- Testing server capabilities
- Debugging cross-origin issues

---

## 8) TRACE & CONNECT (Awareness Level)

### TRACE

**What it is:**

- Echoes back the received request for debugging.
- Helps see what changes intermediaries (proxies) make.

**Usage:**

```http
TRACE /api/test HTTP/1.1
Host: example.com
```

**Response:**

```http
HTTP/1.1 200 OK
Content-Type: message/http

TRACE /api/test HTTP/1.1
Host: example.com
User-Agent: ...
```

**Security note:**

- Often **disabled** due to security risks (can expose headers).
- Rarely used in practice.

---

### CONNECT

**What it is:**

- Establishes a tunnel to the server (used for HTTPS through proxies).
- Converts connection to a TCP tunnel.

**Usage:**

```http
CONNECT example.com:443 HTTP/1.1
Host: example.com
```

**Key points:**

- Used by proxies to establish SSL/TLS tunnels.
- **Not used in typical application development**.
- Handled by infrastructure (proxies, load balancers).

---

## Quick Reference Table

| Method  | Safe | Idempotent | Request Body | Response Body | Common Use                   |
| ------- | ---- | ---------- | ------------ | ------------- | ---------------------------- |
| GET     | ✅   | ✅         | ❌           | ✅            | Fetch data                   |
| POST    | ❌   | ❌         | ✅           | ✅            | Create resource              |
| PUT     | ❌   | ✅         | ✅           | ✅            | Replace entire resource      |
| PATCH   | ❌   | ⚠️         | ✅           | ✅            | Partial update               |
| DELETE  | ❌   | ✅         | ❌\*         | ⚠️            | Remove resource              |
| HEAD    | ✅   | ✅         | ❌           | ❌            | Get headers only             |
| OPTIONS | ✅   | ✅         | ❌           | ✅            | Discover capabilities (CORS) |
| TRACE   | ✅   | ✅         | ❌           | ✅            | Echo request (debugging)     |
| CONNECT | ❌   | ❌         | ❌           | ⚠️            | Establish tunnel             |

\*DELETE can have a body but it's uncommon and not recommended.
