import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";

export const createPurchase = async (req, res) => {

  try {

    let totalAmount = 0;

    for (const item of req.body.items) {
      totalAmount += item.quantity * item.costPrice;
    }

    const purchase = await Purchase.create({
      ...req.body,
      totalAmount
    });

    /* Update Product Stock */

    for (const item of req.body.items) {

      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stock: item.quantity },
          costPrice: item.costPrice
        }
      );

    }

    res.json({ success: true, purchase });

  } catch (error) {

    console.log(error);
    res.status(500).json({ success:false, message:"Purchase error" });

  }

};


export const getPurchases = async (req, res) => {
  try {

    const purchases = await Purchase.find()
      .populate("supplierId")
      .populate("items.productId");

    res.json({
      success: true,
      purchases
    });

  } catch (error) {
    console.error("Purchase fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load purchases"
    });
  }
};

export const deletePurchase = async(req,res)=>{

  await Purchase.findByIdAndDelete(req.params.id);

  res.json({success:true});

};