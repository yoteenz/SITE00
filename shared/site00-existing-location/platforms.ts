import type { ExistingLocationPlatform } from './types';

export const EXISTING_LOCATION_PLATFORMS: {
  id: ExistingLocationPlatform;
  label: string;
  description: string;
}[] = [
  { id: 'SHOPIFY', label: 'SHOPIFY', description: 'Online store on Shopify.' },
  { id: 'WORDPRESS', label: 'WORDPRESS', description: 'WordPress site or WooCommerce.' },
  { id: 'WEBFLOW', label: 'WEBFLOW', description: 'Webflow-hosted site.' },
  { id: 'SQUARESPACE', label: 'SQUARESPACE', description: 'Squarespace site or store.' },
  { id: 'WIX', label: 'WIX', description: 'Wix site or store.' },
  { id: 'CUSTOM_CODE', label: 'CUSTOM / CODED SITE', description: 'Custom stack (React, Next.js, PHP, etc.).' },
  { id: 'OTHER', label: 'OTHER', description: 'Another platform — we will confirm during intake.' },
  { id: 'UNSURE', label: "I'M NOT SURE", description: 'Describe your site; we will help identify the platform.' },
];

export const EXISTING_LOCATION_REQUEST_TYPES: {
  id: import('./types').ExistingLocationRequestType;
  label: string;
  description: string;
}[] = [
  { id: 'DIAGNOSE', label: 'DIAGNOSE A PROBLEM', description: 'Understand what is wrong before any changes.' },
  { id: 'REPAIR', label: 'FIX SOMETHING BROKEN', description: 'Repair incorrect or broken behavior.' },
  { id: 'IMPROVE', label: 'IMPROVE SOMETHING', description: 'Refine or enhance existing functionality.' },
  { id: 'INSTALL', label: 'INSTALL A CAPABILITY', description: 'Add a new feature or integration.' },
  { id: 'CUSTOM_EXPERIENCE', label: 'ADD A CUSTOM EXPERIENCE', description: 'Custom interactive experience on your existing property.' },
  { id: 'UNSURE', label: "I'M NOT SURE", description: 'Tell us what you need; we will recommend the path.' },
];
