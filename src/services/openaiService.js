// Polyfill AbortController cho Node 14
import AbortController from "abort-controller";
if (!globalThis.AbortController) {
    globalThis.AbortController = AbortController;
}

// Polyfill fetch, Headers, Request, Response cho Node < 18
import fetch, { Headers, Request, Response } from "node-fetch";
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;
}

// Polyfill FormData, File, Blob cho Node 14
import { FormData, File, Blob } from "formdata-node";
if (!globalThis.FormData) {
    globalThis.FormData = FormData;
    globalThis.File = File;
    globalThis.Blob = Blob;
}

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Hàm phân tích intent (tách searchterm + filter)
export async function analyzeQuestion(question) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            {
                role: "system",
                content: `Bạn là trợ lý phân tích intent để lấy searchterm và filter.
        Trả về JSON với format:
        {"searchterm":"...","filter":"specialty|exam_package|complex_facility|doctor|all"}`,
            },
            { role: "user", content: question },
        ],
        temperature: 0,
    });

    return JSON.parse(completion.choices[0].message.content);
}

// Hàm sinh câu trả lời dựa trên dữ liệu DB
export async function generateAnswer(question, dbData) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            {
                role: "system",
                content: "Bạn là trợ lý y tế, chỉ trả lời dựa trên dữ liệu được cung cấp.",
            },
            {
                role: "user",
                content: `Người dùng hỏi: "${question}"\n
        Dữ liệu từ database: ${JSON.stringify(dbData)}\n
        Hãy trả lời tự nhiên, dễ hiểu, súc tích.`,
            },
        ],
    });

    return completion.choices[0].message.content;
}
