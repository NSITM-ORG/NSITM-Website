# Create and enter the project directory
mkdir nsitm-backend
cd nsitm-backend

# Initialize project
npm init -y

# ── PRODUCTION DEPENDENCIES ──────────────────────────────────────────
npm install \
  express \
  mongoose \
  dotenv \
  bcryptjs \
  jsonwebtoken \
  cors \
  helmet \
  compression \
  morgan \
  cookie-parser \
  express-mongo-sanitize \
  express-rate-limit \
  express-validator \
  hpp \
  multer \
  cloudinary \
  streamifier \
  resend \
  winston \
  csv-stringify \
  xss

# ── DEVELOPMENT DEPENDENCIES ─────────────────────────────────────────
npm install --save-dev nodemon