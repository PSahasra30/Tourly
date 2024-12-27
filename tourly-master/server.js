const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
// Load environment variables from a .env file
dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));

// MongoDB User Model (simple version)
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
}));

// API routes for registration and login
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords don't match" });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create and save the new user
  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  res.status(201).json({ message: 'User registered successfully. Please log in.' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Compare the password with the hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Generate a JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Return the token
  res.json({ message: 'Login successful', token });
});

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Handle requests to other routes (return index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index1.html'));
});


app.use(bodyParser.json());
app.use(cors());

app.post('/send-email', async (req, res) => {
    const { name, email, phone, members, date, packageName, amount } = req.body;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your email', // Replace with your email
            pass: 'your app password', // Replace with your email password
        },
    });
    const cleanedAmount = amount.replace(/[^0-9.-]/g, ''); // Remove everything except digits, minus, and period
    const money = Number(cleanedAmount);    const mem = Number(members);   // Ensure members is an integer
    // Validate the parsed values
    if (isNaN(money) || isNaN(mem)) {
        return res.status(400).send('Invalid amount or members');
    } // Make sure members is an integer
   
    const totalPrice = money * mem; // Calculate the total price
    const text = `Hi ${name},\n\nThank you for booking "${packageName}".\n\nDetails:\n- Number of Members: ${members}\n- Preferred Date: ${date}\n- Price per Member: ${amount}\n- Total Price: $${totalPrice}\n\nYour booking has been successfully submitted!\n\nRegards,\nTeam.`;
    
    const mailOptions = {
        from: 'Your email',
        to: email, // User's email
        subject: 'Booking Confirmation',
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        res.redirect('/receipt.html');
        
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});