# REST API Resource Design Patterns

## 1) Collections vs Single Resource

### What it is

- **Collections**: Multiple resources of the same type
- **Single resource**: One specific resource identified by ID
- Different HTTP methods apply to each pattern
- URL structure indicates whether you're working with many or one

### Core principle

**Collections represent groups, single resources represent individuals.**

### Collection pattern

**URL structure:**

```
/users              # Collection
/products           # Collection
/orders             # Collection
```

**Operations on collections:**

```http
GET    /users              # Get list of all users
POST   /users              # Create a new user (server assigns ID)
```

**Response for collection (GET /users):**

```json
{
  "data": [
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

### Single resource pattern

**URL structure:**

```
/users/123          # Specific user
/products/456       # Specific product
/orders/789         # Specific order
```

**Operations on single resource:**

```http
GET    /users/123          # Get user 123
PUT    /users/123          # Replace user 123 entirely
PATCH  /users/123          # Update specific fields of user 123
DELETE /users/123          # Delete user 123
```

**Response for single resource (GET /users/123):**

```json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin",
  "createdAt": "2025-01-20T10:30:00Z"
}
```

### HTTP methods by pattern

| Pattern        | GET                   | POST        | PUT                   | PATCH                 | DELETE                |
| -------------- | --------------------- | ----------- | --------------------- | --------------------- | --------------------- |
| **Collection** | List all resources    | Create new  | ❌ Not typically used | ❌ Not typically used | ❌ Not typically used |
| **Single**     | Get specific resource | ❌ Not used | Replace entire        | Update partial        | Delete resource       |

### Creating resources

**POST to collection (server assigns ID):**

```http
POST /users HTTP/1.1
Content-Type: application/json

{
  "name": "Charlie",
  "email": "charlie@example.com"
}
```

**Response:**

```http
HTTP/1.1 201 Created
Location: /users/125
Content-Type: application/json

{
  "id": 125,
  "name": "Charlie",
  "email": "charlie@example.com",
  "createdAt": "2025-01-24T15:45:00Z"
}
```

**PUT to single resource (client specifies ID - less common):**

```http
PUT /users/999 HTTP/1.1
Content-Type: application/json

{
  "name": "David",
  "email": "david@example.com"
}
```

### Collection filtering and pagination

**Filtering:**

```http
GET /users?role=admin
GET /products?category=electronics&inStock=true
GET /orders?status=pending&userId=123
```

**Sorting:**

```http
GET /users?sort=createdAt
GET /products?sort=-price              # Descending
GET /orders?sort=createdAt,status      # Multiple fields
```

**Pagination:**

```http
GET /users?page=2&limit=10
GET /products?offset=20&limit=10
GET /orders?cursor=eyJpZCI6MTIzfQ==
```

**Combined:**

```http
GET /products?category=electronics&sort=-price&page=1&limit=20
```

### Key points

- **Collections**: Plural nouns (`/users`, `/products`)
- **Single resource**: Collection + ID (`/users/123`)
- **POST** creates → use on collections
- **GET/PUT/PATCH/DELETE** → use on single resources
- Always return appropriate status codes (200, 201, 204, 404)

### Common patterns

**E-commerce:**

```
GET    /products                 # Browse products
GET    /products/456             # View product details
POST   /orders                   # Create order
GET    /orders/789               # View order
```

**Blog:**

```
GET    /posts                    # List posts
GET    /posts/123                # Read post
POST   /posts                    # Publish new post
PATCH  /posts/123                # Edit post
DELETE /posts/123                # Delete post
```

**User management:**

```
GET    /users                    # List users
GET    /users/123                # View user profile
POST   /users                    # Register user
PUT    /users/123                # Update entire profile
PATCH  /users/123                # Update email only
DELETE /users/123                # Delete account
```

---

## 2) Nested Resources

### What it is

- Resources that **belong to** or **depend on** a parent resource
- Shows **hierarchical relationships** in the URL
- Represents ownership or containment
- Makes relationships explicit and RESTful

### Core principle

**If resource B belongs to resource A, nest it: /A/:id/B**

### When to use nested resources

**Ownership relationship:**

```
/users/123/orders              # Orders belonging to user 123
/posts/456/comments            # Comments on post 456
/companies/789/employees       # Employees of company 789
```

**Dependency relationship:**

```
/projects/101/tasks            # Tasks in project 101
/courses/202/lessons           # Lessons in course 202
/albums/303/photos             # Photos in album 303
```

### Nested resource patterns

**Get all nested resources:**

```http
GET /users/123/orders HTTP/1.1
```

**Response:**

```json
{
  "data": [
    {
      "id": 456,
      "total": 99.99,
      "status": "shipped",
      "userId": 123
    },
    {
      "id": 457,
      "total": 149.99,
      "status": "pending",
      "userId": 123
    }
  ],
  "total": 2
}
```

**Create nested resource:**

```http
POST /users/123/orders HTTP/1.1
Content-Type: application/json

