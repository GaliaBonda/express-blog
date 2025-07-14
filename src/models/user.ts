import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  enabled2fa: { type: Boolean, default: false },
  secret2fa: {type: String}
});

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

userSchema.set('toJSON', {virtuals: true})

export const User = mongoose.model("User", userSchema);
