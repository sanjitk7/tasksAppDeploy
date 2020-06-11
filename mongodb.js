// CRUD Create Remove Update Delete Operations

// const mongodb = require("mongodb")
// const MongoClient = mongodb.MongoClient

const { MongoClient, ObjectID } = require("mongodb")

const connectionURL = "mongodb://127.0.0.1:27017"
const databaseName = "taskManager"

const id = new ObjectID()

MongoClient.connect(connectionURL,{ useNewUrlParser:true,useUnifiedTopology: true },(error, client) => {
    if (error){
        return console.log("Coudn't Connect!")
    }
    console.log("Connected to local mongoDB")
    const db = client.db(databaseName)

    // db.collection("users").deleteMany({ _id: ObjectID("5ec37bf50d5c6a04ed8d6319") }).then((result) => {
    //     console.log("Deleted # ",result.deletedCount)
    // })

    
    
} )
