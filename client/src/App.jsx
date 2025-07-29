import { useState } from "react";
import JobList from "./components/JobList";
import AddJobForm from "./components/AddJobForm";
import GlobalResumeManager from "./components/GlobalResumeManager";
import Logo from "./components/Logo";

const statuses = ["all", "wishlist", "applied", "interview", "offer", "rejected"];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingJob, setEditingJob] = useState(null);
  const [globalResume, setGlobalResume] = useState(localStorage.getItem("globalResume") || "");
  const [showResumeManager, setShowResumeManager] = useState(false);

  const handleCoverLetterSaved = () => setRefreshFlag(f => !f);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-pebble to-white text-neutral-highTide font-sans">
      {/* Header Section */}
      <div className="bg-white shadow-card border-b border-neutral-pebble">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="large" />
              <div className="h-12 w-1 bg-gradient-to-b from-primary-blue to-primary-lime rounded-full"></div>
              <p className="text-neutral-cadet font-medium text-lg">Your Career Command Center</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-lime rounded-full animate-pulse-slow"></div>
              <span className="text-sm text-neutral-cadet font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setEditingJob(null);
              setShowForm(!showForm);
            }}
            className="px-8 py-3 bg-primary-blue text-white rounded-xl shadow-punch hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
          >
            <span>{showForm && !editingJob ? "Cancel" : "Add Job"}</span>
            {!showForm && (
              <div className="w-2 h-2 bg-primary-lime rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setShowResumeManager(true)}
            className="px-8 py-3 bg-primary-lime text-neutral-highTide rounded-xl shadow-lime-glow hover:shadow-lg transition-all duration-200 font-semibold"
          >
            Manage Resume
          </button>
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

        {/* Resume Manager Modal */}
        {showResumeManager && (
          <GlobalResumeManager
            globalResume={globalResume}
            onUpdateResume={(resume) => {
              setGlobalResume(resume);
              localStorage.setItem("globalResume", resume);
            }}
            onClose={() => setShowResumeManager(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;