{
  "items": [
    {"productId": 789, "quantity": 2}
  ],
  "shippingAddress": "123 Main St"
}
```

**Response:**

```http
HTTP/1.1 201 Created
Location: /users/123/orders/458
Content-Type: application/json

{
  "id": 458,
  "userId": 123,
  "items": [...],
  "total": 199.99,
  "status": "pending"
}
```

**Get specific nested resource:**

```http
GET /users/123/orders/458 HTTP/1.1
```

**Update nested resource:**

```http
PATCH /users/123/orders/458 HTTP/1.1
Content-Type: application/json

{
  "shippingAddress": "456 Oak Ave"
}
```

**Delete nested resource:**

```http
DELETE /users/123/orders/458 HTTP/1.1
```

### Multi-level nesting examples

**Blog platform:**

```
GET    /users/123/posts                    # User's posts
GET    /users/123/posts/456                # Specific post
GET    /users/123/posts/456/comments       # Comments on post
POST   /users/123/posts/456/comments       # Add comment
GET    /users/123/posts/456/comments/789   # Specific comment
```

**Project management:**

```
GET    /projects/101/tasks                 # Tasks in project
GET    /projects/101/tasks/202             # Specific task
GET    /projects/101/tasks/202/subtasks    # Subtasks
POST   /projects/101/tasks/202/subtasks    # Add subtask
```

**E-learning:**

```
GET    /courses/303/modules                # Course modules
GET    /courses/303/modules/404            # Specific module
GET    /courses/303/modules/404/lessons    # Lessons in module
GET    /courses/303/modules/404/lessons/505 # Specific lesson
```

### Nested vs flat resources

**Scenario: Getting a user's orders**

**Nested approach:**

```http
GET /users/123/orders
```

- Clear ownership
- Automatically scoped to user
- Natural for UI flows

**Flat approach:**

```http
GET /orders?userId=123
```

- More flexible filtering
- Can combine with other filters
- Better for complex queries

**Both are valid! Choose based on use case.**

### When both make sense

**User's orders (strong ownership):**

```
GET /users/123/orders           # Natural for user profile page
GET /orders?userId=123          # Natural for admin filtering
```

**Post comments (strong ownership):**

```
GET /posts/456/comments         # Natural for viewing post
GET /comments?postId=456        # Natural for comment moderation
```

**Product reviews:**

```
GET /products/789/reviews       # Natural for product page
GET /reviews?productId=789      # Natural for review analytics
```

### Key points

- Nest when there's **clear ownership** or **strong dependency**
- Use parent ID in URL: `/users/123/orders`
- Nested resources **inherit context** from parent
- Both nested and flat can coexist for different use cases
- Limit nesting depth (see next section)

---

## 3) When NOT to Nest Deeply

### What it is

- **Deep nesting** = 3+ levels of resource hierarchy
- Creates overly complex, brittle URLs
- Makes API harder to use and maintain
- Often indicates poor resource design

### Core principle

**Avoid nesting beyond 2 levels. Flatten when possible.**

### Problems with deep nesting

**❌ Too deep (4 levels):**

```
GET /companies/123/departments/456/teams/789/members/101
DELETE /users/111/posts/222/comments/333/replies/444
PUT /courses/555/modules/666/lessons/777/quizzes/888
```

**Problems:**

- URLs become extremely long
- Fragile (changing any parent breaks children)
- Hard to remember and construct
- Difficult to document
- Complex permission checking
- Poor cacheability

### How to flatten deep nesting

**Example: Company → Department → Team → Member**

**❌ Bad (4 levels deep):**

```
GET /companies/123/departments/456/teams/789/members
GET /companies/123/departments/456/teams/789/members/101
```

**✅ Better (2 levels max):**

```
GET /teams/789/members
GET /teams/789/members/101
GET /members/101
```

**✅ Or use query parameters:**

```
GET /members?teamId=789
GET /members?teamId=789&departmentId=456
GET /members?companyId=123
```

### Real-world examples

**Social media: Post → Comment → Reply**

**❌ Too nested:**

```
GET /users/123/posts/456/comments/789/replies
POST /users/123/posts/456/comments/789/replies
GET /users/123/posts/456/comments/789/replies/101
```

**✅ Flattened:**

```
GET /comments/789/replies               # Replies to comment 789
POST /comments/789/replies              # Add reply
GET /replies/101                        # Specific reply

