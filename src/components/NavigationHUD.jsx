import React, { useState } from 'react';
import {
  Trophy,
  Gauge,
  Radio,
  Tv,
  Volume2,
  VolumeX,
  Play,
  Crosshair,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../utils/AudioEngine';

export function NavigationHUD({
  activeMoment,
  setActiveMoment,
  activeScene,
  isRetroCRT,
  setIsRetroCRT,
  sceneState,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [showFactModal, setShowFactModal] = useState(false);

  const moments = [
    {
      id: 'cricket1983',
      title: '1983 Cricket World Cup Final',
      subtitle: "India vs West Indies - Lord's",
      date: 'June 25, 1983',
      icon: Trophy,
      badge: 'CRICKET',
      color: '#4facfe',
    },
    {
      id: 'f11976',
      title: '1976 F1 World Championship',
      subtitle: 'Hunt vs Lauda Fuji Downpour',
      date: 'October 24, 1976',
      icon: Gauge,
      badge: 'FORMULA 1',
      color: '#ff4b2b',
    },
    {
      id: 'football1986',
      title: "1986 World Cup: Goal of Century",
      subtitle: 'Maradona vs England Azteca',
      date: 'June 22, 1986',
      icon: Sparkles,
      badge: 'FOOTBALL',
      color: '#ffd700',
    },
  ];

  const currentMomentInfo = moments.find((m) => m.id === activeMoment);

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    audioEngine.setMuted(nextState);
  };

  return (
    <div className="hud-container">
      {/* Top Glass Header */}
      <header className="hud-header">
        <div className="brand-logo">
          <div className="time-vault-badge">
            <Radio className="pulse-icon" size={18} />
            <span>TIMEVAULT VR</span>
          </div>
          <span className="live-year-tag">HISTORIC REPLAY ARCHIVE</span>
        </div>

        {/* Moment Cards Selector */}
        <div className="moment-selector">
          {moments.map((moment) => {
            const IconComp = moment.icon;
            const isActive = activeMoment === moment.id;
            return (
              <button
                key={moment.id}
                className={`moment-card ${isActive ? 'active' : ''}`}
                onClick={() => {
                  audioEngine.stopAll();
                  setActiveMoment(moment.id);
                }}
                style={{ '--card-accent': moment.color }}
              >
                <div className="card-badge">{moment.badge}</div>
                <div className="card-content">
                  <IconComp size={18} />
                  <span className="card-title">{moment.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="header-actions">
          <button
            className={`hud-btn ${isRetroCRT ? 'active-gold' : ''}`}
            onClick={() => setIsRetroCRT(!isRetroCRT)}
            title="Toggle 1980s Retro Broadcast CRT Filter"
          >
            <Tv size={18} />
            <span>{isRetroCRT ? '1980s TV: ON' : 'HD VR: ON'}</span>
          </button>

          <button className="hud-btn" onClick={toggleMute} title="Audio Mute Toggle">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            className="hud-btn"
            onClick={() => setShowFactModal(true)}
            title="Match History & Stats"
          >
            <Info size={18} />
          </button>
        </div>
      </header>

      {/* Center Scene Title & Interactive HUD Controls */}
      <div className="scene-overlay-hud">
        <div className="scene-meta-box">
          <div className="meta-date">{currentMomentInfo?.date}</div>
          <h1 className="meta-title">{currentMomentInfo?.title}</h1>
          <p className="meta-subtitle">{currentMomentInfo?.subtitle}</p>

          {/* Real-time Scene Telemetry Bar */}
          <div className="telemetry-bar">
            {activeMoment === 'cricket1983' && (
              <>
                <div className="tele-item">
                  <span className="tele-label">Runs Scored:</span>
                  <span className="tele-val">{sceneState.score || 0}</span>
                </div>
                <div className="tele-item">
                  <span className="tele-label">Deliveries:</span>
                  <span className="tele-val">{sceneState.balls || 0}</span>
                </div>
                <div className="tele-item">
                  <span className="tele-label">Target:</span>
                  <span className="tele-val">183 to Win</span>
                </div>
              </>
            )}

            {activeMoment === 'f11976' && (
              <>
                <div className="tele-item">
                  <span className="tele-label">Engine RPM:</span>
                  <span className="tele-val">{sceneState.rpm || 9400}</span>
                </div>
                <div className="tele-item">
                  <span className="tele-label">Top Speed:</span>
                  <span className="tele-val">{sceneState.speed || 240} km/h</span>
                </div>
                <div className="tele-item">
                  <span className="tele-label">Weather:</span>
                  <span className="tele-val warning">Heavy Rain</span>
                </div>
              </>
            )}

            {activeMoment === 'football1986' && (
              <>
                <div className="tele-item">
                  <span className="tele-label">Dribble Dist:</span>
                  <span className="tele-val">{sceneState.distance || 0}m / 60m</span>
                </div>
                <div className="tele-item">
                  <span className="tele-label">Defenders Beaten:</span>
                  <span className="tele-val">{sceneState.defendersPassed || 0} / 5</span>
                </div>
                <div className="tele-item">
                  <span className="tele-label">Stadium Roar:</span>
                  <span className="tele-val">114,000</span>
                </div>
              </>
            )}
          </div>

          {/* Interactive Replay Action Buttons */}
          <div className="scene-action-buttons">
            {activeMoment === 'cricket1983' && (
              <>
                <button
                  className="action-btn primary"
                  onClick={() => activeScene && activeScene.triggerKapilCatch && activeScene.triggerKapilCatch()}
                >
                  <Play size={18} />
                  <span>Replay Kapil Dev Catch</span>
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => activeScene && activeScene.triggerBattingSwing && activeScene.triggerBattingSwing()}
                >
                  <Crosshair size={18} />
                  <span>Swing Bat (Batting POV)</span>
                </button>
              </>
            )}

            {activeMoment === 'f11976' && (
              <>
                <button
                  className="action-btn primary"
                  onClick={() => activeScene && activeScene.toggleCockpitView && activeScene.toggleCockpitView()}
                >
                  <Layers size={18} />
                  <span>Toggle Cockpit VR POV</span>
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => activeScene && activeScene.triggerRivalryOverhaul && activeScene.triggerRivalryOverhaul()}
                >
                  <Radio size={18} />
                  <span>Play Rivalry Commentary</span>
                </button>
              </>
            )}

            {activeMoment === 'football1986' && (
              <>
                <button
                  className="action-btn primary"
                  onClick={() => activeScene && activeScene.triggerMaradonaRun && activeScene.triggerMaradonaRun()}
                >
                  <Play size={18} />
                  <span>Play 60m Goal of Century Run</span>
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => activeScene && activeScene.triggerVRKick && activeScene.triggerVRKick()}
                >
                  <Crosshair size={18} />
                  <span>Kick Penalty (Striker VR)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Match History Info Drawer Modal */}
      {showFactModal && (
        <div className="fact-modal-backdrop" onClick={() => setShowFactModal(false)}>
          <div className="fact-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{currentMomentInfo?.title}</h2>
            <p className="fact-subtitle">{currentMomentInfo?.date} - Historic Archives</p>

            {activeMoment === 'cricket1983' && (
              <div className="fact-body">
                <p>
                  <strong>The Miracle of Lord's:</strong> Defending champions West Indies were heavily favored to win their 3rd consecutive World Cup. India scored 183 runs. During the chase, Viv Richards was tearing through the Indian bowling.
                </p>
                <p>
                  Captain Kapil Dev ran backwards 25 yards under immense pressure to take a extraordinary running catch over his shoulder off Madan Lal's bowling. India bowled out West Indies for 140, winning by 43 runs and changing cricket history forever.
                </p>
              </div>
            )}

            {activeMoment === 'f11976' && (
              <div className="fact-body">
                <p>
                  <strong>The Duel in the Rain:</strong> Just 6 weeks after surviving a near-fatal fiery crash at Nürburgring, Niki Lauda returned to fight James Hunt for the World Championship at Fuji Speedway in torrential rain.
                </p>
                <p>
                  Conditions were so hazardous that Lauda voluntarily retired on lap 2. James Hunt drove a heroic recovery drive to finish 3rd in his McLaren M23, securing the title by 1 point in one of motorsport's greatest sagas.
                </p>
              </div>
            )}

            {activeMoment === 'football1986' && (
              <div className="fact-body">
                <p>
                  <strong>The Goal of the Century:</strong> In the World Cup Quarter-Final at Estadio Azteca, Diego Maradona received the ball in his own half and embarked on an unbelievable 60-meter dribble.
                </p>
                <p>
                  In just 10.8 seconds, he bypassed 5 English players (Beardsley, Reid, Butcher, Fenwick, and goalkeeper Peter Shilton) to score what FIFA officially voted as the greatest goal in World Cup history.
                </p>
              </div>
            )}

            <button className="close-fact-btn" onClick={() => setShowFactModal(false)}>
              Close Replay Factbook
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
