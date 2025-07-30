# API Routes Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Routes (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/user/login` | User login | No |
| POST | `/auth/user/register` | User registration | No |
| POST | `/auth/user/logout` | User logout | User |
| POST | `/auth/vendor/login` | Vendor login | No |
| POST | `/auth/vendor/register` | Vendor registration | No |
| POST | `/auth/vendor/logout` | Vendor logout | Vendor |
| POST | `/auth/admin/login` | Admin login | No |
| POST | `/auth/admin/logout` | Admin logout | Admin |

## User Routes (`/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | User |
| PUT | `/users/profile` | Update user profile | User |
| GET | `/users/addresses` | Get user addresses | User |
| POST | `/users/addresses` | Add user address | User |
| PUT | `/users/addresses/:id` | Update user address | User |
| DELETE | `/users/addresses/:id` | Delete user address | User |
| GET | `/users/orders` | Get user orders | User |
| GET | `/users/orders/:id` | Get user order by ID | User |
| GET | `/users/wishlist` | Get user wishlist | User |
| POST | `/users/wishlist/:productId` | Add to wishlist | User |
| DELETE | `/users/wishlist/:productId` | Remove from wishlist | User |

## Vendor Routes (`/vendors`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/vendors/profile` | Get vendor profile | Vendor |
| PUT | `/vendors/profile` | Update vendor profile | Vendor |
| GET | `/vendors/dashboard` | Get vendor dashboard | Vendor |
| GET | `/vendors/earnings` | Get vendor earnings | Vendor |

### Vendor Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/vendors/products` | Create product | Vendor |
| PUT | `/vendors/products/:id` | Update product | Vendor |
| DELETE | `/vendors/products/:id` | Delete product | Vendor |
| GET | `/vendors/products/released` | Get released products | Vendor |
| GET | `/vendors/products/drafts` | Get draft products | Vendor |
| GET | `/vendors/products/scheduled` | Get scheduled products | Vendor |

### Vendor Product Bulk Operations
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/vendors/products/unpublish` | Unpublish products | Vendor |
| POST | `/vendors/products/publish` | Publish products | Vendor |
| DELETE | `/vendors/products/bulk` | Delete multiple products | Vendor |

### Vendor Product Scheduling
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/vendors/products/schedule` | Schedule products | Vendor |
| PUT | `/vendors/products/reschedule` | Reschedule products | Vendor |
| POST | `/vendors/products/cancel-schedule` | Cancel scheduled products | Vendor |
| POST | `/vendors/products/publish-scheduled` | Publish scheduled products | Vendor |

### Vendor Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/vendors/orders` | Get vendor orders | Vendor |
| GET | `/vendors/orders/:id` | Get vendor order by ID | Vendor |
| PUT | `/vendors/orders/:id` | Update vendor order | Vendor |
| PUT | `/vendors/orders/:id/status` | Update order status | Vendor |

### Vendor Reviews
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/vendors/reviews` | Get vendor reviews | Vendor |
| GET | `/vendors/reviews/analytics` | Get review analytics | Vendor |
| POST | `/vendors/reviews/:reviewId/responses` | Add review response | Vendor |
| PUT | `/vendors/reviews/:reviewId/responses/:responseId` | Update review response | Vendor |
| DELETE | `/vendors/reviews/:reviewId/responses/:responseId` | Delete review response | Vendor |

### Admin Vendor Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/vendors/admin/list` | Get all vendors | Admin |
| GET | `/vendors/admin/stats` | Get vendor stats | Admin |
| GET | `/vendors/admin/:id` | Get vendor by ID | Admin |
| PUT | `/vendors/admin/:id` | Update vendor | Admin |
| DELETE | `/vendors/admin/:id` | Delete vendor | Admin |
| GET | `/vendors/admin/:id/products` | Get vendor products | Admin |
| GET | `/vendors/admin/:id/orders` | Get vendor orders | Admin |

## Product Routes (`/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | No |
| GET | `/products/search` | Search products | No |
| GET | `/products/category/:categorySlug` | Get products by category | No |
| GET | `/products/slug/:slug` | Get product by slug | No |
| GET | `/products/:id` | Get product by ID | No |
| GET | `/products/:id/similar` | Get similar products | No |

### Product Reviews
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products/:id/reviews` | Get product reviews | No |
| POST | `/products/:id/reviews` | Create product review | User |
| PUT | `/products/:id/reviews/:reviewId` | Update product review | User |
| DELETE | `/products/:id/reviews/:reviewId` | Delete product review | User |

### Product Review Responses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/products/:id/reviews/:reviewId/responses` | Add review response | User |
| PUT | `/products/:id/reviews/:reviewId/responses/:responseId` | Update review response | User |
| DELETE | `/products/:id/reviews/:reviewId/responses/:responseId` | Delete review response | User |

### Vendor Product Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/products` | Create product | Vendor |
| PUT | `/products/:id` | Update product | Vendor |
| DELETE | `/products/:id` | Delete product | Vendor |

## Category Routes (`/categories`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | No |
| GET | `/categories/:id` | Get category by ID | No |
| POST | `/categories` | Create category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

## Order Routes (`/orders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | Get all orders | Admin |
| GET | `/orders/:id` | Get order by ID | Admin/User |
| POST | `/orders` | Create order | User |
| PUT | `/orders/:id` | Update order | Admin |
| DELETE | `/orders/:id` | Delete order | Admin |

## Cart Routes (`/cart`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get cart | User |
| POST | `/cart` | Add to cart | User |
| PUT | `/cart/:id` | Update cart item | User |
| DELETE | `/cart/:id` | Remove from cart | User |
| DELETE | `/cart` | Clear cart | User |

## Authentication Middleware

### User Authentication
- `protectUser`: Requires valid user token
- `optionalUserAuth`: Optional user authentication

### Vendor Authentication
- `protectVendor`: Requires valid vendor token
- `optionalVendorAuth`: Optional vendor authentication

### Admin Authentication
- `protectAdmin`: Requires valid admin token

### Multi-User Authentication
- `protectAny`: Accepts any valid user type (user, vendor, admin)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Common Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Search & Filtering
- `search`: Search term
- `sort`: Sort field
- `order`: Sort order (asc/desc)
- `category`: Category filter
- `price_min`: Minimum price
- `price_max`: Maximum price
- `rating`: Rating filter

## File Upload

### Product Images
- Endpoint: `/vendors/products` (POST/PUT)
- Content-Type: `multipart/form-data`
- Field name: `images`
- Supported formats: JPG, PNG, WebP
- Max file size: 5MB per file
- Max files: 10 per product

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- API endpoints: 100 requests per minute
- File uploads: 10 requests per minute 