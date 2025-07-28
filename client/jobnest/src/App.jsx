// src/App.jsx
import JobList from './components/JobList';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">JobNest</h1>
      <JobList />
    </div>
  );
}

export default App;
