import jwt from 'jsonwebtoken';
import Order from "../models/Order.js"; // ✅ THIS WAS
// Login Admin : /api/admin/login
// Login Admin : /api/admin/login
export const adminLogin = async (req, res) => {
    try {
        // 🔹 DEBUG: log environment vars and incoming request
        console.log('ENV:', process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
        console.log('BODY:', req.body.email, req.body.password);

        const { email, password } = req.body;

        if (password === process.env.ADMIN_PASSWORD && email === process.env.ADMIN_EMAIL) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.json({ success: true, message: 'Admin Logged In' });
        } else {
            return res.json({ success: false, message: 'Invalid Credentials' });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Admin isAuth : /api/admin/is-auth
export const isAdminAuth = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Logout Admin : /api/admin/logout
export const adminLogout = async (req, res) => {
    try {
        res.clearCookie('adminToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: 'Admin Logged Out' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getSalesReport = async (req, res) => {
    try {
        const { from, to, paymentType, status, paymentStatus } = req.query;

        let match = {};

        // 📅 Date filter
        if (from && to) {
            match.createdAt = {
                $gte: new Date(from + "T00:00:00.000Z"),
                $lte: new Date(to + "T23:59:59.999Z")
            };
        }
        // 💳 Payment Type
        if (paymentType && paymentType !== "All") {
            match.paymentType = paymentType;
        }

        if (status && status !== "All") {
            match.status = status;
        }

        if (paymentStatus && paymentStatus !== "All") {
            match.paymentStatus = paymentStatus;
        }

        console.log("FILTERS:", JSON.stringify(match, null, 2));
        /* ---------------- SUMMARY ---------------- */
        const summaryAgg = await Order.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSales: { $sum: "$totalAmount" },
                    totalDiscount: { $sum: "$discountAmount" },

                    codSales: {
                        $sum: {
                            $cond: [
                                { $eq: ["$paymentType", "COD"] },
                                "$totalAmount",
                                0
                            ]
                        }
                    },

                    onlineSales: {
                        $sum: {
                            $cond: [
                                { $ne: ["$paymentType", "COD"] },
                                "$totalAmount",
                                0
                            ]
                        }
                    },

                    paidOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0]
                        }
                    },

                    deliveredOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        /* ---------------- ORDER LIST ---------------- */
        const orders = await Order.find(match)
            .sort({ createdAt: -1 })
            .select(`
        totalAmount
        discountAmount
        paymentType
        paymentStatus
        status
        createdAt
      `);

        res.json({
            summary: summaryAgg[0] || {
                totalOrders: 0,
                totalSales: 0,
                totalDiscount: 0,
                codSales: 0,
                onlineSales: 0,
                paidOrders: 0,
                deliveredOrders: 0
            },
            orders
        });

    } catch (err) {
        console.error("Sales report error:", err);
        res.status(500).json({ message: "Failed to load sales report" });
    }
};