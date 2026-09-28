import { Link } from 'react-router-dom';

const base = 'inline-flex items-center justify-center gap-2 font-head font-semibold tracking-wide text-[0.95rem] px-5 py-2.5 rounded transition-colors duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-amber text-navy-900 hover:bg-amber-600',
  dark: 'bg-navy text-white hover:bg-navy-700',
  outline: 'border-2 border-navy text-navy hover:bg-navy hover:text-white',
  ghost: 'text-navy hover:bg-concrete-300',
  danger: 'bg-rust text-white hover:bg-rust/90',
};

export default function Button({ as, to, variant = 'primary', className = '', children, ...props }) {
  const cls = `${base} ${variants[variant] || variants.primary} ${className}`;
  if (as === 'link' || to) {
    return <Link to={to} className={cls} {...props}>{children}</Link>;
  }
  return <button className={cls} {...props}>{children}</button>;
}
