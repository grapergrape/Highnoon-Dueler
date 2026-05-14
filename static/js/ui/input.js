export function bindInput(game, handlers) {
  const onKey = (e) => {
    if (e.code === "Space" && game.screen === "duel") {
      e.preventDefault();
      handlers.onLockIn?.();
    }
    if (e.code === "Escape") {
      handlers.onBack?.();
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
