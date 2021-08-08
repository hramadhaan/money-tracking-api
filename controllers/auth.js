const Auth = require('../models/auth')
const servicesJwt = require('../services/jwtservices')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

exports.register = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    // Encrypt Password
    bcrypt.hash(password, 12).then(hashedPw => {
        const auth = new Auth({
            name: name,
            email: email,
            password: hashedPw
        });
        return auth.save()
    })
        .then((result) => {
            res.status(201).json({
                success: true,
                message: 'Register Successfully',
                data: result
            })
        })
        .catch(err => {
            if (!res.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.login = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const email = req.body.email
    const password = req.body.password

    let dataUser;

    Auth.findOne({ email: email })
        .then(user => {
            if (!user) {
                res.status(403).json({
                    success: false,
                    message: 'Email not found'
                })
            }

            dataUser = user

            return bcrypt.compare(password, user.password)
        })
        .then(isEqual => {
            if (!isEqual) {
                res.status(403).json({
                    success: false,
                    message: 'Password not matches'
                })
            }

            const token = jwt.sign({
                emai: dataUser.email,
                userId: dataUser._id.toString()
            }, servicesJwt.password)

            res.status(200).json({
                success: true,
                message: 'Login Successfully',
                token: token,
                user: dataUser
            })
        })
        .catch(err => {
            if (!res.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.addPhotoProfile = (req, res, next) => {
    if (!req.file) {
        const error = new Error('No Image Provided')
        error.statusCode = 422
        throw error
    }

    const photo = req.file.path
    const userId = req.userId

    Auth.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error('Could not find user.')
                error.statusCode = 404
                throw error
            }

            user.photo = photo

            return user.save()
        })
        .then(result => {
            res.status(201).json({
                success: true,
                message: 'Successfully updated photo profile.',
                data: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.profile = (req, res, next) => {
    const userId = req.userId

    Auth.findById(userId)
        .populate('wallet', '_id balance name type')
        .populate('transaction')
        .then(result => {
            res.status(200).json({
                success: true,
                message: 'Successfully get profile.',
                data: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}