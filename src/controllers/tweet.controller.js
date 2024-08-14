import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required.");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    if (!tweet) {
        throw new ApiError(400, "Failed to create tweet.");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully."));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id.");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",

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
            $unwind: "$owner",
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes",
                },
            },
        },
        {
            $project: {
                owner: 1,
                content: 1,
                createdAt: 1,
                likesCount: 1,
            },
        }
    ]);

    if (tweets.length === 0) {
        throw new ApiError(404, "No tweets found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, `Found ${tweets.length} tweets.`));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id.");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!tweet) {
        throw new ApiError(400, "Failed to update tweet.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully."));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id.");
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);
    if (!tweet) {
        throw new ApiError(400, "Failed to delete tweet.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully."));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
