import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    website: {
      type: String,
      required: [true, "Website is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    logo: {
      type: String,
      required: [true, "Logo is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
