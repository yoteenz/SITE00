/**
 * Page-specific purpose, depth scope, and feature-grounded value copy for the Blueprint PAGES tab.
 *
 * Each page answers three questions: why it exists (purpose), how it helps the client or their audience (why it
 * matters), and what the selected depth actually includes. Depth is cumulative (FULL includes ESSENTIAL, EXTENSIVE
 * includes FULL), and a part that depends on a feature is listed only when that feature is in the build, so the copy
 * changes with the selection and never promises what the build does not include.
 */
import { CAPABILITY_BY_ID, EXPERIENCE_BY_ID } from '../builder-experience/registry';
import { chosenExperiences, deriveBuildLevel, effectiveCapabilities } from '../builder-experience/rules';
import type { BuilderSelection, CapabilityId, ExperienceChoice, ExperienceDepth, ExperienceId } from '../builder-experience/types';

/** A part of a page at some depth. `needs` gates it on a feature; `note` names it when that absence is worth saying. */
type Part = string | { text: string; needs: CapabilityId; note?: string };

type PageIntel = {
  purpose: string;
  whyItMatters: string;
  /** What each depth adds, in order ESSENTIAL → FULL → EXTENSIVE. */
  adds: Record<ExperienceDepth, Part[]>;
  /** Features this page works through when they are in the build (besides the one it needs). */
  connects?: CapabilityId[];
};

const PAGE_INTEL: Record<ExperienceId, PageIntel> = {
  HOME: {
    purpose: 'MAKE THE RIGHT FIRST IMPRESSION.',
    whyItMatters: 'SAYS WHO YOU ARE QUICKLY, BUILDS CREDIBILITY AND POINTS PEOPLE TOWARD WHAT MATTERS MOST.',
    adds: {
      ESSENTIAL: ['AN OPENING THAT SAYS WHAT YOU DO', 'ONE CLEAR NEXT STEP', { text: 'FEATURED PRODUCTS', needs: 'SELL' }, { text: 'A WAY TO BOOK FROM THE FIRST SCREEN', needs: 'BOOK' }],
      FULL: ['SECTIONS THAT LEAD INTO YOUR KEY PAGES', 'ROOM FOR AN ANNOUNCEMENT OR CAMPAIGN', { text: 'A SIGN-IN FOR PEOPLE WHO RETURN', needs: 'ACCOUNTS' }],
      EXTENSIVE: ['SEASONAL AND CAMPAIGN VERSIONS OF THE PAGE'],
    },
    connects: ['EDIT_CONTENT'],
  },
  ENTRY: {
    purpose: 'OPEN THE DOOR TO YOUR SIGNED-IN SPACES.',
    whyItMatters: 'CONNECTS YOUR PUBLIC PAGES TO THE PRIVATE AREAS YOUR BUILD INCLUDES, SO PEOPLE ARRIVE IN THE RIGHT PLACE.',
    adds: {
      ESSENTIAL: ['SIGN IN AND SIGN OUT', 'A CLEAR WAY BACK TO THE PUBLIC PAGES'],
      FULL: ['PASSWORD RESET AND FIRST-TIME SET-UP', 'PLAIN MESSAGES WHEN SOMETHING GOES WRONG'],
      EXTENSIVE: [{ text: 'A DIFFERENT WAY IN FOR EACH ROLE', needs: 'TEAM_ROLES' }, 'INVITATION-ONLY ENTRY'],
    },
    connects: ['ACCOUNTS'],
  },
  ABOUT: {
    purpose: 'GIVE PEOPLE A REASON TO TRUST YOU.',
    whyItMatters: 'TELLS YOUR STORY, YOUR PERSPECTIVE AND WHAT SETS YOU APART, IN YOUR OWN WORDS.',
    adds: {
      ESSENTIAL: ['WHO YOU ARE AND WHY IT MATTERS', 'ONE PIECE OF PROOF'],
      FULL: ['YOUR TEAM OR FOUNDERS', 'YOUR VALUES AND HOW YOU WORK', 'A SHORT HISTORY'],
      EXTENSIVE: ['PRESS, LOCATIONS AND DEEPER PROOF'],
    },
    connects: ['EDIT_CONTENT'],
  },
  CONTACT: {
    purpose: 'MAKE STARTING A CONVERSATION EASY.',
    whyItMatters: 'TURNS INTEREST INTO A FIRST MESSAGE, WITH CLEAR EXPECTATIONS ABOUT WHAT HAPPENS NEXT.',
    adds: {
      ESSENTIAL: ['A SHORT ENQUIRY FORM', 'HOW AND WHEN YOU REPLY'],
      FULL: [
        'A CONFIRMATION ON SCREEN ONCE SENT',
        'OTHER WAYS TO REACH YOU',
        { text: 'A LINK STRAIGHT INTO BOOKING', needs: 'BOOK', note: 'BOOKING FROM THIS PAGE' },
        { text: 'ATTACHMENTS WITH AN ENQUIRY', needs: 'UPLOAD_FILES' },
        { text: 'A CONFIRMATION EMAIL', needs: 'EMAIL' },
      ],
      EXTENSIVE: ['ENQUIRIES ROUTED BY TOPIC OR LOCATION'],
    },
  },
  SERVICES: {
    purpose: 'SHOW WHAT YOU OFFER, CLEARLY.',
    whyItMatters: 'HELPS PEOPLE SEE WHICH SERVICE FITS THEM BEFORE THEY GET IN TOUCH.',
    adds: {
      ESSENTIAL: ['YOUR SERVICES, EACH IN PLAIN WORDS', 'A WAY TO ENQUIRE ABOUT EACH ONE'],
      FULL: ['A PAGE FOR EACH SERVICE', 'HOW WORKING WITH YOU UNFOLDS', { text: 'BOOKING A SERVICE DIRECTLY', needs: 'BOOK' }],
      EXTENSIVE: ['SERVICES GROUPED BY AUDIENCE OR SECTOR'],
    },
    connects: ['EDIT_CONTENT'],
  },
  PROOF: {
    purpose: 'SHOW THAT YOUR WORK WORKS.',
    whyItMatters: 'GIVES PEOPLE EVIDENCE — RESULTS, CASES AND CLIENT VOICES — BEFORE THEY COMMIT.',
    adds: {
      ESSENTIAL: ['SELECTED RESULTS OR TESTIMONIALS'],
      FULL: ['CASE STUDIES WITH THEIR OWN PAGES', 'PROOF LINKED FROM THE PAGES IT SUPPORTS'],
      EXTENSIVE: ['A LARGER LIBRARY OF CASES', { text: 'SEARCH ACROSS YOUR WORK', needs: 'SEARCH' }],
    },
    connects: ['EDIT_CONTENT'],
  },
  STORIES: {
    purpose: 'HELP PEOPLE EXPLORE WHAT YOU PUBLISH.',
    whyItMatters: 'TURNS YOUR PUBLISHED WORK INTO SOMETHING PEOPLE CAN BROWSE AND COME BACK TO.',
    adds: {
      ESSENTIAL: ['A CLEAR INDEX OF YOUR STORIES'],
      FULL: ['LEAD STORIES AND SECTIONS', 'READ-NEXT PATHS BETWEEN STORIES', { text: 'SEARCH ACROSS STORIES', needs: 'SEARCH' }],
      EXTENSIVE: ['SERIES AND TOPIC COLLECTIONS'],
    },
    connects: ['EDIT_CONTENT'],
  },
  STORY: {
    purpose: 'GIVE ONE PIECE THE SPACE IT DESERVES.',
    whyItMatters: 'A READING LAYOUT THAT KEEPS ATTENTION ON YOUR WORDS AND IMAGES.',
    adds: {
      ESSENTIAL: ['A READABLE ARTICLE LAYOUT', 'IMAGES WITH CAPTIONS'],
      FULL: ['PULL QUOTES, GALLERIES AND EMBEDDED MEDIA', 'RELATED STORIES'],
      EXTENSIVE: ['SPECIAL LAYOUTS FOR FEATURE PIECES'],
    },
    connects: ['EDIT_CONTENT'],
  },
  ARCHIVE: {
    purpose: 'KEEP EVERYTHING YOU HAVE PUBLISHED FINDABLE.',
    whyItMatters: 'LETS YOUR BACK CATALOGUE KEEP WORKING FOR YOU LONG AFTER IT IS PUBLISHED.',
    adds: {
      ESSENTIAL: ['EVERYTHING IN ORDER, BY DATE'],
      FULL: ['BROWSING BY TOPIC OR YEAR', { text: 'SEARCH', needs: 'SEARCH', note: 'SEARCH' }],
      EXTENSIVE: ['CURATED COLLECTIONS FROM THE ARCHIVE'],
    },
    connects: ['EDIT_CONTENT'],
  },
  WORK: {
    purpose: 'SHOW YOUR WORK AS A SEQUENCE OF ROOMS.',
    whyItMatters: 'GIVES EACH BODY OF WORK ITS OWN SPACE, SO PEOPLE MOVE THROUGH IT AS THEY WOULD A GALLERY.',
    adds: {
      ESSENTIAL: ['A SEQUENCE OF WORK ROOMS', 'PREVIOUS AND NEXT'],
      FULL: ['AN INDEX OF ALL ROOMS', 'WORDS THAT FRAME EACH ROOM'],
      EXTENSIVE: ['EXHIBITIONS AND THEMED SEQUENCES'],
    },
    connects: ['EDIT_CONTENT'],
  },
  PIECE: {
    purpose: 'SHOW ONE WORK UP CLOSE.',
    whyItMatters: 'LETS PEOPLE SPEND TIME WITH A SINGLE PIECE AND THE STORY BEHIND IT.',
    adds: {
      ESSENTIAL: ['LARGE IMAGES OF THE PIECE', 'ITS TITLE AND DETAILS'],
      FULL: ['DETAIL VIEWS', 'RELATED PIECES', 'A WAY TO ENQUIRE', { text: 'A WAY TO BUY IT', needs: 'SELL' }],
      EXTENSIVE: ['SERIES AND EDITIONS'],
    },
    connects: ['EDIT_CONTENT'],
  },
  THE_PLACE: {
    purpose: 'CONVEY THE ATMOSPHERE OF YOUR VENUE.',
    whyItMatters: 'HELPS PEOPLE PICTURE BEING THERE BEFORE THEY ARRIVE.',
    adds: {
      ESSENTIAL: ['IMAGES AND WORDS THAT SET THE MOOD'],
      FULL: ['THE SPACES WITHIN THE VENUE', 'THE PEOPLE BEHIND IT'],
      EXTENSIVE: ['SEASONAL AND EVENT VERSIONS'],
    },
    connects: ['EDIT_CONTENT'],
  },
  OFFER: {
    purpose: 'SHOW WHAT A GUEST CAN CHOOSE.',
    whyItMatters: 'MAKES YOUR MENU, STAYS OR OFFER EASY TO READ AND COMPARE.',
    adds: {
      ESSENTIAL: ['YOUR OFFER, CLEARLY LAID OUT'],
      FULL: ['SECTIONS, DETAILS AND PRICES', { text: 'A WAY TO BOOK FROM EACH CHOICE', needs: 'BOOK' }],
      EXTENSIVE: ['SEASONAL OFFERS AND SPECIAL EVENTS'],
    },
    connects: ['EDIT_CONTENT'],
  },
  VISIT: {
    purpose: 'MAKE ARRIVING EASY.',
    whyItMatters: 'ANSWERS WHERE, WHEN AND HOW BEFORE PEOPLE NEED TO ASK.',
    adds: {
      ESSENTIAL: ['ADDRESS, HOURS AND DIRECTIONS'],
      FULL: ['ACCESS AND PARKING NOTES', 'ANSWERS TO COMMON QUESTIONS'],
      EXTENSIVE: ['A PAGE FOR EACH LOCATION'],
    },
  },
  JOURNAL: {
    purpose: 'SHARE NEWS AND STORIES OVER TIME.',
    whyItMatters: 'GIVES PEOPLE A REASON TO COME BACK, AND KEEPS YOUR PLACE VISIBLY CURRENT.',
    adds: {
      ESSENTIAL: ['A LIST OF POSTS', 'A READABLE POST LAYOUT'],
      FULL: ['CATEGORIES', 'RELATED POSTS', { text: 'SEARCH ACROSS POSTS', needs: 'SEARCH' }],
      EXTENSIVE: ['SERIES AND FEATURED COLLECTIONS'],
    },
    connects: ['EDIT_CONTENT'],
  },
  EVENTS: {
    purpose: 'SHOW WHAT IS HAPPENING, AND WHEN.',
    whyItMatters: 'HELPS PEOPLE PLAN AROUND YOU AND NOT MISS WHAT MATTERS.',
    adds: {
      ESSENTIAL: ['UPCOMING EVENTS WITH DATES AND DETAILS'],
      FULL: ['A PAGE FOR EACH EVENT', 'PAST EVENTS', { text: 'RESERVING A PLACE', needs: 'BOOK' }],
      EXTENSIVE: ['PROGRAMMES, SERIES AND CALENDARS'],
    },
    connects: ['EDIT_CONTENT'],
  },
  SHOP: {
    purpose: 'TURN INTEREST INTO PURCHASES.',
    whyItMatters: 'HELPS CUSTOMERS DISCOVER YOUR PRODUCTS AND MOVE STRAIGHT TOWARD CHECKOUT.',
    adds: {
      ESSENTIAL: ['YOUR COLLECTIONS', 'PRODUCTS PEOPLE CAN OPEN'],
      FULL: ['A PAGE FOR EACH COLLECTION', 'ADD TO BAG FROM EVERY PRODUCT', { text: 'SEARCH AND FILTERING', needs: 'SEARCH', note: 'SEARCH AND FILTERING' }],
      EXTENSIVE: ['MERCHANDISED PAGES FOR DROPS AND CAMPAIGNS'],
    },
    connects: ['PAYMENTS'],
  },
  PRODUCT: {
    purpose: 'HELP CUSTOMERS CHOOSE WITH CONFIDENCE.',
    whyItMatters: 'PUTS THE IMAGES, DETAILS AND PRICE TOGETHER AT THE MOMENT OF DECISION.',
    adds: {
      ESSENTIAL: ['IMAGES, DESCRIPTION AND PRICE', 'ADD TO BAG'],
      FULL: ['SIZES, COLOURS AND OTHER OPTIONS', 'AVAILABILITY', 'RELATED PRODUCTS'],
      EXTENSIVE: ['BUNDLES AND SPECIAL EDITIONS'],
    },
    connects: ['PAYMENTS'],
  },
  CHECKOUT: {
    purpose: 'GET FROM BAG TO PAID WITHOUT FRICTION.',
    whyItMatters: 'KEEPS THE LAST STEPS SHORT AND CLEAR, SO BUYING FEELS SIMPLE.',
    adds: {
      ESSENTIAL: ['REVIEWING THE BAG', { text: 'PAYMENT', needs: 'PAYMENTS', note: 'PAYMENT' }, 'AN ORDER CONFIRMATION'],
      FULL: ['DELIVERY OR COLLECTION DETAILS', { text: 'CLEAR MESSAGES WHEN A PAYMENT FAILS', needs: 'PAYMENTS' }, { text: 'A RECEIPT', needs: 'PAYMENTS' }],
      EXTENSIVE: ['GIFT, PROMOTION AND SPECIAL-ORDER PATHS'],
    },
    connects: ['PAYMENTS'],
  },
  CARE: {
    purpose: 'ANSWER QUESTIONS BEFORE THEY BECOME PROBLEMS.',
    whyItMatters: 'PUTS DELIVERY, RETURNS AND HELP IN ONE PLACE, SO PEOPLE BUY WITH CONFIDENCE.',
    adds: {
      ESSENTIAL: ['DELIVERY AND RETURNS', 'COMMON QUESTIONS'],
      FULL: ['A PAGE FOR EACH TOPIC', 'A WAY TO ASK FOR HELP'],
      EXTENSIVE: ['GUIDES FOR CARE AND USE'],
    },
    connects: ['EDIT_CONTENT'],
  },
  BOOKING: {
    purpose: 'MAKE SCHEDULING STRAIGHTFORWARD.',
    whyItMatters: 'LETS PEOPLE CHOOSE A TIME AND CONFIRM IT WITHOUT A BACK-AND-FORTH.',
    adds: {
      ESSENTIAL: ['CHOOSING WHAT TO BOOK AND WHEN', 'A CONFIRMATION'],
      FULL: [
        'CHANGING OR CANCELLING A BOOKING',
        { text: 'CONFIRMATION AND REMINDER EMAILS', needs: 'EMAIL' },
        { text: 'PAYING OR LEAVING A DEPOSIT', needs: 'PAYMENTS' },
      ],
      EXTENSIVE: ['BOOKING ACROSS SEVERAL PEOPLE, ROOMS OR LOCATIONS'],
    },
  },
  MEMBERSHIP: {
    purpose: 'TURN VISITORS INTO MEMBERS.',
    whyItMatters: 'MAKES JOINING, RENEWING AND MANAGING A MEMBERSHIP SIMPLE, SO MEMBERS STAY.',
    adds: {
      ESSENTIAL: ['WHAT MEMBERSHIP INCLUDES', 'JOINING'],
      FULL: ['RENEWING AND CHANGING A MEMBERSHIP', 'MEMBERS-ONLY PAGES', { text: 'PAID MEMBERSHIP', needs: 'PAYMENTS' }],
      EXTENSIVE: ['SEVERAL MEMBERSHIP LEVELS'],
    },
    connects: ['ACCOUNTS'],
  },
  COMMUNITY: {
    purpose: 'GIVE MEMBERS A PLACE TO GATHER.',
    whyItMatters: 'LETS PEOPLE MEET, TALK AND COME BACK BECAUSE OF EACH OTHER.',
    adds: {
      ESSENTIAL: ['MEMBER PROFILES', 'A SHARED SPACE TO POST'],
      FULL: ['REPLIES AND REACTIONS', 'MODERATION TOOLS', { text: 'ALERTS FOR NEW ACTIVITY', needs: 'NOTIFICATIONS' }],
      EXTENSIVE: ['GROUPS AND PRIVATE SPACES'],
    },
    connects: ['ACCOUNTS'],
  },
  MARKETPLACE: {
    purpose: 'LET SEVERAL SELLERS TRADE THROUGH YOUR PLACE.',
    whyItMatters: 'BRINGS SELLERS AND BUYERS TOGETHER UNDER YOUR NAME.',
    adds: {
      ESSENTIAL: ['LISTINGS', 'SELLER PAGES'],
      FULL: ['SELLERS LISTING THEIR OWN ITEMS', 'ORDERS BETWEEN BUYERS AND SELLERS'],
      EXTENSIVE: ['SELLER TOOLS AND REPORTS'],
    },
    connects: ['PAYMENTS', 'ACCOUNTS'],
  },
  ACCOUNT: {
    purpose: 'MAKE COMING BACK EASY.',
    whyItMatters: 'GIVES EACH PERSON THEIR OWN SPACE FOR THE THINGS YOUR BUILD LETS THEM DO.',
    adds: {
      ESSENTIAL: ['SIGNING IN', 'A PROFILE', 'SIGNING OUT'],
      FULL: [
        'SETTINGS AND SECURITY',
        { text: 'ORDER HISTORY', needs: 'SELL', note: 'ORDER HISTORY' },
        { text: 'THEIR BOOKINGS', needs: 'BOOK' },
        { text: 'THEIR MEMBERSHIP', needs: 'MEMBERSHIP' },
        { text: 'LINKS INTO THEIR RECORDS', needs: 'DATA_PORTAL' },
      ],
      EXTENSIVE: [{ text: 'NOTIFICATION PREFERENCES', needs: 'NOTIFICATIONS' }, { text: 'SHARED ACCOUNTS FOR A TEAM', needs: 'TEAM_ROLES' }],
    },
  },
  DASHBOARD: {
    purpose: 'MAKE WHAT NEEDS ATTENTION EASY TO SEE.',
    whyItMatters: 'SURFACES STATUS AND NEXT ACTIONS IN ONE ORGANISED SPACE.',
    adds: {
      ESSENTIAL: ['A SUMMARY OF WHAT NEEDS ATTENTION NOW'],
      FULL: [
        'STATUS AT A GLANCE',
        'RECENT ACTIVITY',
        { text: 'LINKS STRAIGHT INTO RECORDS', needs: 'DATA_PORTAL' },
        { text: 'UPDATES AS THEY HAPPEN', needs: 'LIVE_UPDATES' },
        { text: 'USAGE AND PERFORMANCE INSIGHT', needs: 'MEASURE', note: 'ANALYTICS' },
      ],
      EXTENSIVE: [{ text: 'A VIEW FOR EACH ROLE', needs: 'TEAM_ROLES' }],
    },
  },
  RECORDS: {
    purpose: 'KEEP IMPORTANT WORK ORGANISED.',
    whyItMatters: 'GIVES THE RIGHT PEOPLE ONE RELIABLE PLACE FOR THE RECORDS THEY WORK ON.',
    adds: {
      ESSENTIAL: ['A LIST OF RECORDS', 'OPENING A RECORD'],
      FULL: [
        'STATUS AND PROGRESS ON EACH RECORD',
        'NOTES AND UPDATES',
        { text: 'ATTACHING FILES', needs: 'UPLOAD_FILES' },
        { text: 'DOCUMENTS KEPT WITH EACH RECORD', needs: 'DOCUMENTS', note: 'FILE MANAGEMENT' },
      ],
      EXTENSIVE: ['SEVERAL KINDS OF RECORD, EACH WITH ITS OWN STEPS'],
    },
    connects: ['ACCOUNTS'],
  },
  FILES: {
    purpose: 'KEEP DOCUMENTS ORGANISED AND SHARED.',
    whyItMatters: 'ONE PLACE TO FIND, SHARE AND SIGN OFF THE DOCUMENTS YOUR WORK DEPENDS ON.',
    adds: {
      ESSENTIAL: ['FOLDERS AND FILES', 'UPLOAD AND DOWNLOAD'],
      FULL: ['SHARING WITH THE RIGHT PEOPLE', 'SIGN-OFF'],
      EXTENSIVE: ['VERSIONS AND DOCUMENT WORKFLOWS'],
    },
    connects: ['UPLOAD_FILES'],
  },
  PEOPLE: {
    purpose: 'GIVE THE RIGHT PEOPLE THE RIGHT ACCESS.',
    whyItMatters: 'KEEPS EACH PERSON TO WHAT THEY SHOULD SEE AND DO.',
    adds: {
      ESSENTIAL: ['WHO HAS ACCESS, AND THEIR ROLE'],
      FULL: ['INVITING PEOPLE', 'CHANGING ROLES'],
      EXTENSIVE: ['A RECORD OF WHO CHANGED WHAT'],
    },
    connects: ['ACCOUNTS'],
  },
  SETTINGS: {
    purpose: 'CONTROL HOW YOUR PLACE IS RUN.',
    whyItMatters: 'KEEPS EVERYDAY SETTINGS IN YOUR OWN HANDS.',
    adds: {
      ESSENTIAL: ['THE SETTINGS YOUR TEAM CHANGES MOST'],
      FULL: ['SETTINGS GROUPED BY AREA'],
      EXTENSIVE: ['DETAILED SETTINGS FOR EACH PART OF THE BUILD'],
    },
  },
};

