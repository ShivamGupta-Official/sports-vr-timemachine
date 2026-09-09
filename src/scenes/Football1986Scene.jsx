import React from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  createFootballPitchTexture,
  createGoalPostsGroup,
  createCrowdParticles,
  create3DPlayerMesh,
  createFloodlightTower,
} from '../utils/Procedural3D';
import { audioEngine } from '../utils/AudioEngine';

export function setupFootball1986Scene(scene, camera, controls, onStateUpdate) {
  const sceneGroup = new THREE.Group();
  sceneGroup.name = 'football1986';
  scene.add(sceneGroup);

  // Mexico Sunshine Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  sceneGroup.add(ambient);

  const sun = new THREE.DirectionalLight(0xfffaed, 1.5);
  sun.position.set(35, 55, 25);
  sun.castShadow = true;
  sceneGroup.add(sun);

  // Stadium Floodlight Towers
  const towers = [
    [-30, 0, -40],
    [30, 0, -40],
    [-30, 0, 40],
    [30, 0, 40],
  ];
  towers.forEach(([x, y, z]) => {
    const tower = createFloodlightTower();
    tower.position.set(x, y, z);
    sceneGroup.add(tower);
  });

  // Pitch
  const pitchTex = createFootballPitchTexture();
  const pitchGeo = new THREE.PlaneGeometry(52, 72);
  const pitchMat = new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.6 });
  const pitch = new THREE.Mesh(pitchGeo, pitchMat);
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.y = 0.01;
  pitch.receiveShadow = true;
  sceneGroup.add(pitch);

  // Goals
  const goalNorth = createGoalPostsGroup();
  goalNorth.position.set(0, 0, -32.5);
  sceneGroup.add(goalNorth);

  const goalSouth = createGoalPostsGroup();
  goalSouth.position.set(0, 0, 32.5);
  goalSouth.rotation.y = Math.PI;
  sceneGroup.add(goalSouth);

  // Estadio Azteca Crowd Bowl
  const crowd = createCrowdParticles(40, 4500);
  sceneGroup.add(crowd);

  // Football Mesh (1986 Telstar)
  const ballGeo = new THREE.SphereGeometry(0.24, 24, 24);
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(0, 0.24, 0);
  ball.castShadow = true;
  sceneGroup.add(ball);

  // 3D Player Models: Diego Maradona (#10 Argentina)
  const maradona = create3DPlayerMesh({ shirtColor: 0x75aadb, shortsColor: 0x111111, numberStr: "10" });
  maradona.position.set(0, 0, 25.0);
  sceneGroup.add(maradona);

  // 5 England Defenders 3D Models
  const defenderPositions = [
    [2.2, 0, 15.0, 'Peter Beardsley'],
    [-1.8, 0, 6.0, 'Peter Reid'],
    [4.0, 0, -5.0, 'Terry Butcher'],
    [-2.2, 0, -18.0, 'Terry Fenwick'],
    [0.0, 0, -28.5, 'Peter Shilton (GK)'],
  ];

  defenderPositions.forEach(([x, y, z]) => {
    const def = create3DPlayerMesh({ shirtColor: 0xffffff, shortsColor: 0x002266, numberStr: "ENG" });
    def.position.set(x, y, z);
    sceneGroup.add(def);
  });

  // Maradona 60-meter Dribble Trajectory Curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.25, 25.0),
    new THREE.Vector3(3.5, 0.25, 15.0),
    new THREE.Vector3(-2.0, 0.25, 5.0),
    new THREE.Vector3(4.0, 0.25, -6.0),
    new THREE.Vector3(-1.8, 0.25, -19.0),
    new THREE.Vector3(1.2, 0.25, -27.5),
    new THREE.Vector3(0.0, 0.25, -31.8),
  ]);

  // Glowing Neon Golden Tube for Goal of Century Trajectory
  const tubeGeo = new THREE.TubeGeometry(curve, 96, 0.15, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffaa00,
    emissiveIntensity: 0.85,
    roughness: 0.1,
  });
  const trajectoryTube = new THREE.Mesh(tubeGeo, tubeMat);
  sceneGroup.add(trajectoryTube);

  // Initial Camera View
  camera.position.set(20, 18, 12);
  camera.lookAt(0, 0, -10);
  if (controls) controls.target.set(0, 0, -10);

  let dribbleProgress = 0;
  let isDribbling = false;

  const updateFn = (delta, time) => {
    if (crowd) crowd.rotation.y += 0.0003;

    if (isDribbling) {
      dribbleProgress += delta * 0.17;
      if (dribbleProgress > 1.0) {
        dribbleProgress = 1.0;
        isDribbling = false;
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        audioEngine.startCrowdRoar(1.0);
        audioEngine.speakCommentary(
          "GOOOOOAL! Diego Armando Maradona scores the Goal of the Century! Genius! Cosmic kite, what planet did you come from?!"
        );
        setTimeout(() => audioEngine.stopCrowdRoar(), 4000);
      }

      const pos = curve.getPointAt(dribbleProgress);
      ball.position.set(pos.x + Math.sin(time * 16) * 0.18, pos.y, pos.z);
      maradona.position.set(pos.x, 0, pos.z + 0.6);

      if (onStateUpdate) {
        onStateUpdate({
          distance: Math.round(dribbleProgress * 60),
          defendersPassed: Math.floor(dribbleProgress * 5),
          topSpeed: (28 + Math.sin(dribbleProgress * Math.PI) * 4).toFixed(1),
        });
      }
    }
  };

  const triggerMaradonaRun = () => {
    dribbleProgress = 0;
    isDribbling = true;
    audioEngine.speakCommentary(
      "Maradona receives in his own half... turns past Beardsley... leaves Reid behind... here goes Maradona!"
    );
  };

  const triggerVRKick = () => {
    audioEngine.playBallKick();
    ball.position.set(0, 1.2, -32.0);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    audioEngine.startCrowdRoar(0.9);
    audioEngine.speakCommentary("STRIKE! Rocketed right into the top corner!");
    setTimeout(() => audioEngine.stopCrowdRoar(), 3000);
  };

  return {
    group: sceneGroup,
    update: updateFn,
    triggerMaradonaRun,
    triggerVRKick,
    cleanup: () => { scene.remove(sceneGroup); },
  };
}
