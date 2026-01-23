# HTTP Headers Guide

## Overview

HTTP headers are key-value pairs sent in requests and responses that provide metadata about the HTTP message. They control caching, authentication, content type, security, and more.

### Header format

```http
Header-Name: value
Another-Header: value1, value2
```

**Key points:**

- Headers are **case-insensitive** (`Content-Type` = `content-type`)
- Multiple values separated by commas
- Custom headers often start with `X-` (legacy convention)

---

## Request Headers

Headers sent **from client to server** with each request.

---

### Authorization

**Provides credentials to authenticate the client.**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

#### Types

**Bearer Token (most common for APIs):**

```http
GET /api/protected HTTP/1.1
Host: api.example.com
Authorization: Bearer <JWT-token>
```

**Basic Authentication:**

```http
GET /api/data HTTP/1.1
Host: api.example.com
Authorization: Basic dXNlcjpwYXNz
```

- Format: `username:password` encoded in Base64
- **Not secure without HTTPS** (easily decoded)
- Rarely used in modern APIs

**Other schemes:**

- `Digest` - More secure than Basic
- `OAuth` - OAuth 1.0 (rare now)
- `API-Key` - Custom scheme (non-standard)

#### Use cases

- API authentication (JWT tokens)
- Protected endpoints
- User-specific data access

#### Common patterns

```javascript
// Frontend sending token
fetch("/api/users", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

### Content-Type

**Indicates the media type of the request body.**

```http
POST /api/users HTTP/1.1
Content-Type: application/json

{"name": "Alice", "email": "alice@example.com"}
```

#### Common values

**JSON (most common for APIs):**

```http
Content-Type: application/json
```

**Form data:**

```http
Content-Type: application/x-www-form-urlencoded

username=alice&password=secret
```

**Multipart form (file uploads):**

```http
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

