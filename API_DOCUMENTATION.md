# ShopCheap API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Security Analysis & Recommendations](#security-analysis--recommendations)
3. [API Endpoints Reference](#api-endpoints-reference)
   - [Authentication & Users](#authentication--users)
   - [Products](#products)
   - [Shops](#shops)
   - [Cart](#cart)
   - [Orders](#orders)
   - [Reviews](#reviews)
   - [Bookmarks & Recommendations](#bookmarks--recommendations)

---

## Overview

**Base URL:** `https://<your-convex-deployment>.convex.site`

**Content-Type:** `application/json`

This API powers the ShopCheap e-commerce platform with endpoints for user management, product catalog, shopping cart, orders, reviews, and shop management.

---

## Security Analysis & Recommendations

### 🔴 Critical Issues

#### 1. **Missing Authentication Middleware**
**Current State:** HTTP routes have no authentication checks. Any user can access any endpoint.

**Recommendation:**
```typescript
// Add session validation to protected routes
const validateSession = async (ctx: any, req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  const session = await ctx.runQuery(api.sessions.getSessionByToken, { token });
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }
  return session;
};

// Usage in protected routes:
http.route({
  path: "/protected-route",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const session = await validateSession(ctx, req);
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    // ... proceed with authenticated logic
  }),
});
```

#### 2. **Sensitive Data Exposure - `/users` Endpoint**
**Current State:** The `/users` GET endpoint returns ALL customer data including password hashes.

**Recommendation:**
- Remove this endpoint OR restrict to admin-only access
- Never return `passwordHash` in any response
- Filter sensitive fields:
```typescript
const sanitizeUser = (user: any) => {
  const { passwordHash, reset_token, reset_token_expires, ...safeUser } = user;
  return safeUser;
};
```

#### 3. **No Rate Limiting**
**Current State:** No protection against brute-force attacks on `/auth` endpoint.

**Recommendation:** Implement rate limiting at the application level or use Convex's built-in mechanisms.

---

### 🟠 High Priority Issues

#### 4. **Input Validation Inconsistency**
**Current State:** Some endpoints use Zod validation, others don't.

**Affected Endpoints:**
- `/update-user` - No validation
- `/create/shop` - No validation
- `/seller/register` - No validation

**Recommendation:** Apply consistent validation across all endpoints:
```typescript
const shopValidator = z.object({
  shop_name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  owner_id: z.string(),
  // ... other fields
});
```

#### 5. **Password Returned in User Object**
**Current State:** `passwordHash` is returned in user responses from `/user`, `/user/email` endpoints.

**Fix Required:** Exclude password hash from all responses.

#### 6. **Missing Authorization Checks**
**Current State:** No verification that the requesting user owns the resource they're modifying.

**Example Issues:**
- Any user can update another user's profile via `/update-user`
- Any user can delete items from anyone's cart via `/delete-cart`
- Any user can view anyone's cart via `/cart?userId=...`

**Recommendation:**
```typescript
// Verify ownership before mutations
if (session.userId !== args.user_id) {
  return new Response(JSON.stringify({ message: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}
```

---

### 🟡 Medium Priority Issues

#### 7. **Inconsistent HTTP Methods**
**Current State:** 
- `/delete-cart` uses POST instead of DELETE
- `/increase-cart`, `/reduce-cart` use POST instead of PATCH

**Recommendation:** Follow RESTful conventions:
- DELETE for deletions
- PATCH for partial updates
- PUT for full replacements

#### 8. **Missing CORS Headers**
**Current State:** No CORS headers configured for cross-origin requests.

**Recommendation:**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

#### 9. **Error Message Leakage**
**Current State:** Some error responses expose internal error details.

**Recommendation:** Use generic error messages in production:
```typescript
return new Response(JSON.stringify({ 
  message: "An error occurred", 
  code: "INTERNAL_ERROR" 
}), { status: 500 });
```

#### 10. **Typo in Response (`succes` instead of `success`)**
**Location:** [users.ts#L171](users.ts#L171) - `UpdateCustomer` mutation

```typescript
// Current
return {succes:true, status: 20, message: "Success", user: NewUser};

// Fix
return {success: true, status: 200, message: "Success", user: NewUser};
```

---

### 🟢 Low Priority / Best Practices

#### 11. **Status Code Inconsistencies**
- Successful authentication returns `201` instead of `200`
- Some success responses return `20` (typo) instead of `200`

#### 12. **Missing Request Logging**
Consider adding audit logging for security-sensitive operations.

#### 13. **Spelling Error in Table Name**
`cartegories` should be `categories` - this requires a data migration.

---

## API Endpoints Reference

### Authentication & Users

#### POST `/create-user`
Create a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "passwordHash": "string (required) - bcrypt hash",
  "phoneNumber": "string (optional)",
  "profilePicture": "string (optional)",
  "isVerified": "boolean (required)",
  "role": "string (required) - 'user' | 'seller' | 'admin'",
  "reset_token": "string (optional)",
  "reset_token_expires": "number (required) - timestamp",
  "updatedAt": "number (required) - timestamp",
  "lastLogin": "number (optional) - timestamp"
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "message": "Success your Account was successfully created",
  "status": 200,
  "user": "<user_id>"
}

// Email exists (400)
{
  "success": false,
  "message": "This Email Already Exists",
  "status": 400
}

// Validation error (400)
{
  "message": "Invalid or missing required fields"
}
```

---

#### POST `/auth`
Authenticate a user with email and password.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required) - plain text"
}
```

**Response:**
```json
// Success (201)
{
  "success": true,
  "status": 201,
  "message": "Success",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "isVerified": "boolean"
    // ... other user fields
  }
}

// User not found (404)
{
  "success": false,
  "status": 404,
  "message": "User not Found",
  "user": null
}

// Not verified (404)
{
  "success": false,
  "status": 404,
  "message": "This User is not verified...",
  "user": { /* partial user object */ }
}

// Invalid credentials (401)
{
  "success": false,
  "status": 401,
  "message": "Invalid Credentials",
  "user": null
}
```

---

#### GET `/user?id={customerId}`
Get a user by their ID.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Customer ID (Convex ID format) |

**Response:**
```json
// Success (200)
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "role": "string",
  "isVerified": "boolean",
  "profilePicture": "string | null",
  "phoneNumber": "string | null",
  "_creationTime": "number"
}

// Invalid ID (400)
{
  "message": "Invalid ID format"
}
```

---

#### GET `/user/email?email={email}`
Get a user by their email address.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User's email address |

**Response:**
```json
// Success (200)
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "role": "string"
  // ... user fields
}

// Not found (404)
{
  "message": "Account not Found, please sign-Up first!"
}
```

---

#### GET `/users`
⚠️ **Security Warning:** This endpoint exposes all user data.

Get all users in the system.

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
    // ... all user fields including sensitive data
  }
]
```

---

#### PUT `/update-user`
Update user information.

**Request Body:**
```json
{
  "User": {
    "_id": "string (required) - Customer ID",
    "username": "string (required)",
    "email": "string (required)",
    "passwordHash": "string (required)",
    "phoneNumber": "string (optional)",
    "profilePicture": "string (optional)",
    "isVerified": "boolean (required)",
    "role": "string (required)",
    "reset_token": "string (optional)",
    "reset_token_expires": "number (required)",
    "updatedAt": "number (required)",
    "lastLogin": "number (optional)",
    "_creationTime": "number (optional)"
  }
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "status": 200,
  "message": "Success",
  "user": { /* updated user */ }
}
```

---

#### POST `/seller/register`
Apply to become a seller.

**Request Body:**
```json
{
  "user_id": "string (required) - Customer ID",
  "store_name": "string (required)",
  "description": "string (required)",
  "profile_image": "string (required)",
  "slogan": "string (required)",
  "cover_image": "string (required)",
  "location": {
    "lat": "number (required)",
    "lng": "number (required)"
  }
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "status": 200,
  "message": "Application submitted successfully! We will review your application..."
}

// Already a seller (400)
{
  "success": false,
  "status": 400,
  "message": "You are already a seller"
}

// Already applied (400)
{
  "success": false,
  "status": 400,
  "message": "You have already applied..."
}
```

---

### Products

#### GET `/products`
Get all products (including unapproved).

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "product_name": "string",
    "product_description": "string",
    "product_price": "string",
    "product_image": ["url1", "url2"],
    "product_category": "string",
    "product_condition": "new | used | refurbished",
    "approved": "boolean",
    "product_owner_id": "string"
  }
]
```

---

#### GET `/products/approved`
Get only approved products with reviews.

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "product_name": "string",
    "product_description": "string",
    "product_price": "string",
    "product_image": ["url1", "url2", "url3"],
    "product_category": "string",
    "product_condition": "new | used | refurbished",
    "approved": true,
    "product_owner_id": "string",
    "product_discount": "number | null",
    "product_likes": "number | null",
    "product_views": "number | null",
    "reviews": [/* array of reviews */]
  }
]
```

---

#### GET `/product?id={productId}`
Get a single product by ID.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID |

**Response:**
```json
// Success (200)
{
  "_id": "string",
  "product_name": "string",
  "product_description": "string",
  "product_price": "string",
  "product_image": ["url1", "url2"],
  "product_category": "string",
  "product_condition": "new | used | refurbished",
  "approved": "boolean",
  "product_owner_id": "string"
}

// Not found (404)
null
```

---

#### GET `/products/seller?sellerId={sellerId}`
Get all products by a specific seller.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sellerId | string | Yes | Seller's customer ID |

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "product_name": "string",
    // ... product fields
  }
]

// No products (404)
{
  "message": "No products found for the given seller ID"
}
```

---

#### GET `/products/related?category={category}`
Get products in a specific category.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | Yes | Category name (case-sensitive, starts with uppercase) |

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "product_name": "string",
    "product_category": "string",
    // ... product fields
  }
]
```

---

#### POST `/create-product`
Create a new product.

**Request Body:**
```json
{
  "products": {
    "approved": "boolean (required)",
    "product_category": "string (required)",
    "product_condition": "new | used | refurbished (required)",
    "product_description": "string (required)",
    "product_image": ["string"] (required) - Array of storage IDs",
    "product_name": "string (required)",
    "product_owner_id": "string (required)",
    "product_price": "string (required)",
    "product_discount": "number (optional)",
    "product_embeddings": "[number] (optional)",
    "product_image_embeddings": "[number] (optional)"
  }
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "message": "Product created successfully"
}

// Error (200 - should be 400/500)
{
  "success": false,
  "message": "Error creating product"
}
```

---

### Shops

#### POST `/create/shop`
Create a new shop.

**Request Body:**
```json
{
  "shop_name": "string (required)",
  "description": "string (required)",
  "owner_id": "string (required)",
  "slogan": "string (required)",
  "cover_image": "string (required)",
  "is_verified": "boolean (required)",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "profile_image": "string (required)",
  "isOpen": "boolean (required)"
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "message": "Success your Shop was successfully created",
  "status": 200,
  "shop": "shop_id"
}

// Name exists (400)
{
  "success": false,
  "message": "This shop_name Already Exists",
  "status": 400
}
```

---

#### GET `/shops`
Get all shops.

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "shop_name": "string",
    "description": "string",
    "owner_id": "string",
    "slogan": "string",
    "profile_image": "string",
    "cover_image": "string",
    "is_verified": "boolean",
    "isOpen": "boolean",
    "location": { "lat": "number", "lng": "number" }
  }
]
```

---

#### GET `/shop/name?name={shopName}`
Get a shop by its name.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Shop name |

**Response:**
```json
// Success (200)
{
  "success": true,
  "status": 200,
  "message": "Shop found",
  "shop": { /* shop object */ }
}

// Not found (404)
{
  "success": false,
  "status": 404,
  "message": "Shop not Found",
  "shop": null
}
```

---

#### GET `/shop/owner?owner_id={owner_id}`
Get a shop by owner ID.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ownerId | string | Yes | Owner's customer ID |

**Response:**
```json
// Success (200)
{
  "success": true,
  "status": 200,
  "message": "Shop found",
  "shop": { /* shop object */ }
}

// Not found (404)
{
  "success": false,
  "status": 404,
  "message": "Shop not Found",
  "user": null
}
```

---

### Cart

#### POST `/create-cart`
Add an item to the cart.

**Request Body:**
```json
{
  "CartItem": {
    "product_id": "string (required) - Product ID",
    "quantity": "number (required)",
    "cart_Owner_id": "string (required) - Customer ID"
  }
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "message": "success"
}

// Invalid data (400)
{
  "message": "Invalid cart data"
}
```

---

#### GET `/cart?userId={userId}`
Get all items in a user's cart.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | Customer ID |

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "product_id": "string",
    "quantity": "number",
    "cart_Owner_id": "string",
    "product": {
      "_id": "string",
      "product_name": "string",
      "product_price": "string",
      "product_image": ["url1", "url2"]
    },
    "totalPrice": "number"
  }
]
```

---

#### POST `/increase-cart`
Increase quantity of a cart item by 1.

**Request Body:**
```json
{
  "product_Id": "string (required) - Product ID",
  "user_id": "string (required) - Customer ID"
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "message": "success"
}