# Or with query params
GET /replies?commentId=789
GET /comments?postId=456
```

**E-learning: Course → Module → Lesson → Quiz**

**❌ Too nested:**

```
GET /courses/111/modules/222/lessons/333/quizzes/444
PUT /courses/111/modules/222/lessons/333/quizzes/444
```

**✅ Flattened:**

```
GET /lessons/333/quizzes                # Quizzes for lesson
GET /quizzes/444                        # Specific quiz
PUT /quizzes/444                        # Update quiz

# Or
GET /quizzes?lessonId=333
GET /quizzes?moduleId=222
```

**E-commerce: User → Order → Item → Shipment**

**❌ Too nested:**

```
GET /users/123/orders/456/items/789/shipments
```

**✅ Flattened:**

```
GET /orders/456/items                   # Items in order
GET /items/789                          # Specific item
GET /shipments?orderId=456              # Shipments for order
GET /shipments?itemId=789               # Shipment for item
```

### Recommended nesting limits

**✅ Good (1 level):**

```
GET /users/123
GET /products/456
```

**✅ Good (2 levels):**

```
GET /users/123/orders
GET /posts/456/comments
GET /projects/789/tasks
```

**⚠️ Questionable (3 levels):**

```
GET /users/123/orders/456/items
GET /posts/456/comments/789/replies
```

_Consider flattening or using query params_

**❌ Bad (4+ levels):**

```
GET /a/123/b/456/c/789/d/101
```

_Definitely flatten this_

### Flattening strategies

**Strategy 1: Make deeply nested resources top-level**

```
# Instead of
GET /companies/123/departments/456/employees/789

# Use
GET /employees/789
GET /employees?departmentId=456
GET /employees?companyId=123
```

**Strategy 2: Use query parameters**

```
# Instead of
GET /users/123/posts/456/comments

# Use
GET /comments?postId=456
GET /comments?userId=123
GET /comments?postId=456&userId=123
```

**Strategy 3: Direct resource access**

```
# Instead of
GET /orders/123/items/456/reviews/789

# Use
GET /reviews/789                    # Direct access
GET /reviews?itemId=456             # Filter by item
GET /reviews?orderId=123            # Filter by order
```

**Strategy 4: Keep only meaningful nesting**

```
# Keep parent-child when it adds context
GET /posts/456/comments             # Comments FOR this post

