import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.content.jsx"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }, attempt = 1) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            if (!response || !response.interviewReport) {
                throw new Error("Invalid interview report response from server")
            }
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            if (error?.response?.status === 429 && attempt < 3) {
                const waitTimeMs = 30000 // 30 seconds
                console.warn(`429 detected, waiting ${waitTimeMs / 1000}s before retry #${attempt + 1}`)
                await new Promise(resolve => setTimeout(resolve, waitTimeMs))
                return generateReport({ jobDescription, selfDescription, resumeFile }, attempt + 1)
            }
            console.error("generateReport failed:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            const reportsData = response?.interviewReports ?? []
            setReports(reportsData)
            return reportsData
        } catch (error) {
            if (error?.response?.status === 401) {
                console.warn("getReports unauthorized - user not logged in")
                setReports([])
                return []
            }
            console.error("getReports failed", error)
            setReports([])
            return []
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}