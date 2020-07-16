const mongoose = require('mongoose');

const BootcampSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please add a name'],
        unique:true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    slug:{
        type:String
    },
    description:{
        type:String,
        required:[true,'Please add a description'],
        maxlength:[500,'Description can not be more than 500 characters']
    },
    careers:{
        type:[String],
        required:true,
        enum:[
            'Web Development',
            'Mobile Development',
            'UI/UX'
        ]
    },
    createdAt:{
        type: Date,
        default:Date.now
    }
})

module.exports = mongoose.model('Bootcamp',BootcampSchema);