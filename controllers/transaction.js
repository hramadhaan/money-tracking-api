const Transaction = require('../models/transaction')
const Auth = require('../models/auth')
const mongoose = require('mongoose')
const Wallet = require('../models/wallet')

const { validationResult } = require('express-validator')
const fs = require('fs')

exports.addExpense = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    if (!req.file) {
        const error = new Error('No Image Provided')
        error.statusCode = 422
        throw error
    }

    const amount = req.body.amount
    const category = req.body.category
    const description = req.body.description
    const type = 'expense'
    const attachment = req.file.path
    const wallet = req.body.wallet
    const idUser = req.userId

    const transaction = new Transaction({
        category: category,
        description: description,
        wallet: wallet,
        type: type,
        attachment: attachment,
        amount: amount,
        idUser: idUser
    })

    transaction.save()
        .then(() => {
            return Wallet.findById(wallet)
        })
        .then(dompet => {
            dompet.balance = Number(dompet.balance) - Number(amount)
            return dompet.save()
        })
        .then(() => {
            res.status(201).json({
                success: true,
                messages: 'Successfully add transaction.',
                data: transaction
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.seeAllTransactions = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const idUser = req.userId

    Transaction.find({ idUser: idUser }).sort({ createdAt: -1 }).then(result => {
        if (result.length) {
            res.status(200).json({
                success: true,
                message: 'Successfully get all transactions.',
                data: result
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'Transaction not found!',
            })
        }
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.addIncome = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    if (!req.file) {
        const error = new Error('No Image Provided')
        error.statusCode = 422
        throw error
    }

    const amount = req.body.amount
    const category = req.body.category
    const description = req.body.description
    const type = 'income'
    const attachment = req.file.path
    const wallet = req.body.wallet
    const idUser = req.userId

    const transaction = new Transaction({
        category: category,
        description: description,
        wallet: wallet,
        type: type,
        attachment: attachment,
        amount: amount,
        idUser: idUser
    })

    transaction.save()
        .then(() => {
            return Wallet.findById(wallet)
        })
        .then(dompet => {
            dompet.balance = Number(dompet.balance) + Number(amount)
            return dompet.save()
        })
        .then(() => {
            res.status(201).json({
                success: true,
                messages: 'Successfully add transaction.',
                data: transaction
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.detailTransaction = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const idTransaction = req.params.id

    Transaction.findById(idTransaction).populate('wallet', '_id balance name type')
        .then(result => {
            if (!result) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: 'Succsesfully get transaction.',
                    data: result
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

exports.transactionByExpense = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const userId = req.userId

    Transaction.find({ type: 'expense', idUser: userId }).populate('wallet').sort({ createdAt: -1 })
        .then(result => {
            if (result.length) {
                res.status(200).json({
                    success: true,
                    message: 'Succsesfully get transaction.',
                    data: result
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found!',
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

exports.totalBalanceExpense = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const userId = req.userId

    Transaction.aggregate([
        {
            $match: {
                idUser: mongoose.Types.ObjectId(userId),
                type: 'expense'
            }
        },
        {
            $group: {
                _id: null,
                totalExpense: { $sum: '$amount' }
            }
        }
    ]).then(result => {
        res.status(200).json({
            success: true,
            message: 'Succesfully get total balance',
            data: {
                total: result?.[0]?.totalExpense ?? 0
            }
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.totalBalanceIncome = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const userId = req.userId

    Transaction.aggregate([
        {
            $match: {
                idUser: mongoose.Types.ObjectId(userId),
                type: 'income'
            }
        },
        {
            $group: {
                _id: null,
                totalExpense: { $sum: '$amount' }
            }
        }
    ]).then(result => {
        res.status(200).json({
            success: true,
            message: 'Succesfully get total balance',
            data: {
                total: result?.[0]?.totalExpense ?? 0
            }
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.transactionByIncome = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }


    const userId = req.userId

    Transaction.find({ type: 'income', idUser: userId }).populate('wallet', '_id balance name type').sort({ createdAt: -1 })
        .then(result => {
            if (result.length) {
                res.status(200).json({
                    success: true,
                    message: 'Succsesfully get transaction.',
                    data: result
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found!',
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

function deleteFiles(file, callback) {
    fs.unlink(file, function (err) {
        if (err) {
            callback(err);
            return;
        } else {
            callback(null);
        }
    });
}

exports.deleteTransaction = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const idTransaction = req.params.id
    const idUser = req.userId

    let transaction

    Transaction.findById(idTransaction)
        .then((result) => {
            if (!result) {
                res.status(404).json({
                    message: 'Transaction not found!',
                    success: false
                })
                next()
            }
            transaction = result
            return Wallet.findById(transaction.wallet)
        })
        .then((dompet) => {
            dompet.balance = transaction.type === 'expense' ? Number(dompet.balance) + Number(transaction.amount) : Number(dompet.balance) - Number(transaction.amount)
            return dompet.save()
        })
        .then(() => {
            return Transaction.findByIdAndRemove(idTransaction)
        })
        .then(() => {
            deleteFiles(transaction.attachment, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Has been removed!");
                }
            });
            res.status(200).json({
                success: true,
                message: 'Succesfully remove transaction.',
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}