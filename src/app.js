import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


// Import routes
import userRouter from "./routes/user.route.js"
import videoRouter from "./routes/video.route.js"
import tweetRouter from "./routes/tweet.route.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.route.js"
import commentRouter from "./routes/comment.route.js"

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/comments", commentRouter);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something broke!",
        error: err.message,
    });
});

export { app };