# Remove unnecessary nesting
GET /comments/789                   # Specific comment (no post needed)
```

### When to nest vs when to flatten

**✅ Nest when:**

- Strong ownership relationship
- Parent context is essential
- 2 levels or less
- Common access pattern

```
GET /users/123/orders               # User owns orders
GET /posts/456/comments             # Post owns comments
```

**✅ Flatten when:**

- 3+ levels deep
- Resource stands alone
- Multiple access patterns needed
- Complex filtering required

```
GET /comments?postId=456            # Instead of /posts/456/comments
GET /tasks?projectId=789            # Instead of /projects/789/tasks
```

### Key points

- **Limit nesting to 2 levels maximum**
- Deep nesting creates brittle, complex URLs
- Use **query parameters** for filtering
- Make resources **directly accessible** when possible
- Flatten when relationships become complex
- Consider **multiple access patterns** for the same resource

---

## 4) Actions That Don't Map Neatly

### What it is

- Some operations don't fit the standard CRUD pattern (Create, Read, Update, Delete)
- Actions like login, activate, approve, publish, etc.
- Need special handling in RESTful design
- Multiple valid approaches exist

### Core principle

**Try to model as resource state changes first. Use action endpoints when necessary.**

### Approach 1: Model as resource state (preferred)

**Instead of action endpoints, update resource state:**

**Example: User activation**

**❌ Action endpoint:**

```http
POST /users/123/activate
```

**✅ State change:**

```http
PATCH /users/123 HTTP/1.1
Content-Type: application/json

{
  "status": "active"
}
```

**Example: Order cancellation**

**❌ Action endpoint:**

```http
POST /orders/456/cancel
```

**✅ State change:**

```http
PATCH /orders/456 HTTP/1.1
Content-Type: application/json

{
  "status": "cancelled"
}
```

**Example: Post publishing**

**❌ Action endpoint:**

```http
POST /posts/789/publish
```

**✅ State change:**

```http
PATCH /posts/789 HTTP/1.1
Content-Type: application/json

{
  "publishedAt": "2025-01-24T15:45:00Z",
  "status": "published"
}
```

### Approach 2: Action endpoints (when state change isn't enough)

**When actions involve complex logic, side effects, or don't map to simple state:**

**Authentication and authorization:**

```http
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
```

**Example: Login**

```http
POST /auth/login HTTP/1.1
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
  "expiresIn": 3600,
  "user": {
    "id": 123,
    "name": "Alice"
  }
}
```

**Complex operations with side effects:**

```http
POST /orders/456/checkout          # Process payment, update inventory
POST /invoices/789/send            # Generate PDF, send email
POST /users/123/send-verification  # Create token, send email
POST /reports/generate             # Run complex calculations
```

**Bulk or batch operations:**

```http
POST /products/bulk-update
POST /users/bulk-delete
POST /emails/bulk-send
```

**Example: Bulk update**

```http
POST /products/bulk-update HTTP/1.1
Content-Type: application/json

{
  "productIds": [123, 456, 789],
  "updates": {
    "discount": 20,
    "featured": true
  }
}
```

### Approach 3: Controller pattern

**Group related actions under a controller:**

**Password management:**

```
POST /passwords/forgot             # Send reset email
POST /passwords/reset              # Reset with token
POST /passwords/change             # Change current password
```

**Account management:**

```
POST /account/register
POST /account/verify
POST /account/deactivate
POST /account/reactivate
```

**Email operations:**

```
POST /emails/send
POST /emails/schedule
POST /emails/cancel
```

### Decision tree for action endpoints

```
Is this a simple state change?
├─ YES → Use PATCH with status field
│         PATCH /users/123 {"status": "active"}
│
└─ NO → Does it have side effects or complex logic?
    ├─ YES → Use action endpoint
    │         POST /users/123/send-welcome-email
    │
    └─ NO → Can it be modeled as a new resource?
              POST /activations {"userId": 123}
```

### Real-world examples

**User activation**

**Option 1: State change (simple):**

```http
PATCH /users/123
{"status": "active"}
```

**Option 2: Action endpoint (if complex logic):**

```http
POST /users/123/activate
```

**Option 3: New resource (if tracking needed):**

```http
POST /activations
{"userId": 123}
```

**Order checkout**

**❌ Not RESTful enough:**

```http
POST /checkout
```

**✅ Better (action on specific order):**

```http
POST /orders/456/checkout
```

**✅ Or as state change:**

```http
PATCH /orders/456
{
  "status": "checked_out",
  "paymentMethod": "credit_card"
}
```

**Email sending**

**Action endpoint (has side effects):**

```http
POST /invoices/789/send HTTP/1.1
Content-Type: application/json

