import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import JobList from "./components/JobList";
import AddJobForm from "./components/AddJobForm";
import GlobalResumeManager from "./components/GlobalResumeManager";
import LinkedInScraper from "./components/LinkedInScraper";
import Header from "./components/Header";
import Logo from "./components/Logo";
import ErrorBoundary from "./components/ErrorBoundary";

const statuses = ["all", "wishlist", "applied", "interview", "offer", "rejected"];

// Placeholder components
const AddJobPage = () => <div className="py-8"> <h2 className="text-2xl font-bold mb-4">Add Job</h2> <AddJobForm /> </div>;
const ResumeManagerPage = () => <div className="py-8"> <h2 className="text-2xl font-bold mb-4">Resume Manager</h2> <GlobalResumeManager globalResume={localStorage.getItem("globalResume") || ""} onUpdateResume={() => {}} onClose={() => {}} /> </div>;
const MyApplicationsPage = () => <div className="py-8"> <h2 className="text-2xl font-bold mb-4">My Applications</h2> <p>Coming soon...</p> </div>;

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingJob, setEditingJob] = useState(null);
  const [globalResume, setGlobalResume] = useState(localStorage.getItem("globalResume") || "");
  const [showResumeManager, setShowResumeManager] = useState(false);
  const [showLinkedInScraper, setShowLinkedInScraper] = useState(false);

  const handleCoverLetterSaved = () => setRefreshFlag(f => !f);

  // Handlers for header buttons
  const handleAddJob = () => {
    setEditingJob(null);
    setShowForm((prev) => !prev);
  };
  const handleManageResume = () => setShowResumeManager(true);
  const handleLinkedInScraper = () => setShowLinkedInScraper(true);
  const handleJobsImported = (count) => {
    setRefreshFlag(f => !f);
    // You could add a toast notification here
    console.log(`${count} jobs imported successfully!`);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-neutral-pebble to-white text-neutral-highTide font-sans">
        <Header
          onAddJob={handleAddJob}
          onManageResume={handleManageResume}
          onLinkedInScraper={handleLinkedInScraper}
          showForm={showForm}
          editingJob={editingJob}
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-200 text-sm shadow-card
                      ${filter === status
                        ? "bg-primary-blue text-white border-primary-blue shadow-punch"
                        : "border-neutral-cadet text-neutral-cadet hover:bg-neutral-cadet hover:text-white hover:shadow-card"}`}
                  >
                    {status[0].toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
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
                filter={filter}
                globalResume={globalResume}
                onEdit={(job) => {
                  setEditingJob(job);
                  setShowForm(true);
                }}
                onCoverLetterSaved={handleCoverLetterSaved}
              />
              {/* Resume Manager Modal (only in Home view) */}
              {showResumeManager && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-2xl w-full">
                    <button
                      onClick={() => setShowResumeManager(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                      aria-label="Close"
                    >
                      &times;
                    </button>
                    <GlobalResumeManager
                      globalResume={globalResume}
                      onUpdateResume={(resume) => {
                        setGlobalResume(resume);
                        localStorage.setItem("globalResume", resume);
                      }}
                      onClose={() => setShowResumeManager(false)}
                    />
                  </div>
                </div>
              )}
              
              {/* LinkedIn Scraper Modal */}
              {showLinkedInScraper && (
                <LinkedInScraper
                  onClose={() => setShowLinkedInScraper(false)}
                  onJobsImported={handleJobsImported}
                />
              )}
            </>
          } />
          <Route path="/add-job" element={<AddJobPage />} />
          <Route path="/resume-manager" element={<ResumeManagerPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
        </Routes>
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;