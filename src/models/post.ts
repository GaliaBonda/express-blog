import mongoose from "mongoose";

export const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  attachments: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
});

postSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

postSchema.set('toJSON', {virtuals: true})

export const Post = mongoose.model("Post", postSchema);
