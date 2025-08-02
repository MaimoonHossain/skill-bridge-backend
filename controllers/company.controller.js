import { Company } from "../models/company.model.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/datauri.js";

// Assuming you're using multer for file parsing

export const registerCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const files = req.files;

    // Validate required fields
    if (!name || !description || !website || !location) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    // Check if company already exists
    let existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res
        .status(400)
        .json({ message: "Company already exists", success: false });
    }

    const newCompanyData = {
      name,
      description,
      website,
      location,
      userId: req.id,
    };

    // ✅ Handle logo upload
    if (files?.logo && files.logo[0]) {
      const fileUri = getDataUri(files.logo[0]);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "image",
        folder: "company_logos",
      });
      newCompanyData.logo = cloudResponse.secure_url;
    } else {
      return res
        .status(400)
        .json({ message: "Company logo is required", success: false });
    }

    const company = await Company.create(newCompanyData);

    return res.status(201).json({
      message: "Company registered successfully",
      success: true,
      company,
    });
  } catch (error) {
    console.error("Error registering company:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

export const getCompany = async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.id });
    if (!companies || companies.length === 0) {
      return res.status(200).json({
        message: "Companies not found",
        success: false,
        companies: [],
      });
    }
    return res.status(200).json({
      message: "Companies retrieved successfully",
      success: true,
      companies,
    });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Company retrieved successfully",
      success: true,
      company,
    });
  } catch (error) {
    console.error("Error retrieving company:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, website, location } = req.body;
    const files = req.files;

    // Validate required fields
    if (!name || !description || !website || !location) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Find existing company
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    // Prepare update data
    const updateData = {
      name,
      description,
      website,
      location,
    };

    // ✅ Handle optional logo update
    if (files?.logo && files.logo[0]) {
      const fileUri = getDataUri(files.logo[0]);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "image",
        folder: "company_logos",
      });
      updateData.logo = cloudResponse.secure_url;
    }

    const updatedCompany = await Company.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      message: "Company updated successfully",
      success: true,
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};
