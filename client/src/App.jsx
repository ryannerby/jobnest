import { useState } from "react";
import JobList from "./components/JobList";
import AddJobForm from "./components/AddJobForm";
import GlobalResumeManager from "./components/GlobalResumeManager";

const statuses = ["all", "wishlist", "applied", "interview", "offer", "rejected"];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingJob, setEditingJob] = useState(null);
  const [globalResume, setGlobalResume] = useState(localStorage.getItem("globalResume") || "");
  const [showResumeManager, setShowResumeManager] = useState(false);

  return (
    <div className="min-h-screen bg-cream text-stone px-6 py-10 font-sans">
      <h1 className="text-6xl text-stone font-bold mb-8 tracking-tight font-display">JobNest</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full border-2 font-semibold transition-all text-sm
              ${filter === status
                ? "bg-blue-accent text-white border-blue-accent"
                : "border-blue-accent text-blue-accent hover:bg-blue-accent hover:text-white"}`}
          >
            {status[0].toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => {
            setEditingJob(null);
            setShowForm(!showForm);
          }}
          className="px-6 py-2 bg-blue-accent text-white rounded-full shadow hover:bg-blue-dark transition"
        >
          {showForm && !editingJob ? "Cancel" : "Add Job"}
        </button>
        <button
          onClick={() => setShowResumeManager(true)}
          className="px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition"
        >
          Manage Resume
        </button>
      </div>

      {showForm && (
        <AddJobForm
          editingJob={editingJob}
          onSuccess={() => {
            setShowForm(false);
            setEditingJob(null);
            setRefreshFlag(!refreshFlag);
          }}
        />
      )}

      <JobList
        refreshFlag={refreshFlag}
        filter={filter}
        globalResume={globalResume}
        onEdit={(job) => {
          setEditingJob(job);
          setShowForm(true);
        }}
      />

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
  );
}

export default App; // with styled card props