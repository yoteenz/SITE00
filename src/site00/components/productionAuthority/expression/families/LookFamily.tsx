/**
 * 03 LOOK + WARDROBE — root · looks · outfits · hair · makeup · accessories · fittings · continuity.
 * Source: cast.looks (CharacterCampaignLook), temporal looks and character authority sheets. The character +
 * era picker of the previous Wardrobe screen is kept (same test ids); every aspect route reads the selected look.
 *
 * Media first (STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2 / 03_Look_Wardrobe): the look image leads every route, aspects
 * open on their item tiles (the fashion-continuity authority's own detail panels, captioned in its words) and the
 * look record text sits beside them — the board is the visual authority, the record is the spec.
 */
import { useState, type ReactNode } from 'react';
import type { CharacterCampaignLook } from '../../../../../../shared/site00-studio-world/acting-catalogue/index.js';
import { pad2 } from '../../primitives';
import { words } from '../expressionData';
import { aspectMedia, characterMedia, first, lookMedia, type MediaItem } from '../expressionMedia';
import { Actions, Btn, Chip, Empty, Grid, Kv, MediaImg, Panel, Row } from '../ExpressionFamilyShell';
import { Gallery, MediaCard, MediaGrid, useMediaInspector } from '../ExpressionMediaKit';
import type { FamilyProps } from './types';

const ENGINE_ROUTE = (slug: string) => `/projects/${slug}/content-operations/expression-engine`;

function useLookPick(d: FamilyProps['d']) {
  const dressed = d.cast.characters.filter((c) => c.campaignLookId);
  const [charId, setCharId] = useState(dressed[0]?.characterId ?? '');
  const [era, setEra] = useState('');
  const character = dressed.find((c) => c.characterId === charId) ?? dressed[0] ?? null;
  const temporal = character ? d.temporal(character.characterId) : [];
  const eras = temporal.length ? temporal.map((t) => ({ era: t.eraLabel, lookId: t.campaignLookId })) : character?.campaignLookId ? [{ era: 'CURRENT', lookId: character.campaignLookId }] : [];
  const active = eras.find((e) => e.era === era) ?? eras[0];
  const look = d.look(active?.lookId) ?? (character ? d.look(character.campaignLookId) : null);
  const picker = character ? (
    <div className="exf-picker" data-testid="look-picker">
      <select
        className="exf-select"
        value={character.characterId}
        onChange={(e) => {
          setCharId(e.target.value);
          setEra('');
        }}
        aria-label="Character"
        data-testid="wardrobe-character-select"
      >
        {dressed.map((c) => {
          const a = d.actor(c.actorId);
          return (
            <option key={c.characterId} value={c.characterId}>
              {c.characterName}
              {a ? ` (${a.catalogueNumber})` : ''}
            </option>
          );
        })}
      </select>
      {eras.length > 1 ?
        <div className="exf-seg" role="group" aria-label="Era" data-testid="wardrobe-era">
          {eras.map((e) => (
            <button key={e.era} type="button" className={e.era === active?.era ? 'is-active' : ''} aria-pressed={e.era === active?.era} onClick={() => setEra(e.era)}>
              {e.era}
            </button>
          ))}
        </div>
      : null}
    </div>
  ) : null;
  const selectLook = (lookId: string) => {
    const t = eras.find((e) => e.lookId === lookId);
    if (t) setEra(t.era);
  };
  return { dressed, character, look, picker, locked: character?.status === 'LOCKED', selectLook };
}

type Aspect = { title: string; items: string; rows: (l: CharacterCampaignLook, d: FamilyProps['d']) => (readonly [string, ReactNode])[]; compare: (l: CharacterCampaignLook) => string; meta?: (l: CharacterCampaignLook) => string };

