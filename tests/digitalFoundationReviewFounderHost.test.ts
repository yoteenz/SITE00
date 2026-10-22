import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DigitalFoundationReviewFounderHost, {
  founderReviewIdForAnchor,
  founderReviewPathForAnchor,
} from '../src/site00/pages/foundation/DigitalFoundationReviewFounderHost';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../src/site00/admin/founder-workspace/config/routes';

describe('DigitalFoundationReviewFounderHost', () => {
  it('maps overview anchor to founder overview route', () => {
    expect(founderReviewPathForAnchor('df-r-founder-overview')).toBe(IDNTY_FOUNDER_WORKSPACE_ROUTES.overview);
    expect(founderReviewIdForAnchor('df-r-founder-overview')).toBe('OVERVIEW');
  });

  it('renders inline founder page without nesting a second Router', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/foundation/review'] },
        createElement(DigitalFoundationReviewFounderHost, { anchorId: 'df-r-founder-overview' }),
      ),
    );
    expect(html).toContain('df-review__founder-host');
    expect(html).not.toContain('BROKEN');
    expect(html).toContain('ws-');
  });
});
