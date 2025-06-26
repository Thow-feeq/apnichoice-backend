import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  image: {
    type: String,
    default: '', // image URL
  },
  bgColor: {
    type: String,
    default: '#f0f0f0', // fallback color
  },
  path: {
    type: String,
    default: '', // optional: URL-friendly path
  }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
