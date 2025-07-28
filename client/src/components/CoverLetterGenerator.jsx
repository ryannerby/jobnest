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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-stone">Generate Cover Letter</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Job Details</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Position:</strong> {job.title}</p>
              <p><strong>Company:</strong> {job.company}</p>
              {job.notes && <p><strong>Description:</strong> {job.notes}</p>}
            </div>
          </div>

          {!generatedCoverLetter ? (
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Resume Source</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useGlobalResume}
                      onChange={() => setUseGlobalResume(true)}
                      className="mr-2"
                    />
                    Use Global Resume
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useGlobalResume}
                      onChange={() => setUseGlobalResume(false)}
                      className="mr-2"
                    />
                    Use Custom Resume
                  </label>
                </div>
              </div>

              {!useGlobalResume && (
                <div>
                  <label className="block font-medium mb-2">Custom Resume</label>
                  <textarea
                    value={customResume}
                    onChange={(e) => setCustomResume(e.target.value)}
                    placeholder="Paste your resume here..."
                    className="w-full border rounded px-3 py-2 h-32 resize-none"
                  />
                </div>
              )}

              {useGlobalResume && globalResume && (
                <div>
                  <label className="block font-medium mb-2">Global Resume Preview</label>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {globalResume.substring(0, 200)}...
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-6 py-2 bg-blue-accent text-white rounded hover:bg-blue-dark transition disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate Cover Letter"}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Generated Cover Letter</label>
                <textarea
                  value={generatedCoverLetter}
                  onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                  className="w-full border rounded px-3 py-2 h-64 resize-none"
                  placeholder="Generated cover letter will appear here..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Save to Job
                </button>
                <button
                  onClick={() => setGeneratedCoverLetter("")}
                  className="px-6 py-2 bg-blue-accent text-white rounded hover:bg-blue-dark transition"
                >
                  Regenerate
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
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