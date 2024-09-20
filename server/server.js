const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import MongoDB connection function
const authRoutes = require('./routes/auth'); // Import auth routes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
connectDB();

// Use the auth routes
app.use('/api/auth', authRoutes); // Use auth routes under '/api/auth' path

// Test route to ensure server is running
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
