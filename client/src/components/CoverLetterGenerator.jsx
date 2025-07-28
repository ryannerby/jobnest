import { useState } from "react";
import axios from "axios";

function CoverLetterGenerator({ job, onClose, globalResume }) {
  const [customResume, setCustomResume] = useState("");
  const [useGlobalResume, setUseGlobalResume] = useState(true);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    
    try {
      const resumeText = useGlobalResume ? globalResume : customResume;
      
      if (!resumeText.trim()) {
        setError("Please provide a resume");
        setIsGenerating(false);
        return;
      }

      const response = await axios.post("http://localhost:3001/api/generate-cover-letter", {
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.notes || "",
        resume: resumeText
      });

      setGeneratedCoverLetter(response.data.coverLetter);
    } catch (err) {
      setError("Failed to generate cover letter. Please try again.");
      console.error("Cover letter generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/api/jobs/${job.id}`, {
        ...job,
        cover_letter: generatedCoverLetter
      });
      onClose();
    } catch (err) {
      setError("Failed to save cover letter");
      console.error("Save failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-highTide/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-card border border-neutral-pebble max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-lime rounded-xl flex items-center justify-center">
                <span className="text-neutral-highTide font-bold text-xl">✉️</span>
              </div>
              <h2 className="text-3xl font-bold text-neutral-highTide font-display">Generate Cover Letter</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-neutral-pebble rounded-xl flex items-center justify-center text-neutral-cadet hover:bg-neutral-cadet hover:text-white transition-all duration-200 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-neutral-cadet">Job Details</h3>
            <div className="bg-neutral-pebble/30 p-6 rounded-xl border border-neutral-pebble">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-cadet/60 uppercase tracking-wide">Position</p>
                  <p className="text-lg font-medium text-neutral-highTide">{job.title}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-cadet/60 uppercase tracking-wide">Company</p>
                  <p className="text-lg font-medium text-neutral-highTide">{job.company}</p>
                </div>
              </div>
              {job.notes && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-neutral-cadet/60 uppercase tracking-wide">Description</p>
                  <p className="text-neutral-cadet mt-1">{job.notes}</p>
                </div>
              )}
            </div>
          </div>

          {!generatedCoverLetter ? (
            <div className="space-y-6">
              <div>
                <label className="block font-semibold text-neutral-cadet mb-4 text-lg">Resume Source</label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-neutral-pebble rounded-xl hover:bg-neutral-pebble/20 transition-all cursor-pointer">
                    <input
                      type="radio"
                      checked={useGlobalResume}
                      onChange={() => setUseGlobalResume(true)}
                      className="mr-3 w-4 h-4 text-primary-blue focus:ring-primary-blue/20"
                    />
                    <span className="font-medium text-neutral-highTide">Use Global Resume</span>
                  </label>
                  <label className="flex items-center p-4 border border-neutral-pebble rounded-xl hover:bg-neutral-pebble/20 transition-all cursor-pointer">
                    <input
                      type="radio"
                      checked={!useGlobalResume}
                      onChange={() => setUseGlobalResume(false)}
                      className="mr-3 w-4 h-4 text-primary-blue focus:ring-primary-blue/20"
                    />
                    <span className="font-medium text-neutral-highTide">Use Custom Resume</span>
                  </label>
                </div>
              </div>

              {!useGlobalResume && (
                <div>
                  <label className="block font-semibold text-neutral-cadet mb-3 text-lg">Custom Resume</label>
                  <textarea
                    value={customResume}
                    onChange={(e) => setCustomResume(e.target.value)}
                    placeholder="Paste your resume here..."
                    className="w-full border border-neutral-pebble rounded-xl px-6 py-4 h-64 resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all font-sans text-base leading-relaxed"
                  />
                </div>
              )}

              {error && (
                <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-primary-blue text-white rounded-xl shadow-punch hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Cover Letter</span>
                      <div className="w-2 h-2 bg-primary-lime rounded-full"></div>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-3 border border-neutral-cadet text-neutral-cadet rounded-xl hover:bg-neutral-cadet hover:text-white transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block font-semibold text-neutral-cadet mb-3 text-lg">Generated Cover Letter</label>
                <textarea
                  value={generatedCoverLetter}
                  onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                  className="w-full border border-neutral-pebble rounded-xl px-6 py-4 h-96 resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all font-sans text-base leading-relaxed"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-primary-lime text-neutral-highTide rounded-xl shadow-lime-glow hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  Save to Job
                </button>
                <button
                  onClick={() => setGeneratedCoverLetter("")}
                  className="px-8 py-3 border border-neutral-cadet text-neutral-cadet rounded-xl hover:bg-neutral-cadet hover:text-white transition-all duration-200 font-semibold"
                >
                  Generate New
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-3 border border-neutral-cadet text-neutral-cadet rounded-xl hover:bg-neutral-cadet hover:text-white transition-all duration-200 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoverLetterGenerator; 