const DEPTH_ORDER: readonly ExperienceDepth[] = ['ESSENTIAL', 'FULL', 'EXTENSIVE'];

/** Parts often contain "and" themselves, so a list reads as separate items rather than one long sentence. */
const list = (items: readonly string[]) => items.join(' · ');

const verb = (id: CapabilityId) => CAPABILITY_BY_ID[id].verb.toUpperCase();

/** The parts a depth includes (cumulative), split into those the build has and the noted ones it lacks. */
function partsFor(intel: PageIntel, depth: ExperienceDepth, caps: Set<CapabilityId>) {
  const included: string[] = [];
  const usedFeatures: CapabilityId[] = [];
  const missing: { note: string; needs: CapabilityId }[] = [];
  for (const tier of DEPTH_ORDER.slice(0, DEPTH_ORDER.indexOf(depth) + 1)) {
    for (const part of intel.adds[tier]) {
      if (typeof part === 'string') included.push(part);
      else if (caps.has(part.needs)) {
        included.push(part.text);
        usedFeatures.push(part.needs);
      } else if (part.note) missing.push({ note: part.note, needs: part.needs });
    }
  }
  return { included, usedFeatures, missing };
}

export type PageValueDetail = {
  purpose: string;
  whyItMatters: string;
  /** What the selected depth includes in this build. */
  depthProvides: string;
  depthSummary: string;
  /** Which features in the build make the page work. */
  featuresNote: string | null;
  /** What this page does not include here, when that is worth knowing. */
  limitation: string | null;
};

