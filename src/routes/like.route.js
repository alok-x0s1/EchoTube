import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
} from "../controllers/like.controller";

const router = express.Router();
router.use(verifyJWT);

router.use("/toggle/v/:videoId").post(toggleVideoLike);
router.use("/toggle/c/:commentId").post(toggleCommentLike);
router.use("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;