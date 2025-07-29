import { useState } from "react";
import axios from "axios";

const LinkedInScraper = ({ onClose, onJobsImported }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [error, setError] = useState("");
  const [step, setStep] = useState("search"); // "search", "results", "import"

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a job title or keyword");
      return;
    }

    setIsScraping(true);
    setError("");

    try {
      console.log("Making API call to:", "http://localhost:3001/api/scrape-linkedin");
      console.log("Request data:", { searchTerm: searchTerm.trim(), location: location.trim() });
      
      const response = await axios.post("http://localhost:3001/api/scrape-linkedin", {
        searchTerm: searchTerm.trim(),
        location: location.trim()
      });

      console.log("API response:", response.data);

      if (response.data.jobs && response.data.jobs.length > 0) {
        setScrapedJobs(response.data.jobs);
        setStep("results");
      } else {
        setError("No jobs found. Try different search terms.");
      }
    } catch (err) {
      console.error("Scraping error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      if (err.code === 'ERR_NETWORK') {
        setError("Network error: Cannot connect to server. Please check if the server is running.");
      } else if (err.response?.status === 404) {
        setError("API endpoint not found. Please check server configuration.");
      } else if (err.response?.status === 500) {
        setError("Server error: " + (err.response?.data?.message || "Internal server error"));
      } else {
        setError(err.response?.data?.message || "Failed to scrape jobs. Please try again.");
      }
    } finally {
      setIsScraping(false);
    }
  };

  const handleJobToggle = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === scrapedJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(scrapedJobs.map(job => job.id));
    }
  };

  const handleImportJobs = async () => {
    if (selectedJobs.length === 0) {
      setError("Please select at least one job to import");
      return;
    }

    setIsScraping(true);
    setError("");

    try {
      const jobsToImport = scrapedJobs.filter(job => selectedJobs.includes(job.id));
      
      // Import each selected job
      const importPromises = jobsToImport.map(job => 
        axios.post("http://localhost:3001/api/jobs", {
          title: job.title,
          company: job.company,
          link: job.link,
          location: job.location,
          status: "wishlist", // Default status for imported jobs
          notes: `Imported from LinkedIn - ${job.description?.substring(0, 200)}...`
        })
      );

      await Promise.all(importPromises);
      
      setStep("import");
      onJobsImported?.(selectedJobs.length);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Import error:", err);
      setError("Failed to import some jobs. Please try again.");
    } finally {
      setIsScraping(false);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setLocation("");
    setScrapedJobs([]);
    setSelectedJobs([]);
    setError("");
    setStep("search");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-pebble">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🔗</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-highTide font-display">
              LinkedIn Job Scraper
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-neutral-pebble rounded-xl flex items-center justify-center text-neutral-cadet hover:bg-neutral-cadet hover:text-white transition-all duration-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === "search" && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-neutral-cadet text-lg">
                  Search for jobs on LinkedIn and import them to your job list
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="searchTerm" className="block text-sm font-medium text-neutral-cadet mb-2">
                    Job Title or Keywords *
                  </label>
                  <input
                    type="text"
                    id="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g., Software Engineer, React Developer, Product Manager"
                    className="w-full px-4 py-3 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-neutral-cadet mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA or Remote"
                    className="w-full px-4 py-3 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleSearch}
                  disabled={isScraping || !searchTerm.trim()}
                  className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-xl shadow-punch hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isScraping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Search Jobs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-highTide">
                  Found {scrapedJobs.length} jobs for "{searchTerm}"
                </h3>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors text-sm font-medium"
                >
                  {selectedJobs.length === scrapedJobs.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="text-sm text-neutral-cadet mb-2">
                  Showing {scrapedJobs.length} jobs. Scroll to see more.
                </div>
                {scrapedJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedJobs.includes(job.id)
                        ? "border-primary-blue bg-primary-blue/5"
                        : "border-neutral-pebble hover:border-primary-blue/30"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleJobToggle(job.id)}
                        className="mt-1 w-4 h-4 text-primary-blue border-neutral-pebble rounded focus:ring-primary-blue"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-neutral-highTide truncate">
                              {job.title}
                            </h4>
                            <p className="text-neutral-cadet text-sm">{job.company}</p>
                            {job.location && (
                              <p className="text-neutral-cadet/60 text-sm">📍 {job.location}</p>
                            )}
                          </div>
                          {job.link && (
                            <a
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-primary-blue hover:text-primary-blue/80 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              🔗
                            </a>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-neutral-cadet text-sm mt-2 line-clamp-2">
                            {job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-neutral-pebble">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-neutral-pebble text-neutral-cadet rounded-xl hover:bg-neutral-pebble/50 transition-all duration-200 font-semibold"
                >
                  New Search
                </button>
                <button
                  onClick={handleImportJobs}
                  disabled={isScraping || selectedJobs.length === 0}
                  className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-xl shadow-punch hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isScraping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      <span>Import {selectedJobs.length} Selected Jobs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "import" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-highTide mb-2">
                  Successfully Imported!
                </h3>
                <p className="text-neutral-cadet">
                  {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} have been added to your job list.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInScraper; 