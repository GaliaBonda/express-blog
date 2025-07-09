import mongoose from "mongoose";

export const categorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
});

categorySchema.virtual('id').get(function() {
    return this._id.toHexString();
})

categorySchema.set('toJSON', {virtuals: true})

export const Category = mongoose.model("Category", categorySchema);