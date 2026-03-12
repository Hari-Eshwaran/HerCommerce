# HerCommerce - Smart Home Business Support System

A digital platform designed to help women running small home businesses (tailoring, baking, handicrafts, homemade food, beauty services) manage and grow their business effectively.

## Features

- **Customer Management**: Track customer information, order history, and spending patterns
- **Order Management**: Create, track, and manage customer orders with status updates
- **Product Catalog**: Manage your products with pricing, stock tracking, and categories
- **Sales Dashboard**: Visual insights into your business performance
- **AI Tools**: Smart pricing suggestions, marketing ideas, and business assistant

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router DOM
- Recharts (for charts)
- Axios

### Backend
- Node.js
- Express.js
- MongoDB Atlas (Mongoose)
- OpenAI API (optional, for AI features)

## Project Structure

```
/client
  /src
    /components    # Reusable UI components
    /pages         # Page components
    /services      # API services
/server
  /controllers     # Request handlers
  /routes          # API routes
  /models          # MongoDB schemas
  /services        # Business logic services
  /ai              # AI service integrations
  server.js        # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- (Optional) OpenAI API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HerCommerce
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   Or install manually:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Configure environment variables**

   For the server:
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/hercommerce
   ```

   For the client:
   ```bash
   cd client
   cp .env.example .env
   ```

4. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```
   This starts both frontend (port 5173) and backend (port 5000).

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist your IP address (or allow access from anywhere for development)
5. Get your connection string and add it to `.env`

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get by category
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update status
- `DELETE /api/orders/:id` - Delete order

### Dashboard
- `GET /api/dashboard/stats` - Get business stats
- `GET /api/dashboard/sales` - Get sales data
- `GET /api/dashboard/recent-orders` - Get recent orders

### AI Tools
- `POST /api/ai/pricing` - Get pricing suggestions
- `POST /api/ai/description` - Generate descriptions
- `POST /api/ai/marketing` - Get marketing ideas
- `POST /api/ai/chat` - Business assistant chat

## Business Categories

The platform supports these home business categories:
- Tailoring
- Baking
- Handicrafts
- Homemade Food
- Beauty Services

## AI Features

The AI tools work with or without an OpenAI API key:
- **With API key**: Full AI-powered responses using GPT
- **Without API key**: Rule-based fallback suggestions

To enable AI features, add your OpenAI API key to the server `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the repository or contact the maintainers.

---

Made with ❤️ for women entrepreneurs
