export function Table({ children }) {
  return (
    <div className="table-wrapper">
      <table className="table">{children}</table>
    </div>
  );
}

export function TableHead({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col}>{col}</th>
        ))}
      </tr>
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}
