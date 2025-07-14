import mongoose from "mongoose";

export const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", required: true },
  price: {type: Number, required: true},
  stripeProductId: {type: String, required: true},
  stripePriceId: {type: String, required: true}
});

productSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

productSchema.set('toJSON', {virtuals: true})

export const Product = mongoose.model("Product", productSchema);
