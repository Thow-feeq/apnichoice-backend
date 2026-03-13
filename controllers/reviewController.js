import Review from "../models/reviewModel.js";


// GET ALL REVIEWS
export const getReviews = async (req, res) => {
    try {

        const reviews = await Review.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            reviews
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



// CREATE REVIEW
export const createReview = async (req, res) => {

    try {

        const { name, review, rating } = req.body;

        const image = req.file ? `/uploads/${req.file.filename}` : "";

        const newReview = new Review({
            name,
            review,
            rating,
            image
        });

        await newReview.save();

        res.json({
            success: true,
            message: "Review added"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



// UPDATE REVIEW
export const updateReview = async (req, res) => {

    try {

        const { id } = req.params;

        await Review.findByIdAndUpdate(id, req.body);

        res.json({
            success: true,
            message: "Review updated"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



// DELETE REVIEW
export const deleteReview = async (req, res) => {

    try {

        const { id } = req.params;

        await Review.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Review deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};