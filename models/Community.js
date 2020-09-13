const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
// const moment = require("moment");

const CommunitySchema = new mongoose.Schema({
    community: {
        type: String,
        trim: true,
        require: true,
        unique: true,
        maxlength: [50, "Commnuity can not be more than 50 characters"],
    },
    securityCode: {
        type: String,
        trim: true,
        minlength: [6, "Security code can not be less than 6 characters"]
    },
    member: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Member'
        }
    ],
    contactPerson: {
        type: String,
    },
    communityEmail: {
        type: String
    },
    contactNumber: {
        type: String
    }


});


CommunitySchema.method('toClient', function () {
    var obj = this.toObject();
    //Rename fields
    delete obj._id;
    return obj;
});
CommunitySchema.virtual('admin', {
    ref: 'User',
    localField: '_id',
    foreignField: 'community_id',
    justOne: false,
    match: { role: ["root", "admin"] }
})
CommunitySchema.pre("findOneAndUpdate", async function (next) {
    const securityCode = this._update.securityCode;
    const salt = await bcrypt.genSalt(10);
    this._update.securityCode = await bcrypt.hash(securityCode, salt);
})


//Match user entered security code to hashed security code in database
CommunitySchema.methods.matchSecurityCode = async function (enteredSecurityCode) {
    console.log(enteredSecurityCode, '      ', this.securityCode);
    return await bcrypt.compare(enteredSecurityCode, this.securityCode)
}

CommunitySchema.set('toObject', { virtuals: true });
CommunitySchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model("Community", CommunitySchema)
