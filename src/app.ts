import express from "express";

import bodyParser from "body-parser";
import morgan from "morgan";
import { connect } from "mongoose";
import postsRouter from "./routers/posts.js";
import catsRouter from "./routers/categories.js";
import usersRouter from "./routers/users.js";
import cors from "cors";

import "dotenv/config";
import { authJwt } from "./helpers/jwt.js";
import { errorHandler } from "./helpers/error-handler.js";

const app = express();

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
