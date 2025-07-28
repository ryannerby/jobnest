import { useState } from "react";

function GlobalResumeManager({ globalResume, onUpdateResume, onClose }) {
  const [resumeText, setResumeText] = useState(globalResume || "");

  const handleSave = () => {
    onUpdateResume(resumeText);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-highTide/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-card border border-neutral-pebble max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-lime rounded-xl flex items-center justify-center">
                <span className="text-neutral-highTide font-bold text-xl">📄</span>
              </div>
              <h2 className="text-3xl font-bold text-neutral-highTide font-display">Global Resume Manager</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-neutral-pebble rounded-xl flex items-center justify-center text-neutral-cadet hover:bg-neutral-cadet hover:text-white transition-all duration-200 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <p className="text-neutral-cadet text-lg leading-relaxed">
              This resume will be used as the default for generating cover letters. 
              You can always override it with a custom resume for specific jobs.
            </p>
          </div>

          <div className="mb-8">
            <label className="block font-semibold text-neutral-cadet mb-3 text-lg">Resume Content</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full border border-neutral-pebble rounded-xl px-6 py-4 h-96 resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all font-sans text-base leading-relaxed"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-primary-blue text-white rounded-xl shadow-punch hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
            >
              <span>Save Resume</span>
              <div className="w-2 h-2 bg-primary-lime rounded-full"></div>
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 border border-neutral-cadet text-neutral-cadet rounded-xl hover:bg-neutral-cadet hover:text-white transition-all duration-200 font-semibold"
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