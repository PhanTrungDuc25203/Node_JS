import { allMedicalServiceFilterSearchService } from "../services/searchService";
import { analyzeQuestion, generateAnswer } from "../services/openaiService";

export const chatWithAI = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Missing question!" });
        }

        // B1: gọi OpenAI phân tích intent
        const { searchterm, filter } = await analyzeQuestion(question);

        // B2: search DB bằng service cũ
        const dbResult = await allMedicalServiceFilterSearchService(searchterm, filter === "all" ? null : filter);

        // B3: tạo câu trả lời hội thoại
        const answer = await generateAnswer(question, dbResult.data);

        res.json({
            searchterm,
            filter,
            rawData: dbResult.data,
            answer,
        });
    } catch (error) {
        console.error("Chat API error:", error);
        res.status(500).json({ error: error.message });
    }
};
