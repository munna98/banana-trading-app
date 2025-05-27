//components/accounts/AccountsViewControls.js
import SearchInput from './SearchInput';
import ViewModeToggle from './ViewModeToggle';
import FilterSelects from './FilterSelects';

const AccountsViewControls = ({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-slate-900">View Accounts</h3>
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {viewMode === 'list' && (
        <FilterSelects
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      )}
    </div>
  );
};

export default AccountsViewControls;