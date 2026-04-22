const cloudinary = require("../config/cloudinary");

async function uploadToCloudinary(
  fileBuffer,
  folder = "CourseHub",
  resourceType = "image" 
) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
}

module.exports = uploadToCloudinary;