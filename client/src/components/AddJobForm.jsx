// src/components/AddJobForm.jsx
import { useState } from "react";
import axios from "axios";

function AddJobForm({ onSuccess }) {
  const [form, setForm] = useState({
    company: "",
    title: "",
    status: "wishlist",
    application_date: "",
    deadline: "",
    notes: "",
    link: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/jobs", form);
      onSuccess();
    } catch (err) {
      console.error("Failed to add job:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-4">
      <div>
        <label className="block font-medium">Company</label>
        <input name="company" value={form.company} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
      </div>

      <div>
        <label className="block font-medium">Title</label>
        <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
      </div>

      <div>
        <label className="block font-medium">Status</label>
        <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="wishlist">Wishlist</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Application Date</label>
          <input type="date" name="application_date" value={form.application_date} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="flex-1">
          <label className="block font-medium">Deadline</label>
          <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
      </div>

      <div>
        <label className="block font-medium">Link</label>
        <input name="link" value={form.link} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>

      <div>
        <label className="block font-medium">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>

      <button type="submit" className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Submit
      </button>
    </form>
  );
}

export default AddJobForm;
