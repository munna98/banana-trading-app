//components/accounts/ViewModeToggle.js
const ViewModeToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-slate-100 rounded-lg p-1">
      <button
        onClick={() => setViewMode('chart')}
        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
          viewMode === 'chart' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
        }`}
      >
        Chart View
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
          viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
        }`}
      >
        List View
      </button>
    </div>
  );
};

export default ViewModeToggle;