// Not found (400)
{
  "success": false,
  "message": "Cart product not found"
}
```

---

#### POST `/reduce-cart`
Decrease quantity of a cart item by 1 (removes if quantity reaches 0).

**Request Body:**
```json
{
  "product_Id": "string (required) - Product ID",
  "user_id": "string (required) - Customer ID"
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "message": "success"
}
```

---

#### POST `/delete-cart`
Remove an item from the cart completely.

**Request Body:**
```json
{
  "product_Id": "string (required) - Product ID",
  "user_id": "string (required) - Customer ID"
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "message": "success"
}

// Not found (400)
{
  "success": false,
  "message": "Cart product not found"
}
```

---

### Orders

#### GET `/orders/seller?sellerId={sellerId}`
Get all orders for a specific seller.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sellerId | string | Yes | Seller's customer ID |

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "order_status": "pending | confirmed | out-for-delivery | delivered | cancelled",
    "product_id": "string",
    "quantity": "number",
    "user_id": "string",
    "cost": "number | null",
    "specialInstructions": "string | null",
    "sellerId": "string | null",
    "product": {
      "_id": "string",
      "product_name": "string",
      "product_image": ["url1", "url2"]
    }
  }
]
```

---

### Reviews

#### POST `/create-review`
Create a new product review.

