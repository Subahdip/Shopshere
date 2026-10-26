# ShopSphere — MERN fashion store

A local-development full-stack e-commerce demo built with React + Vite, Express, Node.js, and MongoDB. Includes product browsing/search/filter/sorting, JWT login/register, cart persistence, order placement, stock checks, order history, and an admin dashboard. Online payment processing is intentionally not implemented.

## Prerequisites
- Node.js 20.19+ (or a Node version supported by Vite 6) and npm
- MongoDB Community Server running locally, usually at `mongodb://127.0.0.1:27017`
- Git/VS Code optional

## 1. Configure the backend
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and set a long random `JWT_SECRET`. Ensure MongoDB is running locally. The default URI is `mongodb://127.0.0.1:27017/shopsphere`.

Seed sample products and create/reset the local admin account:
```bash
npm run seed
```
Default local demo credentials are `admin@shopsphere.local` / `ChangeMe123!` unless changed in `.env`. Change them before using this beyond a local demo.

Start the API in one terminal:
```bash
npm run dev
```
API health check: `http://localhost:5000/api/health`.

## 2. Configure the frontend
In another terminal:
```bash
cd client
npm install
```
Copy `.env.example` to `.env` if you need a custom API URL. Then run:
```bash
npm run dev
```
Open `http://localhost:5173`.

## Main routes
- `/` homepage
- `/shop` searchable catalog
- `/product/:id` product detail
- `/cart` shopping bag
- `/register` and `/login`
- `/checkout` protected checkout (COD demo)
- `/orders` customer order history
- `/admin` protected admin dashboard

## API endpoints
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Signed in | Current user |
| GET | `/api/products` | Public | List/search/filter/sort products |
| GET | `/api/products/:id` | Public | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | Signed in | Place order |
| GET | `/api/orders/my` | Signed in | Current user's orders |
| GET | `/api/orders` | Admin | List all orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

## Important implementation notes
- Passwords are hashed with bcrypt; JWTs are sent in the Authorization header.
- The cart is persisted in browser localStorage. Never trust client-submitted prices: the server loads product prices and validates stock when creating an order.
- This starter decrements stock item-by-item. For production, use a MongoDB transaction on a replica set, atomic stock reservation, stronger rate limiting, request validation, audit logging, and tests.
- The JWT is stored in localStorage for ease of learning. For a production deployment, consider secure, HttpOnly cookies and appropriate CSRF protections.
- Images are sample remote Unsplash URLs. Replace with licensed assets or an image-storage service for a real store.
- The seed script resets the products collection and resets the configured admin password. Run it only when intended.
- This is a learning starter, not a production-audited commerce platform. Payment integration, tax rules, shipping-provider integration, email notifications, returns, and deployment hardening are future work.
