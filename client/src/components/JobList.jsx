// src/components/JobList.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import CoverLetterGenerator from "./CoverLetterGenerator";
import AddJobForm from "./AddJobForm";
import AdvancedFilters from "./AdvancedFilters";
import { filterJobs, sortJobs, exportToCSV, importFromCSV, validateJobData } from "../utils/dataManager";

function JobList({
  globalResume,
  jobs = [],
  onJobsUpdate,
  cardStyle = "bg-white rounded-xl shadow-card border border-neutral-pebble p-6 transition-all duration-200 hover:shadow-lg hover:border-primary-blue/20",
  titleStyle = "text-lg font-bold text-neutral-highTide font-display tracking-tight",
  metaStyle = "text-sm font-medium text-neutral-cadet font-sans"
}) {
  const [showCoverLetterGenerator, setShowCoverLetterGenerator] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filterConfig, setFilterConfig] = useState({
    filters: { search: '', status: 'all', company: '', location: '', dateRange: 'all', startDate: '', endDate: '', hasDeadline: 'all', hasNotes: 'all', hasCoverLetter: 'all' },
    sortBy: 'id',
    sortOrder: 'desc'
  });



  // Apply filters and sorting
  useEffect(() => {
    const filtered = filterJobs(jobs, filterConfig.filters);
    const sorted = sortJobs(filtered, filterConfig.sortBy, filterConfig.sortOrder);
    setFilteredJobs(sorted);
  }, [jobs, filterConfig.filters, filterConfig.sortBy, filterConfig.sortOrder]); // Use specific properties instead of the entire object

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
      onJobsUpdate(prev => prev.filter(job => job.id !== id));
      setExpandedJobId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback((newFilterConfig) => {
    setFilterConfig(newFilterConfig);
  }, []);

  // Handle bulk operations
  const handleBulkOperation = useCallback(async (action, selectedIds) => {
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} jobs?`)) return;
      
      try {
        await Promise.all(selectedIds.map(id => axios.delete(`http://localhost:3001/api/jobs/${id}`)));
        onJobsUpdate(prev => prev.filter(job => !selectedIds.includes(job.id)));
      } catch (err) {
        console.error("Bulk delete failed:", err);
      }
    } else if (action.startsWith('status-')) {
      const newStatus = action.replace('status-', '');
      
      try {
        await Promise.all(selectedIds.map(id => {
          const job = jobs.find(j => j.id === id);
          if (job) {
            return axios.put(`http://localhost:3001/api/jobs/${id}`, { ...job, status: newStatus });
          }
        }));
        onJobsUpdate(prev => prev.map(job => 
          selectedIds.includes(job.id) ? { ...job, status: newStatus } : job
        ));
      } catch (err) {
        console.error("Bulk status update failed:", err);
      }
    }
  }, [jobs, onJobsUpdate]);

  // Handle export
  const handleExport = useCallback((selectedIds) => {
    try {
      exportToCSV(jobs, selectedIds);
    } catch (err) {
      console.error("Export failed:", err);
    }
  }, [jobs]);

  // Handle import
  const handleImport = useCallback(async (file) => {
    try {
      const importedJobs = await importFromCSV(file);
      
      // Validate imported jobs
      const validJobs = [];
      const invalidJobs = [];
      
      importedJobs.forEach(job => {
        const errors = validateJobData(job);
        if (errors.length === 0) {
          validJobs.push(job);
        } else {
          invalidJobs.push({ job, errors });
        }
      });

      if (invalidJobs.length > 0) {
        console.warn('Some jobs failed validation:', invalidJobs);
      }

      // Import valid jobs
      if (validJobs.length > 0) {
        const results = await Promise.all(
          validJobs.map(job => axios.post('http://localhost:3001/api/jobs', job))
        );
        onJobsUpdate(prev => [...prev, ...results.map(r => r.data)]);
        alert(`Successfully imported ${validJobs.length} jobs`);
      }
    } catch (err) {
      console.error("Import failed:", err);
      alert('Import failed. Please check the file format.');
    }
  }, [onJobsUpdate]);

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



  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <AdvancedFilters
        jobs={jobs}
        onFilterChange={handleFilterChange}
        onBulkOperation={handleBulkOperation}
        onExport={handleExport}
        onImport={handleImport}
      />

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
      {filteredJobs.map((job) => {
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
                {/* Editable Job Details */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-6">
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
                    }}
                    onGenerateCoverLetter={() => {
                      setSelectedJob(job);
                      setShowCoverLetterGenerator(true);
                    }}
                    hideCancel={true}
                  />
                </div>

                {/* Action Buttons */}
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
