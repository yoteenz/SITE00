/**
 * 05 SETS + SCENES — root · environments · sets · zones · props · graphics · camera.
 *
 * ENVIRONMENT (the world a scene happens in) ≠ SET (a built / dressed space inside it) ≠ ZONE (an area of a set).
 * Entry 002 has no set authority yet (package item NOT STARTED), so environment / set / zone stay honest empties.
 * What canonical data does define is shown with its true source: character props (approved looks), graphic needs
 * (proof architecture visual forms), camera intent (beat shot functions) and the narrative territory.
 */
import { pad2 } from '../../primitives';
import { words } from '../expressionData';
import { Actions, Btn, Chip, Empty, Grid, Kv, Panel, Row } from '../ExpressionFamilyShell';
import type { FamilyProps } from './types';

const LIBRARY = '/production/libraries';

export function SetsFamily({ d, r, go }: FamilyProps) {
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" testId="expression-no-entry" />;
  const item = d.itemFor('sets');
  const reel = d.plan.formatAdaptations.find((f) => f.format === 'REEL');
  const graphics = d.plan.proofArchitecture.objects.map((o) => ({ id: o.proofId, form: o.visualForm, proves: o.whatItProves, placement: o.bestPlacement }));
  const camera = d.plan.beats.map((b) => ({ id: b.beatId, order: b.order, label: b.label, fn: b.shotFunction, tension: b.tensionStage }));
  const keyProps = d.cast.authoritySheets.filter((s) => s.keyProp).map((s) => ({ prop: s.keyProp!, who: s.characterName }));
  const library = (
    <Btn variant="ghost" to={LIBRARY} testId="sets-open-libraries">
      OPEN ENVIRONMENT LIBRARY
    </Btn>
  );
  const status = <Chip tone={item.status === 'NOT_STARTED' ? 'gray' : 'amber'}>{words(item.status)}</Chip>;
  const hierarchy = (
    <ol className="exf-chain exf-chain--h" data-testid="sets-hierarchy">
      <li>
        <span data-entity="environment">
          <small>ENVIRONMENT</small>
          <b>NOT ASSIGNED</b>
        </span>
      </li>
      <li>
        <span data-entity="set">
          <small>SET</small>
          <b>NOT DEFINED</b>
        </span>
      </li>
      <li>
        <span data-entity="zone">
          <small>ZONES</small>
          <b>00</b>
        </span>
      </li>
    </ol>
  );
  const details = (
    <Kv
      testId="sets-details"
      rows={[
        ['ENVIRONMENT', 'NOT ASSIGNED'],
        ['SET', 'NOT ASSIGNED'],
        ['ZONES', '0'],
        ['SET PROPS', '0'],
        ['GRAPHICS / TEXT ANCHORS', '0 PLACED'],
        ['CAMERA COVERAGE', 'NOT PLANNED'],
      ]}
    />
  );
  const territory = (
    <Kv
      rows={[
        ['TERRITORY', d.plan.creativeTerritoryLabel],
        ['CONTINUITY', reel?.reelDetail?.visualContinuityRequirements ?? '—'],
      ]}
    />
  );
  const cameraList = camera.map((c) => (
    <Row key={c.id} testId="sets-camera-row" media={<em className="exf-num">{pad2(c.order)}</em>} title={words(c.fn)} sub={c.label} aside={<Chip tone={c.tension === 'PEAK' ? 'red' : 'gray'}>{c.tension}</Chip>} />
  ));
  const propsList = (
    <>
      {d.props.map((p) => (
        <Row key={`${p.lookId}-${p.prop}`} testId="sets-prop-row" title={p.prop} sub={`LOOK · ${p.lookLabel}`} aside={<Chip>CHARACTER PROP</Chip>} />
      ))}
      {keyProps.map((k) => (
        <Row key={`${k.who}-${k.prop}`} testId="sets-prop-row" title={k.prop.toUpperCase()} sub={`AUTHORITY SHEET · ${k.who}`} aside={<Chip tone="ink">KEY PROP</Chip>} />
      ))}
    </>
  );
  const graphicsList = graphics.map((g) => <Row key={g.id} testId="sets-graphic-row" title={words(g.form)} sub={g.proves} aside={<Chip>{g.placement.toUpperCase()}</Chip>} />);
  const statusPanel = (title = 'SET STATUS') => (
    <Panel title={title} meta={item.detail} at={{ d: [4, 1], t: [5, 1], m: [6, 1] }} testId="sets-status">
      <div className="exf-tags">{status}</div>
      {hierarchy}
      <Actions>{library}</Actions>
    </Panel>
  );

  switch (r.route.id) {
    case 'environments':
      return (
        <Grid rows={{ d: '1fr 0.8fr', t: '1fr 0.8fr', m: '0.9fr 0.95fr 0.75fr' }}>
          <Panel title="CURRENT SCENE ENVIRONMENT" at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="sets-environments">
            <Empty title="NO ENVIRONMENT ASSIGNED" body="ENTRY 002 HAS NO ENVIRONMENT OR SET AUTHORITY YET. REQUEST ONE FROM THE PROJECT, OR SEARCH THE ENVIRONMENT LIBRARY." testId="sets-empty" />
          </Panel>
          {statusPanel('ENVIRONMENT STATUS')}
          <Panel title="NARRATIVE TERRITORY" meta="FROM NARRATIVE · NOT A SET" at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="sets-territory">
            {territory}
          </Panel>
        </Grid>
      );
    case 'sets':
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '0.85fr 1fr 0.7fr' }}>
          <Panel title="CURRENT SET" at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="sets-sets">
            <Empty title="NO SET DEFINED" body="THIS SLOT FILLS ONCE A SET IS ASSIGNED TO THE ENTRY." testId="sets-empty" />
          </Panel>
          <Panel title="SET DETAILS" at={{ d: [4, 2], t: [5, 2], m: [6, 1] }} testId="sets-set-details">
            {details}
            <Actions>{library}</Actions>
          </Panel>
          <Panel title="ALTERNATE SETS" meta="0" at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="sets-alternates">
            <Empty title="NO ALTERNATES" body="ALTERNATE SETS ARE LISTED ONCE A PRIMARY SET EXISTS." />
          </Panel>
        </Grid>
      );
    case 'zones':
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '0.9fr 0.8fr 0.8fr' }}>
          <Panel title="SCENE ZONES" meta="0 ZONES" at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="sets-zones">
            <Empty title="NO ZONES DEFINED" body="ZONES ARE AREAS OF A SET. THEY APPEAR ONCE A SET IS ASSIGNED." testId="sets-empty" />
          </Panel>
          {statusPanel('SPATIAL HIERARCHY')}
          <Panel title="ZONE INSPECTOR" at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="sets-zone-inspector">
            <Empty title="NO ZONE SELECTED" />
          </Panel>
        </Grid>
      );
    case 'props':
      return (
        <Grid rows={{ d: '1fr 0.7fr', t: '1fr 0.75fr', m: '1fr 0.75fr 0.7fr' }}>
          <Panel title="PROP INVENTORY" meta={`${d.props.length + keyProps.length} FROM LOOKS + AUTHORITY`} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} testId="sets-props">
            {d.props.length + keyProps.length ? propsList : <Empty title="NO PROPS" />}
          </Panel>
          <Panel title="SET DRESSING" meta="0" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="sets-dressing">
            <Empty title="NO SET DRESSING" body="SET PROPS ARRIVE WITH THE SET AUTHORITY." />
          </Panel>
          <Panel title="WARDROBE LINK" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="sets-props-look">
            <Actions note="CHARACTER PROPS ARE OWNED BY THEIR LOOKS.">
              <Btn to={go('look', 'accessories')}>OPEN ACCESSORIES</Btn>
            </Actions>
          </Panel>
        </Grid>
      );
    case 'graphics':
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '1fr 0.8fr 0.7fr' }}>
          <Panel title="GRAPHIC REQUIREMENTS" meta={`${graphics.length} FROM PROOF ARCHITECTURE`} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} testId="sets-graphics">
            {graphicsList}
          </Panel>
          <Panel title="GRAPHIC ASSETS" meta="0" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="sets-graphic-assets">
            <Empty title="NO GRAPHICS PLACED" body="TEXT ANCHORS + GRAPHIC PLATES ARE PLACED ON A SET." />
          </Panel>
          <Panel title="PROOF" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="sets-graphics-proof">
            <Actions>
              <Btn to={go('narrative', 'proof')}>OPEN PROOF ARCHITECTURE</Btn>
            </Actions>
          </Panel>
        </Grid>
      );
    case 'camera':
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '1fr 0.75fr 0.7fr' }}>
          <Panel title="SHOT INTENT BY BEAT" meta={`${camera.length} BEATS`} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} testId="sets-camera">
            {cameraList}
          </Panel>
          <Panel title="CAMERA SETUPS" meta="NOT PLANNED" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="sets-camera-setups">
            <Empty title="NO CAMERA COVERAGE" body="LENSES, MOVES AND FRAMING ARE PLANNED AGAINST A SET." />
          </Panel>
          <Panel title="REEL" meta={reel?.durationOrSlideCount ?? '—'} at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="sets-camera-reel">
            <Kv rows={[['PACING', reel?.reelDetail?.pacingNotes ?? '—'], ['SOUND', reel?.reelDetail?.soundNotes ?? '—']]} />
          </Panel>
        </Grid>
      );
    default:
      return (
        <Grid rows={{ d: '1fr 0.85fr', t: '1fr 0.85fr', m: '0.95fr 0.75fr 0.75fr 0.7fr' }}>
          <Panel title="CURRENT SCENE ENVIRONMENT" to={go('sets', 'environments')} toLabel="ENVIRONMENTS" at={{ d: [5, 1], t: [7, 1], m: [6, 1] }} testId="sets-root-environment">
            <Empty title="NO ENVIRONMENT ASSIGNED" body="ENTRY 002 HAS NO SET AUTHORITY YET." testId="sets-empty" />
          </Panel>
          {statusPanel()}
          <Panel title="SET DETAILS" to={go('sets', 'sets')} toLabel="SETS" at={{ d: [3, 1], t: [0, 0], m: [0, 0] }} hide="t m" testId="sets-root-details">
            {details}
          </Panel>
          <Panel title="PROPS" meta={`${d.props.length + keyProps.length}`} to={go('sets', 'props')} toLabel="PROPS" at={{ d: [4, 1], t: [4, 1], m: [3, 1] }} testId="sets-root-props">
            {propsList}
          </Panel>
          <Panel title="GRAPHICS" meta={`${graphics.length} NEEDS`} to={go('sets', 'graphics')} toLabel="GRAPHICS" at={{ d: [4, 1], t: [4, 1], m: [3, 1] }} testId="sets-root-graphics">
            {graphicsList}
          </Panel>
          <Panel title="CAMERA" meta={`${camera.length} SHOT INTENTS`} to={go('sets', 'camera')} toLabel="CAMERA" at={{ d: [4, 1], t: [4, 1], m: [6, 1] }} testId="sets-root-camera">
            {cameraList}
          </Panel>
        </Grid>
      );
  }
}
