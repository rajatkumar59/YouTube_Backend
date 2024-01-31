import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";


dotenv.config({
    path: "./.env"
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>console.log(`Server is running at port ${process.env.PORT}`))
})
.catch((error)=>{    
    console.log("MongoDB connection failed !!!", error)
})



















// effi approch to connect to db
/*
import express from "express";
const app = express();

;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (err)=>console.log("Error", err))
        app.listen(process.env.PORT, ()=>console.log(`Server is running at port ${process.env.PORT}`))
    }catch(error){
        console.log("Error", error)
        throw err
    }
    
})() */