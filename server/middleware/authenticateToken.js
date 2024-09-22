const jwt = require('jsonwebtoken');
const UserAuth = require('../models/UserAuth'); // Điều chỉnh đường dẫn nếu cần
const crypto = require('crypto');


const authenticateToken = async (req, res, next) => {
    const { token: accessToken, userid } = req.body;
    console.log('accessToken:', accessToken); 
    console.log('id user:', userid); 

    if (!accessToken) return res.status(401).json({ message: 'Failtoken' });
    try {
        // Tìm userAuth dựa trên userid
        const userAuth = await UserAuth.findOne({ id_User: userid });
        if (!userAuth) {
            return res.status(403).json({ message: 'Invalid user' });
        }
        // Kiểm tra khóa public được sử dụng có khớp không
        console.log('KeyPublic used for verification:', userAuth.KeyPublic);
        if (userAuth.HistoryToken.includes(accessToken)) {
            console.log('Token đã tồn tại trong lịch sử, xóa userAuth');
            await UserAuth.deleteOne({ id_User: userid });
            return res.status(200).json({ message: 'User auth deleted due to duplicate token' });
        } else {
            console.log('Token không nằm trong lịch sử, không cần xóa userAuth');
        }
        // Tạo token mới và cập nhật thông tin
        const newKeyPublic = crypto.randomBytes(60).toString('hex');
        const newKeyPrivate = crypto.randomBytes(60).toString('hex');
        const newAccessToken = jwt.sign({ id: userid }, newKeyPrivate, { expiresIn: '1m' });
        const newRefreshToken = jwt.sign({ id: userid }, newKeyPublic, { expiresIn: '1d' });
        userAuth.HistoryToken.push(accessToken);
        userAuth.TokenAcess = newAccessToken;
        userAuth.TokenRefress = newRefreshToken;
        userAuth.KeyPublic = newKeyPublic;
        userAuth.KeyPrivate = newKeyPrivate;
        await userAuth.save();
        req.user = { id: userid };
        req.newAccessToken = newAccessToken;
        req.newRefreshToken = newRefreshToken;
        return res.status(200).json({
            newAccessToken: newAccessToken,
            newRefreshToken: newRefreshToken,
        });
        next();
    } catch (err) {
        console.error('Error:', err);
        const isExpired = err.name === 'TokenExpiredError';
        return res.status(403).json({ message: isExpired ? 'Token expired, please log in again' : 'Invalid token' });
    }
};



module.exports = authenticateToken;
