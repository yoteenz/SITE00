import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { Site00ExperiencePage } from '../../components/experience/Site00ExperiencePage';
import { SITE00_FAQ_ITEMS_SEED } from '../../config/seed/site00-page-seed';

export default function FaqPage() {
  return (
    <Site00ExperiencePage pageClassName="site00-page--faq" pageLabel="FAQ">
      <PageIntro title={<BracketHeading>FAQ</BracketHeading>} subtitle="FREQUENTLY ASKED QUESTIONS ABOUT SITE 00." />
      <div className="site00-faq-list">
        {SITE00_FAQ_ITEMS_SEED.map((item) => (
          <details key={item.id} className="site00-faq-item">
            <summary className="site00-faq-item__question">{item.question}</summary>
            <p className="site00-faq-item__answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </Site00ExperiencePage>
  );
}
