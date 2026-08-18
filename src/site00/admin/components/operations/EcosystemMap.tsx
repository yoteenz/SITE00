import { Link } from 'react-router-dom';

type EcosystemNode = {
  id: string;
  label: string;
  count: number;
  href: string;
};

type EcosystemEdge = {
  from: string;
  to: string;
};

type EcosystemMapProps = {
  nodes: EcosystemNode[];
  edges: EcosystemEdge[];
};

export function EcosystemMap({ nodes, edges }: EcosystemMapProps) {
  const order = ['identities', 'intakes', 'projects', 'sites', 'live'];
  const ordered = order.map((id) => nodes.find((n) => n.id === id)).filter(Boolean) as EcosystemNode[];

  return (
    <div className="site00-admin-ecosystem" aria-label="Ecosystem funnel">
      <div className="site00-admin-ecosystem__diagram">
        {ordered.map((node, index) => (
          <div key={node.id} className="site00-admin-ecosystem__node-wrap">
            <Link to={node.href} className="site00-admin-ecosystem__node">
              <span className="site00-admin-ecosystem__node-label">{node.label}</span>
              <span className="site00-admin-ecosystem__node-count">{node.count}</span>
            </Link>
            {index < ordered.length - 1 ? (
              <span className="site00-admin-ecosystem__connector" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <svg className="site00-admin-ecosystem__svg" aria-hidden="true" viewBox="0 0 400 40">
        {edges.map((edge) => {
          const fromIndex = order.indexOf(edge.from);
          const toIndex = order.indexOf(edge.to);
          if (fromIndex < 0 || toIndex < 0) return null;
          const x1 = 40 + fromIndex * 80;
          const x2 = 40 + toIndex * 80;
          return <line key={`${edge.from}-${edge.to}`} x1={x1} y1={20} x2={x2} y2={20} />;
        })}
      </svg>
    </div>
  );
}
