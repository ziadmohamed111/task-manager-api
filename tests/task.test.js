const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOne, userTwo, taskOne, setUpDatabase } = require("./fixtures/db");

beforeEach(setUpDatabase)

test('Should create task to user', async ()=>{
    // .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    const taskData = {
        description : 'taskOne',
    }

    const response = 
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send(taskData)
            .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    
    expect(task.completed).toBe(false)
})

test("Should fetch user tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

    expect(response.body.length).toBe(2)
});

test("Should not delete tasks", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .expect(404);

    const task = Task.findById(taskOne._id);
    expect(task).not.toBeNull()

});