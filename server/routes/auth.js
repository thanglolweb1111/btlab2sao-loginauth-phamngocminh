const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { console } = require('inspector');
const router = express.Router();
const jwt = require('jsonwebtoken');
// const { google } = require('googleapis');
const User = require('../models/User');
const UserAuth = require('../models/UserAuth');

// Signup route
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User không tìm thấy' });
        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Thông tin đăng nhập không hợp lệ' });
        
        // Tạo Public và Private Key mới
        const KeyPublic = crypto.randomBytes(60).toString('hex'); 
        const KeyPrivate = crypto.randomBytes(60).toString('hex'); 
        
        // Tạo tokenAccess và tokenRefresh
        const tokenAccess = jwt.sign({ id: user._id, email: user.email }, KeyPrivate, { expiresIn: '1m' }); 
        const tokenRefresh = jwt.sign({ id: user._id }, KeyPublic, { expiresIn: '1d' }); 

        let userAuth = await UserAuth.findOne({ id_User: user._id.toString() });
        if (userAuth) {
            if (userAuth.TokenRefress) {
                userAuth.HistoryToken.push(userAuth.TokenRefress);
            }
            // Cập nhật TokenAccess, TokenRefresh, và KeyPublic, KeyPrivate
            userAuth.TokenAcess = tokenAccess;
            userAuth.TokenRefress = tokenRefresh;
            userAuth.KeyPublic = KeyPublic;
            userAuth.KeyPrivate = KeyPrivate;
            await userAuth.save(); // Lưu cập nhật vào database
        } else {
            // Nếu không tìm thấy userAuth, tạo mới bản ghi
            userAuth = new UserAuth({
                id_User: user._id.toString(),
                email: user.email,
                TokenAcess: tokenAccess,
                TokenRefress: tokenRefresh,
                HistoryToken: [],
                KeyPublic, // Lưu Public Key
                KeyPrivate // Lưu Private Key
            });
            await userAuth.save(); // Lưu userAuth mới
        }
        res.status(200).json({ message: 'Login thành công', user, tokenAccess, tokenRefresh });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const generateRandomPassword = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log(email);
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        
        const newPassword = generateRandomPassword(12); 
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        console.log(`New password for ${email}: ${newPassword}`); // Log mật khẩu mới để kiểm tra
        user.password = hashedPassword;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your New Password',
            text: `Your password has been reset successfully.\n\n` +
                    `Here is your new password: ${newPassword}\n\n` +
                    `Please change your password after logging in for security reasons.\n`,
        };
        let nodeMailer = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            }
        });
        nodeMailer.sendMail(mailOptions, (err) => {
            console.log(err || "Email sent successfully");
        });

        res.status(200).json({ message: 'New password sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
