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

export { app };
