// src/App.jsx
import { useState } from "react";
import JobList from "./components/JobList";
import AddJobForm from "./components/AddJobForm";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">JobNest</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {showForm ? "Cancel" : "Add Job"}
      </button>

      {showForm && (
        <AddJobForm
          onSuccess={() => {
            setShowForm(false);
            setRefreshFlag(!refreshFlag);
          }}
        />
      )}

      <JobList refreshFlag={refreshFlag} />
    </div>
  );
}

export default App;
