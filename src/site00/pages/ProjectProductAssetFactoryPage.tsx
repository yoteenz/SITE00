import { useParams } from 'react-router-dom';
import { ProductAssetFactoryWorkspace } from '../components/productAssetFactory/ProductAssetFactoryWorkspace';
import '../styles/site00-product-asset-factory-p0paf1.css';

export function ProjectProductAssetFactoryPage() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  return (
    <div className="site00-page site00-page--product-asset-factory" data-product-asset-factory="p0paf1-page">
      <ProductAssetFactoryWorkspace projectSlug={projectSlug ?? 'frontal-slayer'} />
    </div>
  );
}
