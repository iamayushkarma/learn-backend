# REST API Core Concepts Guide

## 1) Resources (Nouns, Not Actions)

### What it is

- REST organizes everything as **resources** (entities like users, products, orders).
- Resources are identified by **URIs** (Uniform Resource Identifiers).
- URIs should use **nouns**, not verbs.
- Actions are expressed through **HTTP methods**, not URL paths.

### Core principle

**URLs identify WHAT (resources), HTTP methods specify HOW (actions).**

### Examples

**✅ Good (resource-oriented, nouns):**

```
GET    /users                    # Get all users
GET    /users/123                # Get specific user
POST   /users                    # Create new user
PUT    /users/123                # Update user 123
DELETE /users/123                # Delete user 123

GET    /products                 # Get all products
GET    /products/456/reviews     # Get reviews for product 456
POST   /orders                   # Create new order
```

**❌ Bad (action-oriented, verbs):**

```
GET    /getUsers
POST   /createUser
GET    /deleteUser/123
POST   /updateProduct/456
GET    /fetchAllOrders
POST   /addReview
```

### Resource naming best practices

**1. Use plural nouns:**

```
/users          (not /user)
/products       (not /product)
/orders         (not /order)
```

**2. Hierarchical relationships:**

```
/users/123/orders              # Orders belonging to user 123
/products/456/reviews          # Reviews for product 456
/companies/789/employees       # Employees of company 789
/posts/101/comments            # Comments on post 101
```

**3. Use hyphens for readability:**

```
/user-profiles      (not /user_profiles or /userProfiles)
/order-items
/product-categories
```

**4. Lowercase only:**

```
/users/123/billing-address     (not /Users/123/BillingAddress)
```

### Key points

- Resources represent **entities** (users, products, orders).
- URIs identify resources; HTTP methods specify actions.
- Keep URIs **predictable** and **consistent**.
- No verbs in URLs (let HTTP methods handle actions).

### Common use cases

- Collections: `/users`, `/products`, `/orders`
- Specific items: `/users/123`, `/products/456`
- Nested resources: `/users/123/orders`, `/posts/101/comments`
- Filtering via query params: `/products?category=electronics&sort=price`

---

## 2) Representations (JSON)

### What it is

- A **representation** is how a resource is formatted when sent over the network.
- The same resource can have multiple representations (JSON, XML, HTML).
- **JSON** is the most common format for modern REST APIs.
- Client and server negotiate format using `Content-Type` and `Accept` headers.

### Why JSON?

- ✅ **Lightweight**: Less verbose than XML
- ✅ **Human-readable**: Easy to read and debug
- ✅ **Native JavaScript support**: `JSON.parse()` and `JSON.stringify()`
- ✅ **Universal**: Supported by all modern languages
- ✅ **Flexible**: Supports nested objects and arrays

### Content negotiation

**Client requests JSON:**

```http
GET /api/users/123 HTTP/1.1
Host: example.com
Accept: application/json
```

**Server responds with JSON:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2025-01-20T10:30:00Z"
}
```

**Client sends JSON:**

```http
POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "name": "Bob",
  "email": "bob@example.com"
}
```

### JSON structure examples

**Single resource:**

```json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "active": true,
  "roles": ["admin", "user"]
}
```

**Collection of resources:**

```json
{
  "users": [
    {
      "id": 123,
      "name": "Alice",
      "email": "alice@example.com"
    },
    {
      "id": 124,
      "name": "Bob",
      "email": "bob@example.com"
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 10
}
```

**Nested resources:**

```json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "orders": [
    {
      "id": 456,
      "total": 99.99,
      "status": "shipped"
    }
  ]
}
```

### Common JSON conventions

**Use camelCase for field names:**

```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "emailAddress": "alice@example.com"
}
```

**ISO 8601 for dates:**

```json
{
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-24T15:45:00Z"
}
```

**Include metadata for collections:**

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

### Key points

- JSON is the **standard** representation format for REST APIs.
- Use `Content-Type: application/json` header.
- Structure responses consistently across your API.
- Include meaningful field names (camelCase preferred).
- Support pagination metadata for collections.

### Other representations (awareness level)

**XML:**

```xml
<user>
  <id>123</id>
  <name>Alice</name>
  <email>alice@example.com</email>
</user>
```

**HTML (for browser consumption):**

```html
<div class="user">
  <h2>Alice</h2>
  <p>alice@example.com</p>
