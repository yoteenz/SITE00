import { useParams } from 'react-router-dom';
import { FoundationClient } from '../../foundation-client/FoundationClient';

/** `/foundation/:token` — the personalized Digital Foundation link (Board 01 + Board 02 client experience). */
export default function DigitalFoundationArtifactPage() {
  const { token = '' } = useParams<{ token: string }>();
  return <FoundationClient key={token} token={token} />;
}
