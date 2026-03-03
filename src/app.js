import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// cors middleware configuration
// cors settings are important to allow frontend to communicate with backend

// app.use - middleware

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Handling the data coming from frontend in json format. e.g. Form submissions data

app.use(express.json({ limit: "16kb" }));

// Handling the data coming from frontend in urlencoded format.

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// To store files or folders as an assest and make them publicly available

app.use(express.static("public"));

// To handle the cookies sent from frontend or user's browser

app.use(cookieParser());

// Routes

import userRouter from "./routes/user.routes.js";

// Routes declaration

// app.use() - middleware to handle the routes, because roters are are written in separate files and we need to use them in app.js

app.use("/api/v1/users", userRouter); // here control will pass to user.routes.js file

//Route - http://localhost:8000/api/v1/users/register

export { app };
