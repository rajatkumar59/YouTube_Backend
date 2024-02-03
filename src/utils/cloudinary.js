import { v2 as cloudinary } from "cloudinary";
import e from "express";
import fs from "fs";

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (localFilePath) => {
    try {
        console.log("Uploading file to Cloudinary:", localFilePath);

        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });

        console.log("File uploaded successfully", response.url);
        return response;
    } catch (err) {
        console.error("Error uploading file to Cloudinary:", err.message);
        fs.unlinkSync(localFilePath);
        return null;
    }
}


export default uploadToCloudinary;