{
  "recipientEmail": "customer@example.com",
  "includeAttachment": true
}
```

**File processing**

```http
POST /documents/123/convert HTTP/1.1
Content-Type: application/json

{
  "format": "pdf",
  "quality": "high"
}
```

**Search operations**

**Simple search (GET with query params):**

```http
GET /products?q=laptop&category=electronics
```

**Complex search (POST for advanced criteria):**

```http
POST /products/search HTTP/1.1
Content-Type: application/json

{
  "query": "laptop",
  "filters": {
    "price": {"min": 500, "max": 1500},
    "brands": ["Dell", "HP"],
    "specifications": {
      "ram": "16GB",
      "storage": "512GB SSD"
    }
  },
  "sort": "-price"
}
```

### Naming conventions for action endpoints

**Use verbs for actions:**

```
POST /users/123/activate
POST /orders/456/cancel
POST /posts/789/publish
POST /invoices/101/send
```

**Use nouns for controllers:**

```
POST /auth/login               # auth is the controller
POST /payments/process         # payments is the controller
POST /exports/generate         # exports is the controller
```

**Prefix with resource when possible:**

```
POST /users/123/verify         # Better
POST /verify-user/123          # Not RESTful

POST /orders/456/refund        # Better
POST /refund-order/456         # Not RESTful
```

### HTTP status codes for actions

**Successful action:**

```http
HTTP/1.1 200 OK                # Action completed, returning data
HTTP/1.1 202 Accepted          # Action queued, will process later
HTTP/1.1 204 No Content        # Action completed, no data to return
```

**Action created something:**

```http
HTTP/1.1 201 Created
Location: /resources/new-id
```

**Action failed:**

```http
HTTP/1.1 400 Bad Request       # Invalid input
HTTP/1.1 409 Conflict          # Action not allowed in current state
HTTP/1.1 422 Unprocessable Entity  # Validation failed
```

### Examples with responses

**Activate user:**

```http
POST /users/123/activate HTTP/1.1
```

**Response:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "Alice",
  "status": "active",
  "activatedAt": "2025-01-24T15:45:00Z"
}
```

**Send invoice (async):**

```http
POST /invoices/789/send HTTP/1.1
Content-Type: application/json

{
  "recipientEmail": "customer@example.com"
}
```

**Response:**

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "message": "Email queued for sending",
  "jobId": "job_abc123",
  "estimatedDelivery": "2025-01-24T15:50:00Z"
}
```

### Key points

- **Prefer state changes** over action endpoints when possible
- Use **PATCH** to update resource state (status, publishedAt, etc.)
- Use **action endpoints** when:
  - Complex side effects exist
  - Multiple systems are involved
  - Operation doesn't map to simple state change
- **Group related actions** under controllers (auth, passwords)
- Keep actions **resource-focused** when possible
- Use appropriate **HTTP status codes** (200, 202, 204)

### Best practices summary

| Scenario                      | Recommended Approach    | Example                                 |
| ----------------------------- | ----------------------- | --------------------------------------- |
| Simple state change           | PATCH resource          | `PATCH /users/123 {"status": "active"}` |
| Complex operation             | POST action endpoint    | `POST /orders/456/checkout`             |
| Authentication                | POST to auth controller | `POST /auth/login`                      |
| Bulk operations               | POST bulk endpoint      | `POST /products/bulk-update`            |
| Side effects (email, payment) | POST action endpoint    | `POST /invoices/789/send`               |
| Search (simple)               | GET with query params   | `GET /products?q=laptop`                |
| Search (complex)              | POST search endpoint    | `POST /products/search`                 |

---

## Complete Examples

### E-commerce API

```
# Products
GET    /products                           # List products
GET    /products/123                       # Get product
POST   /products                           # Create product
PATCH  /products/123                       # Update product
DELETE /products/123                       # Delete product
GET    /products?category=electronics      # Filter products

# Reviews (nested)
GET    /products/123/reviews               # Product reviews
POST   /products/123/reviews               # Add review
GET    /reviews/456                        # Specific review (flat)

