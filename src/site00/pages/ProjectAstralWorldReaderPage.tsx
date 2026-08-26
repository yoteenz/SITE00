import { Navigate, useParams } from 'react-router-dom';
import AstralWorldReaderRouter from '../astral-world/reader/AstralWorldReaderRouter';

export default function ProjectAstralWorldReaderPage() {
  const { projectSlug = '' } = useParams();
  if (projectSlug !== 'astral-world') {
    return <Navigate to={`/projects/${projectSlug}`} replace />;
  }
  return <AstralWorldReaderRouter />;
}
