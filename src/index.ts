import { json, urlencoded } from "body-parser";
import express = require("express");
import "reflect-metadata";
import { createConnection } from "typeorm";
import { log } from "util";
import { ApiRouter } from "./api";

createConnection().then(async () => {
    const app = express();

    app.use(json());
    app.use(urlencoded({ extended: false }));

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, x-access-token");
        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        } else {
            return next();
        }
    });

    app.use("/api", ApiRouter);

    app.listen(8007, "localhost", () => {
        log("App started");
    });
}).catch((error) => log(error));
