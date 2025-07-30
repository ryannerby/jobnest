import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Dashboard = ({ jobs, onRefresh }) => {
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    return saved ? JSON.parse(saved) : getDefaultWidgets();
  });
  
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [availableWidgets] = useState([
    { id: 'stats', name: 'Application Statistics', icon: '📊' },
    { id: 'recent', name: 'Recent Applications', icon: '🕒' },
    { id: 'upcoming', name: 'Upcoming Deadlines', icon: '⏰' },
    { id: 'status', name: 'Status Distribution', icon: '📈' },
    { id: 'companies', name: 'Top Companies', icon: '🏢' },
    { id: 'locations', name: 'Location Analysis', icon: '🌍' },
    { id: 'timeline', name: 'Application Timeline', icon: '📅' },
    { id: 'notes', name: 'Recent Notes', icon: '📝' }
  ]);

  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
  }, [widgets]);

  function getDefaultWidgets() {
    return [
      { id: 'stats', enabled: true, size: 'medium', position: 0 },
      { id: 'recent', enabled: true, size: 'large', position: 1 },
      { id: 'upcoming', enabled: true, size: 'medium', position: 2 },
      { id: 'status', enabled: true, size: 'medium', position: 3 }
    ];
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedWidgets = items.map((widget, index) => ({
      ...widget,
      position: index
    }));

    setWidgets(updatedWidgets);
  };

  const toggleWidget = (widgetId) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, enabled: !widget.enabled }
        : widget
    ));
  };

  const changeWidgetSize = (widgetId, size) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, size }
        : widget
    ));
  };

  const addWidget = (widgetId) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (widget && !widgets.find(w => w.id === widgetId)) {
      setWidgets(prev => [...prev, {
        id: widgetId,
        enabled: true,
        size: 'medium',
        position: prev.length
      }]);
    }
    setShowWidgetSelector(false);
  };

  const removeWidget = (widgetId) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
  };

  const resetDashboard = () => {
    setWidgets(getDefaultWidgets());
  };

  const enabledWidgets = widgets.filter(widget => widget.enabled);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-highTide">Dashboard</h1>
          <p className="text-neutral-cadet">Overview of your job applications</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowWidgetSelector(!showWidgetSelector)}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-all duration-200"
          >
            Customize
          </button>
          <button
            onClick={resetDashboard}
            className="px-4 py-2 text-neutral-cadet border border-neutral-pebble rounded-lg hover:bg-neutral-pebble transition-all duration-200"
          >
            Reset Layout
          </button>
        </div>
      </div>

      {/* Widget Selector */}
      {showWidgetSelector && (
        <div className="bg-white rounded-xl shadow-card border border-neutral-pebble p-6">
          <h3 className="text-lg font-semibold mb-4">Add Widgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {availableWidgets.map(widget => {
              const isEnabled = widgets.find(w => w.id === widget.id)?.enabled;
              return (
                <button
                  key={widget.id}
                  onClick={() => isEnabled ? removeWidget(widget.id) : addWidget(widget.id)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isEnabled 
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                      : 'bg-neutral-pebble border-neutral-cadet text-neutral-highTide hover:bg-neutral-cadet hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{widget.icon}</div>
                  <div className="text-sm font-medium">{widget.name}</div>
                  <div className="text-xs opacity-75">
                    {isEnabled ? 'Remove' : 'Add'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {enabledWidgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${
                        widget.size === 'large' ? 'lg:col-span-2 xl:col-span-2' : ''
                      } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <DashboardWidget
                        widget={widget}
                        jobs={jobs}
                        onChangeSize={(size) => changeWidgetSize(widget.id, size)}
                        onToggle={() => toggleWidget(widget.id)}
                        onRemove={() => removeWidget(widget.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

// Individual Widget Component
const DashboardWidget = ({ widget, jobs, onChangeSize, onToggle, onRemove }) => {
  const renderWidgetContent = () => {
    switch (widget.id) {
      case 'stats':
        return <StatsWidget jobs={jobs} />;
      case 'recent':
        return <RecentApplicationsWidget jobs={jobs} />;
      case 'upcoming':
        return <UpcomingDeadlinesWidget jobs={jobs} />;
      case 'status':
        return <StatusDistributionWidget jobs={jobs} />;
      case 'companies':
        return <TopCompaniesWidget jobs={jobs} />;
      case 'locations':
        return <LocationAnalysisWidget jobs={jobs} />;
      case 'timeline':
        return <ApplicationTimelineWidget jobs={jobs} />;
      case 'notes':
        return <RecentNotesWidget jobs={jobs} />;
      default:
        return <div>Unknown widget</div>;
    }
  };

  const getSizeLabel = (size) => {
    switch (size) {
      case 'small': return 'S';
      case 'medium': return 'M';
      case 'large': return 'L';
      default: return 'M';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-neutral-pebble p-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {availableWidgets.find(w => w.id === widget.id)?.icon}
          </span>
          <h3 className="font-semibold text-neutral-highTide">
            {availableWidgets.find(w => w.id === widget.id)?.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Size Controls */}
          <div className="flex border border-neutral-pebble rounded-lg">
            {['small', 'medium', 'large'].map(size => (
              <button
                key={size}
                onClick={() => onChangeSize(size)}
                className={`px-2 py-1 text-xs font-medium transition-all duration-200 ${
                  widget.size === size
                    ? 'bg-primary-blue text-white'
                    : 'text-neutral-cadet hover:bg-neutral-pebble'
                }`}
              >
                {getSizeLabel(size)}
              </button>
            ))}
          </div>
          
          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="ml-2 p-1 text-neutral-cadet hover:text-red-600 transition-colors duration-200"
            title="Remove widget"
          >
            ×
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className={widget.size === 'small' ? 'text-sm' : ''}>
        {renderWidgetContent()}
      </div>
    </div>
  );
};

// Widget Components
const StatsWidget = ({ jobs }) => {
  const total = jobs.length;
  const applied = jobs.filter(job => job.status === 'applied').length;
  const interviews = jobs.filter(job => job.status === 'interview').length;
  const offers = jobs.filter(job => job.status === 'offer').length;
  const rejected = jobs.filter(job => job.status === 'rejected').length;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary-blue">{total}</div>
        <div className="text-sm text-neutral-cadet">Total</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{applied}</div>
        <div className="text-sm text-neutral-cadet">Applied</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">{interviews}</div>
        <div className="text-sm text-neutral-cadet">Interviews</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{offers}</div>
        <div className="text-sm text-neutral-cadet">Offers</div>
      </div>
    </div>
  );
};

const RecentApplicationsWidget = ({ jobs }) => {
  const recentJobs = jobs
    .filter(job => job.application_date)
    .sort((a, b) => new Date(b.application_date) - new Date(a.application_date))
    .slice(0, 5);

  return (
    <div className="space-y-3">
      {recentJobs.map(job => (
        <div key={job.id} className="flex items-center justify-between p-3 bg-neutral-pebble rounded-lg">
          <div>
            <div className="font-medium text-neutral-highTide">{job.title}</div>
            <div className="text-sm text-neutral-cadet">{job.company}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-neutral-highTide">
              {new Date(job.application_date).toLocaleDateString()}
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              job.status === 'applied' ? 'bg-blue-100 text-blue-800' :
              job.status === 'interview' ? 'bg-yellow-100 text-yellow-800' :
              job.status === 'offer' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {job.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const UpcomingDeadlinesWidget = ({ jobs }) => {
  const upcomingDeadlines = jobs
    .filter(job => job.deadline && new Date(job.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="space-y-3">
      {upcomingDeadlines.length === 0 ? (
        <div className="text-center text-neutral-cadet py-4">
          No upcoming deadlines
        </div>
      ) : (
        upcomingDeadlines.map(job => {
          const daysUntil = Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          return (
            <div key={job.id} className="flex items-center justify-between p-3 bg-neutral-pebble rounded-lg">
              <div>
                <div className="font-medium text-neutral-highTide">{job.title}</div>
                <div className="text-sm text-neutral-cadet">{job.company}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-highTide">
                  {new Date(job.deadline).toLocaleDateString()}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  daysUntil <= 3 ? 'bg-red-100 text-red-800' :
                  daysUntil <= 7 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {daysUntil} day{daysUntil !== 1 ? 's' : ''} left
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const StatusDistributionWidget = ({ jobs }) => {
  const statusCounts = {
    wishlist: jobs.filter(job => job.status === 'wishlist').length,
    applied: jobs.filter(job => job.status === 'applied').length,
    interview: jobs.filter(job => job.status === 'interview').length,
    offer: jobs.filter(job => job.status === 'offer').length,
    rejected: jobs.filter(job => job.status === 'rejected').length
  };

  const total = jobs.length;
  const statusColors = {
    wishlist: 'bg-gray-500',
    applied: 'bg-blue-500',
    interview: 'bg-yellow-500',
    offer: 'bg-green-500',
    rejected: 'bg-red-500'
  };

  return (
    <div className="space-y-3">
      {Object.entries(statusCounts).map(([status, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={status} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{status}</span>
              <span className="font-medium">{count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${statusColors[status]}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TopCompaniesWidget = ({ jobs }) => {
  const companyCounts = jobs.reduce((acc, job) => {
    acc[job.company] = (acc[job.company] || 0) + 1;
    return acc;
  }, {});

  const topCompanies = Object.entries(companyCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-3">
      {topCompanies.map(([company, count]) => (
        <div key={company} className="flex items-center justify-between p-3 bg-neutral-pebble rounded-lg">
          <div className="font-medium text-neutral-highTide">{company}</div>
          <div className="text-sm text-neutral-cadet">{count} application{count !== 1 ? 's' : ''}</div>
        </div>
      ))}
    </div>
  );
};

const LocationAnalysisWidget = ({ jobs }) => {
  const locationCounts = jobs.reduce((acc, job) => {
    if (job.location) {
      acc[job.location] = (acc[job.location] || 0) + 1;
    }
    return acc;
  }, {});

  const topLocations = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-3">
      {topLocations.length === 0 ? (
        <div className="text-center text-neutral-cadet py-4">
          No location data available
        </div>
      ) : (
        topLocations.map(([location, count]) => (
          <div key={location} className="flex items-center justify-between p-3 bg-neutral-pebble rounded-lg">
            <div className="font-medium text-neutral-highTide">{location}</div>
            <div className="text-sm text-neutral-cadet">{count} job{count !== 1 ? 's' : ''}</div>
          </div>
        ))
      )}
    </div>
  );
};

const ApplicationTimelineWidget = ({ jobs }) => {
  const timelineData = jobs
    .filter(job => job.application_date)
    .sort((a, b) => new Date(a.application_date) - new Date(b.application_date))
    .slice(-10);

  return (
    <div className="space-y-2">
      {timelineData.map((job, index) => (
        <div key={job.id} className="flex items-center gap-3">
          <div className="w-2 h-2 bg-primary-blue rounded-full"></div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-neutral-highTide truncate">{job.title}</div>
            <div className="text-xs text-neutral-cadet">{job.company}</div>
          </div>
          <div className="text-xs text-neutral-cadet">
            {new Date(job.application_date).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

const RecentNotesWidget = ({ jobs }) => {
  const jobsWithNotes = jobs
    .filter(job => job.notes && job.notes.trim())
    .sort((a, b) => new Date(b.application_date || b.created_at) - new Date(a.application_date || a.created_at))
    .slice(0, 3);

  return (
    <div className="space-y-3">
      {jobsWithNotes.length === 0 ? (
        <div className="text-center text-neutral-cadet py-4">
          No notes available
        </div>
      ) : (
        jobsWithNotes.map(job => (
          <div key={job.id} className="p-3 bg-neutral-pebble rounded-lg">
            <div className="font-medium text-neutral-highTide mb-1">{job.title}</div>
            <div className="text-sm text-neutral-cadet mb-2">{job.company}</div>
            <div className="text-sm text-neutral-highTide line-clamp-3">{job.notes}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard; 