import { useState } from "react";
import JobList from "./components/JobList";
import AddJobForm from "./components/AddJobForm";

const statuses = ["all", "wishlist", "applied", "interview", "offer", "rejected"];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [filter, setFilter] = useState("all");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">JobNest</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {status[0].toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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

      <JobList refreshFlag={refreshFlag} filter={filter} />
    </div>
  );
}

export default App;
