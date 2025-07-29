import React from "react";
import Logo from "./Logo";

const Header = ({ onAddJob, onManageResume, onLinkedInScraper, showForm, editingJob }) => {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <Logo size="xsmall" />
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onAddJob}
          className="px-8 py-3 bg-primary-blue text-white rounded-xl shadow-punch hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
        >
          <span>{showForm && !editingJob ? "Cancel" : "Add Job"}</span>
          {!showForm && (
            <div className="w-2 h-2 bg-primary-lime rounded-full"></div>
          )}
        </button>
        <button
          onClick={onLinkedInScraper}
          className="px-8 py-3 bg-primary-lime text-neutral-highTide rounded-xl shadow-lime-glow hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
        >
          <span>🔗</span>
          <span>LinkedIn Scraper</span>
        </button>
        <button
          onClick={onManageResume}
          className="px-8 py-3 bg-neutral-pebble text-neutral-highTide rounded-xl shadow-card hover:shadow-lg transition-all duration-200 font-semibold"
        >
          Manage Resume
        </button>
      </div>
    </header>
  );
};

export default Header; 