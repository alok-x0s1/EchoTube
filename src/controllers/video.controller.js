import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideosOfUser = asyncHandler(async (req, res) => {
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

    // Build the initial match criteria
    const matchCriteria = {
        isPublished: true,
        owner: new mongoose.Types.ObjectId(userId),
    };

    // If there is an additional query, add it to the match criteria
    if (query) {
        matchCriteria.$text = { $search: query };
    }

    // Build the aggregation pipeline
    const pipeline = [
        {
            $match: matchCriteria,
        },
    ];

    // Add sorting if provided
    if (sortBy && sortType) {
        const sortCriteria = {};
        sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
        pipeline.push({ $sort: sortCriteria });
    }

    // Define options for pagination
    const options = {
        page: pageNum,
        limit: limitNum,
    };

    // Execute the aggregation pipeline
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

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build the initial match criteria
    const matchCriteria = {
        isPublished: true,
    };

    // If there is an additional query, add it to the match criteria
    if (query) {
        matchCriteria.$text = { $search: query };
    }

    // Build the aggregation pipeline
    const pipeline = [
        {
            $match: matchCriteria,
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
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
    ];

    // Add sorting if provided
    if (sortBy && sortType) {
        const sortCriteria = {};
        sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
        pipeline.push({ $sort: sortCriteria });
    }

    // Define options for pagination
    const options = {
        page: pageNum,
        limit: limitNum,
    };

    // Execute the aggregation pipeline
    const result = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        options
    );
    if (result.docs.length === 0) {
        throw new ApiError(404, "No videos found.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.docs,
                `Found ${result.totalDocs} videos.`
            )
        );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required.");
    }

    const videoCloudinary = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);
    if (!videoCloudinary || !thumbnailCloudinary) {
        throw new ApiError(400, "Failed to upload video and thumbnail.");
    }

    const video = await Video.create({
        videoFile: videoCloudinary.secure_url,
        thumbnail: thumbnailCloudinary.secure_url,
        title,
        description,
        owner: req.user?._id,
        duration: videoCloudinary.duration,
    });

    if (!video) {
        throw new ApiError(400, "Failed to publish video.");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully."));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id.");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found.");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video found."));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id.");
    }
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const thumbnailLocalPath = req.file?.path;
    if (thumbnailLocalPath) {
        const thumbnailCloudinary =
            await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnailCloudinary) {
            throw new ApiError(400, "Failed to upload thumbnail.");
        }
        req.body.thumbnail = thumbnailCloudinary.secure_url;
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: req.body,
        },
        {
            new: true,
            runValidators: true,
        }
    );
    if (!video) {
        throw new ApiError(400, "Failed to update video.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully."));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id.");
    }

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(400, "Failed to delete video.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully."));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id.");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found.");
    }
    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video status updated successfully.")
        );
});

export {
    getAllVideosOfUser,
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
