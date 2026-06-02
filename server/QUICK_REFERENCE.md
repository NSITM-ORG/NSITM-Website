# 🚀 NSITM Express Server - Quick Reference

## Starting the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## Testing Server

```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api/info
```

## Environment Setup

- **Development**: Uses `mongodb://localhost:27017` (Mongo Compass)
- **Production**: Update MONGO_URI to MongoDB Atlas connection string
- **CORS**: Configured for localhost:3000 and localhost:3001 (React ports)

## Adding New Features

### 1. Create Model

```javascript
// models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export default mongoose.model("User", userSchema);
```

### 2. Create Controller

```javascript
// controllers/userController.js
import User from "../models/user.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { successResponse } from "../utils/helpers.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  successResponse(res, "Users retrieved", users);
});
```

### 3. Create Routes

```javascript
// routes/userRoutes.js
import express from "express";
import { getUsers } from "../controllers/userController.js";

const router = express.Router();
router.get("/", getUsers);

export default router;
```

### 4. Register in index.js

```javascript
import userRoutes from "./routes/userRoutes.js";

// In ROUTES section:
app.use("/api/users", userRoutes);
```

## Key Middleware

| Middleware        | Purpose                 | Location                          |
| ----------------- | ----------------------- | --------------------------------- |
| CORS              | Allow React frontend    | `/middleware/cors.js`             |
| Rate Limiter      | Prevent abuse           | `/middleware/rateLimiter.js`      |
| Image Compression | Optimize images         | `/middleware/imageCompression.js` |
| Error Handler     | Global error management | `/middleware/errorHandler.js`     |

## Upload Configuration

- **Temp uploads**: `./uploads/temp`
- **Optimized images**: `./uploads/optimized`
- **Max file size**: 10MB (configurable via env)
- **Image quality**: 80% (configurable via env)
- **Auto-resize**: Max 1920x1920

## Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* ... */
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Error occurred"
}
```

## Environment Variables Cheat Sheet

```env
NODE_ENV=development|production
PORT=5000
MONGO_URI=mongodb://localhost:27017/db_name
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
IMAGE_QUALITY=80
```

## Useful npm Commands

```bash
npm install              # Install dependencies
npm run dev             # Start dev server with hot reload
npm start               # Start production server
npm audit               # Check for vulnerabilities
npm audit fix           # Fix vulnerabilities
npm list                # Show installed packages
```

## Common Issues & Solutions

### MongoDB won't connect

```
❌ ECONNREFUSED
✅ Solution: Start MongoDB via Mongo Compass or mongod CLI
```

### CORS errors

```
❌ CORS policy: origin not allowed
✅ Solution: Add frontend URL to CORS_ORIGIN in .env
```

### Rate limit blocking

```
❌ Too many requests
✅ Solution: Wait 15 minutes or restart server (dev only)
```

## File Structure Reference

```
server/
├── index.js              # Main server file - Entry point
├── .env                  # Dev environment variables
├── .env.example          # Template for .env
├── README.md             # Full documentation
├── SETUP_COMPLETE.md     # Setup verification
│
├── config/
│   ├── database.js       # MongoDB setup
│   └── cloudinary.js     # Cloud storage (future)
│
├── middleware/
│   ├── cors.js           # Cross-origin setup
│   ├── rateLimiter.js    # Rate limiting
│   ├── imageCompression.js # Image optimization
│   └── errorHandler.js   # Error handling
│
├── utils/
│   └── helpers.js        # Response formatters & logger
│
├── models/               # Add Mongoose schemas here
├── controllers/          # Add business logic here
├── routes/              # Add API endpoints here
└── uploads/             # File uploads (auto-created)
```

## Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Update MONGO_URI to Atlas
- [ ] Set strong JWT_SECRET
- [ ] Update CORS_ORIGIN to domain
- [ ] Configure Cloudinary (if using)
- [ ] Setup SMTP (if using email)
- [ ] Run npm audit && npm audit fix
- [ ] Test all endpoints
- [ ] Setup error monitoring
- [ ] Configure SSL/HTTPS

## Support & Resources

- **MongoDB**: Ensure mongod service is running
- **Nodemon**: Only works with .js changes (not .env changes)
- **Sharp**: Requires native build tools on Windows
- **Cloudinary**: Optional - enable by setting credentials

---

For detailed documentation, see `README.md`
