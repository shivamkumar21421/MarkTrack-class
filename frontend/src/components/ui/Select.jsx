export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select className={`select ${error ? 'input-error' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
