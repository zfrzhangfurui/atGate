const mongoose = require("mongoose")
const MemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    m_id: {
        type: Number,
        required: true
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    community_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community'
    },
    community: {
        type: String,
        require: true
    },
    status: {
        type: String,
        enum: ["active", "deactived"],
        default: "active",
        required: true
    }

});

module.exports = mongoose.model("Member", MemberSchema)