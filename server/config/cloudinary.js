import { v2 as cloudinary } from 'cloudinary';
import chalk from 'chalk';

// Configure Cloudinary
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log(chalk.green('✓ Cloudinary configured successfully'));
  }
};

// Upload to Cloudinary
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const {
      folder = 'nsitm-school-system',
      publicId = null,
      resourceType = 'auto',
      overwrite = true,
      quality = 'auto',
    } = options;

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      overwrite,
      quality,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log(chalk.green(`✓ File uploaded to Cloudinary: ${result.public_id}`));
    return result;
  } catch (error) {
    console.error(chalk.red(`✗ Cloudinary upload error: ${error.message}`));
    throw error;
  }
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === 'ok') {
      console.log(chalk.green(`✓ File deleted from Cloudinary: ${publicId}`));
    }
    return result;
  } catch (error) {
    console.error(chalk.red(`✗ Cloudinary delete error: ${error.message}`));
    throw error;
  }
};

// Get Cloudinary URL
const getCloudinaryUrl = (publicId, options = {}) => {
  const { width, height, crop = 'fill', quality = 'auto' } = options;

  let url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;

  if (width || height) {
    url += `w_${width || 'auto'},h_${height || 'auto'},c_${crop},q_${quality}/`;
  } else {
    url += `q_${quality}/`;
  }

  url += `${publicId}`;

  return url;
};

export {
  configureCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
};
