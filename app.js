const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')

// Internal File
const mongoServices = require('./services/mongooDB')

// Routes
const authRoutes = require('./routes/auth')
const walletRoutes = require('./routes/wallet')
const transactionRoutes = require('./routes/transaction')

const app = express()

// Storage
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// Setting for Express JS
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

// Initialization Routes
app.use('/auth', authRoutes)
app.use('/wallet', walletRoutes)
app.use('/transaction', transactionRoutes)

// Promise Error
app.use((error, req, res, next) => {
    const status = error.statusCode || 500
    const message = error.message
    res.status(status).json({
        success: false,
        message: message
    })
})

mongoose.connect(`mongodb+srv://${mongoServices.username}:${mongoServices.password}@cluster0.g083m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(8000)
}).catch(err => {
    console.log('Cannot Connect MongoDB: ', err)
})