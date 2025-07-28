// src/components/JobList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function JobList({ refreshFlag, filter, onEdit }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/api/jobs')
      .then(res => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch(err => {
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

  const handleEdit = (job) => {
    onEdit(job);
  };

  const filteredJobs = filter === "all"
    ? jobs
    : jobs.filter(job => job.status === filter);

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div className="space-y-4">
      {filteredJobs.length === 0 ? (
        <p className="text-gray-500">No jobs found for "{filter}".</p>
      ) : (
        filteredJobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-sm text-gray-500">{job.company} — {job.status}</p>
            {job.link && (
              <a href={job.link} target="_blank" className="text-blue-600 underline text-sm">
                View listing
              </a>
            )}
            {job.notes && <p className="mt-2 text-gray-700 text-sm">{job.notes}</p>}

            {/* Edit/Delete buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(job)}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(job.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default JobList;
