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
  { id: 1, brand: 'Longines', model: 'HydroConquest', notes: 'Blue bezel, black dial, mesh bracelet', imageUrl: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.longines.com/en-nl/watches/sport/hydroconquest' },
  { id: 2, brand: 'Longines', model: 'Conquest', notes: 'Classic sport watch', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.longines.com/en-nl/watches/conquest' },
  { id: 3, brand: 'Oris', model: 'Aquis Date', notes: 'Modern dive watch profile', imageUrl: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.oris.ch/en-NL/collection/aquis' },
  { id: 4, brand: 'Tudor', model: 'Royal', notes: 'Blue dial', imageUrl: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.tudorwatch.com/en/watches/tudor-royal/m28600-0005' },
  { id: 5, brand: 'Christopher Ward', model: 'C1 Bel Canto', notes: 'Chiming complication design', imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.christopherward.com/int/watches/the-c1-bel-canto/C01-41APT2-T00B0-VB.html' },
  { id: 6, brand: 'Oris', model: 'Big Crown Pointer Date', notes: 'Pointer-date heritage styling', imageUrl: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.oris.ch/en-NL/collection/big-crown' },
  { id: 7, brand: 'Oris', model: 'ProPilot X Calibre 400', notes: 'Contemporary pilot watch', imageUrl: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.oris.ch/en-NL/collection/propilot-x' },
  { id: 8, brand: 'Omega', model: 'Seamaster Diver 300M', notes: 'Blue dial', imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.omegawatches.com/en-nl/watches/seamaster/diver-300-m' },
  { id: 9, brand: 'Omega', model: 'Seamaster Aqua Terra', notes: 'Blue dial', imageUrl: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.omegawatches.com/en-nl/watches/seamaster/aqua-terra-150m' },
  { id: 10, brand: 'Maurice Lacroix', model: 'AIKON Automatic', notes: 'Integrated bracelet sports style', imageUrl: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=80', productUrl: 'https://www.mauricelacroix.com/eu_en/watches/watches-aikon' },
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