**Request Body:**
```json
{
  "product_id": "string (required)",
  "reviewer_id": "string (required)",
  "title": "string (required)",
  "rating": "number (required) - 1 to 5",
  "review": "string (required)",
  "verified": "boolean (optional)",
  "helpful": "number (optional)",
  "notHelpful": "number (optional)"
}
```

**Response:**
```json
// Success (200)
{
  "success": true,
  "message": "Review created successfully"
}

// Already reviewed (400)
{
  "success": false,
  "message": "Only one review per product is allowed"
}

// Validation error (400)
{
  "message": "Invalid review data",
  "errors": [/* Zod validation errors */]
}
```

---

#### GET `/review?productId={productId}`
Get all reviews for a specific product.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | Product ID |

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "product_id": "string",
    "reviewer_id": "string",
    "title": "string",
    "rating": "number",
    "review": "string",
    "verified": "boolean | null",
    "_creationTime": "number"
  }
]
```

---

#### GET `/reviews`
Get all reviews in the system.

**Response:**
```json
// Success (200)
{
  "reviews": [/* array of reviews */],
  "status": 200,
  "success": true
}

// Error (500)
{
  "reviews": [],
  "status": 500,
  "success": false
}
```

---

### Bookmarks & Recommendations

#### GET `/bookmarks?userId={userId}`
Get all bookmarked products for a user.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | Customer ID |

**Response:**
```json
// Success (200)
{
  "bookmarks": [/* array of bookmarked products */],
  "status": 200
}
```

---

#### GET `/recommendations?userId={userId}&type={type}`
Get product recommendations for a user.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | Customer ID |
| type | string | Yes | Recommendation type |

**Response:**
```json
// Success (200)
[/* array of recommended products */]
```

---

### Categories

#### GET `/categories`
Get all product categories.

**Response:**
```json
// Success (200)
[
  {
    "_id": "string",
    "category": "string"
  }
]
```

---

### Webhooks

#### POST `/resendHook`
Webhook endpoint for Resend email events.

**Note:** This endpoint is for internal use by Resend service.

---

## Error Response Format

All error responses follow this general format:

```json
{
  "message": "string - Human readable error message",
  "status": "number (optional) - HTTP status code",
  "errors": "array (optional) - Validation errors"
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (used for authentication success) |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Quick Reference - Endpoints Summary

| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/create-user`  Register new user |
| POST | `/auth`  Login |
| GET | `/user` | ⚠️ Should be | Get user by ID |
| GET | `/user/email` | ⚠️ Should be | Get user by email |
| GET | `/users` | ⚠️ Admin only | Get all users |
| PUT | `/update-user` | ⚠️ Owner only | Update user |
| POST | `/seller/register` | ⚠️ Yes | Apply as seller |
| GET | `/products`  Get all products |
| GET | `/products/approved`  Get approved products |
| GET | `/product`  Get product by ID |
| GET | `/products/seller`  Get seller's products |
| GET | `/products/related`  Get related products |
| POST | `/product` | ⚠️ Seller only | Create product |
| POST | `/create/shop` | ⚠️ Seller only | Create shop |
| GET | `/shops`  Get all shops |
| GET | `/shop/name`  Get shop by name |
| GET | `/shop/owner`  Get shop by owner |
| POST | `/create-cart` | ⚠️ Yes | Add to cart |
| GET | `/cart` | ⚠️ Owner only | Get cart |
| POST | `/increase-cart` | ⚠️ Owner only | Increase quantity |
| POST | `/reduce-cart` | ⚠️ Owner only | Decrease quantity |
| POST | `/delete-cart` | ⚠️ Owner only | Remove from cart |
| GET | `/orders/seller` | ⚠️ Seller only | Get seller orders |
| POST | `/create-review` | ⚠️ Yes | Create review |
| GET | `/review`  Get product reviews |
| GET | `/reviews`  Get all reviews |
| GET | `/bookmarks` | ⚠️ Owner only | Get bookmarks |
| GET | `/recommendations` | ⚠️ Yes | Get recommendations |
| GET | `/categories`  Get categories |

⚠️ = Authentication/Authorization currently missing but recommended

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-01 | Initial documentation |
