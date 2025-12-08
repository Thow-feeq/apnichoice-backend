import Category from '../models/Category.js';

// POST /api/seller/category/add
export const addCategory = async (req, res) => {
  try {
    const { name, slug, image, bgColor, parent } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name & slug required"
      });
    }

    // ✅ Duplicate check
    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    // ✅ Level calculation
    let level = 0;
    if (parent) {
      const parentCat = await Category.findById(parent);
      if (!parentCat) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category"
        });
      }
      level = parentCat.level + 1;
    }

    const category = new Category({
      name,
      slug,
      image,
      bgColor,
      parent: parent || null,
      level
    });

    await category.save();

    return res.json({
      success: true,
      message: "Category added successfully"
    });
  } catch (err) {
    console.error("Add Category Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
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

// PUT /api/seller/category/edit/:id
// PUT /api/seller/category/edit/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, bgColor, image, parent } = req.body;

    let level = 0;
    if (parent) {
      const parentCat = await Category.findById(parent);
      if (!parentCat) {
        return res.status(400).json({ success: false, message: "Invalid parent category" });
      }
      level = parentCat.level + 1;
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { name, slug, bgColor, image, parent: parent || null, level },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category updated", category: updated });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
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

// server/controllers/categoryController.js

export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    const map = {};
    const roots = [];

    categories.forEach(cat => {
      map[cat._id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parent) {
        map[cat.parent]?.children.push(map[cat._id]);
      } else {
        roots.push(map[cat._id]);
      }
    });

    res.json({ success: true, categories: roots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
