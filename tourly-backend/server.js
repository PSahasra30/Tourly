const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // We'll create this file later

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// MongoDB connection string (replace with your Atlas or local MongoDB URI)
mongoose.connect('mongodb://localhost:27017/tourly', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Failed to connect to MongoDB:', err));

// Use authentication routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
