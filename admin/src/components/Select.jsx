const Select = ({
  name,
  value,
  onChange,
  children,
  disabled,
  className = "",
}) => (
  <select
    name={name}
    id={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`block w-full px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors duration-150 ease-in-out cursor-pointer ${className}`}
  >
    {children}
  </select>
);

export default Select;
