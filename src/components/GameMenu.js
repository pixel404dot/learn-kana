import React, { useMemo, useState } from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'
import ProgressStatsModal from './ProgressStatsModal'
import { Link } from "react-router-dom";

function getWeakKanasFromStats(limit = 8) {
  let userStats = {};
  try {
    userStats = JSON.parse(localStorage.getItem('userStats') || '{}') || {};
  } catch (e) {
    return [];
  }
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const cutoff = thirtyDaysAgo.getTime();
  const scored = [];
  for (const kana in userStats) {
    const stats = userStats[kana];
    if (!stats || !stats.dailyPerformance) continue;
    let right = 0, wrong = 0, help = 0, timeSum = 0;
    stats.dailyPerformance.forEach((d) => {
      if (d.date < cutoff) return;
      right += d.rightGuesses || 0;
      wrong += d.wrongGuesses || 0;
      help += d.askForHelpCounter || 0;
      timeSum += d.responseTimeSum || 0;
    });
    const attempts = right + wrong + help;
    if (attempts < 2) continue;
    const errorRate = (wrong + help) / attempts;
    const avgTime = right > 0 ? timeSum / right : 0;
    scored.push({
      kana,
      score: errorRate * 100 + (avgTime / 1000) * 2,
      avgTime: avgTime / 1000,
    });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export default function GameMenu() {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const weakKanas = useMemo(() => getWeakKanasFromStats(8), []);

  if(localStorage.getItem('checkedKanas') === null) {
    localStorage.setItem('checkedKanas', JSON.stringify(["あ"]))
  }

  const handleButtonClick = () => {
    const checkboxes = document.querySelectorAll('.kana-checkbox');
    const checkedChars = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedChars.push(checkbox.id);
      }
    });

    // Save result to local storage
    localStorage.setItem('checkedKanas', JSON.stringify(checkedChars));

  };

  return (
    <div className='game-menu-page'>
      <h2 id='game-menu-title'>Select a group to learn</h2>
      <div className='kana-group-selector'>
        <KanaGroup groupToShow="hiragana" />
        <KanaGroup groupToShow="katakana" />
      </div>
      {weakKanas.length > 0 && (
        <section className='weak-kana-menu-section'>
          <h2>Weak kana practice</h2>
          <p className='weak-kana-menu-copy'>
            Based on recent misses and slow answers. Jump straight into a focused drill.
          </p>
          <div className='weak-kana-chips'>
            {weakKanas.map((row) => (
              <div className='weak-kana-chip' key={row.kana}>
                <span className='char'>{row.kana}</span>
                <span className='time'>{row.avgTime > 0 ? row.avgTime.toFixed(1) + 's' : '—'}</span>
              </div>
            ))}
          </div>
          <button
            className='glowButton weak-kana-start'
            onClick={() => {
              handleButtonClick();
              localStorage.setItem(
                'problematicKanasFilter',
                JSON.stringify(weakKanas.map((w) => w.kana))
              );
              window.location.href = '/learn-kana∕game';
            }}
          >
            Drill weak kana
          </button>
        </section>
      )}
      <div className='game-mode-selector'>
        <GameModeSelector />
        <Link to='/learn-kana∕game'>
          <button className='glowButton' onClick={() => {
            localStorage.removeItem('problematicKanasFilter');
            handleButtonClick();
          }}>Let's start!</button>
        </Link>
      </div>
      <button className='neoButton stats-button-floating' onClick={() => setShowStatsModal(true)} title='View Progress Stats'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-6h2v16h-2V5z"/>
        </svg>
      </button>
      <ProgressStatsModal visible={showStatsModal} onClose={() => setShowStatsModal(false)} />
    </div>
  )
}
