import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Post = new Schema(
  {
    title: { type: string, required: true },
    text: { type: string, required: true },
    status: {
      type: string,
      required: true,
      enum: ["in progress", "not started", "completed"],
    },
  },
  { collection: "Post" },
);

export const UserModel = mongoose.model("Post", Post);
