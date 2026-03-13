import Banner from "../models/bannerModel.js";

export const createBanner = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file required"
            });
        }

        const { width, height, position } = req.body;

        const banner = await Banner.create({
            image: `/uploads/${req.file.filename}`,
            width,
            height,
            position
        });

        res.json({
            success: true,
            banner
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getBanners = async (req, res) => {

    try {

        const { position } = req.query;

        let filter = { isActive: true };

        if (position) {
            filter.position = position;
        }

        const banners = await Banner.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            banners
        });

    } catch (err) {

        res.status(500).json({
            success: false
        });

    }

};


export const deleteBanner = async (req, res) => {

    try {

        await Banner.findByIdAndDelete(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {

        res.status(500).json({
            success: false
        });

    }

};