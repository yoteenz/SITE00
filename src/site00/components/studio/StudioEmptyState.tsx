type StudioEmptyStateProps = {
  title: string;
  body?: string;
};

export function StudioEmptyState({ title, body }: StudioEmptyStateProps) {
  return (
    <div className="site00-studio-empty" role="status">
      <p className="site00-studio-empty__title">{title}</p>
      {body ? <p className="site00-studio-empty__body">{body}</p> : null}
    </div>
  );
}
