import express from "express";
import * as assistantController from "../controllers/assistant.controller.mjs";

const router = express.Router();

router.route("/titles").post(assistantController.getTitleHelper);
router.route("/subtitles").post(assistantController.getSubtitleHelper);
router.route("/content").post(assistantController.getContentHelper);
// router.route("/hashtags").post(assistantController.getHashtagsHelper);

export default router;
