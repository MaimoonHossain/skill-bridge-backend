import { Job } from "../models/job.model.js";

// for admin
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      jobType,
      position,
      companyId,
      location,
      salary,
      experience,
    } = req.body;
    const userId = req.id;

    // Validate input
    if (
      !title ||
      !description ||
      !companyId ||
      !location ||
      !salary ||
      !jobType ||
      !position ||
      !experience ||
      !requirements
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const formattedRequirements = Array.isArray(requirements)
      ? requirements.map((req) => req.trim())
      : requirements.split(",").map((req) => req.trim());

    const job = await Job.create({
      title,
      description,
      company: companyId,
      location,
      salary: Number(salary),
      created_by: userId,
      jobType,
      position,
      experienceLevel: Number(experience),
      requirements: formattedRequirements,
    });

    res.status(201).json({
      message: "Job posted successfully",
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error posting job:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// for students
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({ path: "company" })
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "No jobs found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Jobs retrieved successfully",
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id)
      .populate("applications")
      .populate("company");

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job retrieved successfully",
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error retrieving job:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// for admin
export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ created_by: req.id });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "No jobs found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Jobs retrieved successfully",
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Error retrieving admin jobs:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