(binary data)
------WebKitFormBoundary--
```

**Plain text:**

```http
Content-Type: text/plain
```

**XML:**

```http
Content-Type: application/xml
```

#### Key points

- **Required** for requests with body (POST, PUT, PATCH)
- Not needed for GET/DELETE (no body)
- Mismatch causes **415 Unsupported Media Type**

---

### Accept

**Tells server what content types the client can handle.**

```http
GET /api/users/123 HTTP/1.1
Accept: application/json
```

#### Common values

**Prefer JSON:**

```http
Accept: application/json
```

**Accept multiple formats:**

```http
Accept: application/json, application/xml
```

**Quality values (preferences):**

```http
Accept: application/json;q=1.0, application/xml;q=0.8, text/html;q=0.5
```

- `q=1.0` - Most preferred (default)
- `q=0.8` - Second choice
- `q=0.5` - Last resort

**Accept anything:**

```http
Accept: */*
```

#### Related headers

```http
Accept-Language: en-US, en;q=0.9, es;q=0.8
Accept-Encoding: gzip, deflate, br
Accept-Charset: utf-8
```

#### Use cases

- Content negotiation
- API versioning (different formats)
- Internationalization

#### Server response

If server can't provide requested format → **406 Not Acceptable**

---

### User-Agent

**Identifies the client application, OS, and browser.**

```http
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

#### Common examples

**Chrome:**

```http
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

**Mobile Safari:**

```http
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1
```

**Custom API client:**

```http
User-Agent: MyApp/1.0 (contact@example.com)
```

**curl:**

```http
User-Agent: curl/7.68.0
```

#### Use cases

- **Analytics** (track browser usage)
- **Responsive design** (detect mobile)
- **Bot detection**
- **Feature detection** (browser capabilities)
- **API rate limiting** (per client)

#### Key points

- Sent automatically by browsers
- Can be customized in API clients
- Used for logging and debugging

---

### Origin

**Indicates where the request originated (for CORS).**

```http
GET /api/users HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
```

#### Format

```http
Origin: <scheme>://<hostname>[:<port>]
```

**Examples:**

```http
Origin: https://myapp.com
Origin: http://localhost:3000
Origin: https://app.example.com:8080
```

#### Use cases

- **CORS (Cross-Origin Resource Sharing)**
- Security checks (validate allowed origins)
- Prevent CSRF attacks

#### How CORS works

**Browser sends:**

```http
GET /api/data HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
```

**Server responds:**

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
```

**If origins don't match → browser blocks response**

#### Key points

- **Set automatically by browser** (can't be modified via JavaScript)
- Only sent for **cross-origin requests**
- Not sent for same-origin requests

---

### Referer

**URL of the page that linked to current request.**

```http
GET /product/123 HTTP/1.1
Host: shop.example.com
Referer: https://shop.example.com/category/electronics
```

#### Use cases

- **Analytics** (where did traffic come from?)
- **Security** (validate request source)
- **Link tracking**
- **A/B testing**

#### Examples

**User clicked link on search results:**

```http
GET /article HTTP/1.1
Referer: https://www.google.com/search?q=http+basics
```

**User navigated from homepage:**

```http
GET /products HTTP/1.1
Referer: https://shop.example.com/
```

**Direct access (no Referer):**

```http
GET /page HTTP/1.1
(no Referer header - typed URL directly or from bookmark)
```

#### Privacy considerations

- **Referer Policy** controls what's sent
- Can leak sensitive URLs (e.g., with tokens)
- HTTPS → HTTP drops Referer by default

#### Controlling Referer

```html
<a href="/page" rel="noreferrer">Link</a>
```

```http
Referrer-Policy: no-referrer
Referrer-Policy: strict-origin-when-cross-origin
```

**Note:** Header name is misspelled (`Referer` not `Referrer`)

---

### Cookie

**Sends stored cookies to the server.**

```http
GET /dashboard HTTP/1.1
Host: example.com
Cookie: sessionId=abc123; theme=dark; lang=en
```

#### Format

```http
Cookie: name1=value1; name2=value2; name3=value3
```

#### How cookies work

**1. Server sets cookie (first visit):**

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure

Welcome to our site!
```

**2. Browser stores cookie**

**3. Browser sends cookie on subsequent requests:**

```http
GET /profile HTTP/1.1
Cookie: sessionId=abc123
```

#### Common uses

- **Session management** (logged in state)
- **Personalization** (theme, language)
- **Tracking** (analytics, ads)
- **Shopping cart**

#### Example

```http
Cookie: session=xyz789; cart=item1,item2; preferences={"theme":"dark"}
```

#### Key points

- Multiple cookies sent as **one header** (semicolon-separated)
- Sent automatically by browser
- Domain and path restrictions apply
- Size limit: ~4KB per cookie

---

### If-None-Match / If-Modified-Since

**Conditional requests for caching.**

#### If-None-Match (ETag validation)

**First request:**

```http
GET /api/users/123 HTTP/1.1

→

HTTP/1.1 200 OK
ETag: "abc123xyz"
Cache-Control: max-age=3600

{"id": 123, "name": "Alice"}
```

**Subsequent request (validating cache):**

```http
GET /api/users/123 HTTP/1.1
If-None-Match: "abc123xyz"

→ (if not modified)

HTTP/1.1 304 Not Modified
ETag: "abc123xyz"
(no body - use cached version)

→ (if modified)

HTTP/1.1 200 OK
ETag: "def456uvw"

{"id": 123, "name": "Alice Updated"}
```

#### If-Modified-Since (time-based validation)

**First request:**

```http
GET /image.jpg HTTP/1.1

→

HTTP/1.1 200 OK
Last-Modified: Mon, 20 Jan 2025 10:00:00 GMT
Cache-Control: max-age=3600

(image data)
```

**Subsequent request:**

```http
GET /image.jpg HTTP/1.1
If-Modified-Since: Mon, 20 Jan 2025 10:00:00 GMT

→ (if not modified)

HTTP/1.1 304 Not Modified
(no body - use cached version)

→ (if modified)

HTTP/1.1 200 OK
Last-Modified: Mon, 20 Jan 2025 14:00:00 GMT

(new image data)
```

#### Benefits

- **Saves bandwidth** (304 responses have no body)
- **Faster responses** (server doesn't regenerate data)
- **Cache validation** (ensure freshness)

#### ETag vs Last-Modified

- **ETag**: Content-based (hash of content)
- **Last-Modified**: Time-based (modification timestamp)
- **ETag is more accurate** (catches changes within same second)

---

## Response Headers

Headers sent **from server to client** with each response.

---

### Set-Cookie

**Instructs browser to store a cookie.**

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
```

#### Attributes

**Basic cookie:**

```http
Set-Cookie: name=value
```

**With expiration (absolute time):**

```http
Set-Cookie: sessionId=abc123; Expires=Wed, 21 Jan 2026 07:28:00 GMT
```

**With max age (relative time in seconds):**

```http
Set-Cookie: sessionId=abc123; Max-Age=3600
```

- 3600 seconds = 1 hour

**Domain and Path:**

```http
Set-Cookie: token=xyz; Domain=example.com; Path=/api
```

- Only sent to `example.com` and subdomains
- Only for paths starting with `/api`

**Security flags:**

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
```

#### Security attributes explained

**HttpOnly:**

- Cookie **not accessible via JavaScript**
- Prevents XSS attacks from stealing cookies

```http
Set-Cookie: session=abc; HttpOnly
```

**Secure:**

- Cookie **only sent over HTTPS**
- Prevents interception over unencrypted connections

```http
Set-Cookie: session=abc; Secure
```

**SameSite:**

- Controls cross-site cookie sending
- Prevents CSRF attacks

```http
Set-Cookie: session=abc; SameSite=Strict
```

- **Strict**: Never sent cross-site
- **Lax**: Sent on top-level navigation (GET only)
- **None**: Always sent (requires `Secure`)

#### Multiple cookies

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; HttpOnly; Secure
Set-Cookie: theme=dark; Max-Age=31536000
Set-Cookie: lang=en; Path=/
```

#### Delete cookie

```http
Set-Cookie: sessionId=; Max-Age=0
Set-Cookie: oldCookie=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

### Cache-Control

**Directives for caching mechanisms.**

```http
Cache-Control: max-age=3600, must-revalidate
```

#### Common directives

**No caching:**

```http
Cache-Control: no-store
```

- **Don't cache this response** at all
- Use for sensitive data (banking, personal info)

**Cache but revalidate:**

```http
Cache-Control: no-cache
```

- Cache it, but **validate with server before using**
- Always sends conditional request (If-None-Match)

**Public caching (CDN):**

```http
Cache-Control: public, max-age=86400
```

- Can be cached by **any cache** (browsers, proxies, CDNs)
- `max-age=86400` = 24 hours

**Private caching (browser only):**

```http
Cache-Control: private, max-age=3600
```

- Only **browser cache**, not CDNs/proxies
- Use for user-specific data

**Stale-while-revalidate:**

```http
Cache-Control: max-age=600, stale-while-revalidate=86400
```

- Serve cached version up to 10 minutes
- After that, serve stale version while fetching fresh one

**Must revalidate:**

```http
Cache-Control: max-age=3600, must-revalidate
```

- After expiry, **must validate** before using stale cache

#### Use case examples

**Static assets (long cache):**

```http
Cache-Control: public, max-age=31536000, immutable
```

- 1 year cache
- `immutable` = never changes (use versioned URLs)

**API responses (short cache):**

```http
Cache-Control: private, max-age=300
```

- 5 minutes browser cache

**Sensitive data (no cache):**

```http
Cache-Control: no-store, no-cache, must-revalidate
```

**HTML pages (validate every time):**

```http
Cache-Control: no-cache
```

---

### ETag / Last-Modified

**Resource versioning for cache validation.**

#### ETag (Entity Tag)

**Unique identifier for specific version of resource.**

```http
HTTP/1.1 200 OK
ETag: "abc123xyz"
Content-Type: application/json

{"id": 123, "name": "Alice"}
```

**Strong ETag:**

```http
ETag: "abc123"
```

- Byte-for-byte identical

**Weak ETag:**

```http
ETag: W/"abc123"
```

- Semantically equivalent (might differ in whitespace)

#### Last-Modified

**Timestamp of last modification.**

```http
HTTP/1.1 200 OK
Last-Modified: Mon, 20 Jan 2025 10:00:00 GMT
Content-Type: image/jpeg

(image data)
```

#### How they work together

**Initial request:**

```http
GET /api/data HTTP/1.1

→

HTTP/1.1 200 OK
ETag: "v123"
Last-Modified: Mon, 20 Jan 2025 10:00:00 GMT
Cache-Control: max-age=3600

{"data": "..."}
```

**Cached, then validating:**

```http
GET /api/data HTTP/1.1
If-None-Match: "v123"
If-Modified-Since: Mon, 20 Jan 2025 10:00:00 GMT

→ (not modified)

HTTP/1.1 304 Not Modified
```

#### Generating ETags

```javascript
// Simple hash-based ETag
const crypto = require("crypto");
const data = JSON.stringify(obj);
const etag = crypto.createHash("md5").update(data).digest("hex");

res.set("ETag", `"${etag}"`);
```

---

### Location

**URL of a resource (used with redirects and creation).**

#### With 3xx redirects

```http
HTTP/1.1 301 Moved Permanently
Location: https://newsite.com/page
```

```http
HTTP/1.1 302 Found
Location: /temporary-page
```

#### With 201 Created

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

#### Formats

**Absolute URL:**

```http
Location: https://example.com/resource
```

**Relative to server:**

```http
Location: /api/users/123
```

**Relative to current path:**

```http
Location: ../parent/resource
```

#### Use cases

- Redirects (301, 302, 307, 308)
- Resource creation (201)
- Post-login redirects
- Canonical URLs

---

### Access-Control-\* (CORS)

**Control cross-origin resource sharing.**

#### Access-Control-Allow-Origin

**Specifies allowed origins.**

```http
Access-Control-Allow-Origin: https://myapp.com
```

**Allow all origins (public API):**

```http
Access-Control-Allow-Origin: *
```

**Allow multiple origins (requires dynamic check):**

```javascript
// Server-side logic
const allowedOrigins = ["https://app1.com", "https://app2.com"];
const origin = req.headers.origin;

if (allowedOrigins.includes(origin)) {
  res.set("Access-Control-Allow-Origin", origin);
}
```

#### Access-Control-Allow-Methods

**Allowed HTTP methods.**

```http
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

#### Access-Control-Allow-Headers

**Allowed request headers.**

```http
Access-Control-Allow-Headers: Content-Type, Authorization, X-Custom-Header
```

#### Access-Control-Allow-Credentials

**Allow cookies and auth headers.**

```http
Access-Control-Allow-Credentials: true
```

**Note:** Can't use `*` for origin when credentials are allowed.

#### Access-Control-Max-Age

**How long preflight response can be cached.**

```http
Access-Control-Max-Age: 86400
```

- 86400 seconds = 24 hours

#### Complete CORS response

**Preflight OPTIONS request:**

```http
OPTIONS /api/users HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: Authorization

→

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Actual request:**

```http
DELETE /api/users/123 HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Authorization: Bearer <token>

→

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true

{"message": "User deleted"}
```

---

### Content-Security-Policy (CSP)

**Controls which resources can be loaded (XSS protection).**

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'
```

#### Common directives

**Only load from same origin:**

```http
Content-Security-Policy: default-src 'self'
```

**Allow scripts from specific domains:**

```http
Content-Security-Policy: script-src 'self' https://cdn.example.com https://analytics.google.com
```

**Allow inline styles (not recommended):**

```http
Content-Security-Policy: style-src 'self' 'unsafe-inline'
```

**Block all plugins (Flash, Java):**

```http
Content-Security-Policy: object-src 'none'
```

**Comprehensive example:**

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
```

#### Directives explained

- **default-src**: Fallback for everything
- **script-src**: JavaScript sources
- **style-src**: CSS sources
- **img-src**: Image sources
- **font-src**: Font sources
- **connect-src**: AJAX, WebSocket, EventSource
- **frame-ancestors**: Who can embed this page
- **form-action**: Where forms can submit

#### Report violations

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

---

### Strict-Transport-Security (HSTS)

**Forces HTTPS connections.**

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

#### Attributes

**Basic (1 year):**

```http
Strict-Transport-Security: max-age=31536000
```

**Include all subdomains:**

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Preload (hardcoded in browsers):**

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

#### How it works

**First visit (HTTP → HTTPS redirect):**

```http
HTTP/1.1 301 Moved Permanently
Location: https://example.com
```

**HTTPS response sets HSTS:**

```http
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**All future requests (browser forces HTTPS):**

- User types `http://example.com`
- Browser **automatically** converts to `https://example.com`
- No HTTP request sent (prevents MITM attacks)

#### Key points

- **Only works over HTTPS** (ignored on HTTP)
- Protects against protocol downgrade attacks
- Browser remembers for `max-age` seconds
- Use `preload` for maximum security (submit to browser vendors)

---

### X-Content-Type-Options

**Prevents MIME type sniffing.**

```http
X-Content-Type-Options: nosniff
```

#### Problem it solves

**Without this header:**

```http
HTTP/1.1 200 OK
Content-Type: text/plain

<script>alert('XSS')</script>
```

- Browser might execute as JavaScript (MIME sniffing)

**With nosniff:**

```http
HTTP/1.1 200 OK
Content-Type: text/plain
X-Content-Type-Options: nosniff

<script>alert('XSS')</script>
```

- Browser treats it **strictly as text/plain**
- Won't execute as JavaScript

#### Use case

```http
X-Content-Type-Options: nosniff
```

- **Always include** for security
- Prevents browsers from misinterpreting content type
- Stops XSS attacks via uploaded files

---

### X-Frame-Options

**Controls if page can be embedded in iframe (clickjacking protection).**

```http
X-Frame-Options: DENY
```

#### Options

**Never allow framing:**

```http
X-Frame-Options: DENY
```

**Allow framing from same origin:**

```http
X-Frame-Options: SAMEORIGIN
```

**Allow framing from specific domain (deprecated):**

```http
X-Frame-Options: ALLOW-FROM https://trusted.com
```

#### Clickjacking attack it prevents

**Attacker's site:**

```html
<iframe src="https://bank.com/transfer?amount=1000&to=attacker"></iframe>
<div style="opacity: 0; position: absolute; top: 0;">
  Click here to win a prize!
</div>
```

**With X-Frame-Options:**

```http
HTTP/1.1 200 OK
X-Frame-Options: DENY
```

- Browser refuses to load bank.com in iframe
- Clickjacking attack prevented

#### Modern alternative (CSP)

```http
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy: frame-ancestors 'self'
Content-Security-Policy: frame-ancestors https://trusted.com
```

#### Use case

```http
X-Frame-Options: SAMEORIGIN
```

- Prevents clickjacking attacks
- Legacy but still widely supported
- Use CSP `frame-ancestors` for better control

---

## Quick Reference Table

### Request Headers

| Header            | Purpose                    | Example                         |
| ----------------- | -------------------------- | ------------------------------- |
| Authorization     | Authentication credentials | `Bearer <token>`                |
| Content-Type      | Request body format        | `application/json`              |
| Accept            | Desired response format    | `application/json`              |
| User-Agent        | Client identification      | `Mozilla/5.0 ...`               |
| Origin            | Request origin (CORS)      | `https://myapp.com`             |
| Referer           | Previous page URL          | `https://google.com/search`     |
| Cookie            | Stored cookies             | `sessionId=abc; theme=dark`     |
| If-None-Match     | Cache validation (ETag)    | `"abc123"`                      |
| If-Modified-Since | Cache validation (time)    | `Mon, 20 Jan 2025 10:00:00 GMT` |

### Response Headers

| Header                       | Purpose                 | Example                               |
| ---------------------------- | ----------------------- | ------------------------------------- |
| Set-Cookie                   | Store cookie in browser | `session=abc; HttpOnly; Secure`       |
| Cache-Control                | Caching directives      | `max-age=3600, must-revalidate`       |
| ETag                         | Resource version        | `"abc123xyz"`                         |
| Last-Modified                | Modification timestamp  | `Mon, 20 Jan 2025 10:00:00 GMT`       |
| Location                     | Redirect/resource URL   | `/api/users/456`                      |
| Access-Control-Allow-Origin  | CORS allowed origins    | `https://myapp.com` or `*`            |
| Access-Control-Allow-Methods | CORS allowed methods    | `GET, POST, PUT, DELETE`              |
| Access-Control-Allow-Headers | CORS allowed headers    | `Content-Type, Authorization`         |
| Content-Security-Policy      | Resource loading policy | `default-src 'self'`                  |
| Strict-Transport-Security    | Force HTTPS             | `max-age=31536000; includeSubDomains` |
| X-Content-Type-Options       | Prevent MIME sniffing   | `nosniff`                             |
| X-Frame-Options              | Prevent clickjacking    | `DENY` or `SAMEORIGIN`                |

---

## Common Patterns

### Secure API request

```http
POST /api/users HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGci...
Content-Type: application/json
Accept: application/json
Origin: https://myapp.com

{"name": "Alice", "email": "alice@example.com"}
```

### Secure API response

```http
HTTP/1.1 201 Created
Location: /api/users/456
Content-Type: application/json
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'

{"id": 456, "name": "Alice"}
```

### Cached resource

```http
GET /api/data HTTP/1.1
If-None-Match: "abc123"
If-Modified-Since: Mon, 20 Jan 2025 10:00:00 GMT

→

HTTP/1.1 304 Not Modified
ETag: "abc123"
Cache-Control: max-age=3600
```

### Secure cookie session

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```
