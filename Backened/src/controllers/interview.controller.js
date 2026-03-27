// // const { selfDescription, jobDescription, resume } = require("../services/temp")
// const pdfParse = require("pdf-parse")
// const generateInterviewReport = require("../services/ai.service")
// const interviewReportModel = require("../models/interviewReport.model")


// async function generateInterViewReportController(req,res){
//  const resumeFile = req.file

//  const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
//  const {selfDescription,jobDescription}=req.body

//  const interviewReportByAi = await generateInterViewReport({
//     resume: resumeContent.text,
//     selfDescription,
//     jobDescription
//  })
//  const interviewReport = await interviewReportModel.create({
//     user: req.user.id,
//     resume:resumeContent.text,
//     selfDescription,
//     jobDescription,
//     ...interviewReportByAi

//  })
//  res.status(201).json({
//     message:"Interview report generated successfully.",
//     interviewReport
//  })
// }
// async function getInterviewReportByIdController(req,res){
//    const { interviewId } = req.params
//    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })
//    if (!interviewReport) {
//       return res.status(404).json({ message: "Interview report not found." })
//    }
//    res.status(200).json({
//       message: "Interview report retrieved successfully.",
//       interviewReport
//    })
// }

// async function getAllInterviewReportsController(req, res) {
//     const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

//     res.status(200).json({
//         message: "Interview reports fetched successfully.",
//         interviewReports
//     })
// }
// module.exports = {generateInterViewReportController,getInterviewReportByIdController,getAllInterviewReportsController}


const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body

        if (!req.file && !selfDescription) {
            return res.status(400).json({
                message: "Either a resume file or selfDescription is required."
            })
        }

        let resumeText = ""

        if (req.file) {
            try {
                const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
                resumeText = resumeContent.text || ""
            } catch (error) {
                return res.status(400).json({
                    message: "Unable to parse uploaded resume. Make sure it is a valid PDF file."
                })
            }
        } else {
            resumeText = selfDescription
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        console.log("AI output for interview report:", JSON.stringify(interViewReportByAi, null, 2))

        if (!interViewReportByAi || typeof interViewReportByAi !== 'object') {
            return res.status(502).json({
                message: "AI service did not return a valid interview report."
            })
        }

        const techQs = Array.isArray(interViewReportByAi.technicalQuestions) ? interViewReportByAi.technicalQuestions : []
        const behavQs = Array.isArray(interViewReportByAi.behavioralQuestions) ? interViewReportByAi.behavioralQuestions : []
        const gaps = Array.isArray(interViewReportByAi.skillGaps) ? interViewReportByAi.skillGaps : []
        const prep = Array.isArray(interViewReportByAi.preparationPlan) ? interViewReportByAi.preparationPlan : []

        if (techQs.length < 4 || behavQs.length < 4 || gaps.length < 3 || prep.length < 7) {
            // prevent saving weak outputs that don't meet business requirements
            return res.status(502).json({
                message: "AI service returned incomplete interview report; please try again."
            })
        }

        interViewReportByAi.technicalQuestions = techQs
        interViewReportByAi.behavioralQuestions = behavQs
        interViewReportByAi.skillGaps = gaps
        interViewReportByAi.preparationPlan = prep
        interViewReportByAi.title = interViewReportByAi.title || "Untitled Position"

        if (interViewReportByAi.matchScore == null) {
            interViewReportByAi.matchScore = 0
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("generateInterViewReportController error:", error)
        return res.status(500).json({
            message: "Internal Server Error while generating interview report.",
            error: error.message || "Unknown error",
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }