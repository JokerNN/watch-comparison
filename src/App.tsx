import { useMemo, useState } from 'react';

interface Watch {
  id: number;
  brand: string;
  model: string;
  notes: string;
  imageUrl: string;
  productUrl: string;
  wins: number;
  losses: number;
  totalVotes: number;
  score: number;
}

interface Pair {
  leftId: number;
  rightId: number;
}

interface WatchCardProps {
  watch: Watch;
  onChoose: () => void;
  highlighted?: boolean;
  flash?: boolean;
}

interface LeaderboardProps {
  watches: Watch[];
  leaderId?: number;
}

const STORAGE_KEY = 'birthday-watch-battle-state-v1';

const wishlist: Omit<Watch, 'wins' | 'losses' | 'totalVotes' | 'score'>[] = [
  { id: 1, brand: 'Longines', model: 'HydroConquest', notes: 'Blue bezel, black dial, mesh bracelet', imageUrl: 'https://www.longines.com/uploads/watchshare/facebook_image/watches-conquest-l3-781-4-56-6.png', productUrl: 'https://www.longines.com/en-us/p/watch-hydroconquest-l3-781-4-56-6' },
  { id: 2, brand: 'Longines', model: 'Conquest', notes: 'Classic sport watch', imageUrl: 'https://www.longines.com/uploads/watchshare/facebook_image/watches-conquest-l3-430-4-92-6.png', productUrl: 'https://www.longines.com/en-us/p/watch-conquest-l3-430-4-92-6' },
  { id: 3, brand: 'Oris', model: 'Aquis Date', notes: 'Modern dive watch profile', imageUrl: 'https://www.oris.ch/data/products/01-733-7730-4155-07-8-24-05PEB/images/01-733-7730-4155-07-8-24-05PEB.png', productUrl: 'https://www.oris.ch/en-US/product/watch/aquis/aquis-date/01-733-7730-4155-07-8-24-05PEB' },
  { id: 4, brand: 'Tudor', model: 'Royal', notes: 'Blue dial', imageUrl: 'https://www.tudorwatch.com/-/media/model-assets/upright/m28600-0005.png', productUrl: 'https://www.tudorwatch.com/en/watches/tudor-royal/m28600-0005' },
  { id: 5, brand: 'Christopher Ward', model: 'C1 Bel Canto', notes: 'Chiming complication design', imageUrl: 'https://www.christopherward.com/on/demandware.static/-/Sites-cw-master-catalog/default/dw6dfb57a8/images/watches/C01-41APT2-T00B0-VB_front.jpg', productUrl: 'https://www.christopherward.com/int/the-bel-canto-collection/C01-41APT2-T00B0-VB.html' },
  { id: 6, brand: 'Oris', model: 'Big Crown Pointer Date', notes: 'Pointer-date heritage styling', imageUrl: 'https://www.oris.ch/data/products/01-754-7741-4065-07-8-20-22/images/01-754-7741-4065-07-8-20-22.png', productUrl: 'https://www.oris.ch/en-US/product/watch/big-crown/big-crown-pointer-date/01-754-7741-4065-07-8-20-22' },
  { id: 7, brand: 'Oris', model: 'ProPilot X Calibre 400', notes: 'Contemporary pilot watch', imageUrl: 'https://www.oris.ch/data/products/01-400-7778-7155-07-7-20-01TLC/images/01-400-7778-7155-07-7-20-01TLC.png', productUrl: 'https://www.oris.ch/en-US/product/watch/propilot/propilot-x-calibre-400/01-400-7778-7155-07-7-20-01TLC' },
  { id: 8, brand: 'Omega', model: 'Seamaster Diver 300M', notes: 'Blue dial', imageUrl: 'https://www.omegawatches.com/media/catalog/product/o/m/omega-seamaster-diver-300m-co-axial-master-chronometer-42-mm-21030422003001-l.png', productUrl: 'https://www.omegawatches.com/en-us/watch-omega-seamaster-diver-300m-co-axial-master-chronometer-42-mm-21030422003001' },
  { id: 9, brand: 'Omega', model: 'Seamaster Aqua Terra', notes: 'Blue dial', imageUrl: 'https://www.omegawatches.com/media/catalog/product/o/m/omega-seamaster-aqua-terra-150m-co-axial-master-chronometer-41-mm-22010412103004-l.png', productUrl: 'https://www.omegawatches.com/en-us/watch-omega-seamaster-aqua-terra-150m-co-axial-master-chronometer-41-mm-22010412103004' },
  { id: 10, brand: 'Maurice Lacroix', model: 'AIKON Automatic', notes: 'Integrated bracelet sports style', imageUrl: 'https://www.mauricelacroix.com/dw/image/v2/BCVJ_PRD/on/demandware.static/-/Sites-masterCatalog_MauriceLacroix/default/dw1f4bc26c/images/large/AI6008-SS002-430-1.png', productUrl: 'https://www.mauricelacroix.com/ch_en/watches/watches-aikon/watches-aikon-automatic/aikon-automatic-date-42mm/AI6008-SS002-430-1.html' },
];

