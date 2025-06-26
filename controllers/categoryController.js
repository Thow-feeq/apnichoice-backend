import Category from '../models/Category.js';

// POST /api/seller/category/add
export const addCategory = async (req, res) => {
  try {
    const { text, path, image, bgColor } = req.body;

    if (!text || !path || !image || !bgColor) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exists = await Category.findOne({ $or: [{ text }, { path }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const newCategory = new Category({ text, path, image, bgColor });
    await newCategory.save();

    res.status(201).json({ success: true, message: 'Category added successfully' });
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/seller/category/count
export const getCategoryCount = async (req, res) => {
  try {
    const count = await Category.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to get category count' });
  }
};

// GET /api/seller/category/list?page=1
export const listCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;

    const [categories, totalCount] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Category.countDocuments()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      success: true,
      categories,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error('List categories error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/seller/category/all
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }); // latest first
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/seller/category/edit/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, path, bgColor, image } = req.body;

    const updated = await Category.findByIdAndUpdate(
      id,
      { text, path, bgColor, image },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category updated', category: updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/seller/category/delete/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
