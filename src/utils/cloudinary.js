import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file (avatar and coverImage file) on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File has been uploaded on cloudinary sucessfully
    // console.log("File is uploaded on cloudinary successfully", response.url);

    console.log("Clodinary response:", response);

    // Once the file is uploaded on cloudinary, we can remove that file from our local storage as we don't need it anymore.

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed.

    return null;
  }
};

export { uploadOnCloudinary };
