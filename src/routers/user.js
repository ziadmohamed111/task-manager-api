const sharp = require("sharp")
const multer = require('multer')
const express = require("express")
const User = require("../models/user")
const auth = require("../middleware/auth")
const {
    sendWelcomEmail,
    sendCancelationEmail
} = require("../emails/account")

const router = new express.Router()

//create
router.post('/users', async (req, res) => {

    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(`err :, ${e}`)
    }

})

// login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send("e:" + e)
    }
})

//logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send("e:" + e)
    }
})

//upload avatar
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match('\.(jpg|png|jpeg)$')) {
            return cb(new Error("Please provide an Image"))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width : 250,height : 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({
        error: err.message
    })
})

//logout all
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send("e:" + e)
    }
})

//read profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//get a url for the image to view it 
router.get('/users/:id/avatar', async(req , res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error('there is no profile pic')
        }

        res.set("Content-Type" , "image/png")
        res.send(user.avatar)

    }catch(err){
        res.status(404).send({err})
    }
    

})

//update
router.patch("/users/me", auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'age', 'email', 'password']
    const isValid = updates.every((update) => {
        return allowedUpdate.includes(update)
    })

    if (!isValid) {
        return res.status(400).send("invalid updates")
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }

})

//delete
router.delete("/users/me", auth, async (req, res) => {

    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email ,req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }

})

//deleting user avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send({
            error : e
        })
    }

})

module.exports = router