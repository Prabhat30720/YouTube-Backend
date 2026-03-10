import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // The one who is subdcribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // The one to which the subscriber is subscribing.
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
