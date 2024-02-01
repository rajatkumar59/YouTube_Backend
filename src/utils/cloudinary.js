import { v2 as cloudinary } from "cloudinary";
import e from "express";
import fs from "fs";

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (locatFilePath) => {
    try{
        if(!locatFilePath) return null
        cloudinary.uploader.upload(localFilePath, 
           { resourse_type:"auto"})
           console.log("file uploaded successfully",response.url)
           return response;
    }catch(err){
        fs.unlinkSync(localFilePath)
        return null;
    }   

}

export default uploadToCloudinary