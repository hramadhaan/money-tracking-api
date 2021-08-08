const jwt = require('jsonwebtoken')

const servicesjwt = require('../services/jwtservices')

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization')

    if (!authHeader) {
        res.status(401).json({
            message: 'Unauthorized Token',
            success: false
        })
    }

    const token = authHeader.split(' ')[1]
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, servicesjwt.password)
    } catch (err) {
        res.status(500).json({
            message: 'Kesalahan Koneksi',
            success: false,
            errors: err
        })
    }

    if (!decodedToken) {
        res.status(400).json({
            message: 'Not Authenticated',
            success: false
        })
    }

    req.userId = decodedToken.userId

    next()
}