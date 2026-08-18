import { Site00LogoBlock } from '../shell/Site00LogoBlock';
import { FastTravelTrigger } from '../fast-travel/FastTravelTrigger';
import { DirectoryExitButton } from '../locations/DirectoryExitButton';
import type { RefObject } from 'react';

export type Site00MobileHeaderVariant = 'default' | 'directory';

type Site00MobileHeaderProps = {
  variant?: Site00MobileHeaderVariant;
  onFastTravelOpen?: () => void;
  fastTravelExpanded?: boolean;
  fastTravelTriggerRef?: RefObject<HTMLButtonElement>;
};

/** Mobile header — SITE 00 mark + Fast Travel trigger, or EXIT 00 on the directory page. */
export function Site00MobileHeader({
  variant = 'default',
  onFastTravelOpen,
  fastTravelExpanded = false,
  fastTravelTriggerRef,
}: Site00MobileHeaderProps) {
  return (
    <header className="site00-mobile-header">
      <Site00LogoBlock showBracket={false} />
      {variant === 'directory' ? (
        <DirectoryExitButton />
      ) : (
        <FastTravelTrigger
          onOpen={() => onFastTravelOpen?.()}
          expanded={fastTravelExpanded}
          buttonRef={fastTravelTriggerRef}
        />
      )}
    </header>
  );
}
