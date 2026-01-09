import express from "express";
import recommendationController from "../controllers/recommendationController";

let initRecommendationRoutes = (app) => {
    let router = express.Router();

    router.get("/api/recommend/doctors", recommendationController.recommendDoctorsForPatientController);
    router.get("/api/recommend/packages", recommendationController.recommendPackagesForPatientController);

    return app.use("/", router);
};

export default initRecommendationRoutes;
