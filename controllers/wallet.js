const Wallet = require('../models/wallet')
const Auth = require('../models/auth')
const Transaction = require('../models/transaction')
const mongoose = require('mongoose')

const { validationResult } = require('express-validator')

exports.addWallet = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const balance = req.body.balance
    const name = req.body.name
    const type = req.body.type
    const userId = req.userId

    const wallet = new Wallet({
        balance: balance,
        name: name,
        type: type,
        owner: userId
    })

    wallet.save()
        .then(result => {
            res.status(200).json({
                message: 'Successfully add wallet.',
                success: true,
                data: wallet
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.getTotalWallet = (req, res, next) => {
    const userId = req.userId
    Wallet.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalBalance: { $sum: '$balance' }
            }
        }
    ]).then(response => {
        res.status(200).json({
            success: true,
            message: 'Succesfully get total balance',
            data: {
                total: response?.[0]?.totalBalance ?? 0
            }
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.detailWallet = (req, res, next) => {
    const idWallet = req.params.id
    let resultWallet
    Wallet.findById(idWallet).then(result => {
        if (!result) {
            res.status(404).json({
                message: 'Wallet not found.',
                success: false
            })
        } else {
            resultWallet = result
            return Transaction.find({ wallet: idWallet }).sort({ createdAt: -1 })
        }
    })
        .then(response => {
            if (!res) {
                res.status(404).json({
                    message: 'Transaction not found',
                    success: false
                })
            } else {
                res.status(200).json({
                    message: 'Successfully get information about wallet and transactions',
                    success: true,
                    wallet: resultWallet,
                    data: response
                })
            }
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.deleteWallet = (req, res, next) => {
    const idWallet = req.params.id

    Wallet.findById(idWallet)
        .then(result => {
            if (!result) {
                res.status(404).json({
                    message: 'Wallet not found.',
                    success: false
                })
                next()
            }
            wallet = result
            return Transaction.deleteOne({ wallet: idWallet })
        })
        .then(() => {
            return Wallet.findByIdAndRemove(idWallet)
        })
        .then(() => {
            res.status(200).json({
                success: true,
                message: 'Succesfully remove wallet.'
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.listWallet = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const userId = req.userId

    Wallet.find({ owner: userId }).sort({ createdAt: -1 }).then((result) => {
        if (!result) {
            res.status(400).json({
                message: 'Wallet not found.',
                success: false
            })
        } else {
            res.status(200).json({
                message: 'Succesfully get information wallet.',
                success: true,
                data: result,
            })
        }

    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}