import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-28 text-center">
      <p className="font-head font-bold text-6xl text-navy">404</p>
      <h1 className="font-head font-bold text-2xl text-navy mt-3">Page not found</h1>
      <p className="text-ink/60 mt-2">The page you're looking for doesn't exist or has moved.</p>
      <Button as="link" to="/" className="mt-7">Back to Home</Button>
    </div>
  );
}
