const express = require("express")
const cookieParser = require('cookie-parser')
require("./db/mongoose")
const userRouter = require("./routes/user")
const taskRouter = require("./routes/task")
const app = express()

const port = process.env.PORT || 3000


app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log("Server Up on port"+port)
})