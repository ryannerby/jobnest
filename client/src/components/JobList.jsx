// src/components/JobList.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import CoverLetterGenerator from "./CoverLetterGenerator";

function JobList({
  refreshFlag,
  filter,
  onEdit,
  globalResume,
  cardStyle = "bg-white rounded-lg shadow-sm border border-gray-light p-4 transition hover:shadow-md",
  titleStyle = "text-lg font-bold text-stone font-display tracking-tight",
  metaStyle = "text-sm font-medium text-gray-dark font-sans",
  linkStyle = "text-blue-accent underline hover:text-blue-dark font-sans text-sm font-medium",
  notesStyle = "text-gray-dark text-sm leading-relaxed font-sans italic"
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCoverLetterGenerator, setShowCoverLetterGenerator] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/api/jobs")
      .then((res) => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, [refreshFlag]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/jobs/${id}`);
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredJobs = filter === "all" ? jobs : jobs.filter((job) => job.status === filter);

  if (loading) return <p className="font-display text-stone">Loading jobs...</p>;

  return (
    <div className="space-y-2">
      {/* Header Row */}
      <div className="bg-gray-light/30 rounded-lg p-4 grid grid-cols-12 gap-3 items-center font-sans text-sm font-semibold text-gray-dark">
        <div className="col-span-4">Position</div>
        <div className="col-span-2">Company</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Link</div>
        <div className="col-span-1">Notes</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Job Rows */}
      {filteredJobs.map((job) => (
        <div key={job.id} className={cardStyle}>
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Position */}
            <div className="col-span-4">
              <h3 className={titleStyle}>{job.title}</h3>
            </div>

            {/* Company */}
            <div className="col-span-2">
              <p className={metaStyle}>{job.company}</p>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                job.status === 'applied' ? 'bg-blue-accent/20 text-blue-accent' :
                job.status === 'interview' ? 'bg-yellow-500/20 text-yellow-600' :
                job.status === 'offer' ? 'bg-green-500/20 text-green-600' :
                job.status === 'rejected' ? 'bg-red-500/20 text-red-600' :
                job.status === 'wishlist' ? 'bg-purple-500/20 text-purple-600' :
                'bg-gray-500/20 text-gray-600'
              }`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>

            {/* Link */}
            <div className="col-span-2">
              {job.link ? (
                <a href={job.link} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                  View listing
                </a>
              ) : (
                <span className="text-gray-medium text-sm">No link</span>
              )}
            </div>

            {/* Notes */}
            <div className="col-span-1">
              {job.notes ? (
                <p className={notesStyle} title={job.notes}>
                  {job.notes.length > 15 ? job.notes.substring(0, 15) + '...' : job.notes}
                </p>
              ) : (
                <span className="text-gray-medium text-sm">-</span>
              )}
              {job.cover_letter && (
                <div className="mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    📄 Cover Letter
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-1 flex gap-1 min-w-0">
              <button
                onClick={() => onEdit(job)}
                className="px-1.5 py-1 text-xs bg-blue-accent text-white rounded hover:bg-blue-dark transition-colors font-medium flex-shrink-0"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setShowCoverLetterGenerator(true);
                }}
                className="px-1.5 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium flex-shrink-0"
                title="Generate Cover Letter"
              >
                📝
              </button>
              <button
                onClick={() => handleDelete(job.id)}
                className="px-1.5 py-1 text-xs bg-gray-medium text-white rounded hover:bg-gray-dark transition-colors font-medium flex-shrink-0"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}

      {showCoverLetterGenerator && selectedJob && (
        <CoverLetterGenerator
          job={selectedJob}
          globalResume={globalResume}
          onClose={() => {
            setShowCoverLetterGenerator(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}

export default JobList;