</div>
```

---

## 3) Statelessness

### What it is

- Each request from client to server must contain **all information** needed to understand and process it.
- The server does **not store client context** between requests.
- No session state is kept on the server.
- Every request is **independent** and **self-contained**.

### Core principle

**Server doesn't remember previous requests. Each request stands alone.**

### How it works

**❌ Stateful (not REST):**

```
Client → Server: Login (username/password)
Server: Creates session, stores user data in memory
Client → Server: Get profile (no auth info, relies on session)
Server: Looks up session, returns profile
```

**✅ Stateless (REST):**

```
Client → Server: Login (username/password)
Server: Returns authentication token
Client → Server: Get profile (includes token in every request)
Server: Validates token, returns profile
```

### Stateless request examples

**Every request includes authentication:**

```http
GET /api/users/123 HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Every request includes all parameters:**

```http
GET /api/products?category=electronics&page=2&limit=10 HTTP/1.1
Host: example.com
Authorization: Bearer <token>
```

**Client maintains state, not server:**

```http
POST /api/orders HTTP/1.1
Host: example.com
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {"productId": 123, "quantity": 2},
    {"productId": 456, "quantity": 1}
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York"
  }
}
```

### Benefits of statelessness

**1. Scalability:**

- Any server can handle any request (no session affinity needed).
- Easy to add more servers (horizontal scaling).
- Load balancers can distribute requests freely.

**2. Reliability:**

- Server crashes don't lose client state.
- Easy recovery from failures.
- No session cleanup needed.

**3. Simplicity:**

- Each request is independent and testable.
- No complex session management.
- Easier debugging (each request has full context).

**4. Cacheability:**

- Responses can be cached without worrying about session state.
- Proxy servers and CDNs work better.

### Authentication patterns

**Token-based authentication (JWT):**

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Subsequent requests:**

