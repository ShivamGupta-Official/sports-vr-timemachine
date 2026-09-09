import React from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  createGrassTexture,
  createCricketPitchTexture,
  createCricketBallMesh,
  createCricketBatMesh,
  createWicketsGroup,
  createCrowdParticles,
  create3DPlayerMesh,
  createFloodlightTower,
} from '../utils/Procedural3D';
import { audioEngine } from '../utils/AudioEngine';

export function setupCricket1983Scene(scene, camera, controls, onStateUpdate) {
  const sceneGroup = new THREE.Group();
  sceneGroup.name = 'cricket1983';
  scene.add(sceneGroup);

  // Sunlight & Ambient
  const ambient = new THREE.AmbientLight(0xfff8ee, 0.85);
  sceneGroup.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff2d6, 1.4);
  sun.position.set(30, 50, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sceneGroup.add(sun);

  // 4 Floodlight Towers around Stadium
  const towerPositions = [
    [-45, 0, -45],
    [45, 0, -45],
    [-45, 0, 45],
    [45, 0, 45],
  ];
  towerPositions.forEach(([x, y, z]) => {
    const tower = createFloodlightTower();
    tower.position.set(x, y, z);
    sceneGroup.add(tower);
  });

  // Lord's Oval Grass Ground
  const grassTex = createGrassTexture();
  grassTex.repeat.set(12, 12);
  const groundGeo = new THREE.CylinderGeometry(52, 52, 0.4, 64);
  const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.7 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.2;
  ground.receiveShadow = true;
  sceneGroup.add(ground);

  // Pitch
  const pitchTex = createCricketPitchTexture();
  const pitchGeo = new THREE.PlaneGeometry(3.2, 20.12);
  const pitchMat = new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.5 });
  const pitch = new THREE.Mesh(pitchGeo, pitchMat);
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.y = 0.01;
  pitch.receiveShadow = true;
  sceneGroup.add(pitch);

  // Wickets
  const wicketsStriker = createWicketsGroup();
  wicketsStriker.position.set(0, 0, 10.06);
  sceneGroup.add(wicketsStriker);

  const wicketsBowler = createWicketsGroup();
  wicketsBowler.position.set(0, 0, -10.06);
  wicketsBowler.rotation.y = Math.PI;
  sceneGroup.add(wicketsBowler);

  // Detailed Lord's Victorian Pavilion
  const pavGroup = new THREE.Group();
  const pavBodyGeo = new THREE.BoxGeometry(32, 10, 8);
  const pavMat = new THREE.MeshStandardMaterial({ color: 0xaa4433, roughness: 0.6 });
  const pavBody = new THREE.Mesh(pavBodyGeo, pavMat);
  pavBody.position.set(0, 5, -50);
  pavBody.castShadow = true;
  pavGroup.add(pavBody);

  // White Balcony Tier
  const balconyGeo = new THREE.BoxGeometry(34, 1.2, 2.5);
  const balconyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const balcony = new THREE.Mesh(balconyGeo, balconyMat);
  balcony.position.set(0, 6.5, -46);
  pavGroup.add(balcony);

  // Clock Tower Roof
  const roofGeo = new THREE.ConeGeometry(12, 6, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x225533, roughness: 0.4 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 13, -50);
  pavGroup.add(roof);

  sceneGroup.add(pavGroup);

  // Boundary Rope Ring
  const ropeGeo = new THREE.TorusGeometry(47, 0.3, 16, 64);
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const rope = new THREE.Mesh(ropeGeo, ropeMat);
  rope.rotation.x = Math.PI / 2;
  rope.position.y = 0.1;
  sceneGroup.add(rope);

  // Stadium Crowd
  const crowd = createCrowdParticles(48, 4000);
  sceneGroup.add(crowd);

  // Cricket Ball & Bat
  const ball = createCricketBallMesh();
  ball.position.set(0, 1.2, -9.5);
  sceneGroup.add(ball);

  const bat = createCricketBatMesh();
  bat.position.set(0.45, 0.3, 9.6);
  bat.rotation.y = -Math.PI / 5;
  sceneGroup.add(bat);

  // 3D Player Models (Kapil Dev, Viv Richards, Bowler Madan Lal)
  const kapilDev = create3DPlayerMesh({ shirtColor: 0x0033aa, shortsColor: 0xffffff, numberStr: "Kapil" });
  kapilDev.position.set(4, 0, 14);
  sceneGroup.add(kapilDev);

  const vivRichards = create3DPlayerMesh({ shirtColor: 0xaa0000, shortsColor: 0xffffff, numberStr: "Viv" });
  vivRichards.position.set(0, 0, 9.8);
  sceneGroup.add(vivRichards);

  // Camera initial position
  camera.position.set(0, 12, 26);
  camera.lookAt(0, 1, 0);
  if (controls) controls.target.set(0, 1, 0);

  let timelineProgress = 0;
  let isBowling = false;
  let scoreCount = 0;
  let ballsFaced = 0;

  const updateFn = (delta, time) => {
    if (crowd) crowd.rotation.y += 0.0004;

    if (isBowling) {
      timelineProgress += delta * 1.1;

      if (timelineProgress <= 1.0) {
        const t = timelineProgress;
        const z = -9.5 + t * 19.3;
        const y = 1.2 + Math.sin(t * Math.PI) * 1.5;
        ball.position.set(0, y, z);
      } else if (timelineProgress > 1.0 && timelineProgress < 2.6) {
        const t = (timelineProgress - 1.0) / 1.6;
        const z = 9.8 + t * 15.0;
        const x = t * 14.0;
        const y = 1.5 + Math.sin(t * Math.PI) * 16.0;
        ball.position.set(x, y, z);

        kapilDev.position.set(2.0 + t * 11.0, 0, 8.0 + t * 16.0);
      } else if (timelineProgress >= 2.6) {
        isBowling = false;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        audioEngine.startCrowdRoar(0.9);
        audioEngine.speakCommentary("UNBELIEVABLE CATCH! Kapil Dev runs 25 yards backwards to take the catch of the century!");
        setTimeout(() => audioEngine.stopCrowdRoar(), 4000);
      }
    }
  };

  const triggerKapilCatch = () => {
    timelineProgress = 0;
    isBowling = true;
    audioEngine.speakCommentary("Madan Lal bowls... Viv Richards hooks high into the London sky!");
  };

  const triggerBattingSwing = () => {
    audioEngine.playBatHit();
    scoreCount += 6;
    ballsFaced += 1;
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    audioEngine.startCrowdRoar(1.0);
    audioEngine.speakCommentary("MONSTER SHOT! Launched high into the Grandstand for SIX!");
    if (onStateUpdate) onStateUpdate({ score: scoreCount, balls: ballsFaced });
    setTimeout(() => audioEngine.stopCrowdRoar(), 3000);
  };

  return {
    group: sceneGroup,
    update: updateFn,
    triggerKapilCatch,
    triggerBattingSwing,
    cleanup: () => { scene.remove(sceneGroup); },
  };
}
