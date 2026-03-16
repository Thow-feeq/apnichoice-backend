import Supplier from "../models/Supplier.js";

export const addSupplier = async(req,res)=>{
  const supplier = await Supplier.create(req.body);
  res.json({success:true,supplier});
};

export const getSuppliers = async(req,res)=>{
  const suppliers = await Supplier.find();
  res.json({success:true,suppliers});
};

export const deleteSupplier = async(req,res)=>{
  await Supplier.findByIdAndDelete(req.params.id);
  res.json({success:true});
};