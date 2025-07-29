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
  const [searchTerm, setSearchTerm] = useState(''); // for search functionality
  const [sortBy, setSortBy] = useState('id'); // for sorting
  const [sortOrder, setSortOrder] = useState('desc'); // asc or desc

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && expandedJobId) {
        setExpandedJobId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expandedJobId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (expandedJobId && !e.target.closest('.job-card')) {
        setExpandedJobId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedJobId]);

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

  // Filter and sort jobs
  const filteredAndSortedJobs = jobs
    .filter((job) => {
      // Status filter
      const statusMatch = filter === "all" || job.status === filter;
      
      // Search filter
      const searchMatch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.notes && job.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'application_date':
          aValue = a.application_date || '';
          bValue = b.application_date || '';
          break;
        case 'deadline':
          aValue = a.deadline || '';
          bValue = b.deadline || '';
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusStyle = (status) => {
    const baseClasses = "status-badge inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold min-w-[80px] text-center";
    switch (status) {
      case 'applied':
        return `${baseClasses} status-applied text-primary-blue border border-primary-blue/20 shadow-sm`;
      case 'interview':
        return `${baseClasses} status-interview text-warning border border-warning/20 shadow-sm`;
      case 'offer':
        return `${baseClasses} status-offer text-success border border-success/20 shadow-sm`;
      case 'rejected':
        return `${baseClasses} status-rejected text-error border border-error/20 shadow-sm`;
      case 'wishlist':
        return `${baseClasses} status-wishlist text-neutral-highTide border border-primary-lime/20 shadow-sm`;
      default:
        return `${baseClasses} bg-neutral-cadet/10 text-neutral-cadet border border-neutral-cadet/20 shadow-sm`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'wishlist': return '📋';
      case 'applied': return '📤';
      case 'interview': return '🤝';
      case 'offer': return '🎉';
      case 'rejected': return '❌';
      default: return '📝';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
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
      {/* Search and Sort Controls */}
      <div className="bg-white rounded-xl shadow-card border border-neutral-pebble p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <label htmlFor="search" className="block text-sm font-medium text-neutral-cadet mb-2">
              Search Jobs
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by title, company, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-cadet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Sort Controls */}
          <div className="flex gap-2 items-end">
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-neutral-cadet mb-2">
                Sort by
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="id">Date Added</option>
                <option value="title">Title</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
                <option value="application_date">Application Date</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-neutral-pebble rounded-lg hover:bg-neutral-pebble/50 transition-all duration-200"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-4 text-sm text-neutral-cadet">
          Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
        </div>
      </div>

      {/* Header Row */}
      <div className="bg-neutral-pebble/50 rounded-xl p-6 grid grid-cols-12 gap-4 items-center font-sans text-sm font-bold text-neutral-cadet border border-neutral-pebble">
        <div className="col-span-4">Position</div>
        <div className="col-span-2">Company</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-2">Applied</div>
        <div className="col-span-1">Link</div>
        <div className="col-span-1"></div>
      </div>

      {/* Job Rows */}
      {filteredAndSortedJobs.map((job) => {
        const isExpanded = expandedJobId === job.id;
        return (
          <div
            key={job.id}
            className={`job-card ${cardStyle} ${isExpanded ? "ring-2 ring-primary-blue/30 shadow-xl animate-slide-down" : "cursor-pointer hover-lift"} transition-all duration-300 ease-in-out`}
            onClick={() => !isExpanded && setExpandedJobId(job.id)}
          >
            {!isExpanded ? (
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Position */}
                <div className="col-span-4">
                  <h3 className={titleStyle}>{job.title}</h3>
                  {job.notes && (
                    <p className="text-neutral-cadet/60 text-sm mt-1 line-clamp-1">{job.notes}</p>
                  )}
                </div>
                {/* Company */}
                <div className="col-span-2">
                  <p className={metaStyle}>{job.company}</p>
                </div>
                {/* Status */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className={getStatusStyle(job.status)}>
                    <span>{getStatusIcon(job.status)}</span>
                    <span className="hidden sm:inline">{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                  </span>
                </div>
                {/* Application Date */}
                <div className="col-span-2">
                  {job.application_date ? (
                    <span className="text-neutral-cadet text-sm font-medium">
                      {formatDate(job.application_date)}
                    </span>
                  ) : (
                    <span className="text-neutral-cadet/40 text-sm font-medium">Not applied</span>
                  )}
                </div>
                {/* Link */}
                <div className="col-span-1">
                  {job.link ? (
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors"
                      onClick={e => e.stopPropagation()}
                      title="View job listing"
                    >
                      🔗
                    </a>
                  ) : (
                    <span className="text-neutral-cadet/30 text-sm">—</span>
                  )}
                </div>
                {/* Expand indicator */}
                <div className="col-span-1 flex justify-end">
                  <div className="w-6 h-6 text-neutral-cadet/40 hover:text-neutral-cadet transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div onClick={e => e.stopPropagation()} className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">✏️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-highTide font-display">Edit Job</h2>
                  </div>
                  <button
                    onClick={() => setExpandedJobId(null)}
                    className="w-10 h-10 bg-neutral-pebble rounded-xl flex items-center justify-center text-neutral-cadet hover:bg-neutral-cadet hover:text-white transition-all duration-200 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
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
                  hideCancel={true}
                />
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-4 border-t border-neutral-pebble">
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-6 py-3 bg-error text-white rounded-xl shadow hover:bg-error/80 transition-all duration-200 font-semibold flex items-center space-x-2"
                  >
                    <span>🗑️</span>
                    <span>Delete Job</span>
                  </button>
                  <div className="flex items-center space-x-2 text-neutral-cadet text-sm">
                    <span>Click outside or press Esc to close</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {filteredAndSortedJobs.length === 0 && (
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
