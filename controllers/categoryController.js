import Category from "../models/Category.js";

/* ================= ADD CATEGORY ================= */
export const addCategory = async (req, res) => {
  try {
    const { name, slug, image, bgColor, parent } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug required",
      });
    }

    // 🔥 Check duplicate only inside same parent
    const exists = await Category.findOne({
      slug,
      parent: parent || null,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists under this parent",
      });
    }

    let level = 0;
    let path = name;

    if (parent) {
      const parentCat = await Category.findById(parent);
      if (!parentCat) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent",
        });
      }

      level = parentCat.level + 1;
      path = `${parentCat.path}/${name}`;
    }

    const category = await Category.create({
      name,
      slug,
      image,
      bgColor,
      parent: parent || null,
      level,
      path,
    });

    res.json({
      success: true,
      message: "Category created",
      category,
    });
  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET /api/seller/category/:id
export const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getCategoryCount = async (req, res) => {
  try {
    const count = await Category.countDocuments();

    res.json({
      success: true,
      count
    });
  } catch (err) {
    console.error("CATEGORY COUNT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
/* ================= GET TREE ================= */
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    const map = {};
    const roots = [];

    categories.forEach((cat) => {
      map[cat._id] = { ...cat, children: [] };
    });

    categories.forEach((cat) => {
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

/* ================= UPDATE CATEGORY ================= */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, bgColor } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug required"
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check duplicate under same parent
    const exists = await Category.findOne({
      _id: { $ne: id },
      slug,
      parent: category.parent || null
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists under this parent"
      });
    }

    category.name = name;
    category.slug = slug;
    category.bgColor = bgColor;

    await category.save();

    res.json({
      success: true,
      message: "Category updated",
      category
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
/* ================= DELETE (SAFE DELETE WITH CHILD CHECK) ================= */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const hasChildren = await Category.findOne({ parent: id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Delete sub categories first",
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};