import express from "express";
import aydController from "../controllers/aydController";

let initChatRoutes = (app) => {
    let router = express.Router();

    router.post("/api/ayd/session", aydController.createSession);

    return app.use("/", router);
};

export default initChatRoutes;
