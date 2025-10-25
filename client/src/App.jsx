import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import JobList from "./components/JobList";
import AddJobForm from "./components/AddJobForm";
import GlobalResumeManager from "./components/GlobalResumeManager";

import Dashboard from "./components/Dashboard";
import DataManager from "./components/DataManager";
import Header from "./components/Header";

import ErrorBoundary from "./components/ErrorBoundary";



// Placeholder components
const AddJobPage = () => <div className="py-8"> <h2 className="text-2xl font-bold mb-4">Add Job</h2> <AddJobForm /> </div>;
const ResumeManagerPage = () => <div className="py-8"> <h2 className="text-2xl font-bold mb-4">Resume Manager</h2> <GlobalResumeManager globalResume={localStorage.getItem("globalResume") || ""} onUpdateResume={() => {}} onClose={() => {}} /> </div>;
const DashboardPage = ({ jobs, onRefresh }) => <div className="py-8"> <Dashboard jobs={jobs} onRefresh={onRefresh} /> </div>;
const MyApplicationsPage = () => <div className="py-8"> <h2 className="text-2xl font-bold mb-4">My Applications</h2> <p>Coming soon...</p> </div>;

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [editingJob, setEditingJob] = useState(null);
  const [globalResume, setGlobalResume] = useState(localStorage.getItem("globalResume") || "");
  const [showResumeManager, setShowResumeManager] = useState(false);

  const [showDataManager, setShowDataManager] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [_jobsLoading, setJobsLoading] = useState(true);

  const handleCoverLetterSaved = () => setRefreshFlag(f => !f);

  // Handlers for header buttons
  const handleAddJob = () => {
    setEditingJob(null);
    setShowForm((prev) => !prev);
  };
  const handleManageResume = () => setShowResumeManager(true);

  const handleDataManager = () => setShowDataManager(true);


  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/jobs');
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, [refreshFlag]);


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        <Header
          onAddJob={handleAddJob}
          onManageResume={handleManageResume}
          onDataManager={handleDataManager}
          showForm={showForm}
          editingJob={editingJob}
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={
            <>

              {/* Form Section */}
              {showForm && (
                <div className="mb-8">
                  <AddJobForm
                    editingJob={editingJob}
                    onSuccess={() => {
                      setShowForm(false);
                      setEditingJob(null);
                      setRefreshFlag(!refreshFlag);
                    }}
                  />
                </div>
              )}
              {/* Job List */}
              <JobList
                refreshFlag={refreshFlag}
                globalResume={globalResume}
                jobs={jobs}
                onJobsUpdate={setJobs}
                onEdit={(job) => {
                  setEditingJob(job);
                  setShowForm(true);
                }}
                onCoverLetterSaved={handleCoverLetterSaved}
              />
              {/* Resume Manager Modal */}
              {showResumeManager && (
                <GlobalResumeManager
                  globalResume={globalResume}
                  onUpdateResume={(newResume) => {
                    setGlobalResume(newResume);
                    localStorage.setItem("globalResume", newResume);
                    setShowResumeManager(false);
                  }}
                  onClose={() => setShowResumeManager(false)}
                />
              )}
              

              
              {/* Data Manager Modal */}
              {showDataManager && (
                <DataManager
                  jobs={jobs}
                  onClose={() => setShowDataManager(false)}
                />
              )}
            </>
          } />
          <Route path="/add-job" element={<AddJobPage />} />
          <Route path="/resume-manager" element={<ResumeManagerPage />} />
          <Route path="/dashboard" element={<DashboardPage jobs={jobs} onRefresh={() => setRefreshFlag(f => !f)} />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
        </Routes>
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;