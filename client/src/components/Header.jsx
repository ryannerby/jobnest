import React from "react";
import Logo from "./Logo";

const Header = ({ onAddJob, onManageResume, onDataManager, showForm, editingJob }) => {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <Logo size="medium" />
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
          onClick={onManageResume}
          className="px-8 py-3 bg-neutral-pebble text-neutral-highTide rounded-xl shadow-card hover:shadow-lg transition-all duration-200 font-semibold"
        >
          Manage Resume
        </button>
        <button
          onClick={onDataManager}
          className="px-8 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center space-x-2"
        >
          <span>💾</span>
          <span>Data Manager</span>
        </button>
      </div>
    </header>
  );
};

export default Header; 