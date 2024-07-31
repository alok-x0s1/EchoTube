const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            next(err)
        );
    };
};

export { asyncHandler };

/*
const asyncHandler = (requestHandler) => {
    return async (req, res) => {
        try {
            await requestHandler(req, res);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    };
}
*/