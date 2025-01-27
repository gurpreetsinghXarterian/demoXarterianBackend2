const jwt = require('jsonwebtoken');
const { decrypt } = require('../handlers/helperFunction');

const authenticateToken = () => {
return(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).send({ title: 'Token Missing', message: 'Not Authorized' });

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send({ title: 'Wrong Token',  message: "Not Authorized" });
        req.user = user || {};
        const {userId,email,phone,...other}=user
        req.user.userId = decrypt(userId);
        req.user.email = decrypt(email);
        req.user.phone = decrypt(phone);
        req.user = { ...req.user, ...other };
        
        next();
    });
};
};
module.exports = authenticateToken;
