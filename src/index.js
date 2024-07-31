import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port : ${PORT}`);
        })
    })
    .catch( (error) => {
        console.error("Error connecting to the database: ", error);
        process.exit(1);
    })