```http
GET /api/users/123 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### What gets stored where?

**Client-side (browser, app):**

- Authentication tokens
- User preferences
- Shopping cart contents
- Current page/filter state

**Server-side (database, cache):**

- User accounts
- Product catalog
- Order history
- Persistent application data

**NOT stored on server:**

- Session state
- "Current user" in memory
- Temporary workflow state

### Key points

- **Every request is self-contained** with all needed information.
- Use **tokens** (JWT, OAuth) for authentication, not sessions.
- Client stores and sends state with each request.
- Server remains **stateless** between requests.
- Enables **horizontal scaling** and better reliability.

### Common misconceptions

**"Stateless means no database":**

- ❌ Wrong: You can use databases for persistent data.
- ✅ Correct: Server doesn't store temporary session state.

**"Stateless means no authentication":**

- ❌ Wrong: You still authenticate users.
- ✅ Correct: Use tokens instead of server-side sessions.

---

## 4) Consistent URL Structures

### What it is

- REST APIs should follow **predictable, logical URL patterns**.
- Similar resources should use similar URL structures.
- Consistency makes APIs **intuitive** and **easy to learn**.
- Well-designed URLs are self-documenting.

### Core principle

**If you know one endpoint, you should be able to guess others.**

### URL structure patterns

**Collection and resource pattern:**

```
GET    /users              # Get all users (collection)
POST   /users              # Create new user
GET    /users/123          # Get specific user (resource)
PUT    /users/123          # Update user 123
PATCH  /users/123          # Partially update user 123
DELETE /users/123          # Delete user 123
```

**Nested resources:**

```
GET    /users/123/orders           # Get all orders for user 123
POST   /users/123/orders           # Create order for user 123
GET    /users/123/orders/456       # Get specific order
PUT    /users/123/orders/456       # Update order 456
DELETE /users/123/orders/456       # Delete order 456
```

**Multi-level nesting:**

```
GET    /users/123/orders/456/items         # Get order items
GET    /companies/789/departments/10/employees
```

### Filtering, sorting, pagination

**Query parameters for filtering:**

```
GET /products?category=electronics
GET /products?category=electronics&brand=sony
GET /products?minPrice=100&maxPrice=500
GET /users?status=active&role=admin
```

**Sorting:**

```
GET /products?sort=price              # Ascending by price
GET /products?sort=-price             # Descending by price
GET /products?sort=price,name         # Multiple fields
```

**Pagination:**

```
GET /users?page=2&limit=10            # Page-based
GET /users?offset=20&limit=10         # Offset-based
GET /users?cursor=abc123              # Cursor-based
```

**Combined:**

```
GET /products?category=electronics&sort=-price&page=1&limit=20
```

### Consistent naming conventions

**Use plural nouns consistently:**

```
✅ /users, /products, /orders
❌ /user, /product, /order
```

**Use hyphens for multi-word resources:**

```
✅ /user-profiles, /product-categories
❌ /user_profiles, /userProfiles
```

**Lowercase only:**

```
✅ /api/users/123/billing-address
❌ /API/Users/123/BillingAddress
```

**Avoid file extensions:**

```
✅ /users/123
❌ /users/123.json
```

### Versioning strategies

**URL versioning:**

```
/api/v1/users
/api/v2/users
```

**Header versioning:**

```http
GET /api/users HTTP/1.1
Accept: application/vnd.myapi.v2+json
```

**Query parameter versioning:**

```
/api/users?version=2
```

### Action endpoints (when needed)

**For non-CRUD operations:**

```
POST /users/123/activate          # Activate user account
POST /orders/456/cancel           # Cancel order
POST /products/789/publish        # Publish product
POST /invoices/101/send           # Send invoice via email
```

**Bulk operations:**

```
POST /users/bulk-delete
POST /products/bulk-update
```

### URL structure examples

**E-commerce API:**

```
GET    /products
GET    /products/123
GET    /products/123/reviews
POST   /products/123/reviews
GET    /categories
GET    /categories/electronics/products
POST   /orders
GET    /orders/456
POST   /orders/456/cancel
GET    /users/123/cart
POST   /users/123/cart/items
```

**Blog API:**

```
GET    /posts
POST   /posts
GET    /posts/123
PUT    /posts/123
DELETE /posts/123
GET    /posts/123/comments
POST   /posts/123/comments
GET    /authors
GET    /authors/456/posts
GET    /categories
GET    /categories/tech/posts
```

**Social media API:**

```
GET    /users/123
GET    /users/123/posts
GET    /users/123/followers
GET    /users/123/following
POST   /users/123/follow
POST   /users/123/unfollow
GET    /posts/456/likes
POST   /posts/456/like
DELETE /posts/456/like
```

### Best practices summary

| Do ✅                     | Don't ❌                  |
| ------------------------- | ------------------------- |
| `/users`                  | `/getUsers`               |
| `/users/123`              | `/user?id=123`            |
| `/users/123/orders`       | `/getUserOrders/123`      |
| `/products?category=tech` | `/products/category/tech` |
| `/api/v1/users`           | `/api/users/v1`           |
| `/user-profiles`          | `/user_profiles`          |
| Plural nouns              | Singular nouns            |
| Lowercase                 | CamelCase or mixed        |

### Key points

- **Collections**: `/users` (plural)
- **Specific resource**: `/users/123` (ID in path)
- **Nested resources**: `/users/123/orders`
- **Filtering**: Use query parameters (`?category=tech`)
- **Actions**: Use HTTP methods, not URL verbs
- **Consistency**: Same pattern across all endpoints

---

## 5) HATEOAS (Hypermedia as the Engine of Application State)

### What it is

- **HATEOAS** is a constraint of REST where responses include **links** to related resources.
- Clients navigate the API using these links, not hardcoded URLs.
- The API becomes **self-descriptive** and **discoverable**.
- Rarely used strictly in practice, but good to understand.

### Core principle

**Responses tell clients what they can do next, via hyperlinks.**

### Why HATEOAS?

**Traditional approach (hardcoded URLs):**

```javascript
// Client has hardcoded URLs
const user = await fetch("/api/users/123");
const orders = await fetch("/api/users/123/orders"); // Hardcoded
```

**HATEOAS approach (discoverable URLs):**

```json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "links": [
    {
      "rel": "self",
      "href": "/api/users/123",
      "method": "GET"
    },
    {
      "rel": "orders",
      "href": "/api/users/123/orders",
      "method": "GET"
    },
    {
      "rel": "edit",
      "href": "/api/users/123",
      "method": "PUT"
    },
    {
      "rel": "delete",
      "href": "/api/users/123",
      "method": "DELETE"
    }
  ]
}
```

### HATEOAS examples

**User resource with links:**

```json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "status": "active",
  "_links": {
    "self": {
      "href": "/api/users/123"
    },
    "orders": {
      "href": "/api/users/123/orders"
    },
    "deactivate": {
      "href": "/api/users/123/deactivate",
      "method": "POST"
    }
  }
}
```

**Order resource with state-based links:**

```json
{
  "id": 456,
  "status": "pending",
  "total": 99.99,
  "_links": {
    "self": {
      "href": "/api/orders/456"
    },
    "cancel": {
      "href": "/api/orders/456/cancel",
      "method": "POST"
    },
    "pay": {
      "href": "/api/orders/456/payment",
      "method": "POST"
    }
  }
}
```

**After payment (links change based on state):**

```json
{
  "id": 456,
  "status": "paid",
  "total": 99.99,
  "_links": {
    "self": {
      "href": "/api/orders/456"
    },
    "track": {
      "href": "/api/orders/456/tracking",
      "method": "GET"
    },
    "invoice": {
      "href": "/api/orders/456/invoice",
      "method": "GET"
    }
  }
}
```

### Collection with links

```json
{
  "users": [
    {
      "id": 123,
      "name": "Alice",
      "_links": {
        "self": { "href": "/api/users/123" }
      }
    },
    {
      "id": 124,
      "name": "Bob",
      "_links": {
        "self": { "href": "/api/users/124" }
      }
    }
  ],
  "_links": {
    "self": { "href": "/api/users?page=1" },
    "next": { "href": "/api/users?page=2" },
    "last": { "href": "/api/users?page=10" }
  }
}
```

### HAL (Hypertext Application Language) format

**HAL is a popular HATEOAS format:**

```json
{
  "_links": {
    "self": { "href": "/api/users/123" },
    "orders": { "href": "/api/users/123/orders" }
  },
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "_embedded": {
    "recent_orders": [
      {
        "_links": {
          "self": { "href": "/api/orders/456" }
        },
        "id": 456,
        "total": 99.99
      }
    ]
  }
}
```

### Benefits of HATEOAS

**1. API evolution:**

- URLs can change without breaking clients.
- Clients follow links, not hardcoded paths.

**2. Discoverability:**

- Clients can explore the API by following links.
- Self-documenting responses.

**3. State transitions:**

- Links change based on resource state.
- Clients know what actions are available.

**4. Decoupling:**

- Clients don't need to construct URLs.
- Server controls URL structure.

### Why it's rarely used strictly

**Complexity:**

- Adds overhead to responses.
- More complex to implement and consume.

**Client complexity:**

- Clients need to parse and follow links.
- Most clients prefer predictable URLs.

**Practical alternatives:**

- Good API documentation.
- Consistent URL patterns.
- Versioning for breaking changes.

### Practical middle ground

**Include some links for key relationships:**

```json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "links": {
    "orders": "/api/users/123/orders",
    "profile": "/api/users/123/profile"
  }
}
```

**Use for navigation in collections:**

```json
{
  "data": [...],
  "pagination": {
    "current": "/api/users?page=2",
    "next": "/api/users?page=3",
    "prev": "/api/users?page=1",
    "first": "/api/users?page=1",
    "last": "/api/users?page=10"
  }
}
```

### Key points

- HATEOAS makes APIs **self-descriptive** via hyperlinks.
- Responses include links to related resources and actions.
- **Rarely implemented strictly** in real-world APIs.
- Adds complexity but improves discoverability.
- Good for understanding REST principles.
- **Practical approach**: Include key links without full HATEOAS.

### Common HATEOAS standards

**HAL (Hypertext Application Language):**

- Uses `_links` and `_embedded` properties.
- Popular for HATEOAS implementations.

**JSON:API:**

- Includes `relationships` and `links` objects.
- Standardized format for JSON APIs.

**JSON-LD (Linked Data):**

- Uses `@context` and `@id` for semantic links.
- More complex, used for semantic web.

---

## Quick Reference Summary

| Concept             | Key Principle                                             | Example                             |
| ------------------- | --------------------------------------------------------- | ----------------------------------- |
| **Resources**       | Use nouns, not verbs                                      | `/users` not `/getUsers`            |
| **Representations** | JSON is standard format                                   | `Content-Type: application/json`    |
| **Statelessness**   | Each request is self-contained                            | Include auth token in every request |
| **URL Structure**   | Consistent, predictable patterns                          | `/users/123/orders`                 |
| **HATEOAS**         | Include links to related resources (rarely used strictly) | `"_links": {"orders": "..."}`       |

---

## REST Maturity Model (Richardson Maturity Model)

**Level 0: The Swamp of POX**

- Single endpoint, single HTTP method (usually POST)
- Example: `/api` with all operations in request body

**Level 1: Resources**

- ✅ Multiple URIs for different resources
- Still using only POST

**Level 2: HTTP Verbs**

- ✅ Multiple URIs
- ✅ Proper HTTP methods (GET, POST, PUT, DELETE)
- Most real-world "REST" APIs are here

**Level 3: Hypermedia Controls**

- ✅ Multiple URIs
- ✅ Proper HTTP methods
- ✅ HATEOAS (links in responses)
- True REST according to Roy Fielding

**Most APIs aim for Level 2 (resources + HTTP verbs) as it provides the best balance of benefits vs complexity.**
