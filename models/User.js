const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email",
        ],
    },
    community: {
        type: String,
        required: [true, "user has to belong to a community"],
        enum: ['Hobart', 'Kingston']
    }
    ,
    role: {
        type: String,
        enum: ["user", "admin", "root"],
        default: "user",
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createAt: {
        type: Date,
        default: Date.now,
    },
})

//Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

//Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    //remember the static and methods in mongoose
    //this is mongoose methods so we could access the attributes of the instance in mongodb database
    // so "this" represent the user instance in mongodb, "this.password" is the password stored in mongodb
    //compare return true or false
    return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("User", UserSchema)
