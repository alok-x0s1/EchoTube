import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECREAT,
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("Error uploading file to cloudinary:", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
};

// Delete from cloudnary
const deleteFromCloudinary = async (cloudinaryFilePath, path) => {
    try {
        if (!cloudinaryFilePath) return null;

        const avatarPublicId = cloudinaryFilePath
            .split("/")
            .pop()
            .split(".")[0];

        const response = await cloudinary.uploader.destroy(
            `${path}/${avatarPublicId}`
        );

        return response;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
