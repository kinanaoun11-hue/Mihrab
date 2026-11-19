import type { AppTab } from '../types/islamic';

export type HistoryOverlay = 'drawer' | 'tafsir' | 'surahIndex' | 'quranSettings' | null;

export interface MihrabHistoryState {
  mihrab: true;
  tab: AppTab;
  overlay: HistoryOverlay;
  seq: number;
}

export function createHistoryState(
  tab: AppTab,
  overlay: HistoryOverlay = null,
  seq = 0
): MihrabHistoryState {
  return {
    mihrab: true,
    tab,
    overlay,
    seq,
  };
}

export function isMihrabHistoryState(val: unknown): val is MihrabHistoryState {
  if (!val || typeof val !== 'object') return false;
  const candidate = val as Partial<MihrabHistoryState>;
  return (
    candidate.mihrab === true &&
    typeof candidate.tab === 'string' &&
    (candidate.overlay === null ||
      candidate.overlay === 'drawer' ||
      candidate.overlay === 'tafsir' ||
      candidate.overlay === 'surahIndex' ||
      candidate.overlay === 'quranSettings')
  );
}

/**
 * Pure helper computing whether navigating to `nextTab` from `currentState`
 * should replace the current history entry (when a drawer overlay is currently
 * on top so Back doesn't re-open the drawer) or push a fresh history entry.
 */
export function resolveTabHistoryAction(
  current: MihrabHistoryState,
  nextTab: AppTab,
  nextSeq: number
): { action: 'noop' | 'push' | 'replace'; nextState: MihrabHistoryState } {
  if (current.tab === nextTab && current.overlay === null) {
    return { action: 'noop', nextState: current };
  }
  const nextState = createHistoryState(nextTab, null, nextSeq);
  if (current.overlay === 'drawer') {
    if (current.tab === nextTab) {
      return { action: 'replace', nextState };
    }
    return { action: 'replace', nextState };
  }
  return { action: 'push', nextState };
}

/**
 * Pure helper computing the state transition when a popstate event occurs.
 * Falls back safely to Home if the browser history entry has no Mihrab state.
 */
export function resolvePopStateTarget(state: unknown): {
  tab: AppTab;
  overlay: HistoryOverlay;
} {
  if (isMihrabHistoryState(state)) {
    return {
      tab: state.tab,
      overlay: state.overlay,
    };
  }
  return {
    tab: 'home',
    overlay: null,
  };
}
