const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

//user testing data
const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'Mike@mike.com',
    password: 'Mike123Mike',
    tokens: [{
        token: jwt.sign({
                _id: userOneId
            },
            process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
  _id: userTwoId,
  name: "walter",
  email: "walter@white.com",
  password: "walter123walter",
  tokens: [
    {
      token: jwt.sign(
        {
          _id: userTwoId
        },
        process.env.JWT_SECRET
      )
    }
  ]
};

const taskOne = {
    _id : new mongoose.Types.ObjectId(),
    description: "Frist Task",
    completed: false,
    owner : userOneId
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second Task",
  completed: true,
  owner: userOneId
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third Task",
  completed: true,
  owner: userTwoId
};

const setUpDatabase = async ()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
    await new User(userOne).save()
    await new User(userTwo).save()
}


module.exports={
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setUpDatabase
}