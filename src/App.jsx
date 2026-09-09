import React, { useState } from 'react';
import { VRCanvas } from './components/VRCanvas';
import { NavigationHUD } from './components/NavigationHUD';
import { RetroCRTFilter } from './components/RetroCRTFilter';
import './App.css';

export default function App() {
  const [activeMoment, setActiveMoment] = useState('cricket1983');
  const [activeScene, setActiveScene] = useState(null);
  const [isRetroCRT, setIsRetroCRT] = useState(false);
  const [sceneState, setSceneState] = useState({});

  return (
    <div className="app-container">
      {/* 3D WebXR VR Canvas Viewport */}
      <VRCanvas
        activeMoment={activeMoment}
        setActiveMoment={setActiveMoment}
        onSceneReady={(scene) => setActiveScene(scene)}
        onStateUpdate={(state) => setSceneState(state)}
      />

      {/* 1980s Retro TV Broadcast CRT Filter */}
      <RetroCRTFilter enabled={isRetroCRT} />

      {/* Glassmorphic Desktop/Mobile HUD */}
      <NavigationHUD
        activeMoment={activeMoment}
        setActiveMoment={setActiveMoment}
        activeScene={activeScene}
        isRetroCRT={isRetroCRT}
        setIsRetroCRT={setIsRetroCRT}
        sceneState={sceneState}
      />
    </div>
  );
}
