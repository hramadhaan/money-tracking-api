const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactionSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    wallet: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'wallet'
    },
    type: {
        type: String,
        default: 'expense'
    },
    attachment: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    idUser: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'auth'
    }

}, { timestamps: true })

module.exports = mongoose.model('transaction', transactionSchema)