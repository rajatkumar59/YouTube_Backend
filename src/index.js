import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})


connectDB()



















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