import { useState } from "react";
import axios from "axios";

function CoverLetterGenerator({ job, isOpen, onClose, globalResume }) {
  const [customResume, setCustomResume] = useState("");
  const [useCustomResume, setUseCustomResume] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    
    try {
      const resumeToUse = useCustomResume ? customResume : globalResume;
      
      if (!resumeToUse) {
        setError("Please provide a resume (either global or custom)");
        setIsGenerating(false);
        return;
      }

      const response = await axios.post("http://localhost:3001/api/generate-cover-letter", {
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.notes || "",
        resume: resumeToUse,
        jobLink: job.link || ""
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

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCoverLetter);
  };

  if (!isOpen) return null;

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

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Resume Selection</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useCustomResume}
                  onChange={() => setUseCustomResume(false)}
                  className="mr-2"
                />
                Use Global Resume
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useCustomResume}
                  onChange={() => setUseCustomResume(true)}
                  className="mr-2"
                />
                Use Custom Resume
              </label>

              {useCustomResume && (
                <textarea
                  value={customResume}
                  onChange={(e) => setCustomResume(e.target.value)}
                  placeholder="Paste your custom resume here..."
                  className="w-full h-32 border rounded p-2"
                />
              )}

              {!useCustomResume && globalResume && (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Using global resume (first 200 characters shown):</p>
                  <p className="text-sm">{globalResume.substring(0, 200)}...</p>
                </div>
              )}

              {!useCustomResume && !globalResume && (
                <p className="text-red-500 text-sm">No global resume set. Please use custom resume or set a global resume.</p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!useCustomResume && !globalResume)}
              className="px-4 py-2 bg-blue-accent text-white rounded hover:bg-blue-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>

          {generatedCoverLetter && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Generated Cover Letter</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Save to Job
                  </button>
                </div>
              </div>
              <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-sans">{generatedCoverLetter}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoverLetterGenerator; 