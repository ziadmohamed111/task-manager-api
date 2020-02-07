const express = require("express")
const Task = require("../models/task")
const auth = require('../middleware/auth')
const router = new express.Router()

//create
router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        res.status(201).send(await task.save())
    } catch (e) {
        res.status(400).send(`err :, ${err}`)
    }
})

//read all
router.get('/tasks', auth, async (req, res) => {
    try {   
        const match = {}
        const sort = {} 
        if (req.query.completed){
            match.completed = req.query.completed === "true"
        }
        if(req.query.sortBy){
            const parts = req.query.sortBy.split('_')
            sort[parts[0]]= parts[1 ]=== 'desc' ? -1 : 1
        }        
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(`err :, ${e}`)
    }
})

//read one
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        })
        if (!task) {
            res.status(404).send("task was not found")
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(`err :, ${e}`)
    }
})

//update
router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdate = ['description', 'completed']
    const isValid = updates.every(update => allowedUpdate.includes(update))

    if (!isValid) {
        return res.status(400).send("invalid updates")
    }

    try {
        const task = await Task.findOne({_id : req.params.id , owner : req.user._id })
        
        if (!task) {
            return res.status(404).send('task not found')
        }
        
        updates.forEach(update => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (e) {
        res.status(400).send("e:" + e)
    }
})

//delete
router.delete("/tasks/:id", auth ,async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id : req.params.id , owner : req.user.id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router