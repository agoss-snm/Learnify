const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const resourceSchema = new Schema(
  {
     title: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      required: true,
    },
      content: {
        type: String,
        required: true,
      },
      code:{
        type:String,
      }
  }
);

const Resource = model("Resource", resourceSchema);

module.exports = Resource;
