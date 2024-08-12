import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id.");
    }

    const subscribersData = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",

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
            $unwind: "$subscribers",
        },
        {
            $group: {
                _id: "$channel",
                subscribers: {
                    $push: "$subscribers",
                },
                totalSubscribers: {
                    $sum: 1,
                },
            },
        },
        {
            $project: {
                _id: 0,
                channel: "$_id",
                subscribers: 1,
                totalSubscribers: 1,
            },
        },
    ]);

    if (!subscribersData) {
        throw new ApiError(404, "Subscribers not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribersData, "Subscribers found."));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id.");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",

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
            $unwind: "$channels",
        },
        {
            $group: {
                _id: "$subscriber",
                channels: {
                    $push: "$channels",
                },
                totalChannels: {
                    $sum: 1,
                },
            },
        },
        {
            $project: {
                _id: 0,
                subscriber: "$_id",
                channels: 1,
                totalChannels: 1,
            },
        },
    ]);

    if (subscribedChannels.length === 0) {
        throw new ApiError(404, "No channels found.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "Subscribed channels found."
            )
        );
});

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id.");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Unsubscribed successfully."));
    } else {
        const subscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId,
        });
        if (!subscription) {
            throw new ApiError(400, "Failed to subscribe.");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, subscription, "Subscribed successfully.")
            );
    }
});

export {
    getUserChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription,
};