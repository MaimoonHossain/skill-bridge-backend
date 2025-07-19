import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  applyJob,
  getApplicants,
  getAppliedJobs,
  updateStatus,
} from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").post(isAuthenticated, applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/applicants/:jobId").get(isAuthenticated, getApplicants);
router
  .route("/update-status/:applicationId")
  .patch(isAuthenticated, updateStatus);

export default router;
