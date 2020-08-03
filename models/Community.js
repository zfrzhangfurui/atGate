const mongoose = require("mongoose")
// const moment = require("moment");
const CommunitySchema = new mongoose.Schema({
    community: {
        type: String,
        trim: true,
        require: true,
        unique: true,
        maxlength: [50, "Commnuity can not be more than 50 characters"],
    },
    member: [
        {
            member_id: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
            },
            address: {
                type: String,
            },
            user_id: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            }

        }
    ],
});


module.exports = mongoose.model("Community", CommunitySchema)
