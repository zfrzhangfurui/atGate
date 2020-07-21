const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [50, "Name can not be more than 50 characters"],
    },
    type: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    entryTime: {
        type: String,
    }
})

module.exports = mongoose.model("Transaction", TransactionSchema)
