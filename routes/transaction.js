const express = require('express')
const { body, param } = require('express-validator')
const multer = require('multer')
const fs = require('fs')

// Controllers
const transactionControllers = require('../controllers/transaction')

// Models
const Transaction = require('../controllers/transaction')

// Middleware
const isAuth = require('../middleware/authentication')

// Storage
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb(null, 'images/profile/')
        const path = `images/transaction/`
        fs.mkdirSync(path, { recursive: true })
        cb(null, path)
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + ' - ' + file.originalname)
    }
})

const router = express.Router()

router.post('/add-expense', isAuth, multer({ storage: fileStorage }).single('attachment'), transactionControllers.addExpense)

router.post('/add-income', isAuth, multer({ storage: fileStorage }).single('attachment'), transactionControllers.addIncome)

router.get('/all-transactions', isAuth, transactionControllers.seeAllTransactions)

router.get('/transaction/:id', isAuth, transactionControllers.detailTransaction)

router.get('/transaction-expense', isAuth, transactionControllers.transactionByExpense)

router.get('/transaction-income', isAuth, transactionControllers.transactionByIncome)

router.get('/delete-transaction/:id', isAuth, transactionControllers.deleteTransaction)

router.get('/total-expense', isAuth, transactionControllers.totalBalanceExpense)

router.get('/total-income', isAuth, transactionControllers.totalBalanceIncome)

module.exports = router