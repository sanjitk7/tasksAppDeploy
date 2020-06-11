const validator = require("validator")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("./tasks")


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required:true,
        unique: true,
        lowercase: true,
        trim:true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }
    },  
    age:{
        type:Number,
        default:0,
        validate(value){
            if (value<0){
                throw new Error("Age cannot be negetive")
            }
        }

    },
    password: {
        type: String,
        trim: true,
        minlength: 7,
        validate(value){
            if (value.includes("password")){
                throw new Error("Password cannot be 'password'")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

}, {
    timestamps: true
})


// create a virtual reverse relationship bw user-> task : Established a connection/relationship/mapping like in SQLDBs

userSchema.virtual( "tasks", {  
    ref: "Task",
    localField: "_id",
    foreignField : "owner"
})


// return public profile whenever user info is returned ( hide password and token history)

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//token generation and appending in model

userSchema.methods.generateToken = async function () {
    const findUser = this
    const token = jwt.sign({ _id:findUser._id.toString() }, process.env.JWT_SECRET)
    
    // console.log(findUser)
    findUser.tokens = findUser.tokens.concat({ token })
    
    await findUser.save()
    return token

}

//find and login users

userSchema.statics.findByCredentials = async (email, password) => {
    const findUser = await User.findOne({ email })
    // console.log(findUser)
    if(!findUser) {
        throw new Error ("Unable to Login!")
    }
    const isMatch = await bcrypt.compare(password, findUser.password)

    if(!isMatch) {
        throw new Error("Unable to Login!")
    }
    return findUser


}


//hash plain text password before save
userSchema.pre("save", async function(next) {
    const user = this
    // console.log("this prints before saving")

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()

})

//delete tasks of the user being deleted
userSchema.pre("remove", async function(next){
    const user = this

    await Task.deleteMany({ owner:user._id })

    next()
})

const User = mongoose.model("User", userSchema)


module.exports = User