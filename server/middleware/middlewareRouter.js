const jwt = require('jsonwebtoken');
const UserAuth = require('../models/UserAuth'); 

const verifyToken = async (req, res, next) => {
    const tokenAccess = req.body.tokenAccess;
    const tokenRefresh = req.body.tokenRefresh;
    const userId = req.body.user; 
    if (!tokenAccess || !tokenRefresh || !userId) {
        return res.status(401).json({ error: 'Vui lòng cung cấp access token, refresh token và user ID' });
    }
    const datauser = await UserAuth.findOne({ id_User: userId });
    if (!datauser) {
        return res.status(404).json({ error: 'Người dùng không tìm thấy' });
    }
    jwt.verify(tokenAccess, datauser.KeyPrivate, (err) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ error: 'Token đã hết hạn' });  // Chỉ gửi 1 phản hồi
            }
            return res.status(403).json({ error: 'Token không hợp lệ' }); // Chỉ gửi 1 phản hồi
        }
        if (!datauser.TokenAcess || datauser.TokenAcess !== tokenAccess) {
            console.log('Access token does not match');
            return res.status(403).json({ error: 'Access token không khớp' }); // Chỉ gửi 1 phản hồi
        }
        console.log('Token verified successfully'); 
        return res.json({ message: 'success' }); // Chỉ gửi 1 phản hồi
    });
};

module.exports = verifyToken;
