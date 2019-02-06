import { json } from "body-parser";
import express = require("express");
import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApiRouter } from "./api";
import { log, verbose } from "./log";

createConnection().then(async () => {
    const app = express();

    app.use(json());

    app.use((req, res, next) => {
        verbose(req.ip, req.method, req.path);
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
