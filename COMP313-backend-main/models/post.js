import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Post = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["in progress", "not started", "completed"],
    },
  },
  { collection: "Post" },
);

export const PostModel = mongoose.model("Post", Post);
