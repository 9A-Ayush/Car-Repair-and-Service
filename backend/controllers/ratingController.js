import mongoose from 'mongoose';
import Rating from '../models/Rating.js';

// Create a new rating
const createRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { rating, comment } = req.body;
    
    console.log('Received rating request:', { rating, comment, userId });

    // Validate required fields
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required'
      });
    }

    // Check if user has already submitted a rating
    const existingRating = await Rating.findOne({ userId });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a rating'
      });
    }

    // Validate rating value
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create and save rating
    const newRating = new Rating({
      userId,
      rating: ratingValue,
      review: comment || ''
    });

    await newRating.save();
    console.log('Rating saved successfully:', newRating._id);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (error) {
    console.error('Error creating rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};



// Get all ratings (admin only)
const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find();
    return res.status(200).json({
      success: true,
      message: 'Ratings retrieved successfully',
      data: ratings
    });
  } catch (error) {
    console.error('Error retrieving ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ratings',
      error: error.message
    });
  }
};

// Get ratings for a specific user
const getUserRatings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const ratings = await Rating.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'User ratings retrieved successfully',
      data: ratings
    });
  } catch (error) {
    console.error('Error retrieving user ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user ratings',
      error: error.message
    });
  }
};

// Get a single rating by ID
const getRatingById = async (req, res) => {
  try {
    const ratingId = req.params.ratingId;
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format'
      });
    }

    const rating = await Rating.findById(ratingId)
      .populate('userId', 'name email');

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rating retrieved successfully',
      data: rating
    });
  } catch (error) {
    console.error('Error retrieving rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rating',
      error: error.message
    });
  }
};

// Update a rating
const updateRating = async (req, res) => {
  try {
    const ratingId = req.params.ratingId;
    const userId = req.user?._id;
    const { rating, comment, serviceQuality, customerService, timelyService } = req.body;

    // Validate rating ID
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format'
      });
    }

    // Find existing rating
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user owns the rating
    if (existingRating.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rating'
      });
    }

    // Validate rating values
    const ratings = {
      overall: rating,
      service: serviceQuality,
      customer: customerService,
      timely: timelyService
    };

    for (const [key, value] of Object.entries(ratings)) {
      if (value !== undefined) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1 || numValue > 5) {
          return res.status(400).json({
            success: false,
            message: `Invalid rating value for ${key}. Must be between 1 and 5.`
          });
        }
      }
    }

    // Update rating
    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      {
        $set: {
          rating: rating !== undefined ? parseInt(rating) : existingRating.rating,
          comment: comment !== undefined ? comment : existingRating.comment,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update rating',
      error: error.message
    });
  }
};

// Delete a rating
const deleteRating = async (req, res) => {
  try {
    const ratingId = req.params.ratingId;
    const userId = req.user?._id;

    // Validate rating ID
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format'
      });
    }

    // Find the rating
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user owns the rating or is admin
    if (rating.userId.toString() !== userId.toString() && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rating'
      });
    }

    // Delete the rating
    await Rating.findByIdAndDelete(ratingId);

    return res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
      error: error.message
    });
  }
};

// Single export statement for all functions
export {
  createRating,
  getAllRatings,
  getUserRatings,
  getRatingById,
  updateRating,
  deleteRating
};