const mongoose = require("mongoose");
const moment = require("moment");
const RecordSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: [50, "Name can not be more than 50 characters"],
    },
    member_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Member',
        require: true,
    },
    transfer: {
        type: Number,
        required: true
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
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    community_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community',
        required: true,
    },
    createdAt: { //when the user create this transaction
        type: String,
        required: true,
        // set: v => {
        //     return new Date(v).toString();
        // }
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
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'deactived'],
        default: 'active'
    }
});

//Encrypt password using bcrypt
RecordSchema.pre("save", async function (next) {
    this.createdAt = moment(this.createdAt).format("YYYY-MM-DD")
})
module.exports = mongoose.model("Record", RecordSchema);
