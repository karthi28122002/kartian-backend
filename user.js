// user.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./schemas/userSchema.js'); // Import the correct model

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      req.userId = decoded.userId;
      next();
    });
};

// Registration route
router.post('/register', async (req, res) => {
    try {
      const { firstName, lastName, email, phoneNumber, password } = req.body;
  
      const newUser = new User({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });
  
      await newUser.save();
  
      console.log('Registration successful'); // Add this line for debugging
      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error during registration:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      console.log('Attempting to find user by email:', email);
  
      const user = await User.findOne({ email });
  
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      console.log('User found:', user);
  
      const isPasswordMatch = await user.comparePassword(password);
  
      if (!isPasswordMatch) {
        console.log('Invalid password');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      console.log('Password matched, creating token');
  
      const token = jwt.sign({ userId: user._id }, 'your-secret-key');
      res.json({ user: { firstName: user.firstName }, token });
  
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.get('/dashboard/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: { firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
