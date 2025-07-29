// src/components/JobList.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import CoverLetterGenerator from "./CoverLetterGenerator";
import AddJobForm from "./AddJobForm"; // Added import for AddJobForm

function JobList({
  refreshFlag,
  filter,
  globalResume,
  cardStyle = "bg-white rounded-xl shadow-card border border-neutral-pebble p-6 transition-all duration-200 hover:shadow-lg hover:border-primary-blue/20",
  titleStyle = "text-lg font-bold text-neutral-highTide font-display tracking-tight",
  metaStyle = "text-sm font-medium text-neutral-cadet font-sans",
  linkStyle = "inline-flex items-center space-x-2 px-3 py-1.5 bg-primary-blue/10 text-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition-all duration-200 font-medium text-sm border border-primary-blue/20 hover:border-primary-blue",
  notesStyle = "text-neutral-cadet text-sm leading-relaxed font-sans italic"
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCoverLetterGenerator, setShowCoverLetterGenerator] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // for expanded card
  const [expandedJobId, setExpandedJobId] = useState(null); // for expanded card
  const [refresh, setRefresh] = useState(false); // to trigger refresh after edit/delete

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
  }, [refreshFlag, refresh]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/jobs/${id}`);
      setJobs(prev => prev.filter(job => job.id !== id));
      setExpandedJobId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredJobs = filter === "all" ? jobs : jobs.filter((job) => job.status === filter);

  const getStatusStyle = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'applied':
        return `${baseClasses} bg-primary-blue/10 text-primary-blue border border-primary-blue/20`;
      case 'interview':
        return `${baseClasses} bg-warning/10 text-warning border border-warning/20`;
      case 'offer':
        return `${baseClasses} bg-success/10 text-success border border-success/20`;
      case 'rejected':
        return `${baseClasses} bg-error/10 text-error border border-error/20`;
      case 'wishlist':
        return `${baseClasses} bg-primary-lime/10 text-neutral-highTide border border-primary-lime/20`;
      default:
        return `${baseClasses} bg-neutral-cadet/10 text-neutral-cadet border border-neutral-cadet/20`;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-primary-blue rounded-full animate-pulse"></div>
        <p className="font-display text-neutral-cadet text-lg">Loading jobs...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="bg-neutral-pebble/50 rounded-xl p-6 grid grid-cols-12 gap-4 items-center font-sans text-sm font-bold text-neutral-cadet border border-neutral-pebble">
        <div className="col-span-4">Position</div>
        <div className="col-span-2">Company</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Link</div>
        <div className="col-span-1"></div>
      </div>

      {/* Job Rows */}
      {filteredJobs.map((job) => {
        const isExpanded = expandedJobId === job.id;
        return (
          <div
            key={job.id}
            className={cardStyle + (isExpanded ? " ring-2 ring-primary-blue/30" : " cursor-pointer")}
            onClick={() => !isExpanded && setExpandedJobId(job.id)}
          >
            {!isExpanded ? (
              <div className="grid grid-cols-12 gap-4 items-center">
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
                  <span className={getStatusStyle(job.status)}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                {/* Link */}
                <div className="col-span-3">
                  {job.link ? (
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkStyle}
                      onClick={e => e.stopPropagation()}
                    >
                      <span>🔗</span>
                      <span>View listing</span>
                    </a>
                  ) : (
                    <span className="text-neutral-cadet/40 text-sm font-medium">No link</span>
                  )}
                </div>
                {/* No actions or icons on front */}
                <div className="col-span-1"></div>
              </div>
            ) : (
              <div onClick={e => e.stopPropagation()}>
                <AddJobForm
                  editingJob={job}
                  onSuccess={() => {
                    setExpandedJobId(null);
                    setRefresh(r => !r);
                  }}
                  onGenerateCoverLetter={() => {
                    setSelectedJob(job);
                    setShowCoverLetterGenerator(true);
                  }}
                />
                <div className="flex flex-col md:flex-row gap-4 mt-6 justify-between items-center">
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-6 py-3 bg-error text-white rounded-xl shadow hover:bg-error/80 transition-all duration-200 font-semibold flex items-center space-x-2"
                  >
                    <span>🗑️</span>
                    <span>Delete Job</span>
                  </button>
                  <button
                    onClick={() => setExpandedJobId(null)}
                    className="px-6 py-3 border border-neutral-cadet text-neutral-cadet rounded-xl hover:bg-neutral-cadet hover:text-white transition-all duration-200 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-neutral-cadet text-lg font-medium">No jobs found</p>
          <p className="text-neutral-cadet/60 text-sm mt-2">Add your first job to get started!</p>
        </div>
      )}

      {showCoverLetterGenerator && (
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
