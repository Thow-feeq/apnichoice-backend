import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import {
  addProduct,
  changeStock,
  productById,
  productList,
  updateProduct,
  deleteProduct,
  getProductCount
} from '../controllers/productController.js';

const productRouter = express.Router();

// Fix 1: multer's upload.array takes the field name as a string, NOT an array.
// If your form field name is 'images', use:
// upload.array('images')
// If you expect multiple fields, use .fields() instead.

productRouter.post('/add', upload.array('images'), authSeller, addProduct);

productRouter.get('/list', productList);
productRouter.get('/count', getProductCount);

// Fix 2: Place dynamic routes AFTER all static routes like /list, /count to avoid conflicts
productRouter.get('/:id', productById);

productRouter.post('/stock', authSeller, changeStock);
productRouter.put('/:id', updateProduct);
productRouter.delete('/:id', deleteProduct);

export default productRouter;