const createInitialWatches = (): Watch[] => wishlist.map((watch) => ({ ...watch, wins: 0, losses: 0, totalVotes: 0, score: 0 }));

const pairKey = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

const winRate = (watch: Watch): number => (watch.totalVotes === 0 ? 0 : (watch.wins / watch.totalVotes) * 100);

const getRankedWatches = (watches: Watch[]): Watch[] =>
  [...watches].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const winRateDiff = winRate(b) - winRate(a);
    if (winRateDiff !== 0) return winRateDiff;
    return b.totalVotes - a.totalVotes;
  });

const WatchCard = ({ watch, onChoose, highlighted = false, flash = false }: WatchCardProps): JSX.Element => (
  <article className={`watch-card ${highlighted ? 'leader-highlight' : ''} ${flash ? 'vote-flash' : ''}`}>
    <img src={watch.imageUrl} alt={`${watch.brand} ${watch.model}`} className="watch-image" />
    <div className="watch-content">
      <p className="watch-brand">{watch.brand}</p>
      <h3>{watch.model}</h3>
      <p className="watch-notes">{watch.notes}</p>
      <p>
        <a href={watch.productUrl} target="_blank" rel="noreferrer">View product page</a>
      </p>
      <button className="choose-button" onClick={onChoose}>
        Choose this
      </button>
    </div>
  </article>
);

const Leaderboard = ({ watches, leaderId }: LeaderboardProps): JSX.Element => (
  <section className="leaderboard">
    <h2>Leaderboard</h2>
    <div className="leaderboard-list">
      {watches.map((watch, index) => {
        const isLeader = watch.id === leaderId;
        return (
          <div key={watch.id} className={`leader-row ${isLeader ? 'leader-row-top' : ''}`}>
            <span className="rank">#{index + 1}</span>
            <span className="name">{watch.brand} {watch.model}</span>
            <span>Score: <strong>{watch.score}</strong></span>
            <span>Win rate: <strong>{winRate(watch).toFixed(1)}%</strong></span>
            <span>{watch.wins}W/{watch.losses}L</span>
          </div>
        );
      })}
    </div>
  </section>
);

