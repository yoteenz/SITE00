import { useState } from 'react';
import { EVOLVE_HUB_FAQ_ITEMS } from '../../../config/evolve-hub-mobile';

export function EvolveHubFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="site00-evolve-hub-faq" id="faq" aria-labelledby="evolve-hub-faq-heading">
      <h2 id="evolve-hub-faq-heading" className="site00-evolve-hub-faq__label">
        FAQ
      </h2>
      <dl className="site00-evolve-hub-faq__list">
        {EVOLVE_HUB_FAQ_ITEMS.map((item) => {
          const open = openId === item.id;
          return (
            <div key={item.id} className={`site00-evolve-hub-faq__item ${open ? 'site00-evolve-hub-faq__item--open' : ''}`.trim()}>
              <dt>
                <button
                  type="button"
                  className="site00-evolve-hub-faq__trigger"
                  onClick={() => toggle(item.id)}
                  aria-expanded={open}
                >
                  <span>{item.question}</span>
                  <span className="site00-evolve-hub-faq__control" aria-hidden="true">
                    {open ? '−' : '+'}
                  </span>
                </button>
              </dt>
              {open ? <dd className="site00-evolve-hub-faq__answer">{item.answer}</dd> : null}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