const ASPECTS: Record<string, Aspect> = {
  outfits: {
    title: 'OUTFIT',
    items: 'OUTFIT CATALOGUE',
    meta: (l) => `${l.garments.length} GARMENTS`,
    rows: (l) => [
      ['WARDROBE', l.wardrobe],
      ['GARMENTS', l.garments.join(' · ') || '—'],
      ['SHOES', l.shoes],
      ['LAYERING', l.layering],
      ['BODY STYLING', l.bodyStyling],
      ['WARDROBE ID', l.wardrobeLookId],
    ],
    compare: (l) => l.wardrobe,
  },
  hair: {
    title: 'HAIR',
    items: 'APPROVED HAIR AUTHORITY',
    meta: (l) => l.hairAuthorityId ?? 'NO AUTHORITY',
    rows: (l, d) => [
      ['HAIR', l.hair],
      ['AUTHORITY', l.hairAuthorityId ?? '—'],
      ['ACTOR BASELINE', d.actor(d.character(l.characterId)?.actorId)?.hairBaseline ?? '—'],
      ['ERA', l.era],
    ],
    compare: (l) => l.hair,
  },
  makeup: {
    title: 'MAKEUP',
    items: 'MAKEUP + BEAUTY DETAILS',
    meta: (l) => l.makeupAuthorityId ?? 'NO AUTHORITY',
    rows: (l) => [
      ['MAKEUP', l.makeup],
      ['NAILS', l.nails],
      ['GROOMING', l.grooming],
      ['AUTHORITY', l.makeupAuthorityId ?? '—'],
    ],
    compare: (l) => l.makeup,
  },
  accessories: {
    title: 'ACCESSORIES',
    items: 'ACCESSORY INVENTORY',
    meta: (l) => `${[l.jewelry, l.bag, l.accessories].filter(Boolean).length + l.props.length} ITEMS`,
    rows: (l) => [
      ['JEWELRY', l.jewelry],
      ['ACCESSORIES', l.accessories],
      ['BAG', l.bag ?? '—'],
      ['PROPS', l.props.join(' · ') || '—'],
    ],
    compare: (l) => [l.jewelry, l.accessories].filter(Boolean).join(' · '),
  },
};

