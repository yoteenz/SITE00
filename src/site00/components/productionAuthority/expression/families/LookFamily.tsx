/**
 * 03 LOOK + WARDROBE — root · looks · outfits · hair · makeup · accessories · fittings · continuity.
 * Source: cast.looks (CharacterCampaignLook), temporal looks and character authority sheets. The character +
 * era picker of the previous Wardrobe screen is kept (same test ids); every aspect route reads the selected look.
 */
import { useState, type ReactNode } from 'react';
import type { CharacterCampaignLook } from '../../../../../../shared/site00-studio-world/acting-catalogue/index.js';
import { pad2 } from '../../primitives';
import { words } from '../expressionData';
import { Actions, Btn, Chip, Empty, Grid, Img, Kv, Panel, Row } from '../ExpressionFamilyShell';
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
  return { dressed, character, look, picker, locked: character?.status === 'LOCKED' };
}

type Aspect = { title: string; rows: (l: CharacterCampaignLook, d: FamilyProps['d']) => (readonly [string, ReactNode])[]; compare: (l: CharacterCampaignLook) => string; meta?: (l: CharacterCampaignLook) => string };

const ASPECTS: Record<string, Aspect> = {
  outfits: {
    title: 'OUTFIT',
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
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" testId="expression-no-entry" />;
  const { character, look, picker, locked } = pick;
  const art = d.nodeArt('look');
  const engine = (
    <Btn variant="ghost" to={ENGINE_ROUTE(d.slug)} testId="wardrobe-open-engine">
      OPEN FITTING IN EXPRESSION ENGINE
    </Btn>
  );
  const variations = (
    <div className="exf-rail exf-rail--looks" data-testid="look-variations">
      {d.cast.looks.map((l, i) => (
        <span key={l.lookId} className={`exf-tile${l.lookId === look?.lookId ? ' is-active' : ''}`}>
          <em className="exf-num">L{pad2(i + 1)}</em>
          <b>{l.label}</b>
          <small>
            {l.era} · {d.character(l.characterId)?.characterName ?? ''}
          </small>
        </span>
      ))}
    </div>
  );
  const status = <Chip tone={locked ? 'green' : 'amber'}>{locked ? 'APPROVED' : 'IN REVIEW'}</Chip>;
  const noLook = <Empty title="NO LOOK ASSIGNED" body="THIS CHARACTER HAS NO CAMPAIGN LOOK YET." />;
  const id = r.route.id;

  if (id in ASPECTS) {
    const a = ASPECTS[id]!;
    return (
      <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '0.62fr 1fr 0.85fr' }}>
        <Panel title="ACTIVE LOOK" meta={look?.label} at={{ d: [3, 2], t: [5, 2], m: [6, 1] }} testId="look-active">
          {picker}
          <Img url={art} label={look ? `${look.label} · LOOK AUTHORITY` : 'LOOK AUTHORITY'} className="exf-fill" />
        </Panel>
        <Panel title={a.title} meta={look && a.meta ? a.meta(look) : undefined} at={{ d: [5, 2], t: [7, 1], m: [6, 1] }} testId={`look-${id}`}>
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
        <Panel title={`${a.title} ACROSS LOOKS`} meta={`${d.cast.looks.length} LOOKS`} at={{ d: [4, 2], t: [7, 1], m: [6, 1] }} testId={`look-${id}-compare`}>
          {d.cast.looks.map((l) => (
            <Row key={l.lookId} active={l.lookId === look?.lookId} title={`${l.label} · ${l.era}`} sub={a.compare(l)} />
          ))}
          <Actions>{engine}</Actions>
        </Panel>
      </Grid>
    );
  }

  switch (id) {
    case 'looks':
      return (
        <Grid rows={{ d: '1fr 0.8fr', t: '1fr 0.8fr', m: '0.95fr 1fr 0.55fr' }}>
          <Panel title="LOOKS" meta={`${d.cast.looks.length} CAMPAIGN LOOKS`} at={{ d: [4, 2], t: [5, 2], m: [6, 1] }} testId="look-looks">
            {picker}
            {d.cast.looks.map((l, i) => (
              <Row key={l.lookId} active={l.lookId === look?.lookId} media={<em className="exf-num">L{pad2(i + 1)}</em>} title={l.label} sub={`${l.era} · ${d.character(l.characterId)?.characterName ?? ''}`} aside={<Chip>{words(l.wardrobeContinuityDefault)}</Chip>} />
            ))}
          </Panel>
          <Panel title="LOOK DETAILS" meta={look?.label} at={{ d: [5, 2], t: [7, 1], m: [6, 1] }} testId="look-details">
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
          </Panel>
          <Panel title="LOOK AUTHORITY" meta={look ? `${look.approvedLookAuthorityIds.length} APPROVED` : undefined} at={{ d: [3, 2], t: [7, 1], m: [6, 1] }} testId="look-authority">
            <div className="exf-tags">{status}</div>
            <Img url={art} label="LOOK AUTHORITY" className="exf-fill" />
            {engine}
          </Panel>
        </Grid>
      );
    case 'fittings':
      return (
        <Grid rows={{ d: '1fr 0.7fr', t: '1fr 0.75fr', m: '1fr 0.8fr 0.42fr' }}>
          <Panel title="FITTING AUTHORITY" meta={`${d.cast.authoritySheets.length} SHEETS`} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} testId="look-fittings">
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
          <Panel title="ACTIVE LOOK" meta={look?.label} at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="look-fitting-active">
            {picker}
            {look ? <Kv rows={[['WARDROBE', look.wardrobe], ['SHOES', look.shoes]]} /> : noLook}
          </Panel>
          <Panel title="FITTINGS" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="look-fitting-actions">
            <Actions note="FITTINGS RUN IN THE EXPRESSION ENGINE; THIS VIEW READS THEIR AUTHORITY SHEETS.">{engine}</Actions>
          </Panel>
        </Grid>
      );
    case 'continuity':
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '1fr 0.85fr 0.75fr' }}>
          <Panel title="TEMPORAL LOOKS" meta={`${d.cast.temporalLooks.length} ERAS`} at={{ d: [6, 1], t: [7, 1], m: [6, 1] }} testId="look-continuity-temporal">
            {d.cast.temporalLooks.map((t) => (
              <Row key={t.temporalLookId} title={`${t.eraLabel} · ${d.look(t.campaignLookId)?.label ?? t.campaignLookId}`} sub={t.narrativeReason} aside={<Chip tone={t.preservesActorIdentity ? 'green' : 'red'}>{t.preservesActorIdentity ? 'SAME ACTOR' : 'IDENTITY BREAK'}</Chip>} />
            ))}
          </Panel>
          <Panel title="CONTINUITY CHECK" meta={`${d.continuity.filter((c) => c.valid).length}/${d.continuity.length} ON TRACK`} at={{ d: [6, 1], t: [5, 2], m: [6, 1] }} testId="look-continuity-check">
            {d.continuity.map(({ character: c, valid, flags }) => (
              <Row key={c.characterId} media={<i className={`exf-dot exf-dot--${valid ? 'green' : 'red'}`} aria-hidden />} title={c.characterName} sub={valid ? `LOOK ${d.look(c.campaignLookId)?.label ?? '—'}` : flags.join(' · ')} />
            ))}
          </Panel>
          <Panel title="CONTINUITY DEFAULTS" at={{ d: [12, 1], t: [7, 1], m: [6, 1] }} testId="look-continuity-defaults">
            {d.cast.looks.map((l) => (
              <Row key={l.lookId} title={l.label} sub={`${l.lookReferences.length} REFERENCES · ${l.approvedLookAuthorityIds.length} APPROVED AUTHORITIES`} aside={<Chip>{words(l.wardrobeContinuityDefault)}</Chip>} />
            ))}
          </Panel>
        </Grid>
      );
    default:
      return (
        <Grid rows={{ d: '1fr 0.85fr', t: '1fr 0.75fr 0.7fr', m: '1fr 0.8fr 0.62fr' }}>
          <Panel title="ACTIVE LOOK" meta={look?.label} at={{ d: [4, 2], t: [6, 1], m: [3, 1] }} testId="look-root-active">
            <Img url={art} label={look ? look.label : 'LOOK AUTHORITY'} className="exf-fill" />
            {picker}
          </Panel>
          <Panel title="LOOK DETAILS" to={go('look', 'looks')} toLabel="LOOKS" at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="look-root-details">
            {look ?
              <Kv
                rows={[
                  ['CHARACTER', character?.characterName ?? '—'],
                  ['LOOK', look.label],
                  ['ERA', look.era],
                  ['PALETTE', look.colorPalette],
                ]}
              />
            : noLook}
          </Panel>
          <Panel title="LOOK AUTHORITY" meta={look ? `${look.approvedLookAuthorityIds.length} APPROVED` : undefined} to={go('look', 'continuity')} toLabel="CONTINUITY" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="look-root-authority">
            <div className="exf-tags">
              {status}
              <Chip tone={d.continuity.every((c) => c.valid) ? 'green' : 'red'}>{d.continuity.every((c) => c.valid) ? 'CONTINUITY ON TRACK' : 'CONTINUITY DRIFT'}</Chip>
            </div>
            {engine}
          </Panel>
          <Panel title="WARDROBE SET" meta={look ? `${look.garments.length} GARMENTS` : undefined} to={go('look', 'outfits')} toLabel="OUTFITS" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="look-root-wardrobe">
            {look ?
              <ul className="exf-bullets">
                {look.garments.map((g) => (
                  <li key={g}>{g}</li>
                ))}
                <li>{look.shoes}</li>
              </ul>
            : noLook}
          </Panel>
          <Panel title="LOOK VARIATIONS" meta={`${d.cast.looks.length} LOOKS`} at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} hide="m" testId="look-root-variations">
            {variations}
          </Panel>
        </Grid>
      );
  }
}