# Orders
GET    /orders                             # List orders
POST   /orders                             # Create order
GET    /orders/789                         # Get order
PATCH  /orders/789                         # Update order
POST   /orders/789/checkout                # Checkout (action)
POST   /orders/789/cancel                  # Cancel (action)
GET    /orders?userId=123&status=pending   # Filter orders

# Users
GET    /users/123                          # Get user
PATCH  /users/123                          # Update user
POST   /users/123/activate                 # Activate (action)
GET    /users/123/orders                   # User's orders

# Cart
GET    /users/123/cart                     # User's cart
POST   /users/123/cart/items               # Add to cart
PATCH  /users/123/cart/items/456           # Update quantity
DELETE /users/123/cart/items/456           # Remove from cart

# Auth
POST   /auth/login                         # Login
POST   /auth/logout                        # Logout
POST   /auth/refresh                       # Refresh token
```

### Blog API

```
# Posts
GET    /posts                              # List posts
GET    /posts/123                          # Get post
POST   /posts                              # Create post
PUT    /posts/123                          # Update post
DELETE /posts/123                          # Delete post
PATCH  /posts/123                          # Publish/unpublish
GET    /posts?author=456&status=published  # Filter posts

# Comments (nested)
GET    /posts/123/comments                 # Post comments
POST   /posts/123/comments                 # Add comment
GET    /comments/789                       # Specific comment (flat)
PATCH  /comments/789                       # Edit comment
DELETE /comments/789                       # Delete comment

# Categories
GET    /categories                         # List categories
GET    /categories/tech/posts              # Posts in category

# Authors
GET    /authors                            # List authors
GET    /authors/456                        # Get author
GET    /authors/456/posts                  # Author's posts

# Actions
POST   /posts/123/publish                  # Publish post
POST   /posts/123/archive                  # Archive post
```

### Project Management API

```
# Projects
GET    /projects                           # List projects
POST   /projects                           # Create project
GET    /projects/123                       # Get project
PATCH  /projects/123                       # Update project
DELETE /projects/123                       # Delete project

# Tasks (nested up to 2 levels)
GET    /projects/123/tasks                 # Project tasks
POST   /projects/123/tasks                 # Create task
GET    /tasks/456                          # Specific task (flat)
PATCH  /tasks/456                          # Update task
DELETE /tasks/456                          # Delete task
GET    /tasks?assignee=789&status=open     # Filter tasks

# Don't nest deeply
❌ GET /projects/123/tasks/456/subtasks/789/comments
✅ GET /comments?taskId=789

# Actions
POST   /tasks/456/assign                   # Assign task
POST   /tasks/456/complete                 # Mark complete
POST   /projects/123/archive               # Archive project
```

---

## Quick Reference

| Pattern               | URL Structure              | When to Use                         |
| --------------------- | -------------------------- | ----------------------------------- |
| **Collection**        | `/users`                   | List/create resources               |
| **Single Resource**   | `/users/123`               | Get/update/delete specific resource |
| **Nested (1 level)**  | `/users/123/orders`        | Strong ownership, 2 levels max      |
| **Nested (2 levels)** | `/posts/123/comments/456`  | Only when absolutely necessary      |
| **Flat with filter**  | `/orders?userId=123`       | Flexible filtering, 3+ levels       |
| **State change**      | `PATCH /users/123`         | Simple status updates               |
| **Action endpoint**   | `POST /users/123/activate` | Complex operations, side effects    |
| **Controller**        | `POST /auth/login`         | Group related actions               |

---

## Design Decision Checklist

When designing a new endpoint, ask:

1. **Is this a collection or single resource?**
   - Collection → `/users`
   - Single → `/users/123`

2. **Does it belong to another resource?**
   - Yes, strongly → `/users/123/orders`
   - Yes, but loosely → `/orders?userId=123`
   - No → Top-level `/orders`

3. **Is this more than 2 levels deep?**
   - Yes → Flatten it or use query params

4. **Is this a state change or an action?**
   - State change → `PATCH /resource/123`
   - Action → `POST /resource/123/action`

5. **Does this have side effects?**
   - Yes → Use action endpoint
   - No → Use standard CRUD

6. **Can this be modeled as a resource?**
   - Try resource-first approach
   - Fall back to action endpoint if needed
