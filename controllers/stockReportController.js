import Product from "../models/Product.js";

export const getStockReport = async (req,res) => {

try {

const products = await Product.find();

let report = [];

products.forEach(product => {

if(product.variants?.length){

product.variants.forEach(color => {

color.sizes.forEach(size => {

let status="Normal";

if(size.quantity === 0) status="Out of Stock";
else if(size.quantity <=10) status="Low";

report.push({

product: product.name,
category: product.category,
color: color.colorName,
size: size.size,
available: size.quantity,
sold: size.sold || 0,
status

});

});

});

}

});

res.json({
success:true,
data:report
});

}catch(err){

res.json({
success:false,
message:err.message
});

}

};