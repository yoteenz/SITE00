/**
 * Feed-level material rhythm for 3×3 board.
 */

import type { ArtBoardRetainedFirstSlideContract, FeedMaterialRhythm } from './types.js';

export function buildFeedMaterialRhythm(params: {
  boardId: string;
  contracts: ArtBoardRetainedFirstSlideContract[];
}): FeedMaterialRhythm {
  const surfaceDistribution: Record<string, number> = {};
  const constructionModeDistribution: Record<string, number> = {};
  const edgeDistribution: Record<string, number> = {};
  const depthDistribution: Record<string, number> = {};
  const attachmentDistribution: Record<string, number> = {};
  const printScanDistribution: Record<string, number> = {};

  for (const c of params.contracts) {
    const ab = c.artBoardDirection;
    const surf = ab.materialitySystem.baseSurface;
    surfaceDistribution[surf] = (surfaceDistribution[surf] ?? 0) + 1;
    constructionModeDistribution[ab.pageConstructionMode] = (constructionModeDistribution[ab.pageConstructionMode] ?? 0) + 1;
    edgeDistribution[ab.edgeBehavior] = (edgeDistribution[ab.edgeBehavior] ?? 0) + 1;
    depthDistribution[ab.depthBehavior] = (depthDistribution[ab.depthBehavior] ?? 0) + 1;
    const att = ab.attachmentLogic[0]?.mechanism ?? 'NONE';
    attachmentDistribution[att] = (attachmentDistribution[att] ?? 0) + 1;
    printScanDistribution[ab.materialitySystem.printingBehavior] =
      (printScanDistribution[ab.materialitySystem.printingBehavior] ?? 0) + 1;
  }

  const tornCount = params.contracts.filter((c) => c.artBoardDirection.materialitySystem.tearBehavior !== 'NONE').length;
  const notebookCount = params.contracts.filter(
    (c) =>
      c.artBoardDirection.pageConstructionMode === 'OPEN_NOTEBOOK' ||
      c.artBoardDirection.pageConstructionMode === 'BOUND_PAGE',
  ).length;
  const collageCount = params.contracts.filter((c) => c.artBoardDirection.pageConstructionMode === 'SCRAP_ASSEMBLAGE').length;
  const uniqueSurfaces = Object.keys(surfaceDistribution).length;

  return {
    boardId: params.boardId,
    surfaceDistribution,
    constructionModeDistribution,
    edgeDistribution,
    depthDistribution,
    attachmentDistribution,
    printScanDistribution,
    allSameCanvas: uniqueSurfaces <= 1,
    allTornPaper: tornCount >= 7,
    allNotebook: notebookCount >= 7,
    allCollage: collageCount >= 7,
    variationAdequate: uniqueSurfaces >= 4 && tornCount < 7 && notebookCount < 7,
  };
}

export function allPostsSameCanvasFails(rhythm: FeedMaterialRhythm): boolean {
  return rhythm.allSameCanvas;
}

export function allPostsTornPaperFails(rhythm: FeedMaterialRhythm): boolean {
  return rhythm.allTornPaper;
}

export function allPostsNotebookFails(rhythm: FeedMaterialRhythm): boolean {
  return rhythm.allNotebook;
}

export function scrapbookCollapseFails(rhythm: FeedMaterialRhythm): boolean {
  return rhythm.allCollage;
}
