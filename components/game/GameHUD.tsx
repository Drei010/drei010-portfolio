import { CHAPTERS, portfolioItems } from "@/lib/game/portfolio";

type GameHUDProps = {
  distance: number;
  collected: number;
  onBack: () => void;
  onCollection: () => void;
  collectionOpen: boolean;
};

export function GameHUD({ distance, collected, onBack, onCollection, collectionOpen }: GameHUDProps) {
  const chapter = portfolioItems[Math.min(collected, portfolioItems.length - 1)].type;
  return <div className="game-hud">
    <button className="game-button game-back" onClick={onBack} aria-label="Back to portfolio">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
      <span>Portfolio</span>
    </button>
    <div className="game-progress">
      <div className="game-progress-label"><span>{collected === portfolioItems.length ? "Journey complete" : `${CHAPTERS.indexOf(chapter) + 1} / 5 · ${chapter}`}</span><span data-testid="game-distance">{distance}m</span></div>
      <progress value={collected} max={portfolioItems.length} aria-label="Portfolio discovery progress" />
    </div>
    <button className="game-button" onClick={onCollection} aria-expanded={collectionOpen} aria-controls="game-collection" aria-label={`Collection, ${collected} of ${portfolioItems.length} discovered`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 5h7l2 3h9v12H3z" /></svg>
      <span className="game-collection-label">Collection</span><span data-testid="game-count">{collected}/{portfolioItems.length}</span>
    </button>
  </div>;
}
