import express from "express";
import recommendationController from "../controllers/recommendationController";

let initRecommendationRoutes = (app) => {
    let router = express.Router();

    router.get("/api/recommend/doctors", recommendationController.recommendDoctorsForPatientController);

    return app.use("/", router);
};

export default initRecommendationRoutes;
