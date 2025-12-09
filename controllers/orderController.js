import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe"
import User from "../models/User.js"
import Coupon from "../models/Coupon.js";
import sendEmail from '../utils/emailServices.js';

export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address, couponCode } = req.body;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let amount = 0; // Actual Price without discount
        let totalAmount = 0; // Final Price with discount + tax
        const productDetails = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            amount += product.offerPrice * item.quantity;
            productDetails.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
                image: product.image,
                status: 'Pending'
            });
        }

        let discountAmount = 0;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            const now = new Date();
            if (!coupon) return res.json({ success: false, message: "Invalid coupon code" });
            if (now > coupon.expiry) return res.json({ success: false, message: "Coupon has expired" });
            if (amount < coupon.minCartAmount) return res.json({ success: false, message: `Cart must be at least ₹${coupon.minCartAmount}` });

            discountAmount = coupon.discountType === "percentage"
                ? Math.floor((amount * coupon.discountValue) / 100)
                : coupon.discountValue;

            appliedCoupon = coupon.code;
        }

        const afterDiscount = amount - discountAmount;
        totalAmount = afterDiscount + Math.floor(afterDiscount * 0.02); // Tax 2%

        const newOrder = await Order.create({
            userId,
            items,
            amount, // Original Price
            totalAmount, // Final Amount to be paid
            address,
            paymentType: "COD",
            isPaid: false,
            couponCode: appliedCoupon || null,
            discountAmount,
        });

        const user = await User.findById(userId);

        if (user?.email) {
            sendEmail(user.email, 'Order Confirmed', newOrder._id, productDetails)
                .catch(err => console.log("Email fail:", err.message));
        }

        sendEmail('thowfiqahamed9@gmail.com', 'Order Confirmed', newOrder._id, productDetails)
            .catch(err => console.log("Admin email fail:", err.message));
        res.json({ success: true, message: "Order Placed Successfully (COD)" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const placeOrderOnline = async (req, res) => {
    try {
        const { userId, items, address, couponCode } = req.body;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let amount = 0;
        const productDetails = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            amount += product.offerPrice * item.quantity;
            productDetails.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
                image: product.image,
                status: 'Pending'
            });
        }

        let discountAmount = 0;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            const now = new Date();
            if (!coupon) return res.json({ success: false, message: "Invalid coupon code" });
            if (now > coupon.expiry) return res.json({ success: false, message: "Coupon has expired" });
            if (amount < coupon.minCartAmount) return res.json({ success: false, message: `Cart must be at least ₹${coupon.minCartAmount}` });

            discountAmount = coupon.discountType === "percentage"
                ? Math.floor((amount * coupon.discountValue) / 100)
                : coupon.discountValue;

            appliedCoupon = coupon.code;
        }

        const afterDiscount = amount - discountAmount;
        const totalAmount = afterDiscount + Math.floor(afterDiscount * 0.02);

        const newOrder = await Order.create({
            userId,
            items,
            amount,
            totalAmount,
            address,
            paymentType: "Online",
            isPaid: true,
            couponCode: appliedCoupon || null,
            discountAmount,
        });

        const user = await User.findById(userId);

        if (user?.email) {
            await sendEmail(user.email, 'Order Confirmed', newOrder._id, productDetails);
        }
        await sendEmail('thowfiqahamed9@gmail.com', 'Order Confirmed', newOrder._id, productDetails);

        res.json({ success: true, message: "Order Placed Successfully (Online)" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        const { origin } = req.headers;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" })
        }

        let productData = [];

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
        });

        // Stripe Gateway Initialize    
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // create line items for stripe

        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100
                },
                quantity: item.quantity,
            }
        })

        // create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({ success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response) => {
    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            // Mark Payment as Paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true })
            // Clear user cart
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }


        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    response.json({ received: true });
}


// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;   // ✅ FROM JWT, NOT BODY

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// Get All Orders ( for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getOrderCount = async (req, res) => {
    try {
        const count = await Order.countDocuments();
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get order count', error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!['Pending', 'Dispatched', 'Delivered'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate('items.product'); // make sure products are populated

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        // Prepare product list for email
        const productList = order.items.map(item => ({
            name: item.product?.name,
            price: item.product?.price,
            quantity: item.product?.quantity,
            discountAmount: item.product?.discountAmount,
            image: item.product?.image,
            status,
        }));

        // Send emails
        if (order.userId?.email) {
            await sendEmail(order.userId.email, status, order._id, productList);
        }
        await sendEmail('thowfiqahamed9@gmail.com', status, order._id, productList);

        res.json({ success: true, message: 'Order status updated and emails sent', order });

    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


