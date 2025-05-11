const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
  className = "",
}) => (
  <textarea
    name={name}
    id={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    disabled={disabled}
    className={`block w-full px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors duration-150 ease-in-out placeholder-gray-400 dark:placeholder-slate-400 ${className}`}
  />
);

export default Textarea;
