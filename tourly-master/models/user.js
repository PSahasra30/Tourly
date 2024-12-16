const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure that email is unique
    lowercase: true, // Email will be converted to lowercase before saving
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Hash the user's password before saving to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Skip if password hasn't changed

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare a candidate password with the hashed password in the database
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