export function resolvePageValue(selection: BuilderSelection, choice: ExperienceChoice): PageValueDetail {
  const exp = EXPERIENCE_BY_ID[choice.id];
  const intel = PAGE_INTEL[choice.id];
  const caps = new Set(effectiveCapabilities(selection));
  if (exp.needsCapability && !caps.has(exp.needsCapability)) {
    const needed = verb(exp.needsCapability);
    return {
      purpose: intel.purpose,
      whyItMatters: intel.whyItMatters,
      depthProvides: `NOT IN THIS BUILD — ADD ${needed} TO INCLUDE IT.`,
      depthSummary: `NOT IN THIS BUILD — ADD ${needed} TO INCLUDE IT.`,
      featuresNote: `REQUIRES ${needed} — NOT SELECTED IN THIS BUILD.`,
      limitation: `THIS PAGE STAYS OUT OF THE BUILD UNTIL ${needed} IS ADDED.`,
    };
  }
  const { included, usedFeatures, missing } = partsFor(intel, choice.depth, caps);
  const depthProvides = list(included);
  const features = [...new Set([...(exp.needsCapability ? [exp.needsCapability] : []), ...(intel.connects ?? []), ...usedFeatures])].filter((id) =>
    caps.has(id),
  );
  return {
    purpose: intel.purpose,
    whyItMatters: intel.whyItMatters,
    depthProvides,
    depthSummary: depthProvides,
    featuresNote: features.length ? `RUNS ON THESE FEATURES: ${list(features.map(verb))}` : null,
    // Not every missing feature can be added from the rooms, so the note says where it can be asked for instead.
    limitation: missing.length ? `NOT IN THIS BUILD: ${list(missing.map((m) => m.note))}. ASK FOR IT AT BLUEPRINT REVIEW IF YOU NEED IT.` : null,
  };
}

/** Regression helper: distinct copy per page at same depth. */
export function pageDepthCopySignature(selection: BuilderSelection): string[] {
  const { level } = deriveBuildLevel(selection);
  return chosenExperiences(selection, level).map((c) => {
    const v = resolvePageValue(selection, c);
    return `${c.id}:${v.depthSummary}`;
  });
}
