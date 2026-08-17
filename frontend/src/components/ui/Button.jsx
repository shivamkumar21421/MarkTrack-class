export default function Button({
  children,
  variant = 'primary',
  size = '',
  icon: Icon,
  className = '',
  ...props
}) {
  const classes = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
