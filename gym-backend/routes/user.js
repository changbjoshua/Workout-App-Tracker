const express = require('express');
const multer = require('multer');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const { s3Client, bucketName } = require('../config/aws');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profileImage: req.user.profileImage,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Upload profile image
router.post('/profile/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile image from S3 if exists
    if (user.profileImage) {
      const oldKey = user.profileImage.split('.com/')[1];
      if (oldKey) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldKey,
          }));
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `profile-images/${user._id}-${Date.now()}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the S3 URL
    const imageUrl = `https://${bucketName}.s3.us-east-2.amazonaws.com/${fileName}`;

    // Update user profile with new image URL
    user.profileImage = imageUrl;
    await user.save();

    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: imageUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
});

// Delete profile image
router.delete('/profile/image', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profileImage) {
      return res.status(400).json({ message: 'No profile image to delete' });
    }

    // Extract the S3 key from the URL
    const imageKey = user.profileImage.split('.com/')[1];

    if (imageKey) {
      // Delete from S3
      await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
      }));
    }

    // Remove from user profile
    user.profileImage = null;
    await user.save();

    res.json({
      message: 'Profile image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting profile image', error: error.message });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Find user with password field
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

module.exports = router;
