import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({

    image: {
        type: String,
        required: true
    },

    width: {
        type: Number
    },
    position: {
        type: String,
        enum: ["top", "middle","bottom"],
        default: "top"
    },
    height: {
        type: Number
    },

    isActive: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model("Banner", bannerSchema);