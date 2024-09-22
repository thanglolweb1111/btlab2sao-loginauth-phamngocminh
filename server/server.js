const express = require('express');
const cors = require('cors'); 
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/auth'); 
const authenticateToken = require('./middleware/authenticateToken'); 
const verifyToken = require('./middleware/middlewareRouter'); 

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); 
// Connect to MongoDB
connectDB();
// Use the auth routes
app.use('/api/auth', authRoutes);
// Protected route example
app.post('/api/me', authenticateToken, (req, res) => {
    res.json({ user: req.user }); 
});
app.post('/api/verify', verifyToken, (req, res) => {
    res.json({ user: req.user }); 
});
// Test route to ensure server is running
app.get('/', (req, res) => {
    res.send('Server is running!');
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
