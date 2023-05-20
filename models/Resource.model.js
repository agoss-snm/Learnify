const { Schema, model } = require("mongoose");

const resourceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    snippet: {
      type: String
    },
    code: {
      type: String
    },
    image: {
      type: Object 
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
  }
);

const Resource = model("Resource", resourceSchema);
module.exports = Resource;
