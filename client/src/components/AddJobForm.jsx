// src/components/AddJobForm.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function AddJobForm({ onSuccess, editingJob }) {
  const [form, setForm] = useState({
    company: "",
    title: "",
    status: "wishlist",
    application_date: "",
    deadline: "",
    notes: "",
    link: "",
    cover_letter: "",
  });

  useEffect(() => {
    if (editingJob) {
      setForm(editingJob);
    }
  }, [editingJob]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingJob) {
        await axios.put(`http://localhost:3001/api/jobs/${editingJob.id}`, form);
      } else {
        await axios.post("http://localhost:3001/api/jobs", form);
      }
      onSuccess(); // Triggers refresh + hide form
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-neutral-pebble p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">📝</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-highTide font-display">
          {editingJob ? "Edit Job" : "Add New Job"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Company</label>
            <input 
              name="company" 
              value={form.company} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Title</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Status</label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all bg-white"
            >
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Link</label>
            <input 
              name="link" 
              value={form.link} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Application Date</label>
            <input 
              type="date" 
              name="application_date" 
              value={form.application_date} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
            />
          </div>
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Deadline</label>
            <input 
              type="date" 
              name="deadline" 
              value={form.deadline} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-neutral-cadet mb-2">Notes</label>
          <textarea 
            name="notes" 
            value={form.notes} 
            onChange={handleChange} 
            className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all resize-none" 
            rows="3"
            placeholder="Add any notes about this position..."
          />
        </div>

        <div>
          <label className="block font-semibold text-neutral-cadet mb-2">Cover Letter</label>
          <textarea 
            name="cover_letter" 
            value={form.cover_letter} 
            onChange={handleChange} 
            className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all resize-none" 
            rows="6"
            placeholder="Cover letter content..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="px-8 py-3 bg-primary-blue text-white rounded-xl shadow-punch hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
          >
            <span>{editingJob ? "Update Job" : "Add Job"}</span>
            <div className="w-2 h-2 bg-primary-lime rounded-full"></div>
          </button>
          <button 
            type="button" 
            onClick={onSuccess}
            className="px-8 py-3 border border-neutral-cadet text-neutral-cadet rounded-xl hover:bg-neutral-cadet hover:text-white transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddJobForm;
