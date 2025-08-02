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

export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id; // This assumes authentication middleware sets req.id

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

    // Fetch job by ID
    const existingJob = await Job.findById(jobId);

    if (!existingJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Authorization check
    if (existingJob.created_by.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this job." });
    }

    // Update fields
    existingJob.title = title;
    existingJob.description = description;
    existingJob.requirements = formattedRequirements;
    existingJob.jobType = jobType;
    existingJob.position = position;
    existingJob.company = companyId;
    existingJob.location = location;
    existingJob.salary = Number(salary);
    existingJob.experienceLevel = Number(experience);

    // Save the updated job
    await existingJob.save();

    res.status(200).json({
      message: "Job updated successfully",
      success: true,
      job: existingJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id; // assuming this comes from auth middleware

    // Fetch the job to ensure it exists and the user has permission
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    if (job.created_by.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this job", success: false });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      message: "Job deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
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
      return res.status(200).json({
        message: "No jobs found",
        success: false,
        jobs: [],
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
    // here poulate applicants also in applications
    const job = await Job.findById(id)
      .populate({
        path: "applications",
        populate: { path: "applicant", model: "User" },
      })
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
