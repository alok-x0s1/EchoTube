# EchoTube

EchoTube is a backend project similar to YouTube with features like user creation, video upload, likes, comments, and tweets. It follows a modular structure with separate models, routes, and controllers for each utility.

## Features

- User Authentication (Sign Up, Login, Logout)
- Video Upload and Management
- Like and Comment on Videos
- Tweeting functionality
- Token-based Authentication with JWT
- File uploads handled with Multer
- File uploads on cloudinary

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Cloudinary
- Multer
- Bcrypt
- Cors
- Cookie-Parser
- Dotenv

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/alok-x0s1/EchoTube.git
    cd EchoTube
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=your_port
    MONGODB_URI=your_mongodb_uri
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=your_access_token_expiry
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

4. **Start the server:**
    ```sh
    npm start
    ```

    The server will start on the port specified in the `.env` file.

## Project Structure

```plaintext
.
├── controllers
│   ├── authController.js
│   ├── commentController.js
│   ├── tweetController.js
│   └── videoController.js
├── models
│   ├── Comment.js
│   ├── Tweet.js
│   ├── User.js
│   └── Video.js
├── routes
│   ├── authRoutes.js
│   ├── commentRoutes.js
│   ├── tweetRoutes.js
│   └── videoRoutes.js
├── middlewares
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── utils
│   └── ApiError.js
│   └── ApiResponse.js
│   └── asyncHandler.js
│   └── cloudinary.js
├── app.js
├── constants.js
├── index.js
├── .env
├── .gitignore
├── .prettierignore
├── .prettierrc
├── .package-lock.json
├── .package.json
└── server.js