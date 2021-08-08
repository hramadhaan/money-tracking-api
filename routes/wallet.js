const express = require('express')
const { body } = require('express-validator')

// Controllers
const walletControllers = require('../controllers/wallet')

// Middleware
const isAuth = require('../middleware/authentication')

const router = express.Router()

router.post('/add-wallet', isAuth, [
    body('balance').trim().not().isEmpty(),
    body('name').trim().not().isEmpty(),
    body('type').trim().not().isEmpty(),
], walletControllers.addWallet)

router.get('/total-balance', isAuth, walletControllers.getTotalWallet)

router.get('/wallet/:id', isAuth, walletControllers.detailWallet)

router.get('/delete-wallet/:id', isAuth, walletControllers.deleteWallet)

router.get('/all-wallet', isAuth, walletControllers.listWallet)

module.exports = router