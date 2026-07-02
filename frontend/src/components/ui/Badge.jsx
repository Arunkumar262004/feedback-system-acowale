/**
 * Badge — pill label for categories and tags
 * variant: 'brand' | 'gray' | 'success' | 'warning' | 'danger' | 'info'
 */
export default function Badge({ children, variant = 'brand' }) {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
}
