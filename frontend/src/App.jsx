import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { seedIfEmpty } from "./lib/seed";
import { useEffect } from "react";
import JobsPage from "./routes/JobsPage";
import JobDetails from "./routes/JobDetails";
import JobForm from "./routes/JobForm"; 
import CandidatesPage from "./routes/CandidatesPage";
import CandidateProfile from "./routes/CandidateProfile";
import AssessmentForm from "./routes/AssessmentForm";
import AssessmentsPage from "./routes/AssessmentsPage";
import AssessmentBuilder from "./routes/AssessmentBuilder";
import NavBar from "./components/NavBar";



export default function App() {
  useEffect(() => { seedIfEmpty(); }, []);
  return (
    <Router>
      <NavBar />
      <Routes>
        
        <Route path="/" element={<Navigate to="/jobs" />} />

      
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/new" element={<JobForm />} />          
        <Route path="/jobs/:jobId/edit" element={<JobForm />} />  
        <Route path="/jobs/:jobId" element={<JobDetails />} />

        
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:id" element={<CandidateProfile />} />

        
        <Route path="/assessments/:jobId" element={<AssessmentsPage />} />
        <Route path="/assessments/:jobId/builder" element={<AssessmentBuilder />} />
        <Route path="/assessments/:jobId/form/:candidateId?" element={<AssessmentForm />} />
        <Route path="/assessments/:jobId/take" element={<AssessmentForm />} />



        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
}
