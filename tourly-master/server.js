const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');

// Serve static files from the "tourly" folder
app.use(express.static(path.join(__dirname, 'tourly')));

// middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the "index.html" file on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Correct path to index.html
});


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
  });
  
  // Handle form submission
  app.post('/register', (req, res) => {
    const { name, email, password, confirmPassword, gender } = req.body;
  
    // Perform validation and save to database (placeholder logic)
    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match!');
    }
  
    // Save user to database (Example only, no DB configured)
    console.log('User registered:', { name, email, gender });
    res.send('Registration successful!');
  });
  
  app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
  });
  
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
