import { useState, useEffect } from 'react';

const AdvancedFilters = ({ 
  jobs, 
  onFilterChange, 
  onBulkOperation,
  onExport,
  onImport 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    company: '',
    location: '',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    hasDeadline: 'all',
    hasNotes: 'all',
    hasCoverLetter: 'all'
  });
  
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Get unique companies and locations for filter options
  const companies = [...new Set(jobs.map(job => job.company).filter(Boolean))];
  const locations = [...new Set(jobs.map(job => job.location).filter(Boolean))];

  useEffect(() => {
    onFilterChange({ filters, sortBy, sortOrder });
  }, [filters, sortBy, sortOrder, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(job => job.id));
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleBulkOperation = () => {
    if (!bulkAction || selectedJobs.length === 0) return;
    
    onBulkOperation(bulkAction, selectedJobs);
    setSelectedJobs([]);
    setBulkAction('');
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      company: '',
      location: '',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      hasDeadline: 'all',
      hasNotes: 'all',
      hasCoverLetter: 'all'
    });
    setSortBy('id');
    setSortOrder('desc');
  };

  const exportData = () => {
    onExport(selectedJobs.length > 0 ? selectedJobs : null);
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-neutral-pebble p-6 mb-6">
      {/* Basic Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between mb-4">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-neutral-cadet mb-2">
            Search Jobs
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, company, or notes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
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
            <label className="block text-sm font-medium text-neutral-cadet mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
            >
              <option value="id">Date Added</option>
              <option value="title">Job Title</option>
              <option value="company">Company</option>
              <option value="status">Status</option>
              <option value="application_date">Application Date</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-neutral-pebble rounded-lg hover:bg-neutral-pebble transition-all duration-200"
            title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-all duration-200 font-medium"
        >
          {showAdvanced ? 'Hide' : 'Advanced'} Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-neutral-pebble pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-cadet mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                <option value="wishlist">Wishlist</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-cadet mb-2">
                Company
              </label>
              <select
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-cadet mb-2">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-neutral-cadet mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-cadet mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-cadet mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-cadet mb-2">
                Has Deadline
              </label>
              <select
                value={filters.hasDeadline}
                onChange={(e) => handleFilterChange('hasDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="all">All</option>
                <option value="yes">Has Deadline</option>
                <option value="no">No Deadline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-cadet mb-2">
                Has Notes
              </label>
              <select
                value={filters.hasNotes}
                onChange={(e) => handleFilterChange('hasNotes', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="all">All</option>
                <option value="yes">Has Notes</option>
                <option value="no">No Notes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-cadet mb-2">
                Has Cover Letter
              </label>
              <select
                value={filters.hasCoverLetter}
                onChange={(e) => handleFilterChange('hasCoverLetter', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="all">All</option>
                <option value="yes">Has Cover Letter</option>
                <option value="no">No Cover Letter</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-between items-center pt-4 border-t border-neutral-pebble">
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-neutral-cadet border border-neutral-pebble rounded-lg hover:bg-neutral-pebble transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
            
            <div className="flex gap-2">
              <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 cursor-pointer">
                Import CSV
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Export {selectedJobs.length > 0 ? `(${selectedJobs.length})` : 'All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations */}
      {selectedJobs.length > 0 && (
        <div className="border-t border-neutral-pebble pt-4 mt-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-cadet">
                {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-blue hover:underline"
              >
                {selectedJobs.length === jobs.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="flex gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-neutral-pebble rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
              >
                <option value="">Bulk Actions</option>
                <option value="delete">Delete Selected</option>
                <option value="status-wishlist">Mark as Wishlist</option>
                <option value="status-applied">Mark as Applied</option>
                <option value="status-interview">Mark as Interview</option>
                <option value="status-offer">Mark as Offer</option>
                <option value="status-rejected">Mark as Rejected</option>
              </select>
              <button
                onClick={handleBulkOperation}
                disabled={!bulkAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters; 