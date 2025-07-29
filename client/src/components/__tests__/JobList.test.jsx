import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobList from '../JobList';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('JobList', () => {
  const mockJobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Tech Corp',
      status: 'applied',
      application_date: '2024-01-15',
      notes: 'Great opportunity',
      link: 'https://example.com/job1'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Startup Inc',
      status: 'wishlist',
      application_date: null,
      notes: 'Interesting role',
      link: null
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockJobs });
  });

  it('renders loading state initially', () => {
    render(<JobList refreshFlag={false} filter="all" globalResume="" />);
    expect(screen.getByText('Loading jobs...')).toBeInTheDocument();
  });

  it('renders jobs after loading', async () => {
    render(<JobList refreshFlag={false} filter="all" globalResume="" />);
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
  });

  it('filters jobs by status', async () => {
    render(<JobList refreshFlag={false} filter="applied" globalResume="" />);
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    render(<JobList refreshFlag={false} filter="all" globalResume="" />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by title, company, or notes...')).toBeInTheDocument();
    });
  });

  it('shows sort controls', async () => {
    render(<JobList refreshFlag={false} filter="all" globalResume="" />);
    
    await waitFor(() => {
      expect(screen.getByText('Sort by')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Date Added')).toBeInTheDocument();
    });
  });

  it('displays job count', async () => {
    render(<JobList refreshFlag={false} filter="all" globalResume="" />);
    
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 jobs')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    render(<JobList refreshFlag={false} filter="all" globalResume="" />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by title, company, or notes...');
      fireEvent.change(searchInput, { target: { value: 'Software' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
      expect(screen.getByText('Showing 1 of 2 jobs')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    
    render(<JobList refreshFlag={false} filter="all" globalResume="" />);
    
    await waitFor(() => {
      expect(screen.getByText('Loading jobs...')).toBeInTheDocument();
    });
  });
}); 