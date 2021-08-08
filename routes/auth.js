const express = require('express')
const { body } = require('express-validator')
const multer = require('multer')
const fs = require('fs')

// Models
const Auth = require('../models/auth')

// Controllers
const authControllers = require('../controllers/auth')

// Middleware
const isAuth = require('../middleware/authentication')

// Storage
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb(null, 'images/profile/')
        const path = 'images/profile'
        fs.mkdirSync(path, { recursive: true })
        cb(null, path)
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + ' - ' + file.originalname)
    }
})

const router = express.Router()

// Function
router.post('/register', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return Auth.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email address already exists')
                    }
                })
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
], authControllers.register)

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').trim().isLength({ min: 5 })
], authControllers.login)

router.post('/photo-profile', isAuth, multer({ storage: fileStorage }).single('photo'), authControllers.addPhotoProfile)

router.get('/profile', isAuth, authControllers.profile)

module.exports = router