import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-code">404</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Page not found</h2>
      <p style={{ fontSize: 14, color: '#64748b', maxWidth: 360 }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );
}
