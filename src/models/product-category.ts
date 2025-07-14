import mongoose from "mongoose";

export const productCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
});

productCategorySchema.virtual('id').get(function() {
    return this._id.toHexString();
})

productCategorySchema.set('toJSON', {virtuals: true})

export const ProductCategory = mongoose.model("ProductCategory", productCategorySchema);