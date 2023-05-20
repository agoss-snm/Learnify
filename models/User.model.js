const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
      email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Resource' }]
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
module.exports = User;