const PairwiseVoting = (): JSX.Element => {
  const [watches, setWatches] = useState<Watch[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createInitialWatches();
    try {
      const parsed = JSON.parse(stored) as { watches: Watch[]; pairCounts: Record<string, number>; lastPairKey: string | null };
      return parsed.watches;
    } catch {
      return createInitialWatches();
    }
  });

  const [pairCounts, setPairCounts] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    try {
      const parsed = JSON.parse(stored) as { watches: Watch[]; pairCounts: Record<string, number>; lastPairKey: string | null };
      return parsed.pairCounts ?? {};
    } catch {
      return {};
    }
  });

  const [lastPairKey, setLastPairKey] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as { watches: Watch[]; pairCounts: Record<string, number>; lastPairKey: string | null };
      return parsed.lastPairKey ?? null;
    } catch {
      return null;
    }
  });

  const [showOnlyLeaderboard, setShowOnlyLeaderboard] = useState(false);
  const [flashId, setFlashId] = useState<number | null>(null);

  const persist = (nextWatches: Watch[], nextPairCounts: Record<string, number>, nextLastPairKey: string | null): void => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ watches: nextWatches, pairCounts: nextPairCounts, lastPairKey: nextLastPairKey }),
    );
  };

  // Pair selection logic:
  // 1) Build every possible pair.
  // 2) Find the least-compared pair count.
  // 3) Randomly choose from those least-compared pairs.
  // 4) Avoid the exact same pair as the previous round when alternatives exist.
  const currentPair = useMemo<Pair>(() => {
    const allPairs: Pair[] = [];
    for (let i = 0; i < watches.length; i += 1) {
      for (let j = i + 1; j < watches.length; j += 1) {
        allPairs.push({ leftId: watches[i].id, rightId: watches[j].id });
      }
    }

    const withCounts = allPairs.map((pair) => ({ pair, key: pairKey(pair.leftId, pair.rightId), count: pairCounts[pairKey(pair.leftId, pair.rightId)] ?? 0 }));
    const minCount = Math.min(...withCounts.map((item) => item.count));
    let candidates = withCounts.filter((item) => item.count === minCount);

    const nonRepeatCandidates = candidates.filter((item) => item.key !== lastPairKey);
    if (nonRepeatCandidates.length > 0) {
      candidates = nonRepeatCandidates;
    }

    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    return choice.pair;
  }, [watches, pairCounts, lastPairKey]);

  const ranked = useMemo(() => getRankedWatches(watches), [watches]);
  const leader = ranked[0];

  const totalVotesCast = useMemo(() => watches.reduce((sum, watch) => sum + watch.totalVotes, 0) / 2, [watches]);

  const castVote = (winnerId: number, loserId: number): void => {
    const nextWatches = watches.map((watch) => {
      if (watch.id === winnerId) {
        const wins = watch.wins + 1;
        const totalVotes = watch.totalVotes + 1;
        return { ...watch, wins, totalVotes, score: wins - watch.losses };
      }
      if (watch.id === loserId) {
        const losses = watch.losses + 1;
        const totalVotes = watch.totalVotes + 1;
        return { ...watch, losses, totalVotes, score: watch.wins - losses };
      }
      return watch;
    });

    const key = pairKey(winnerId, loserId);
    const nextPairCounts = { ...pairCounts, [key]: (pairCounts[key] ?? 0) + 1 };

    // Scoring model is intentionally simple for now.
    // score = wins - losses
    setWatches(nextWatches);
    setPairCounts(nextPairCounts);
    setLastPairKey(key);
    setFlashId(winnerId);
    persist(nextWatches, nextPairCounts, key);

    window.setTimeout(() => setFlashId(null), 220);
  };

  const skipPair = (): void => {
    setLastPairKey(pairKey(currentPair.leftId, currentPair.rightId));
  };

  const resetVotes = (): void => {
    const confirmed = window.confirm('Reset all vote history and scores?');
    if (!confirmed) return;
    const resetWatches = createInitialWatches();
    setWatches(resetWatches);
    setPairCounts({});
    setLastPairKey(null);
    setFlashId(null);
    persist(resetWatches, {}, null);
  };

  const leftWatch = watches.find((watch) => watch.id === currentPair.leftId);
  const rightWatch = watches.find((watch) => watch.id === currentPair.rightId);

  if (!leftWatch || !rightWatch) {
    return <p>Unable to select a pair.</p>;
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1>Birthday Watch Battle</h1>
        <div className="controls">
          <button className="secondary" onClick={() => setShowOnlyLeaderboard((prev) => !prev)}>
            {showOnlyLeaderboard ? 'Show voting' : 'Show only leaderboard'}
          </button>
          <button className="danger" onClick={resetVotes}>Reset votes</button>
        </div>
      </header>

      <p className="progress">Total votes cast: <strong>{totalVotesCast}</strong></p>

      {!showOnlyLeaderboard && (
        <>
          <section className="voting-grid">
            <WatchCard watch={leftWatch} onChoose={() => castVote(leftWatch.id, rightWatch.id)} highlighted={leader?.id === leftWatch.id} flash={flashId === leftWatch.id} />
            <WatchCard watch={rightWatch} onChoose={() => castVote(rightWatch.id, leftWatch.id)} highlighted={leader?.id === rightWatch.id} flash={flashId === rightWatch.id} />
          </section>
          <div className="actions-row">
            <button className="secondary" onClick={skipPair}>Skip pair</button>
          </div>
        </>
      )}

      <Leaderboard watches={ranked} leaderId={leader?.id} />
    </div>
  );
};

const App = (): JSX.Element => <PairwiseVoting />;

export default App;
