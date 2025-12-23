import express from "express";
import recommendationController from "../controllers/recommendationController";

let initChatRoutes = (app) => {
    let router = express.Router();

    router.get("/recommend/doctors", recommendationController.recommendDoctorsForPatient);

    return app.use("/", router);
};

export default initChatRoutes;
