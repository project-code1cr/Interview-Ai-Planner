const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
        throw new Error("Missing GOOGLE_GENAI_API_KEY")
    }

    const prompt = `Generate a detailed interview report as a JSON object with the exact fields below (do NOT include any extra fields):

{
  "title": "<job title>",
  "matchScore": <integer 0-100>,
  "technicalQuestions": [
    {
      "question": "...",
      "intention": "...",
      "answer": "..."
    },
    ...
  ],
  "behavioralQuestions": [ ... same shape ... ],
  "skillGaps": [
    { "skill": "...", "severity": "low|medium|high" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "...", "tasks": ["...", "..."] },
    ...
  ]
}

Use the following candidate context:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Requirements:
- At least 4 technical questions, 4 behavioral questions, 3 skill gaps, 7-day prep plan.
- Keep each answer less than 180 words.
- Use clear structured data for JSON parsing.
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    console.log('AI service response text:', response && response.text)
    console.log('AI service response data:', response && response.data)
    console.log('AI service response full object:', response)

    const extractResponsePayload = (res) => {
        if (!res) return null
        if (typeof res === 'string') return res
        if (res.text) return res.text
        if (res.data) return res.data

        const candidateParts = []
        if (Array.isArray(res.candidates)) {
            for (const candidate of res.candidates) {
                if (candidate?.content?.parts) {
                    for (const part of candidate.content.parts) {
                        if (typeof part?.text === 'string') {
                            candidateParts.push(part.text)
                        }
                    }
                }
            }
        }

        if (candidateParts.length > 0) {
            return candidateParts.join('')
        }

        if (Array.isArray(res.output)) {
            const outputParts = []
            for (const item of res.output) {
                if (item?.content?.parts) {
                    for (const part of item.content.parts) {
                        if (typeof part?.text === 'string') {
                            outputParts.push(part.text)
                        }
                    }
                }
                if (typeof item?.text === 'string') {
                    outputParts.push(item.text)
                }
            }
            if (outputParts.length > 0) return outputParts.join('')
        }

        return null
    }

    const payload = extractResponsePayload(response)

    if (!payload) {
        throw new Error("AI service returned no text/data payload")
    }

    let parsed
    if (typeof payload === 'object' && payload !== null) {
        parsed = payload
    } else {
        try {
            parsed = JSON.parse(payload)
        } catch (jsonError) {
            console.error('AI JSON parse error:', jsonError)
            throw new Error("AI service returned unparseable JSON: " + jsonError.message)
        }
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new Error("AI service returned invalid JSON")
    }

    const normalizeQA = (items) => {
        if (!Array.isArray(items)) return []
        if (items.length === 0) return []

        if (typeof items[0] === 'object' && items[0] !== null && 'question' in items[0]) {
            return items
        }

        const results = []
        for (let i = 0; i + 5 < items.length; i += 6) {
            if (items[i] !== 'question' || items[i + 2] !== 'intention' || items[i + 4] !== 'answer') {
                return items
            }
            results.push({
                question: items[i + 1],
                intention: items[i + 3],
                answer: items[i + 5]
            })
        }
        return results.length ? results : items
    }

    const normalizeGaps = (items) => {
        if (!Array.isArray(items)) return []
        if (items.length === 0) return []

        if (typeof items[0] === 'object' && items[0] !== null && 'skill' in items[0]) {
            return items
        }

        const results = []
        for (let i = 0; i + 3 < items.length; i += 4) {
            if (items[i] !== 'skill' || items[i + 2] !== 'severity') {
                return items
            }
            results.push({ skill: items[i + 1], severity: items[i + 3] })
        }
        return results.length ? results : items
    }

    const normalizePlan = (items) => {
        if (!Array.isArray(items)) return []
        if (items.length === 0) return []

        if (typeof items[0] === 'object' && items[0] !== null && 'day' in items[0]) {
            return items
        }

        const results = []
        for (let i = 0; i + 5 < items.length; i += 6) {
            if (items[i] !== 'day' || items[i + 2] !== 'focus' || items[i + 4] !== 'tasks') {
                return items
            }
            let tasks = items[i + 5]
            if (typeof tasks === 'string') tasks = [tasks]
            results.push({ day: Number(items[i + 1]), focus: items[i + 3], tasks })
        }
        return results.length ? results : items
    }

    parsed.technicalQuestions = normalizeQA(parsed.technicalQuestions)
    parsed.behavioralQuestions = normalizeQA(parsed.behavioralQuestions)
    parsed.skillGaps = normalizeGaps(parsed.skillGaps)
    parsed.preparationPlan = normalizePlan(parsed.preparationPlan)

    return parsed
}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }