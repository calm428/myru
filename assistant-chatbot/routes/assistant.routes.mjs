import express from "express";
import * as assistantController from "../controllers/assistant.controller.mjs";

const router = express.Router();

router.route("/chat").post(assistantController.assistantChat);
router.route("/chatStream").post(assistantController.assistantChatStream);
router.route("/visionChat").post(assistantController.assistantVisionChat);
router
  .route("/visionChatStream")
  .post(assistantController.assistantVisionChatStream);

export default router;
