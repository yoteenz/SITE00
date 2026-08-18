import { PlatformErrorScreen } from './PlatformErrorScreen';

type Props = {
  guard: string;
  detail: string;
  onRetry?: () => void;
};

export function GuardLoadingRecovery({ guard, detail, onRetry }: Props) {
  return (
    <PlatformErrorScreen
      dataAttr="guard-loading-recovery"
      title="Route guard timed out"
      message={`${guard} did not reach a terminal state in time.`}
      boundary={guard}
      extra={detail}
      onRetry={onRetry}
    />
  );
}
