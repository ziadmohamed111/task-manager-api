const app = require("./app")
const port = process.env.PORT
app.listen(port, () => {
    console.log('sever is up and runnig on port ' + port)
})
