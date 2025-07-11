import express from "express";

import bodyParser from "body-parser";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import { connect } from "mongoose";
import postsRouter from "./src/routers/posts";
import catsRouter from "./src/routers/categories";
import usersRouter from "./src/routers/users";
import cors from "cors";

import "dotenv/config";
import { authJwt } from "./src/helpers/jwt";
import { errorHandler } from "./src/helpers/error-handler";

import RateLimit from "express-rate-limit";

const app = express();
app.use(compression());

app.use(helmet());

// Set up rate limiter: maximum of twenty requests per minute
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use(cors());
app.options("*", cors());

const api = process.env.API_URL;

// middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

app.use(authJwt());
app.use(errorHandler);

app.use(`${api}/posts`, postsRouter);
app.use(`${api}/categories`, catsRouter);
app.use(`${api}/users`, usersRouter);

connect(process.env.DB_CONNECTION_URL ?? "", { dbName: "rehab_db" })
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => console.log(err));

app.listen(3000, () => {
  console.log(api);

  console.log("server is running http://localhost:3000");
});
