import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config'; // Direct config import for ES Modules

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Built-in Express middleware to parse incoming JSON requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Sample Route
app.get('/', (req, res) => {
  res.send('Hello from the Express server!');
});
app.get('/hello', (req, res) => {
    var le = 3 + 0
  res.send(le);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
