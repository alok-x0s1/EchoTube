import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteVideo,
    getAllVideos,
    getAllVideosOfUser,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(deleteVideo);

router.route("/me").get(getAllVideosOfUser);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
