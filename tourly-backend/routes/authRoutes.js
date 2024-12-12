const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();

// POST Route for User Registration
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Route for User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Route for Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send reset email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password',  // Replace with your email password
      },
    });

    const mailOptions = {
      to: email,
      from: 'your-email@gmail.com',
      subject: 'Password Reset',
      text: `To reset your password, please click the link below:\n\nhttp://localhost:5000/reset-password/${resetToken}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.status(200).json({ message: 'Reset link sent to email' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Route for Resetting Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
