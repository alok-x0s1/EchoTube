import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id.");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found.");
    }

    const isLiked = await Like.findOne({
        likedBy: req.user._id,
        video: videoId,
    });
    if (isLiked) {
        await Like.findOneAndDelete({
            likedBy: req.user._id,
            video: videoId,
        });
    }

    const like = await Like.create({
        likedBy: req.user._id,
        video: videoId,
    });
    if (!like) {
        throw new ApiError(500, "Failed to toggle like.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Like toggled successfully."));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id.");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    const isLiked = await Like.findOne({
        likedBy: req.user._id,
        comment: commentId,
    });
    if (isLiked) {
        await Like.findOneAndDelete({
            likedBy: req.user._id,
            comment: commentId,
        });
    }

    const like = await Like.create({
        likedBy: req.user._id,
        comment: commentId,
    });
    if (!like) {
        throw new ApiError(500, "Failed to toggle like.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Like toggled successfully."));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id.");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found.");
    }

    const isLiked = await Like.findOne({
        likedBy: req.user._id,
        tweet: tweetId,
    });
    if (isLiked) {
        await Like.findOneAndDelete({
            likedBy: req.user._id,
            tweet: tweetId,
        });
    }

    const like = await Like.create({
        likedBy: req.user._id,
        tweet: tweetId,
    });
    if (!like) {
        throw new ApiError(500, "Failed to toggle like.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Like toggled successfully."));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {
                    $exists: true,
                },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
            },
        },
        {
            $unwind: "$video",
        },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "video.owner",

                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$video.owner",
        },
        {
            $group: {
                _id: "$likedBy",
                videos: {
                    $push: "$video",
                },
                videoCount: {
                    $sum: 1,
                },
            },
        },
    ]);

    if (!likedVideos || likedVideos.length === 0) {
        throw new ApiError(404, "No liked videos found.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                `Found ${likedVideos.length} liked videos.`
            )
        );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
