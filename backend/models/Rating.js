import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure one rating per user
ratingSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);
