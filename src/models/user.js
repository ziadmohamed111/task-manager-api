const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value !== Number && value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        validate(email) {
            if (!validator.isEmail(email)) {
                throw new Error('email is not valid')
            }
        },
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 7,
        validate(password) {
            if (password.toLowerCase().includes("password")) {
                throw new Error("password cannot contain password")
            }
        },
        trim: true,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar : {
        type : Buffer
    }
},{
    timestamps : true,
})


//making a virtual task ref to the User Model
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//login methode to find the user whose loging in.
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({
        email
    })
    if (!user) {
        throw new Error("Unable to login")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error("Unable to login")
    }
    return user
}

//login methode to find the user whose loging in.
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({
        _id: user._id.toString()
    }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({
        token
    })
    await user.save()
    return token
}
//method to sind public data and hide private ones
userSchema.methods.toJSON = function () {
    const user = this
    const userData = user.toObject()

    delete userData.password
    delete userData.tokens
    delete userData.avatar

    return userData
}

//hashing password before saving 
userSchema.pre('save', async function (next) {

    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    return next()
})

//delete user tasks when user is removed
userSchema.pre('remove', async function (next) {

    const user = this
    await Task.deleteMany({
        owner: user._id
    })
    return next()
})

//initialize User
const User = mongoose.model('User', userSchema)

module.exports = User