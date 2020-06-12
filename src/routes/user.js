const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const path = require('path')
const User = require("../models/users")
const auth = require("../middleware/auth")
const { welcomeEmail,goodbyeEmail } = require("../emails/account")


const router = new express.Router()

router.post("/users", async (req,res) => {
    const newUser = new User(req.body)
    try{
        await newUser.save()
        welcomeEmail(newUser.email,newUser.name)
        const token = await newUser.generateToken()

        res.cookie('auth_token', token)
        res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'))

        // res.status(201).send({newUser,token})
        // console.log("S")
    } catch (e) {
        // console.log(e)
        res.status(400).send(e)
    }
})

router.post("/users/login", async (req,res) => {
    try{
        // console.log("befoe")
        const userFound = await User.findByCredentials(req.body.email, req.body.password)
        // console.log(userFound)
        const token = await userFound.generateToken()
        // console.log(token)

        res.cookie('auth_token', token)
        res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'))

        // res.send({userFound,token})

    } catch (e) {
        res.status(400).send(e)
    }
})


router.post("/users/logout", auth, async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/users/logoutAll", auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
        
    } catch (e){
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Upload Proper File"))
        }
        cb(undefined,true)
    }
})

router.post("/users/me/avatar",auth, upload.single("avatar"),async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error,req,res,next) => {
    res.status(400).send({ error: error.message})
})

router.get("/users/me", auth, async (req,res) => {
    res.send(req.user)
    
})

router.get("/users/:id/avatar", async (req,res) => {
    try{

        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error("Use or Profile Picture doesn't exist")
        }

        res.set("Content-Type","image/png")
        // console.log(user.avatar)
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


router.patch("/users/me",auth, async (req,res) => {
    const updateFieldsReq = Object.keys(req.body)


    const validFields = ["name", "email", "age","password"]
    const isValidateFields = updateFieldsReq.every((field) => validFields.includes(field)) // automaticly returns based on ES6
    
    if (!isValidateFields){
        return res.status(400).send({ "error" : "Invalid Update Requested!"})
    }
    try {
        updateFieldsReq.forEach((updateField) => req.user[updateField] = req.body[updateField])
        await req.user.save()
        // const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators: true })
        res.send(req.user)
    } catch (e) {
        send.status(400).send(e)
    }
})

router.delete("/users/me", auth, async (req,res) => {
    try {
        goodbyeEmail(req.user.email,req.user.name)
        await req.user.remove()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete("/users/me/avatar", auth, async (req,res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (e){
        res.status(500).send()
    }
})

module.exports = router