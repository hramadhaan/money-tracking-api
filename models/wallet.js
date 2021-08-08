const mongoose = require('mongoose')
const Schema = mongoose.Schema

const walletSchema = new Schema({
    balance: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'auth'
    },
}, { timestamps: true })

module.exports = mongoose.model('wallet', walletSchema)