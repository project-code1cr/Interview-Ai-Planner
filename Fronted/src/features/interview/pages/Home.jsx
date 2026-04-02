
import React, { useState, useRef, useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useinterview.js'
import { useNavigate } from 'react-router'

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ selectedFile, setSelectedFile ] = useState(null)
    const [ isDragging, setIsDragging ] = useState(false)
    
    // 1. Added a specific loading state just for the button
    const [ isGenerating, setIsGenerating ] = useState(false)
    // 2. Add a retry-after countdown after 429 response
    const [ retryAfter, setRetryAfter ] = useState(0)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        const resumeFile = selectedFile || resumeInputRef.current.files[ 0 ]

        if (!resumeFile) {
            alert("Please upload your resume PDF before generating the report.")
            return
        }

        if (!jobDescription.trim()) {
            alert("Job description is required.")
            return
        }

        setRetryAfter(0)

        // 2. Lock the button immediately upon clicking
        setIsGenerating(true)

        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            if (!data || !data._id) {
                throw new Error("No report generated")
            }
            navigate(`/interview/${data._id}`)
        } catch (error) {
            console.error("Report generation failed", error)
            
            const status = error?.response?.status
            if (status === 429) {
                const retrySeconds = Number(error?.response?.data?.retryAfter || error?.response?.headers?.['retry-after'] || 30)
                setRetryAfter(retrySeconds)
                alert(`The AI is currently overwhelmed with requests. Please wait ${retrySeconds} seconds and try again.`)
            } else {
                const serverMessage = error?.response?.data?.error?.message || error?.response?.data?.message
                alert(serverMessage || error.message || "Failed to generate interview report")
            }
        } finally {
            // 4. Ensure the button always unlocks, even if there's an error
            setIsGenerating(false)
        }
    }

    useEffect(() => {
        if (!retryAfter) return

        const timer = setTimeout(() => {
            setRetryAfter(prev => Math.max(prev - 1, 0))
        }, 1000)

        return () => clearTimeout(timer)
    }, [retryAfter])

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>0 / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label
                                className={`dropzone ${isDragging ? 'dropzone--dragging' : ''}`}
                                htmlFor='resume'
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true)
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false)
                                    const file = e.dataTransfer.files[0]
                                    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx')) && file.size <= 5 * 1024 * 1024) {
                                        setSelectedFile(file)
                                        resumeInputRef.current.files = e.dataTransfer.files
                                    } else {
                                        alert('Please provide a PDF or DOCX file under 5MB.')
                                    }
                                }}
                            >
                                <span className='dropzone__icon'>
                                    {selectedFile ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    )}
                                </span>
                        <p className='dropzone__title'>{selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}</p>
                        <p className='dropzone__subtitle'>{selectedFile ? 'Resume selected' : 'PDF or DOCX (Max 5MB)'}</p>
                        <input
                            ref={resumeInputRef}
                            hidden
                            type='file'
                            id='resume'
                            name='resume'
                            accept='.pdf,.docx'
                            onChange={(e) => {
                                const file = e.target.files[0]
                                if (file) setSelectedFile(file)
                            }}
                        />
                    </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>A <strong>Resume PDF</strong> is required to generate a personalized plan (self-description can be added too for improved results).</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    
                    {retryAfter > 0 && (
                        <p className='retry-info'>Please wait {retryAfter} second{retryAfter === 1 ? '' : 's'} then retry.</p>
                    )}

                    {/* 5. Disabled the button and changed text while processing */}
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating || retryAfter > 0}
                        style={{ opacity: isGenerating || retryAfter > 0 ? 0.6 : 1, cursor: isGenerating || retryAfter > 0 ? 'not-allowed' : 'pointer' }}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        {isGenerating ? "Generating Plan..." : "Generate My Interview Strategy"}
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports?.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home