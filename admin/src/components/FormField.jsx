const FormField = ({ label, children, htmlFor, className = "" }) => (
  <div className={className}>
    <label
      htmlFor={htmlFor || label.toLowerCase().replace(/\s+/g, "-")}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {label}
    </label>
    {children}
  </div>
);

export default FormField;
