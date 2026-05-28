import Card from './Card';

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  card = false,
  compact = false,
  className = '',
}) {
  const spacing = compact ? 'py-12' : 'py-20';
  const iconSize = compact ? 'h-12 w-12' : 'h-16 w-16';

  const content = (
    <>
      {Icon ? <Icon className={`empty-state-icon mx-auto mb-4 ${iconSize} text-border-strong/70`} /> : null}
      <h3 className="mb-1 text-lg font-medium text-neutral-dark font-heading">{title}</h3>
      {description ? <p className="mx-auto max-w-md text-text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </>
  );

  if (card) {
    return (
      <Card accent className={`${spacing} text-center ${className}`.trim()}>
        {content}
      </Card>
    );
  }

  return <div className={`${spacing} text-center ${className}`.trim()}>{content}</div>;
}

export default EmptyState;
