import express from 'express';
import { getCategoryCount, addCategory, listCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';

const router = express.Router();
router.get('/count', getCategoryCount); 

router.post('/add', addCategory);
router.get('/list', listCategories);
router.put('/edit/:id', updateCategory); 
router.delete('/delete/:id', deleteCategory);

// Update category by ID



export default router;
