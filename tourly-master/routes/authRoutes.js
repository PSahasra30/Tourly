const express = require('express');
const User = require('./models/User'); // Assuming you have User model
const bcrypt = require('bcryptjs'); // For password comparison
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); // Find user by email
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Successful login, send a success message and user data
    res.status(200).json({
      message: 'Login successful',
      user: { email: user.email, name: user.name }, // Send only necessary user info
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
