// Data management utilities for import/export operations

// Export jobs to CSV
export const exportToCSV = (jobs, selectedIds = null) => {
  const jobsToExport = selectedIds 
    ? jobs.filter(job => selectedIds.includes(job.id))
    : jobs;

  if (jobsToExport.length === 0) {
    throw new Error('No jobs to export');
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Company',
    'Title',
    'Status',
    'Application Date',
    'Deadline',
    'Location',
    'Link',
    'Notes',
    'Cover Letter',
    'Created At'
  ];

  // Convert jobs to CSV rows
  const csvRows = [
    headers.join(','),
    ...jobsToExport.map(job => [
      job.id,
      `"${(job.company || '').replace(/"/g, '""')}"`,
      `"${(job.title || '').replace(/"/g, '""')}"`,
      job.status || '',
      job.application_date || '',
      job.deadline || '',
      `"${(job.location || '').replace(/"/g, '""')}"`,
      `"${(job.link || '').replace(/"/g, '""')}"`,
      `"${(job.notes || '').replace(/"/g, '""')}"`,
      `"${(job.cover_letter || '').replace(/"/g, '""')}"`,
      job.created_at || ''
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `jobnest_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Import jobs from CSV
export const importFromCSV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const jobs = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = parseCSVLine(line);
            const job = {};
            
            headers.forEach((header, index) => {
              const value = values[index] || '';
              switch (header.toLowerCase()) {
                case 'id':
                  job.id = value;
                  break;
                case 'company':
                  job.company = value;
                  break;
                case 'title':
                  job.title = value;
                  break;
                case 'status':
                  job.status = value;
                  break;
                case 'application_date':
                  job.application_date = value;
                  break;
                case 'deadline':
                  job.deadline = value;
                  break;
                case 'location':
                  job.location = value;
                  break;
                case 'link':
                  job.link = value;
                  break;
                case 'notes':
                  job.notes = value;
                  break;
                case 'cover_letter':
                  job.cover_letter = value;
                  break;
                case 'created_at':
                  job.created_at = value;
                  break;
              }
            });
            
            return job;
          });
        
        resolve(jobs);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Parse CSV line with proper quote handling
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// Export data backup (JSON format)
export const exportBackup = (data) => {
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: data
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { 
    type: 'application/json;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `jobnest_backup_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Import data backup
export const importBackup = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        
        if (!backup.version || !backup.data) {
          throw new Error('Invalid backup file format');
        }
        
        resolve(backup.data);
      } catch (error) {
        reject(new Error('Failed to parse backup file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};



// Validate job data
export const validateJobData = (job) => {
  const errors = [];
  
  if (!job.company || job.company.trim() === '') {
    errors.push('Company is required');
  }
  
  if (!job.title || job.title.trim() === '') {
    errors.push('Job title is required');
  }
  
  if (job.status && !['wishlist', 'applied', 'interview', 'offer', 'rejected'].includes(job.status)) {
    errors.push('Invalid status');
  }
  
  // Validate dates
  if (job.application_date && !isValidDate(job.application_date)) {
    errors.push('Invalid application date');
  }
  
  if (job.deadline && !isValidDate(job.deadline)) {
    errors.push('Invalid deadline date');
  }
  
  return errors;
};

// Validate date format
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Filter jobs based on advanced criteria
export const filterJobs = (jobs, filters) => {
  return jobs.filter(job => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        job.title?.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        job.notes?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (job.status !== filters.status) return false;
    }
    
    // Company filter
    if (filters.company) {
      if (job.company !== filters.company) return false;
    }
    
    // Location filter
    if (filters.location) {
      if (job.location !== filters.location) return false;
    }
    
    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const jobDate = new Date(job.application_date || job.created_at);
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          if (!isSameDay(jobDate, now)) return false;
          break;
        case 'week':
          if (!isWithinDays(jobDate, now, 7)) return false;
          break;
        case 'month':
          if (!isWithinDays(jobDate, now, 30)) return false;
          break;
        case 'quarter':
          if (!isWithinDays(jobDate, now, 90)) return false;
          break;
        case 'year':
          if (!isWithinDays(jobDate, now, 365)) return false;
          break;
        case 'custom':
          if (filters.startDate && jobDate < new Date(filters.startDate)) return false;
          if (filters.endDate && jobDate > new Date(filters.endDate)) return false;
          break;
      }
    }
    
    // Has deadline filter
    if (filters.hasDeadline === 'yes' && !job.deadline) return false;
    if (filters.hasDeadline === 'no' && job.deadline) return false;
    
    // Has notes filter
    if (filters.hasNotes === 'yes' && !job.notes) return false;
    if (filters.hasNotes === 'no' && job.notes) return false;
    
    // Has cover letter filter
    if (filters.hasCoverLetter === 'yes' && !job.cover_letter) return false;
    if (filters.hasCoverLetter === 'no' && job.cover_letter) return false;
    
    return true;
  });
};

// Sort jobs
export const sortJobs = (jobs, sortBy, sortOrder) => {
  return [...jobs].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
        break;
      case 'company':
        aValue = (a.company || '').toLowerCase();
        bValue = (b.company || '').toLowerCase();
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'application_date':
        aValue = new Date(a.application_date || 0);
        bValue = new Date(b.application_date || 0);
        break;
      case 'deadline':
        aValue = new Date(a.deadline || 0);
        bValue = new Date(b.deadline || 0);
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
};

// Helper functions for date comparisons
const isSameDay = (date1, date2) => {
  return date1.toDateString() === date2.toDateString();
};

const isWithinDays = (date1, date2, days) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
}; 