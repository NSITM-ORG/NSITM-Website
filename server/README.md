# NSITM School System - Express Backend Server

A production-ready Express.js backend server for the NSITM School Management System with MongoDB integration, comprehensive middleware setup, and scalable architecture.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (Local Mongo Compass or Atlas)
- npm or yarn

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create environment variables**
   - The `.env` file is already configured with local development settings
   - Copy `.env.example` if you need a fresh template
   - Update values as needed

3. **Start the server**

   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
server/
├── config/                 # Configuration files
│   ├── database.js        # MongoDB connection setup
│   └── cloudinary.js      # Cloudinary configuration (for future use)
├── middleware/            # Express middleware
│   ├── cors.js           # CORS configuration
│   ├── rateLimiter.js    # Rate limiting for API protection
│   ├── imageCompression.js # Image optimization with Sharp
│   └── errorHandler.js   # Global error handling
├── models/               # Mongoose schemas (currently empty, add here)
├── controllers/          # Business logic (currently empty, add here)
├── routes/              # API route definitions (currently empty, add here)
├── utils/               # Utility functions and helpers
│   └── helpers.js       # Logger and response formatters
├── uploads/             # Upload directory with subdirectories
│   ├── temp/           # Temporary file storage
│   └── optimized/      # Optimized images after compression
├── index.js            # Main application entry point
├── .env                # Environment variables (development)
├── .env.example        # Environment variables template
└── package.json        # Dependencies and scripts
```

## 🔧 Environment Variables

### Current Configuration (.env)

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/nsitm_school_system
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
IMAGE_QUALITY=80
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1920
```

### For Production

When deploying to production:

1. Update `.env` with production values
2. Change `NODE_ENV` to `production`
3. Use MongoDB Atlas instead of local connection
4. Update CORS_ORIGIN to your production domain
5. Set strong JWT_SECRET
6. Configure Cloudinary for image storage
7. Setup email configuration (SMTP)

## 🛠️ Features & Middleware

### ✅ Already Implemented

1. **CORS Middleware** - Cross-Origin Resource Sharing
   - Configured for React frontend (localhost:3000, 3001)
   - Credentials support enabled
   - Customizable origins via environment variables

2. **Rate Limiting** - API Protection
   - General rate limiter: 100 requests per 15 minutes
   - Auth limiter: 5 login attempts per 15 minutes
   - Upload limiter: 20 uploads per hour
   - Disabled in development mode

3. **Image Compression** - Automatic Image Optimization
   - Powered by Sharp
   - Automatic resize to max 1920x1920
   - Converts to WebP format
   - Configurable quality (default 80%)
   - Validates file type and size

4. **Database Connection** - MongoDB with Mongoose
   - Connection pooling
   - Error handling and retry logic
   - Automatic schema validation

5. **Error Handling** - Comprehensive Error Management
   - Global error handler middleware
   - Async error wrapper (asyncHandler)
   - Mongoose validation error handling
   - JWT error handling
   - Custom AppError class
   - Development vs Production error responses

6. **Cloudinary Integration** - Cloud Image Storage (Ready for use)
   - Upload to Cloudinary
   - Delete from Cloudinary
   - URL generation with transformations
   - Can be enabled by setting CLOUDINARY credentials

7. **Logging** - Colored Console Logging
   - Success, error, warning, and info logs
   - Formatted timestamps
   - Environment-aware logging

### 📝 Utility Functions

**Response Formatters** (utils/helpers.js)

- `successResponse()` - Send success responses
- `errorResponse()` - Send error responses
- `logger` - Colored logging

**Async Wrapper** (middleware/errorHandler.js)

- `asyncHandler()` - Automatically catches async errors

**Custom Error Class**

- `AppError` - Structured error handling

## 🔌 API Endpoints

### Health Check

```bash
GET /health
# Response: { success: true, message: "Server is running", environment: "development" }
```

### API Info

```bash
GET /api/info
# Response: { success: true, message: "NSITM School System API", version: "1.0.0" }
```

## 📚 Adding New Features

### Step 1: Create a Model

Create a new file in `models/` directory:

```javascript
// models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
```

### Step 2: Create a Controller

Create a new file in `controllers/` directory:

```javascript
// controllers/userController.js
import User from "../models/user.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { successResponse, errorResponse } from "../utils/helpers.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  successResponse(res, "Users retrieved successfully", users);
});
```

### Step 3: Create Routes

Create a new file in `routes/` directory:

```javascript
// routes/userRoutes.js
import express from "express";
import { getUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);

export default router;
```

### Step 4: Register Routes

Update `index.js`:

```javascript
import userRoutes from "./routes/userRoutes.js";

// In the ROUTES section, add:
app.use("/api/users", userRoutes);
```

## 🔐 Security Features

1. **Rate Limiting** - Prevents brute force attacks
2. **CORS** - Restricts cross-origin requests
3. **Environment Variables** - Secrets not in code
4. **Input Validation** - Via Mongoose schemas
5. **Error Handling** - No sensitive info in production
6. **File Upload Security** - Type and size validation

## 📦 Dependencies

| Package            | Purpose                       |
| ------------------ | ----------------------------- |
| express            | Web framework                 |
| mongoose           | MongoDB ODM                   |
| cors               | Cross-Origin Resource Sharing |
| express-rate-limit | API rate limiting             |
| sharp              | Image compression             |
| dotenv             | Environment variable loading  |
| chalk              | Colored console output        |
| cloudinary         | Cloud image storage           |

## 🧪 Testing

Health check:

```bash
curl http://localhost:5000/health
```

API info:

```bash
curl http://localhost:5000/api/info
```

## 🚢 Deployment Checklist

- [ ] Update `.env` for production environment
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB connection (Atlas)
- [ ] Update CORS_ORIGIN to production domain
- [ ] Set strong JWT_SECRET
- [ ] Setup Cloudinary credentials
- [ ] Configure SMTP for email
- [ ] Enable rate limiting (currently disabled in dev)
- [ ] Setup SSL/HTTPS
- [ ] Configure proper logging
- [ ] Setup error monitoring (e.g., Sentry)
- [ ] Run security audit: `npm audit`

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running (check Mongo Compass)
- Verify MONGO_URI in .env
- Check firewall settings

### CORS Errors

- Add your frontend URL to CORS_ORIGIN in .env
- Multiple origins separated by commas

### Rate Limit Issues

- Disable rate limiting in development (already done)
- Adjust limits in .env or middleware/rateLimiter.js

### Image Compression Issues

- Ensure uploads directory exists
- Check file permissions
- Verify Sharp installation: `npm list sharp`

## 📖 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": {}
}
```

## 🤝 Contributing

1. Create a new branch for features
2. Follow the project structure
3. Use asyncHandler for async routes
4. Add proper error handling
5. Test before committing

## 📄 License

ISC

## 👨‍💻 Author

NSITM Development Team

## 📞 Support

For issues or questions, contact the development team.

---

**Last Updated:** 2024
**Production Ready:** ✅ Yes