export function LookFamily({ d, r, go }: FamilyProps) {
  const pick = useLookPick(d);
  const insp = useMediaInspector();
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" testId="expression-no-entry" />;
  const { character, look, picker, locked, selectLook } = pick;
  const lm = lookMedia(look);
  const lookSlides = lm.map((m) => ({ url: m.url, label: m.label, meta: m.source }));
  const engine = (
    <Btn variant="ghost" to={ENGINE_ROUTE(d.slug)} testId="wardrobe-open-engine">
      OPEN FITTING IN EXPRESSION ENGINE
    </Btn>
  );
  const status = <Chip tone={locked ? 'green' : 'amber'}>{locked ? 'APPROVED' : 'IN REVIEW'}</Chip>;
  const noLook = <Empty title="NO LOOK ASSIGNED" body="THIS CHARACTER HAS NO CAMPAIGN LOOK YET." />;
  const id = r.route.id;
  /** Look cards: each campaign look led by its era image; selecting one drives the active look. */
  const lookCards = (dir: 'v' | 'h' = 'v') =>
    d.cast.looks.map((l, i) => {
      const m = lookMedia(l);
      return (
        <MediaCard
          key={l.lookId}
          dir={dir}
          media={first(m)}
          num={`L${pad2(i + 1)}`}
          kicker={`${l.era} · ${d.character(l.characterId)?.characterName ?? ''}`}
          title={l.label}
          sub={l.colorPalette}
          active={l.lookId === look?.lookId}
          chips={
            <button type="button" className="exl-pick" onClick={() => selectLook(l.lookId)} aria-pressed={l.lookId === look?.lookId} data-testid="look-select">
              {l.lookId === look?.lookId ? 'ACTIVE' : 'VIEW LOOK'}
            </button>
          }
          onInspect={m.length ? () => insp.open(m, 0, l.label) : undefined}
          emptyLabel="NO LOOK IMAGE"
          testId="look-card"
        />
      );
    });
  const tiles = (items: readonly MediaItem[], title: string, cols: { d: number; t: number; m: number }, testId?: string) => (
    <MediaGrid cols={cols} testId={testId}>
      {items.map((m, i) => (
        <MediaCard key={m.url} media={m} title={m.label} kicker={`${pad2(i + 1)}`} onInspect={() => insp.open(items, i, title)} focus="50% 50%" />
      ))}
    </MediaGrid>
  );

  let body: ReactNode;
  if (id in ASPECTS) {
    const a = ASPECTS[id]!;
    const items = aspectMedia(id);
    body = (
      <Grid rows={{ d: '1fr 0.58fr', t: '1fr 0.6fr', m: '0.62fr 1fr 0.44fr' }}>
        <Panel title={a.items} meta={`${items.length} AUTHORITY DETAILS · FASHION CONTINUITY`} at={{ d: [7, 1], t: [7, 1], m: [6, 1] }} testId={`look-${id}-items`} className="exc-pane exl-items">
          {items.length ? tiles(items, a.items, { d: Math.min(5, items.length), t: Math.min(5, items.length), m: Math.min(3, items.length) }, `look-${id}-tiles`) : <Empty title="NO AUTHORITY DETAILS" />}
        </Panel>
        <Panel title="ACTIVE LOOK" meta={look?.label} at={{ d: [5, 2], t: [5, 2], m: [6, 1] }} testId="look-active" layout="media" className="exc-pane">
          {picker}
          <Gallery items={lm} title={look?.label ?? 'ACTIVE LOOK'} open={insp.open} testId="look-active-media" emptyLabel="NO LOOK IMAGE" />
        </Panel>
        <Panel title={a.title} meta={look && a.meta ? a.meta(look) : undefined} at={{ d: [4, 1], t: [4, 1], m: [6, 1] }} testId={`look-${id}`}>
          {look ?
            <>
              <div className="exf-tags">
                {status}
                <Chip>{look.era}</Chip>
              </div>
              <Kv rows={a.rows(look, d)} />
            </>
          : noLook}
        </Panel>
        <Panel title={`${a.title} ACROSS LOOKS`} meta={`${d.cast.looks.length} LOOKS`} at={{ d: [3, 1], t: [3, 1], m: [0, 0] }} hide="m" testId={`look-${id}-compare`}>
          {d.cast.looks.map((l) => (
            <Row key={l.lookId} active={l.lookId === look?.lookId} title={`${l.label} · ${l.era}`} sub={a.compare(l)} />
          ))}
          <Actions>{engine}</Actions>
        </Panel>
      </Grid>
    );
  } else {
    switch (id) {
      case 'looks':
        body = (
          <Grid rows={{ d: '1fr 0.52fr', t: '1fr 0.55fr', m: '0.5fr 1fr 0.42fr' }}>
            <Panel title="LOOKS" meta={`${d.cast.looks.length} CAMPAIGN LOOKS`} at={{ d: [4, 2], t: [4, 2], m: [6, 1] }} testId="look-looks" className="exc-pane">
              <MediaGrid cols={{ d: 1, t: 1, m: 2 }}>{lookCards('h')}</MediaGrid>
            </Panel>
            <Panel title="LOOK AUTHORITY" meta={look ? `${look.label} · ${look.approvedLookAuthorityIds.length} APPROVED` : undefined} at={{ d: [5, 2], t: [5, 2], m: [6, 1] }} testId="look-authority" layout="media" className="exc-pane">
              <div className="exf-tags">
                {status}
                {look ? <Chip>{look.era}</Chip> : null}
              </div>
              <MediaImg url={lm[0]?.url ?? null} label={look ? `${look.label} · LOOK AUTHORITY` : 'LOOK AUTHORITY'} title={look?.label ?? 'LOOK AUTHORITY'} fit="cover" gallery={lookSlides.length ? lookSlides : undefined} galleryIndex={0} testId="look-authority-media" />
            </Panel>
            <Panel title="LOOK DETAILS" meta={look?.label} at={{ d: [3, 2], t: [3, 2], m: [6, 1] }} testId="look-details" layout="compact">
              {picker}
              {look ?
                <Kv
                  rows={[
                    ['CHARACTER', character?.characterName ?? '—'],
                    ['ERA', look.era],
                    ['PALETTE', look.colorPalette],
                    ['WARDROBE', look.wardrobe],
                    ['HAIR', look.hair],
                    ['MAKEUP', look.makeup],
                    ['CONTINUITY', words(look.wardrobeContinuityDefault)],
                  ]}
                />
              : noLook}
              <Actions>{engine}</Actions>
            </Panel>
          </Grid>
        );
        break;
      case 'fittings': {
        const full = [...lookMedia(d.cast.looks.find((l) => l.era === '2016')), ...lookMedia(d.cast.looks.find((l) => l.era === '2026'))].filter((m) => /FULL|MIRROR|STANDARDS/.test(m.label));
        body = (
          <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.64fr', m: '1fr 0.62fr 0.42fr' }}>
            <Panel title="LOOK PREVIEW · FITTING IMAGES" meta={`${full.length} FULL-LENGTH AUTHORITY IMAGES`} at={{ d: [7, 1], t: [7, 1], m: [6, 1] }} testId="look-fitting-images" className="exc-pane">
              {full.length ? tiles(full, 'FITTINGS', { d: Math.min(4, full.length), t: Math.min(4, full.length), m: Math.min(4, full.length) }) : <Empty title="NO FITTING IMAGES" />}
            </Panel>
            <Panel title="FITTING AUTHORITY" meta={`${d.cast.authoritySheets.length} SHEETS`} at={{ d: [5, 2], t: [5, 2], m: [6, 1] }} testId="look-fittings">
              {d.cast.authoritySheets.map((s) => {
                const slots: [string, string | null][] = [
                  ['WARDROBE FRONT', s.wardrobeFrontAssetId],
                  ['WARDROBE BACK', s.wardrobeBackAssetId],
                  ['HAIR DETAIL', s.hairDetailAssetId],
                  ['MAKEUP / GROOMING', s.makeupGroomingAssetId],
                  ['ACCESSORY DETAIL', s.accessoryDetailAssetId],
                ];
                const have = slots.filter(([, v]) => !!v).length;
                return (
                  <div key={s.characterAuthorityId} className="exf-fit" data-testid="look-fitting-sheet">
                    <header>
                      <b>{s.characterName}</b>
                      <Chip tone={have === slots.length ? 'green' : have ? 'amber' : 'red'}>
                        {have}/{slots.length} FITTED
                      </Chip>
                    </header>
                    <ul>
                      {slots.map(([k, v]) => (
                        <li key={k} data-state={v ? 'filled' : 'missing'}>
                          <i aria-hidden />
                          {k}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </Panel>
            <Panel title="ACTIVE LOOK" meta={look?.label} at={{ d: [7, 1], t: [7, 1], m: [6, 1] }} testId="look-fitting-active" layout="compact">
              {picker}
              {look ? <Kv rows={[['WARDROBE', look.wardrobe], ['SHOES', look.shoes]]} /> : noLook}
              <Actions note="FITTINGS RUN IN THE EXPRESSION ENGINE; THIS VIEW READS THEIR AUTHORITY SHEETS.">{engine}</Actions>
            </Panel>
          </Grid>
        );
        break;
      }
      case 'continuity': {
        const eraLooks = d.cast.temporalLooks.map((t) => ({ t, l: d.look(t.campaignLookId) }));
        body = (
          <Grid rows={{ d: '1fr 0.56fr', t: '1fr 0.6fr', m: '1fr 0.5fr 0.46fr' }}>
            <Panel title="CONTINUITY MATRIX" meta={`${eraLooks.length} ERAS · SAME WOMAN`} at={{ d: [8, 1], t: [8, 1], m: [6, 1] }} testId="look-continuity-matrix" className="exc-pane">
              {eraLooks.length ?
                <MediaGrid cols={{ d: eraLooks.length * 2, t: eraLooks.length * 2, m: eraLooks.length * 2 }}>
                  {eraLooks.flatMap(({ t, l }) => {
                    const m = lookMedia(l);
                    return m.slice(0, 2).map((x, i) => (
                      <MediaCard key={t.temporalLookId + i} media={x} kicker={t.eraLabel} title={i === 0 ? (l?.label ?? t.campaignLookId) : x.label} onInspect={() => insp.open(m, i, l?.label ?? t.eraLabel)} />
                    ));
                  })}
                </MediaGrid>
              : <Empty title="NO TEMPORAL LOOKS" />}
            </Panel>
            <Panel title="CONTINUITY CHECK" meta={`${d.continuity.filter((c) => c.valid).length}/${d.continuity.length} ON TRACK`} at={{ d: [4, 1], t: [4, 1], m: [6, 1] }} testId="look-continuity-check">
              {d.continuity.map(({ character: c, valid, flags }) => (
                <Row key={c.characterId} media={<i className={`exf-dot exf-dot--${valid ? 'green' : 'red'}`} aria-hidden />} title={c.characterName} sub={valid ? `LOOK ${d.look(c.campaignLookId)?.label ?? '—'}` : flags.join(' · ')} />
              ))}
            </Panel>
            <Panel title="TEMPORAL LOOKS" meta={`${d.cast.temporalLooks.length} ERAS`} at={{ d: [6, 1], t: [6, 1], m: [6, 1] }} testId="look-continuity-temporal">
              {d.cast.temporalLooks.map((t) => (
                <Row key={t.temporalLookId} title={`${t.eraLabel} · ${d.look(t.campaignLookId)?.label ?? t.campaignLookId}`} sub={t.narrativeReason} aside={<Chip tone={t.preservesActorIdentity ? 'green' : 'red'}>{t.preservesActorIdentity ? 'SAME ACTOR' : 'IDENTITY BREAK'}</Chip>} />
              ))}
            </Panel>
            <Panel title="CONTINUITY DEFAULTS" at={{ d: [6, 1], t: [6, 1], m: [0, 0] }} hide="m" testId="look-continuity-defaults">
              {d.cast.looks.map((l) => (
                <Row key={l.lookId} title={l.label} sub={`${l.lookReferences.length} REFERENCES · ${l.approvedLookAuthorityIds.length} APPROVED AUTHORITIES`} aside={<Chip>{words(l.wardrobeContinuityDefault)}</Chip>} />
              ))}
            </Panel>
          </Grid>
        );
        break;
      }
      default: {
        const wardrobe = aspectMedia('outfits');
        const subject = characterMedia(d, character);
        body = (
          <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.62fr', m: '1.15fr 0.5fr 0.42fr' }}>
            <Panel title="ACTIVE LOOK" meta={look?.label} at={{ d: [4, 2], t: [4, 2], m: [6, 1] }} testId="look-root-active" layout="media" className="exc-pane">
              {picker}
              <MediaImg url={lm[0]?.url ?? first(subject)?.url ?? null} label={look ? look.label : 'LOOK AUTHORITY'} title={look?.label ?? 'ACTIVE LOOK'} fit="cover" gallery={lookSlides.length ? lookSlides : undefined} testId="look-root-active-media" />
            </Panel>
            <Panel title="LOOK VARIATIONS" meta={`${d.cast.looks.length} LOOKS`} to={go('look', 'looks')} toLabel="LOOKS" at={{ d: [5, 1], t: [5, 1], m: [0, 0] }} hide="m" testId="look-root-variations" className="exc-pane">
              <MediaGrid cols={{ d: Math.max(2, d.cast.looks.length), t: Math.max(2, d.cast.looks.length), m: 2 }} testId="look-variations">
                {lookCards()}
              </MediaGrid>
            </Panel>
            <Panel title="LOOK DETAILS" to={go('look', 'looks')} toLabel="LOOKS" at={{ d: [3, 1], t: [0, 0], m: [0, 0] }} hide="t m" testId="look-root-details" layout="compact">
              <div className="exf-tags">
                {status}
                <Chip tone={d.continuity.every((c) => c.valid) ? 'green' : 'red'}>{d.continuity.every((c) => c.valid) ? 'CONTINUITY ON TRACK' : 'CONTINUITY DRIFT'}</Chip>
              </div>
              {look ?
                <Kv
                  rows={[
                    ['CHARACTER', character?.characterName ?? '—'],
                    ['LOOK', look.label],
                    ['ERA', look.era],
                    ['PALETTE', look.colorPalette],
                    ['WARDROBE', look.wardrobe],
                  ]}
                />
              : noLook}
              {engine}
            </Panel>
            <Panel title="WARDROBE SET" meta={look ? `${look.garments.length} GARMENTS · ${wardrobe.length} AUTHORITY ITEMS` : undefined} to={go('look', 'outfits')} toLabel="OUTFITS" at={{ d: [5, 1], t: [8, 1], m: [6, 1] }} testId="look-root-wardrobe" className="exc-pane">
              {tiles(wardrobe, 'WARDROBE SET', { d: 5, t: 5, m: 5 })}
            </Panel>
            <Panel title="LOOK AUTHORITY" meta={look ? `${look.approvedLookAuthorityIds.length} APPROVED` : undefined} to={go('look', 'continuity')} toLabel="CONTINUITY" at={{ d: [3, 1], t: [3, 1], m: [6, 1] }} testId="look-root-authority" layout="compact">
              <div className="exf-tags">
                {status}
                {look ? <Chip>{look.era}</Chip> : null}
              </div>
              {look ?
                <ul className="exf-bullets">
                  {look.garments.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                  <li>{look.shoes}</li>
                </ul>
              : noLook}
            </Panel>
          </Grid>
        );
      }
    }
  }
  return (
    <>
      {body}
      {insp.overlay}
    </>
  );
}
