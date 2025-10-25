// src/components/AddJobForm.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { parseJobDescriptionWithAI, formatAIResponseForForm } from "../utils/aiJobParser.js";

function AddJobForm({ onSuccess, editingJob, hideCancel = false, onGenerateCoverLetter }) {
  const [form, setForm] = useState({
    company: "",
    title: "",
    status: "wishlist",
    application_date: null,
    deadline: "",
    notes: "",
    link: "",
    cover_letter: "",
    job_description: "",
    hiring_manager: "",
    salary: "",
    job_type: "",
    requirements: "",
    benefits: "",
  });
  const [showJobDescriptionInput, setShowJobDescriptionInput] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (editingJob) {
      setForm(editingJob);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setShowJobDescriptionInput(false); // Show form fields when editing
    }
  }, [editingJob]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    console.log('Validating form with data:', form);
    
    if (!form.company.trim()) {
      newErrors.company = "Company is required";
    }
    if (!form.title.trim()) {
      newErrors.title = "Job title is required";
    }
    if (form.link && !form.link.startsWith('http')) {
      newErrors.link = "Link must start with http:// or https://";
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleAutoSave = useCallback(async () => {
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
  }, [editingJob, validateForm, form]);

  // Auto-save functionality
  useEffect(() => {
    if (!editingJob || !hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(async () => {
      await handleAutoSave();
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [editingJob, hasUnsavedChanges, handleAutoSave]);

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
  }, [hideCancel, onSuccess, handleSubmit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    console.log('Form submission - form data:', form);
    console.log('Form submission - validation result:', validateForm());
    
    if (!validateForm()) {
      console.log('Form validation failed - errors:', errors);
      return;
    }

    setIsSaving(true);
    try {
      // Clean up form data before sending to server
      const cleanedForm = {
        ...form,
        application_date: form.application_date || null,
        deadline: form.deadline || null,
        notes: form.notes || null,
        link: form.link || null,
        cover_letter: form.cover_letter || null,
        job_description: Array.isArray(form.job_description) ? form.job_description.join('\n\n') : (form.job_description || null),
        hiring_manager: form.hiring_manager || null,
        salary: form.salary || null,
        job_type: form.job_type || null,
        requirements: Array.isArray(form.requirements) ? form.requirements.join('\n\n') : (form.requirements || null),
        benefits: Array.isArray(form.benefits) ? form.benefits.join('\n\n') : (form.benefits || null),
      };
      
      console.log('Sending data to server:', JSON.stringify(cleanedForm, null, 2));
      if (editingJob) {
        await axios.put(`http://localhost:3001/api/jobs/${editingJob.id}`, cleanedForm);
      } else {
        await axios.post("http://localhost:3001/api/jobs", cleanedForm);
        // Reset form state for new job
        setShowJobDescriptionInput(true);
        setForm({
          company: "",
          title: "",
          status: "wishlist",
          application_date: null,
          deadline: "",
          notes: "",
          link: "",
          cover_letter: "",
          job_description: "",
          hiring_manager: "",
          salary: "",
          job_type: "",
          requirements: "",
          benefits: "",
        });
      }
      setHasUnsavedChanges(false);
      onSuccess();
    } catch (err) {
      console.error("Submit failed:", err.response?.data || err.message);
      if (err.response?.data?.messages) {
        console.error("Server validation errors:", err.response.data.messages);
      }
    } finally {
      setIsSaving(false);
    }
  }, [form, validateForm, editingJob, onSuccess, errors]);

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
    ) : null;
  };

  const handleParseJobDescription = async () => {
    if (!form.job_description.trim()) {
      setErrors(prev => ({ ...prev, job_description: "Please paste a job description first" }));
      return;
    }

    try {
      setIsProcessing(true);
      setErrors(prev => ({ ...prev, job_description: null }));
      
      console.log('Starting AI-powered job parsing...');
      
      // Parse job description with AI
      const aiResponse = await parseJobDescriptionWithAI(form.job_description);
      
      if (aiResponse.success) {
        // Format AI response for form
        const formattedData = formatAIResponseForForm(aiResponse);
        console.log('AI extracted data:', formattedData);
        
        // Update form with AI-extracted data
        setForm(prev => {
          const newForm = {
            ...prev,
            company: formattedData.company || "",
            title: formattedData.title || "",
            location: formattedData.location || "",
            deadline: formattedData.deadline || "",
            hiring_manager: formattedData.hiring_manager || "",
            salary: formattedData.salary || "",
            job_type: formattedData.job_type || "",
            requirements: formattedData.requirements || "",
            benefits: formattedData.benefits || "",
            cover_letter: formattedData.cover_letter || "",
            job_description: formattedData.job_description || prev.job_description,
          };
          console.log('Updated form data:', newForm);
          return newForm;
        });

        // Store tailored resume and cover letter
        if (aiResponse.tailoredResume) {
          localStorage.setItem('tailoredResume', JSON.stringify(aiResponse.tailoredResume));
        }
        if (aiResponse.coverLetter) {
          localStorage.setItem('coverLetter', aiResponse.coverLetter);
        }

        // Hide job description input and show form fields
        setShowJobDescriptionInput(false);
        
        // Show success message
        alert('✅ AI processing complete! Job details extracted and tailored resume/cover letter generated. You can now review and edit the information before submitting.');
        
        // Clear any existing errors
        setErrors({});
      } else {
        throw new Error(aiResponse.error || 'AI parsing failed');
      }
    } catch (error) {
      console.error('Error in AI job parsing:', error);
      setErrors(prev => ({ ...prev, job_description: "Failed to parse job description with AI. Please check your API key." }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📝</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 font-display">
            {editingJob ? "Edit Job" : "Add New Job"}
          </h2>
        </div>
        {editingJob && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {isSaving && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            )}
            {lastSaved && !isSaving && (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            )}
            {hasUnsavedChanges && (
              <span className="text-yellow-600">• Unsaved changes</span>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Description Parser - Show first */}
        {showJobDescriptionInput && (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🤖</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Smart Job Description Parser</h3>
              </div>
              <button
                type="button"
                onClick={handleParseJobDescription}
                disabled={isProcessing}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 font-semibold flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI Processing...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Extract & Generate</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Paste a job description below and click "Extract & Generate" to intelligently extract all job details, generate a tailored cover letter, and create a customized resume based on your global resume data.
            </p>
            <textarea 
              name="job_description" 
              value={form.job_description} 
              onChange={handleChange} 
              className={`w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none whitespace-pre-wrap leading-relaxed ${errors.job_description ? 'border-red-500' : ''}`}
              rows="8"
              placeholder="Paste the full job description here..."
              style={{ minHeight: '200px' }}
            />
            {errors.job_description && (
              <p className="text-red-500 text-sm mt-2">{errors.job_description}</p>
            )}
          </div>
        )}

        {/* Form Fields - Only show after AI processing or when editing */}
        {(!showJobDescriptionInput || editingJob) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Company *</label>
                <input 
                  name="company" 
                  value={form.company} 
                  onChange={handleChange} 
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
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
          </>
        )}



        {/* Additional Job Details - Only show after AI processing or when editing */}
        {(!showJobDescriptionInput || editingJob) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Location</label>
            <input 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Hiring Manager</label>
            <input 
              name="hiring_manager" 
              value={form.hiring_manager} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
              placeholder="e.g., John Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Salary</label>
            <input 
              name="salary" 
              value={form.salary} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all" 
              placeholder="e.g., $80,000 - $120,000"
            />
          </div>
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Job Type</label>
            <select 
              name="job_type" 
              value={form.job_type} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all bg-white"
            >
              <option value="">Select job type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-neutral-cadet mb-2">Notes</label>
          <textarea 
            name="notes" 
            value={form.notes} 
            onChange={handleChange} 
            className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all resize-none whitespace-pre-wrap leading-relaxed" 
            rows="4"
            placeholder="Add any notes about this position..."
            style={{ minHeight: '100px' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Requirements</label>
            <textarea 
              name="requirements" 
              value={form.requirements} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all resize-none whitespace-pre-wrap leading-relaxed" 
              rows="6"
              placeholder="Job requirements and qualifications..."
              style={{ minHeight: '150px' }}
            />
          </div>
          <div>
            <label className="block font-semibold text-neutral-cadet mb-2">Benefits</label>
            <textarea 
              name="benefits" 
              value={form.benefits} 
              onChange={handleChange} 
              className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all resize-none whitespace-pre-wrap leading-relaxed" 
              rows="6"
              placeholder="Company benefits and perks..."
              style={{ minHeight: '150px' }}
            />
          </div>
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
            className="w-full border border-neutral-pebble rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all resize-none whitespace-pre-wrap leading-relaxed" 
            rows="8"
            placeholder="Cover letter content..."
            style={{ minHeight: '200px' }}
          />
        </div>
        </>
        )}
        
        {/* Show success message and "Start Over" button when form fields are visible */}
        {!showJobDescriptionInput && !editingJob && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">✅</span>
                <h3 className="text-lg font-semibold text-green-800">AI Processing Complete!</h3>
              </div>
              <p className="text-green-700 text-sm">
                Job details extracted, tailored resume and cover letter generated. Review and edit the information below before submitting.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowJobDescriptionInput(true);
                  setForm(prev => ({
                    ...prev,
                    job_description: ""
                  }));
                }}
                className="px-6 py-2 text-primary-blue border border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition-all duration-200 font-semibold"
              >
                🔄 Start Over with Different Job Description
              </button>
            </div>
          </div>
        )}
        
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
