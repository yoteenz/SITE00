import { FastTravelUpNextRegistrationMark } from './FastTravelUpNextRegistrationMark';

type FastTravelUpNextCardChromeProps = {
  /** Visible position within the current UP NEXT set (0-based). */
  cardIndex: number;
};

/** Faded positional index + red registration mark — UP NEXT card shell only. */
export function FastTravelUpNextCardChrome({ cardIndex }: FastTravelUpNextCardChromeProps) {
  return (
    <>
      <span className="site00-fast-travel__up-next-index" aria-hidden="true">
        {cardIndex}
      </span>
      <FastTravelUpNextRegistrationMark className="site00-fast-travel__up-next-registration" />
    </>
  );
}
