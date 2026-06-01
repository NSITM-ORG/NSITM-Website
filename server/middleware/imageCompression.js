import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  const dirs = [
    process.env.UPLOAD_DIR || './uploads',
    `${process.env.UPLOAD_DIR || './uploads'}/temp`,
    `${process.env.UPLOAD_DIR || './uploads'}/optimized`,
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(chalk.red(`Error creating directory ${dir}:`, error));
    }
  }
};

// Initialize directories on module load
await ensureUploadDirs();

// Compress and optimize image
const compressImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      quality = parseInt(process.env.IMAGE_QUALITY) || 80,
      maxWidth = parseInt(process.env.IMAGE_MAX_WIDTH) || 1920,
      maxHeight = parseInt(process.env.IMAGE_MAX_HEIGHT) || 1920,
      format = 'webp',
    } = options;

    await sharp(inputPath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toFile(outputPath);

    console.log(chalk.green(`✓ Image compressed: ${outputPath}`));
    return outputPath;
  } catch (error) {
    console.error(chalk.red(`✗ Image compression error: ${error.message}`));
    throw error;
  }
};

// Get image dimensions
const getImageDimensions = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    };
  } catch (error) {
    console.error(chalk.red(`✗ Error getting image dimensions: ${error.message}`));
    throw error;
  }
};

// Middleware to validate image file
const validateImageFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed (JPEG, PNG, WebP, GIF)',
    });
  }

  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB
  if (req.file.size > maxFileSize) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds maximum limit of ${maxFileSize / 1024 / 1024}MB`,
    });
  }

  next();
};

export { compressImage, getImageDimensions, validateImageFile, ensureUploadDirs };
