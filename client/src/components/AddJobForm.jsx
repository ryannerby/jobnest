// src/components/AddJobForm.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

function AddJobForm({ onSuccess, editingJob, hideCancel = false, onGenerateCoverLetter }) {
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
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (editingJob) {
      setForm(editingJob);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    }
  }, [editingJob]);

  // Auto-save functionality
  useEffect(() => {
    if (!editingJob || !hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(async () => {
      await handleAutoSave();
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [form, editingJob, hasUnsavedChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !hideCancel) {
        onSuccess();
      }
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hideCancel, onSuccess]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!form.company.trim()) {
      newErrors.company = "Company is required";
    }
    if (!form.title.trim()) {
      newErrors.title = "Job title is required";
    }
    if (form.link && !form.link.startsWith('http')) {
      newErrors.link = "Link must start with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAutoSave = async () => {
    if (!editingJob || !validateForm()) return;
    
    setIsSaving(true);
    try {
      await axios.put(`http://localhost:3001/api/jobs/${editingJob.id}`, form);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      if (editingJob) {
        await axios.put(`http://localhost:3001/api/jobs/${editingJob.id}`, form);
      } else {
        await axios.post("http://localhost:3001/api/jobs", form);
      }
      setHasUnsavedChanges(false);
      onSuccess();
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="text-error text-sm mt-1">{errors[fieldName]}</p>
    ) : null;
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-neutral-pebble p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📝</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-highTide font-display">
            {editingJob ? "Edit Job" : "Add New Job"}
          </h2>
        </div>
        {editingJob && (
          <div className="flex items-center space-x-2 text-sm text-neutral-cadet">
            {isSaving && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            )}
            {lastSaved && !isSaving && (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            )}
            {hasUnsavedChanges && (
              <span className="text-warning">• Unsaved changes</span>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Company *</label>
            <input 
              name="company" 
              value={form.company} 
              onChange={handleChange} 
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all ${errors.company ? 'border-error' : 'border-neutral-pebble'}`}
              required 
            />
            {getFieldError('company')}
          </div>

          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Title *</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all ${errors.title ? 'border-error' : 'border-neutral-pebble'}`}
              required 
            />
            {getFieldError('title')}
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
              <option value="wishlist">📋 Wishlist</option>
              <option value="applied">📤 Applied</option>
              <option value="interview">🤝 Interview</option>
              <option value="offer">🎉 Offer</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Link</label>
            <input 
              name="link" 
              value={form.link} 
              onChange={handleChange} 
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all ${errors.link ? 'border-error' : 'border-neutral-pebble'}`}
              placeholder="https://..."
            />
            {getFieldError('link')}
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
              type="text" 
              name="deadline" 
              value={form.deadline} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
              placeholder="e.g., 12/31/2024 or ASAP"
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
          <div className="flex items-center justify-between mb-2">
            <label className="block font-semibold text-neutral-cadet">Cover Letter</label>
            {onGenerateCoverLetter && (
              <button
                type="button"
                onClick={onGenerateCoverLetter}
                className="px-4 py-2 bg-primary-lime text-white rounded-lg shadow hover:bg-primary-lime/80 transition-all duration-200 font-semibold flex items-center space-x-2 text-sm"
              >
                <span>📄</span>
                <span>Generate</span>
              </button>
            )}
          </div>
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
            disabled={isSaving}
            className="px-8 py-3 bg-primary-blue text-white rounded-xl shadow-punch hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>{editingJob ? "Update Job" : "Add Job"}</span>
                <div className="w-2 h-2 bg-primary-lime rounded-full"></div>
              </>
            )}
          </button>
          {!hideCancel && (
            <button 
              type="button" 
              onClick={onSuccess}
              className="px-8 py-3 border border-neutral-cadet text-neutral-cadet rounded-xl hover:bg-neutral-cadet hover:text-white transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
        
        {editingJob && (
          <div className="text-xs text-neutral-cadet/60 pt-2 border-t border-neutral-pebble">
            <p>💡 Tip: Press Ctrl+S to save, Esc to close</p>
          </div>
        )}
      </form>
    </div>
  );
}

export default AddJobForm;
