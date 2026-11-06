/**
 * Overlay micro-asset register. Nothing in the app imports this module.
 * READY_FOR_FOUNDER_REVIEW is not approval. Screens are unchanged.
 */

export type OverlayAssetStatus =
  | 'READY_FOR_FOUNDER_REVIEW'
  | 'PARTIAL'
  | 'UNRESOLVED'
  | 'NOT_REQUIRED'
  | 'BAKED_DO_NOT_REMOUNT'
  | 'HELD_FOR_FOUNDER'
  | 'EXTERNAL_NOT_IN_ENVIRONMENT';

export type OverlayMicroAsset = {
  id: string;
  packageId: string;
  role: string;
  file: string | null;
  classification: string;
  status: OverlayAssetStatus;
  authority: string;
  motion: string;
  notes: string;
};

export const OVERLAY_ASSET_DIR = 'src/projects/jurnl/families/F05_MONEY/MICRO_ASSETS/OVERLAY_GROK1';

export const OVERLAY_MICRO_ASSETS: readonly OverlayMicroAsset[] = [

  { id: 'B01-01', packageId: 'B01', role: 'Remember setup gear', file: 'B01-GEAR-REMEMBER-SETUP.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Cream line gear cut from the privacy authority.' },
  { id: 'B01-02', packageId: 'B01', role: 'Linked accounts bank', file: 'B01-BANK-LINKED-ACCOUNTS.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Classical bank column, cream on olive.' },
  { id: 'B01-03', packageId: 'B01', role: 'Nothing sold shield', file: 'B01-SHIELD-NOTHING-SOLD.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'STATIC DECORATION', notes: 'Privacy statement emblem. Not an editable consent.' },
  { id: 'B01-04', packageId: 'B01', role: 'Ask Jurnl context sparkle', file: 'B01-SPARKLE-ASK-CONTEXT.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Four-point cluster.' },
  { id: 'B01-05', packageId: 'B01', role: 'AI access star', file: 'B01-AI-STAR.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Distinct from the sparkle cluster.' },
  { id: 'B01-06', packageId: 'B01', role: 'Your data cylinder', file: 'B01-DATABASE-YOUR-DATA.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Archival cylinder.' },
  { id: 'B01-07', packageId: 'B01', role: 'Data export', file: 'B01-EXPORT-DOWN.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Downward export glyph.' },
  { id: 'B01-08', packageId: 'B01', role: 'Remove access trash', file: 'B01-TRASH-REMOVE.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Oxblood trash. Distinct from the parchment delete trash.' },
  { id: 'B01-09', packageId: 'B01', role: 'Child navigation chevron', file: 'B01-CHEVRON.png', classification: 'RECONSTRUCTED', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Cream ink of the approved parchment chevron. Same > as the menu rows.' },
  { id: 'B01-10', packageId: 'B01', role: 'Consent switch track', file: 'B01-TOGGLE-TRACK-OLIVE.png', classification: 'RECONSTRUCTED', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'STATE-REACTIVE', notes: 'Gold rim, olive enamel. OFF track is the charcoal file. Opus places the thumb.' },
  { id: 'B01-11', packageId: 'B01', role: 'Consent switch thumb', file: 'B01-TOGGLE-THUMB.png', classification: 'RECONSTRUCTED', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'INDEPENDENTLY MOVABLE', notes: 'Cream disc from the authority thumb. ON = right, OFF = left.' },
  { id: 'B01-12', packageId: 'B01', role: 'Close disc', file: 'B06-CLOSE-DISC.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: 'Shared with every overlay that uses the parchment X disc.' },
  { id: 'B02-01', packageId: 'B02', role: 'Connected accounts', file: 'B01-BANK-LINKED-ACCOUNTS.png', classification: 'VISUAL_MATCH_REUSE', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'FD-01 menu row. Not painted on the OV08 jpg. Same cream bank as privacy.' },
  { id: 'B02-02', packageId: 'B02', role: 'Currency coins', file: 'B02-COINS-CREAM.png', classification: 'RECONSTRUCTED', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'CONTROL-ATTACHED', notes: 'Cream ink of the approved coin stack, for the olive menu field.' },
  { id: 'B02-03', packageId: 'B02', role: 'Safe to spend shield', file: null, classification: 'HELD_FOR_FOUNDER', status: 'HELD_FOR_FOUNDER', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'The only approved shield includes the check (privacy). No plain buffer shield exists on an authority. The check shield is not mounted for this row. Not invented.' },
  { id: 'B02-04', packageId: 'B02', role: 'Ask Jurnl sparkle', file: 'B01-SPARKLE-ASK-CONTEXT.png', classification: 'VISUAL_MATCH_REUSE', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'Same sparkle cluster.' },
  { id: 'B02-05', packageId: 'B02', role: 'Classification tag', file: 'B02-TAG-CREAM.png', classification: 'RECONSTRUCTED', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV05', motion: 'CONTROL-ATTACHED', notes: 'Cream ink of the search category tag.' },
  { id: 'B02-06', packageId: 'B02', role: 'Account profile', file: 'B02-PROFILE.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: 'Cut from the menu authority.' },
  { id: 'B02-07', packageId: 'B02', role: 'Preferences gear', file: 'B02-GEAR-PREFERENCES.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B02-08', packageId: 'B02', role: 'Privacy shield', file: 'B02-SHIELD-PRIVACY.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B02-09', packageId: 'B02', role: 'Membership crown', file: 'B02-CROWN-MEMBERSHIP.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: 'Gold crown, not recolored.' },
  { id: 'B02-10', packageId: 'B02', role: 'Explore add-ons', file: 'B02-FOUR-SQUARE.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B02-11', packageId: 'B02', role: 'Help lifebuoy', file: 'B02-LIFEBUOY.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B02-12', packageId: 'B02', role: 'Sign out', file: 'B02-SIGN-OUT.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B03-01', packageId: 'B03', role: 'Money-bag medallion', file: null, classification: 'EXACT_APPROVED_REUSE', status: 'BAKED_DO_NOT_REMOUNT', authority: 'OV02', motion: 'BACKGROUND-BOUND', notes: 'Already in the Add a Pocket illustration.' },
  { id: 'B03-02', packageId: 'B03', role: 'Bank column', file: 'B03-BANK-SOURCE.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV03', motion: 'CONTROL-ATTACHED', notes: 'Dark ink bank. Selected state is the light bank file.' },
  { id: 'B03-03', packageId: 'B03', role: 'Savings coin stack', file: 'B03-COIN-STACK.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B03-04', packageId: 'B03', role: 'Debit card', file: 'B03-CARD-DEBIT.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'CONTROL-ATTACHED', notes: 'Card with the stripe. Distinct from credit.' },
  { id: 'B03-05', packageId: 'B03', role: 'Credit card', file: 'B03-CARD-CREDIT.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'CONTROL-ATTACHED', notes: 'Plain card. Distinct from debit.' },
  { id: 'B03-06', packageId: 'B03', role: 'Cash', file: 'B03-CASH.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B03-07', packageId: 'B03', role: 'Selected indicator', file: 'B03-CHECK-SELECTED.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'STATE-REACTIVE', notes: 'Check disc on the selected account type. Opus owns selected state.' },
  { id: 'B03-08', packageId: 'B03', role: 'Directional wax seal', file: null, classification: 'EXACT_APPROVED_REUSE', status: 'BAKED_DO_NOT_REMOUNT', authority: 'OV03', motion: 'BACKGROUND-BOUND', notes: 'Arrows are inside the seal.' },
  { id: 'B03-09', packageId: 'B03', role: 'Two-way transfer arrows', file: null, classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV03', motion: 'BACKGROUND-BOUND', notes: 'Same artwork as the wax seal. No second file.' },
  { id: 'B03-10', packageId: 'B03', role: 'Source account icon', file: 'B03-BANK-SOURCE.png', classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV03', motion: 'CONTROL-ATTACHED', notes: 'Same dark bank as B03-02.' },
  { id: 'B03-11', packageId: 'B03', role: 'Destination pocket mark', file: 'B03-POCKET-MARK.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV03', motion: 'CONTROL-ATTACHED', notes: 'Bowl mark beside Travel Fund.' },
  { id: 'B03-12', packageId: 'B03', role: 'Transfer calendar', file: 'B03-CALENDAR.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV03', motion: 'CONTROL-ATTACHED', notes: 'Shared with search date filter.' },
  { id: 'B03-13', packageId: 'B03', role: 'Rename pencil', file: 'B03-PENCIL.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV04', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B03-14', packageId: 'B03', role: 'Delete trash', file: 'B03-TRASH.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV04', motion: 'CONTROL-ATTACHED', notes: 'Dark ink. Not the oxblood privacy trash.' },
  { id: 'B03-15', packageId: 'B03', role: 'Pocket action chevron', file: 'B03-CHEVRON.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV03', motion: 'CONTROL-ATTACHED', notes: 'Dark ink > used on parchment rows.' },
  { id: 'B03-16', packageId: 'B03', role: 'Balance ornament', file: null, classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV02', motion: 'BACKGROUND-BOUND', notes: 'Header sprig is baked into the parchment. No separate mount.' },
  { id: 'B04-01', packageId: 'B04', role: 'Search magnifier', file: 'B04-SEARCH.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV05', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B04-02', packageId: 'B04', role: 'Date filter calendar', file: 'B03-CALENDAR.png', classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV05', motion: 'CONTROL-ATTACHED', notes: 'Same calendar as the transfer date.' },
  { id: 'B04-03', packageId: 'B04', role: 'Account filter bank', file: 'B03-BANK-SOURCE.png', classification: 'VISUAL_MATCH_REUSE', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV05', motion: 'CONTROL-ATTACHED', notes: 'Same dark bank. Search extract kept as B04-BANK-FILTER.png for comparison.' },
  { id: 'B04-04', packageId: 'B04', role: 'Category tag', file: 'B04-TAG.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV05', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B04-05', packageId: 'B04', role: 'Advanced filter', file: null, classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV05', motion: '', notes: 'OV05 has date, account, and category. No separate advanced-filter glyph.' },
  { id: 'B04-06', packageId: 'B04', role: 'Result magnifier', file: 'B04-SEARCH.png', classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV05', motion: 'CONTROL-ATTACHED', notes: 'Same magnifier as the search field.' },
  { id: 'B04-07', packageId: 'B04', role: 'Ledger stack', file: null, classification: 'EXACT_APPROVED_REUSE', status: 'BAKED_DO_NOT_REMOUNT', authority: 'OV05', motion: 'BACKGROUND-BOUND', notes: '' },
  { id: 'B04-08', packageId: 'B04', role: 'Warning medallion', file: null, classification: 'EXACT_APPROVED_REUSE', status: 'BAKED_DO_NOT_REMOUNT', authority: 'OV07', motion: 'BACKGROUND-BOUND', notes: '' },
  { id: 'B04-09', packageId: 'B04', role: 'Balance coins', file: 'B04-COINS-BALANCE.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV07', motion: 'CONTROL-ATTACHED', notes: 'Oxblood coin stack. Not the savings stack.' },
  { id: 'B04-10', packageId: 'B04', role: 'Pending clock', file: 'B04-CLOCK.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV07', motion: 'CONTROL-ATTACHED', notes: '' },
  { id: 'B04-11', packageId: 'B04', role: 'Blocker chevron', file: 'B03-CHEVRON.png', classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV07', motion: 'CONTROL-ATTACHED', notes: 'Same parchment chevron.' },
  { id: 'B04-12', packageId: 'B04', role: 'Architectural ornament', file: null, classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV07', motion: 'BACKGROUND-BOUND', notes: 'Column is in the environment plate.' },
  { id: 'B05-01', packageId: 'B05', role: 'Rename cream paper', file: 'B05-RENAME-CREAM.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV04', motion: 'CONTROL-ATTACHED', notes: 'Text removed. Torn cream. Not the blush delete.' },
  { id: 'B05-02', packageId: 'B05', role: 'Delete blush paper', file: 'B05-DELETE-BLUSH.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV04', motion: 'CONTROL-ATTACHED', notes: 'Text removed. Distinct pink.' },
  { id: 'B05-03', packageId: 'B05', role: 'Remove access paper', file: 'B05-REMOVE-ACCESS.png', classification: 'EXACT_APPROVED_REUSE', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'GROK4 oxblood backing. Text-free.' },
  { id: 'B05-04', packageId: 'B05', role: 'Privacy back paper', file: 'B05-PRIVACY-BACK.png', classification: 'EXACT_APPROVED_REUSE', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH02', motion: 'CONTROL-ATTACHED', notes: 'GROK4 cream backing.' },
  { id: 'B05-05', packageId: 'B05', role: 'Buffer back paper', file: 'B05-BUFFER-BACK.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH01', motion: 'CONTROL-ATTACHED', notes: 'Cream pill, letters removed.' },
  { id: 'B05-06', packageId: 'B05', role: 'Buffer save paper', file: 'B05-SAVE-BUFFER.png', classification: 'RECONSTRUCTED', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH01', motion: 'CONTROL-ATTACHED', notes: 'Gold-rim olive pill reconstructed from the authority capsule. Text-free. True alpha.' },
  { id: 'B05-07', packageId: 'B05', role: 'Buffer amount paper', file: 'B05-BUFFER-AMOUNT.png', classification: 'EXACT_APPROVED_REUSE', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH01', motion: 'CONTROL-ATTACHED', notes: 'GROK4 torn amount sheet.' },
  { id: 'B05-08', packageId: 'B05', role: 'Buffer effect paper', file: 'B05-BUFFER-EFFECT.png', classification: 'EXACT_APPROVED_REUSE', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH01', motion: 'CONTROL-ATTACHED', notes: 'GROK4 torn effect sheet.' },
  { id: 'B05-09', packageId: 'B05', role: 'Search field paper', file: 'B05-SEARCH-FIELD.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV05', motion: 'CONTROL-ATTACHED', notes: 'The authority has one search field, not a separate All Activity button.' },
  { id: 'B05-10', packageId: 'B05', role: 'Advanced search paper', file: null, classification: 'NOT_REQUIRED_AFTER_DEDUPLICATION', status: 'NOT_REQUIRED', authority: 'OV05', motion: '', notes: 'No advanced-search button on OV05.' },
  { id: 'B05-11', packageId: 'B05', role: 'Archive resolve paper', file: 'B05-RESOLVE.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV07', motion: 'CONTROL-ATTACHED', notes: 'Cut from the 2016 Move-free archive master. Text was already absent. Torn olive pill.' },
  { id: 'B05-12', packageId: 'B05', role: 'Archive close paper', file: 'B05-ARCHIVE-CLOSE.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV07', motion: 'CONTROL-ATTACHED', notes: 'Replaced the partial crop with a cut from the 2016 archive master. Torn cream pill. Text-free.' },
  { id: 'B05-13', packageId: 'B05', role: 'Create pocket paper', file: 'B05-CREATE-POCKET.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'CONTROL-ATTACHED', notes: 'Replaced with a cut from the 2016 Add a Pocket master. Torn olive. Text-free.' },
  { id: 'B05-14', packageId: 'B05', role: 'Record transfer paper', file: 'B05-RECORD-TRANSFER.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV03', motion: 'CONTROL-ATTACHED', notes: 'Cut from the 2016 Move Money master. Olive pill. Text was already absent.' },
  { id: 'B06-01', packageId: 'B06', role: 'Close disc', file: 'B06-CLOSE-DISC.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV08', motion: 'CONTROL-ATTACHED', notes: 'Same file as B01-12.' },
  { id: 'B06-02', packageId: 'B06', role: 'Return arrow', file: null, classification: 'REJECTED_GENERIC', status: 'NOT_REQUIRED', authority: '', motion: '', notes: 'No back-arrow glyph on these authorities. DOT 01 bronze arrow is the wrong family.' },
  { id: 'B06-03', packageId: 'B06', role: 'Navigation chevron', file: 'B03-CHEVRON.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV03', motion: 'CONTROL-ATTACHED', notes: 'Dark variant. Cream variant is B01-CHEVRON. Do not collapse them.' },
  { id: 'B06-04', packageId: 'B06', role: 'Information mark', file: 'B06-INFO.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'CH01', motion: 'CONTROL-ATTACHED', notes: 'The i inside the circle is the icon, not a label.' },
  { id: 'B03-02S', packageId: 'B03', role: 'Selected bank (light)', file: 'B03-BANK-SELECTED.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'STATE-REACTIVE', notes: 'Added. The selected account type uses a light bank, not the dark one.' },
  { id: 'B05-15', packageId: 'B05', role: 'Cancel pocket paper', file: 'B05-ADD-CANCEL.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV02', motion: 'CONTROL-ATTACHED', notes: 'Added. Torn cream cancel cut from the 2016 Add a Pocket master. Text-free.' },
  { id: 'B05-16', packageId: 'B05', role: 'Move money cancel paper', file: 'B05-MOVE-CANCEL.png', classification: 'EXACT_EXTRACT', status: 'READY_FOR_FOUNDER_REVIEW', authority: 'OV03', motion: 'CONTROL-ATTACHED', notes: 'Added. Torn cream cancel cut from the 2016 Move Money master. Text-free.' },
  { id: 'U01', packageId: 'UTILITY', role: 'Founder CLOSE', file: null, classification: 'EXTERNAL_FOUNDER_SUPPLIED', status: 'EXTERNAL_NOT_IN_ENVIRONMENT', authority: 'FOUNDER', motion: 'CONTROL-ATTACHED', notes: 'Supersedes older generic controls where the founder approved them. Not in this environment. Do not invent. Do not mount B06-CLOSE-DISC in place of U01.' },
  { id: 'U02', packageId: 'UTILITY', role: 'Founder HAMBURGER', file: null, classification: 'EXTERNAL_FOUNDER_SUPPLIED', status: 'EXTERNAL_NOT_IN_ENVIRONMENT', authority: 'FOUNDER', motion: 'CONTROL-ATTACHED', notes: 'Supersedes older generic controls where the founder approved them. Not in this environment. Do not invent. Do not mount B06-CLOSE-DISC in place of U01.' },
  { id: 'U03', packageId: 'UTILITY', role: 'Founder SEARCH', file: null, classification: 'EXTERNAL_FOUNDER_SUPPLIED', status: 'EXTERNAL_NOT_IN_ENVIRONMENT', authority: 'FOUNDER', motion: 'CONTROL-ATTACHED', notes: 'Supersedes older generic controls where the founder approved them. Not in this environment. Do not invent. Do not mount B06-CLOSE-DISC in place of U01.' },
  { id: 'U04', packageId: 'UTILITY', role: 'Founder PLUS', file: null, classification: 'EXTERNAL_FOUNDER_SUPPLIED', status: 'EXTERNAL_NOT_IN_ENVIRONMENT', authority: 'FOUNDER', motion: 'CONTROL-ATTACHED', notes: 'Supersedes older generic controls where the founder approved them. Not in this environment. Do not invent. Do not mount B06-CLOSE-DISC in place of U01.' },
];

export const OVERLAY_BAKED_DO_NOT_REMOUNT = ['FG03', 'FG05', 'FG07', 'FG09'] as const;

export const OVERLAY_UTILITY_PRECEDENCE = ['U01', 'U02', 'U03', 'U04'] as const;
