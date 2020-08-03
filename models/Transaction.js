const mongoose = require("mongoose")
const moment = require("moment");
const TransactionSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [50, "Name can not be more than 50 characters"],
    },
    member_Id: {
        type: Number,
        require: true,
    },
    transfer: {
        type: Number,
    },
    p: {
        type: Number,
    },
    c: {
        type: Number,

    },
    g: {
        type: Number,

    },
    type: {
        type: Boolean,
        required: true,
    },
    createdBy: {
        type: String,
        required: true
    },
    community: {
        type: String,
        required: true,
    },
    createdAt: { //when the user create this transaction
        type: String,
    },
    seq: {
        type: Number,
        required: true,
    },
    entryTime: { // when the user entry the transaction
        type: String,
        required: true,
        set: v => {
            if (v === null) {
                return Date.now();
            } else {
                return v;
            }
        },
        default: Date.now()
    }
});


TransactionSchema.method('toClient', function () {
    var obj = this.toObject();

    //Rename fields
    delete obj.community;
    obj.trans_id = obj._id;
    delete obj._id;
    delete obj.createdBy;
    return obj;
});

TransactionSchema.set('toJSON', {
    virtuals: true
})

module.exports = mongoose.model("Transaction", TransactionSchema);
