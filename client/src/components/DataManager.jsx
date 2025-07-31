import { useState } from 'react';
import { exportBackup, importBackup, exportToCSV } from '../utils/dataManager';

const DataManager = ({ jobs, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState('');

  const handleExportBackup = async () => {
    setIsExporting(true);
    setMessage('');
    
    try {
      const backupData = {
        jobs: jobs,
        globalResume: localStorage.getItem('globalResume') || '',
        dashboardWidgets: localStorage.getItem('dashboard-widgets') || '[]',
        exportDate: new Date().toISOString()
      };
      
      exportBackup(backupData);
      setMessage('Backup exported successfully!');
    } catch (error) {
      setMessage('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setMessage('');

    try {
      const backupData = await importBackup(file);
      
      // Validate backup data
      if (!backupData.jobs || !Array.isArray(backupData.jobs)) {
        throw new Error('Invalid backup file format');
      }

      // Here you would typically send the data to your backend
      // For now, we'll just show a success message
      setMessage(`Backup imported successfully! Found ${backupData.jobs.length} jobs.`);
      
      // You could also restore other data like global resume and dashboard widgets
      if (backupData.globalResume) {
        localStorage.setItem('globalResume', backupData.globalResume);
      }
      if (backupData.dashboardWidgets) {
        localStorage.setItem('dashboard-widgets', backupData.dashboardWidgets);
      }
      
    } catch (error) {
      setMessage('Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      if (!jobs || jobs.length === 0) {
        setMessage('CSV export failed: No jobs to export');
        return;
      }
      exportToCSV(jobs);
      setMessage('CSV exported successfully!');
    } catch (error) {
      setMessage('CSV export failed: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-neutral-pebble">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-highTide">Data Management</h2>
            <button
              onClick={onClose}
              className="text-neutral-cadet hover:text-neutral-highTide text-xl sm:text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-neutral-cadet mt-2 text-sm sm:text-base">
            Backup, restore, and export your job application data
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Export Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Export Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="p-3 sm:p-4 border-2 border-dashed border-green-600 rounded-lg hover:bg-green-50 transition-all duration-200 text-center min-h-[120px] flex flex-col items-center justify-center"
              >
                <div className="text-2xl sm:text-3xl mb-2">💾</div>
                <div className="font-semibold text-neutral-highTide text-sm sm:text-base">Full Backup</div>
                <div className="text-xs sm:text-sm text-neutral-cadet">Export all data as JSON</div>
                {isExporting && <div className="text-xs text-green-600 mt-2">Exporting...</div>}
              </button>
              
              <button
                onClick={handleExportCSV}
                className="p-3 sm:p-4 border-2 border-dashed border-green-600 rounded-lg hover:bg-green-50 transition-all duration-200 text-center min-h-[120px] flex flex-col items-center justify-center"
              >
                <div className="text-2xl sm:text-3xl mb-2">📊</div>
                <div className="font-semibold text-neutral-highTide text-sm sm:text-base">CSV Export</div>
                <div className="text-xs sm:text-sm text-neutral-cadet">Export jobs as CSV</div>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Import Data</h3>
            <div className="p-3 sm:p-4 border-2 border-dashed border-neutral-pebble rounded-lg">
              <label className="block text-center cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-2">📥</div>
                <div className="font-semibold text-neutral-highTide text-sm sm:text-base">Restore Backup</div>
                <div className="text-xs sm:text-sm text-neutral-cadet mb-2">
                  Import a previously exported backup file
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                  disabled={isImporting}
                />
                <div className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 inline-block text-sm sm:text-base">
                  {isImporting ? 'Importing...' : 'Choose Backup File'}
                </div>
              </label>
            </div>
          </div>

          {/* Data Summary */}
          <div className="bg-neutral-pebble/30 rounded-lg p-3 sm:p-4">
            <h4 className="font-semibold text-neutral-highTide mb-2 text-sm sm:text-base">Data Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-neutral-cadet">Total Jobs:</span>
                <span className="font-semibold ml-2">{jobs.length}</span>
              </div>
              <div>
                <span className="text-neutral-cadet">Global Resume:</span>
                <span className="font-semibold ml-2">
                  {localStorage.getItem('globalResume') ? 'Saved' : 'Not saved'}
                </span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-lg text-sm sm:text-base ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-pebble">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 text-neutral-cadet border border-neutral-pebble rounded-lg hover:bg-neutral-pebble transition-all duration-200 text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager; 