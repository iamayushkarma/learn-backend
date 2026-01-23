# HTTP Fundamentals

## 1) Client–Server Model

### What it is

- **Client**: the app that asks for something (browser, mobile app, Postman, curl).
- **Server**: the app that receives the request and sends back a response (Node/Express, Java Spring, etc.).
- The client and server can be on the same machine (localhost) or different machines across the internet.

### Key points

- **Client initiates**, server responds.
- Server can handle many clients.
- HTTP is **stateless** by default: every request should contain everything needed to understand it (auth/state is added using cookies/tokens/sessions).

### Quick example

- You open `example.com/products`
- Browser (client) sends an HTTP request
- Server returns HTML/JSON + status code

---

## 2) Request–Response Lifecycle

### Step-by-step flow

1. **User action**
   - Click a link, submit a form, app calls an API.

2. **DNS lookup**
   - `example.com` → gets IP address (where the server lives).

3. **Connection**
   - HTTP/1.1 & HTTP/2: TCP connection (TLS for HTTPS).
   - HTTP/3: QUIC (over UDP) + TLS built in.

4. **Client sends HTTP request**
   - Method + URL/path + headers + optional body.

5. **Server processes**
   - Routing → validation → business logic → database calls → prepare response.

6. **Server sends HTTP response**
   - Status code + headers + optional body (HTML/JSON/file).

7. **Client handles response**
   - Render page, show data, store cookie/token, handle errors.

8. **Connection reuse (often)**
   - Keep-alive / HTTP2 multiplexing helps performance.

### What a request looks like (simplified)

```http
GET /api/users?limit=10 HTTP/1.1
Host: example.com
Accept: application/json
Authorization: Bearer <token>
```

---

## 3) URL Anatomy

### Structure

A complete URL has up to 6 parts:

```
scheme://host:port/path?query#fragment
```

### Components breakdown

- **Scheme** (protocol)
  - `http://` or `https://` (also `ftp://`, `ws://`, etc.)
  - Tells the client which protocol to use.
- **Host** (domain/IP)
  - `example.com` or `192.168.1.1`
  - Where the server lives (gets resolved via DNS to an IP).
- **Port** (optional)
  - `:80` for HTTP (default, usually omitted)
  - `:443` for HTTPS (default, usually omitted)
  - `:3000`, `:8080`, etc. for custom servers
  - Example: `http://localhost:3000`
- **Path**
  - `/api/users/123`
  - Specifies the resource on the server.
  - Can be nested: `/products/electronics/phones`
- **Query** (optional)
  - `?key1=value1&key2=value2`
  - Starts with `?`, parameters separated by `&`
  - Used for filtering, pagination, search, etc.
  - Example: `?category=books&sort=price&limit=10`
- **Fragment** (optional)
  - `#section-name`
  - Client-side only (not sent to server)
  - Used for in-page navigation or state in SPAs
  - Example: `#about`, `#comments`

### Complete example

```
https://api.example.com:443/products/search?q=laptop&page=2#reviews
```

- **Scheme**: `https`
- **Host**: `api.example.com`
- **Port**: `443` (default for HTTPS, usually hidden)
- **Path**: `/products/search`
- **Query**: `q=laptop&page=2`
- **Fragment**: `reviews`

### Key notes

- Only **scheme**, **host**, and **path** are required (path can be `/`).
- Query strings should be **URL-encoded** for special characters (`space` → `%20` or `+`).
- Fragments are **never sent to the server** in HTTP requests.

---

## 4) Idempotency & Safety of Methods

### Safe methods

- **Definition**: Methods that **don't change** server state (read-only operations).
- **Safe methods**: `GET`, `HEAD`, `OPTIONS`
- These can be cached, prefetched, and called repeatedly without side effects.
- Example: `GET /api/products` should never modify data.

### Idempotent methods

- **Definition**: Making the **same request multiple times** produces the **same result** as making it once.
- **Idempotent methods**: `GET`, `HEAD`, `PUT`, `DELETE`, `OPTIONS`
- Important for **retry logic** and **network reliability**.

### Comparison table

| Method  | Safe? | Idempotent? | Purpose                        |
| ------- | ----- | ----------- | ------------------------------ |
| GET     | ✅    | ✅          | Retrieve data                  |
| POST    | ❌    | ❌          | Create new resource            |
| PUT     | ❌    | ✅          | Replace/update entire resource |
| PATCH   | ❌    | ❌\*        | Partial update                 |
| DELETE  | ❌    | ✅          | Remove resource                |
| HEAD    | ✅    | ✅          | Get headers only (no body)     |
| OPTIONS | ✅    | ✅          | Check allowed methods          |

\*PATCH can be idempotent depending on implementation

### Idempotency examples

```http
PUT /users/123
{"name": "Alice", "email": "alice@example.com"}
```

- Calling this 1x or 5x → same result: user 123 has those values.

```http
DELETE /users/123
```

- First call: deletes user 123 (returns 200/204)
- Second call: user already gone (returns 404 or 204)
- **Result is the same**: user 123 doesn't exist.

```http
POST /orders
{"product": "laptop", "qty": 1}
```

- Each call creates a **new order** → NOT idempotent.

---

## 5) Content Negotiation Basics

### What it is

- Client and server **negotiate** the format of the request/response body.
- Uses HTTP headers to specify what formats are supported/preferred.

### Key headers

#### Accept (Request header - client tells server)

- **What the client wants to receive** in the response.

```http
Accept: application/json
Accept: text/html
Accept: application/xml
Accept: */*  # any format is fine
Accept: application/json, text/html;q=0.9  # prefer JSON, HTML is ok
```

- `q` (quality value): preference weight (0-1, default 1.0).

#### Content-Type (Both request & response)

- **What format the body is in** (for the current message).

**Request example** (client sending JSON):

```http
POST /api/users HTTP/1.1
Content-Type: application/json

{"name": "Bob", "email": "bob@example.com"}
```

**Response example** (server sending JSON):

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": 123, "name": "Bob"}
```

### Common Content-Type values

- `application/json` - JSON data
- `text/html` - HTML document
- `application/xml` - XML data
- `text/plain` - Plain text
- `application/x-www-form-urlencoded` - Form data
- `multipart/form-data` - File uploads
- `image/png`, `image/jpeg` - Images

### How it works

1. Client sends request with `Accept: application/json`
2. Server checks if it can respond with JSON
3. If yes → server sends response with `Content-Type: application/json`
4. If no → server returns `406 Not Acceptable` or sends default format

### Example negotiation

```http
GET /api/users/123 HTTP/1.1
Accept: application/json, application/xml;q=0.8
```

- Server prefers JSON (q=1.0 default)
- If JSON unavailable, XML is acceptable (q=0.8)
- Server responds with appropriate `Content-Type` header
