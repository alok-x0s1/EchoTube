import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const videoCount = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
            },
        },
        {
            $group: {
                _id: null,
                totalVideoViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                totalLikes: { $sum: { $size: "$likes" } },
                totalComments: { $sum: { $size: "$comments" } },
            },
        },
        {
            $project: {
                totalVideoViews: 1,
                totalVideos: 1,
                totalLikes: 1,
                totalComments: 1,
            },
        },
    ]);

    if (!videoCount.length) {
        throw new ApiError("No videos found for this channel", 404);
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $group: {
                _id: null,
                totalSubscribers: { $sum: 1 },
            },
        },
        {
            $project: {
                totalSubscribers: 1,
            },
        },
    ]);

    if (!subscribers.length) {
        throw new ApiError("No subscribers found for this channel", 404);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videoStats: videoCount[0],
                subscribers: subscribers[0],
            },
            "Channel stats fetched successfully."
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (!userId) {
        throw new ApiError(400, "UserId is required.");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found with this id.");
    }

    const matchCriteria = {
        isPublished: true,
        owner: new mongoose.Types.ObjectId(userId),
    };

    if (query) {
        matchCriteria.$text = { $search: query };
    }

    const pipeline = [
        {
            $match: matchCriteria,
        },
    ];

    if (sortBy && sortType) {
        const sortCriteria = {};
        sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
        pipeline.push({ $sort: sortCriteria });
    }

    const options = {
        page: pageNum,
        limit: limitNum,
    };

    const result = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        options
    );
    if (result.docs.length === 0) {
        throw new ApiError(404, "No videos found for this user.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.docs,
                `Found ${result.totalDocs} videos for this user.`
            )
        );
});

export { getChannelStats, getChannelVideos };
