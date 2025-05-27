//components/accounts/SummaryCard.js
const SummaryCard = ({ title, count, icon, colorClasses }) => {
  const [gradientFrom, gradientTo, borderColor, bgColor, textColor, titleColor] = colorClasses.split(' ');
  
  return (
    <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-6 border ${borderColor}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>
          <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;