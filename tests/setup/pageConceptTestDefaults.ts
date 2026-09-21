/**
 * Default page-concept test env — full pipeline tests expect NBP unless a suite opts into review gate.
 */
if (process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW === undefined) {
  process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
}
