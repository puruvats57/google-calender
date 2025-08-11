import { useEffect, useRef } from "react";

export function useDragSelection(onSelect: (startIdx: number, endIdx: number) => void) {
  const state = useRef<{ dragging: boolean; startIdx: number | null; hasMoved: boolean }>({
    dragging: false,
    startIdx: null,
    hasMoved: false
  });

  useEffect(() => {
    const onPointerUp = () => {
      if (state.current.startIdx !== null) {
        const endRaw = document.body.dataset.dragEndIdx;
        if (endRaw) {
          const endIdx = parseInt(endRaw, 10);
          // If we haven't moved, it's a single cell click
          if (!state.current.hasMoved) {
            onSelect(state.current.startIdx, state.current.startIdx);
          } else {
            onSelect(Math.min(state.current.startIdx, endIdx), Math.max(state.current.startIdx, endIdx));
          }
        }
      }
      state.current = { dragging: false, startIdx: null, hasMoved: false };
      document.body.dataset.dragEndIdx = "";
      document.querySelectorAll(".day-selecting").forEach(el => el.classList.remove("day-selecting"));
    };

    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, [onSelect]);

  function start(idx: number) {
    state.current.dragging = true;
    state.current.startIdx = idx;
    state.current.hasMoved = false;
    document.body.dataset.dragEndIdx = `${idx}`;
    document.querySelectorAll(".day-selecting").forEach(el => el.classList.remove("day-selecting"));

    const el = document.querySelector(`[data-day-idx="${idx}"]`);
    el?.classList.add("day-selecting");

    function onMove(e: PointerEvent) {
      const target = e.target as HTMLElement;
      const tile = target.closest(".cell") as HTMLElement | null;
      if (tile && tile.dataset.dayIdx) {
        const idxNow = parseInt(tile.dataset.dayIdx, 10);
        // Only mark as moved if we're actually on a different cell
        if (idxNow !== state.current.startIdx) {
          state.current.hasMoved = true;
        }
        document.body.dataset.dragEndIdx = `${idxNow}`;
        const start = state.current.startIdx!;
        const min = Math.min(start, idxNow);
        const max = Math.max(start, idxNow);

        document.querySelectorAll(".cell").forEach((c, i) => {
          if (i >= min && i <= max) c.classList.add("day-selecting");
          else c.classList.remove("day-selecting");
        });
      }
    }

    window.addEventListener("pointermove", onMove);
    const cleanup = () => window.removeEventListener("pointermove", onMove);
    setTimeout(cleanup, 300000);
  }

  return { start };
}
