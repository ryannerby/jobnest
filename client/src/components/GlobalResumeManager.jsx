import { useState } from "react";

function GlobalResumeManager({ globalResume, onUpdateResume, onClose }) {
  const [resumeText, setResumeText] = useState(globalResume || "");

  const handleSave = () => {
    onUpdateResume(resumeText);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-stone">Global Resume Manager</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 mb-4">
              This resume will be used as the default for generating cover letters. 
              You can always override it with a custom resume for specific jobs.
            </p>
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-2">Resume Content</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full border rounded px-3 py-2 h-96 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Save Resume
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalResumeManager; 