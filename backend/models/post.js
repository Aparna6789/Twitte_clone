const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    resource_type: {
      type: String,
      required: true,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
