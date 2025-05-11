const StatCard = ({ title, value, icon, unit = "" }) => (
  <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-5 sm:p-6 transition-all hover:shadow-xl">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
        {title}
      </p>
      <div className="text-teal-500 dark:text-teal-400">{icon}</div>
    </div>
    <div className="mt-2">
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {unit}
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

export default StatCard;
