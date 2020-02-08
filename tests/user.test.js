const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {
    userOne,
    userOneId,
    setUpDatabase
} = require('./fixtures/db')

beforeEach(setUpDatabase)

//tests 
test('should signup a new user', async () => {
    const data = {
        name: "test",
        email: "test@test.com",
        password: "test123test"
    }
    const response =
        await request(app)
        .post('/users')
        .send(data)
        .expect(201)

    //Assert that DB was changed correctly 
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assert about the response 
    expect(response.body).toMatchObject({
        user: {
            name: data.name,
            email: data.email,
        },
        token: user.tokens[0].token
    })
    expect(user.body).not.toBe(data.password)

})

test('should login a existing user', async () => {
    const data = {
        email: userOne.email,
        password: userOne.password
    }
    const response =
        await request(app)
        .post('/users/login')
        .send(data)
        .expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login nonexisting user', async () => {
    const data = {
        email: "testing...",
        password: "testing..."
    }
    await request(app)
        .post('/users/login')
        .send(data)
        .expect(400)
})

test('should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for unAuthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('should delete profile for Authenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delete profile for unAuthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/profile-pic.jpg")
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user fields', async () => {

    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "jess"
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toBe("jess")

})

test('should not update unvalid user fields', async () => {

    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "alexandria"
        })
        .expect(400)

})