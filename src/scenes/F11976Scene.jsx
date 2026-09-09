import React from 'react';
import * as THREE from 'three';
import { createF1CarMesh, createRainParticles, createCrowdParticles } from '../utils/Procedural3D';
import { audioEngine } from '../utils/AudioEngine';

export function setupF11976Scene(scene, camera, controls, onStateUpdate) {
  const sceneGroup = new THREE.Group();
  sceneGroup.name = 'f11976';
  scene.add(sceneGroup);

  // Atmospheric Heavy Downpour Lighting
  const ambient = new THREE.AmbientLight(0x7799bb, 0.95);
  sceneGroup.add(ambient);

  const directional = new THREE.DirectionalLight(0xbbddff, 1.2);
  directional.position.set(-15, 40, -25);
  directional.castShadow = true;
  sceneGroup.add(directional);

  // Wet Shiny Asphalt Track Ring
  const trackGeo = new THREE.RingGeometry(25, 46, 128);
  const trackMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.05, // Mirror wetness reflection
    metalness: 0.4,
  });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.rotation.x = -Math.PI / 2;
  track.position.y = 0.01;
  track.receiveShadow = true;
  sceneGroup.add(track);

  // Red & White Rumble Curbs
  const curbInnerGeo = new THREE.RingGeometry(24.0, 25.0, 128);
  const curbOuterGeo = new THREE.RingGeometry(46.0, 47.0, 128);
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3 });

  const curbInner = new THREE.Mesh(curbInnerGeo, curbMat);
  curbInner.rotation.x = -Math.PI / 2;
  curbInner.position.y = 0.02;
  sceneGroup.add(curbInner);

  const curbOuter = new THREE.Mesh(curbOuterGeo, curbMat);
  curbOuter.rotation.x = -Math.PI / 2;
  curbOuter.position.y = 0.02;
  sceneGroup.add(curbOuter);

  // Infield Wet Grass
  const infieldGeo = new THREE.CircleGeometry(24, 64);
  const infieldMat = new THREE.MeshStandardMaterial({ color: 0x142b1a, roughness: 0.8 });
  const infield = new THREE.Mesh(infieldGeo, infieldMat);
  infield.rotation.x = -Math.PI / 2;
  sceneGroup.add(infield);

  // Pit Wall & Sponsorship Hoardings
  const pitWallGeo = new THREE.BoxGeometry(0.9, 2.8, 36);
  const pitWallMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
  const pitWall = new THREE.Mesh(pitWallGeo, pitWallMat);
  pitWall.position.set(22.5, 1.4, 0);
  pitWall.castShadow = true;
  sceneGroup.add(pitWall);

  // McLaren M23 (James Hunt #11)
  const mclaren = createF1CarMesh(0xee1111, '11');
  mclaren.position.set(34.5, 0, 5);
  mclaren.rotation.y = Math.PI;
  sceneGroup.add(mclaren);

  // Ferrari 312T (Niki Lauda #1)
  const ferrari = createF1CarMesh(0xaa0000, '1');
  ferrari.position.set(36.5, 0, -2);
  ferrari.rotation.y = Math.PI;
  sceneGroup.add(ferrari);

  // Exhaust Flame Particle Mesh (Behind McLaren)
  const flameGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.8 });
  const exhaustFlame = new THREE.Mesh(flameGeo, flameMat);
  exhaustFlame.position.set(0, 0.4, -2.2);
  mclaren.add(exhaustFlame);

  // Torrential Rain System
  const rain = createRainParticles(5000);
  sceneGroup.add(rain);

  // Grandstand Crowd Particles
  const crowd = createCrowdParticles(50, 2500);
  sceneGroup.add(crowd);

  // Spectator Camera Setup
  camera.position.set(28, 4.5, 18);
  camera.lookAt(35, 1, 0);
  if (controls) controls.target.set(35, 1, 0);

  let carAngle = 0;
  let rpm = 0.5;
  let isRacing = true;
  let isCockpitView = false;

  audioEngine.startF1Engine();

  const updateFn = (delta, time) => {
    // Animate Rain Particles
    if (rain && rain.geometry.attributes.position) {
      const pos = rain.geometry.attributes.position.array;
      const vels = rain.userData.velocities;
      for (let i = 0; i < rain.userData.count; i++) {
        pos[i * 3 + 1] -= vels[i];
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 30 + Math.random() * 5;
      }
      rain.geometry.attributes.position.needsUpdate = true;
    }

    if (isRacing) {
      carAngle += delta * 0.48;
      rpm = 0.45 + Math.sin(time * 7) * 0.38 + 0.15;
      audioEngine.updateEngineRPM(rpm);

      // Flickering exhaust flame on high revs
      exhaustFlame.scale.setScalar(0.8 + Math.random() * 0.6);
      exhaustFlame.visible = rpm > 0.65;

      const rHunt = 34.8;
      const rLauda = 36.5;

      mclaren.position.x = Math.cos(carAngle) * rHunt;
      mclaren.position.z = Math.sin(carAngle) * rHunt;
      mclaren.rotation.y = -carAngle + Math.PI / 2;

      ferrari.position.x = Math.cos(carAngle - 0.14) * rLauda;
      ferrari.position.z = Math.sin(carAngle - 0.14) * rLauda;
      ferrari.rotation.y = -carAngle + 0.14 + Math.PI / 2;

      // Cockpit View Camera Follow
      if (isCockpitView) {
        const headX = mclaren.position.x + Math.sin(mclaren.rotation.y) * 0.2;
        const headZ = mclaren.position.z + Math.cos(mclaren.rotation.y) * 0.2;
        camera.position.set(headX, 0.98, headZ);

        const lookTarget = new THREE.Vector3(
          mclaren.position.x - Math.sin(mclaren.rotation.y) * 10,
          0.85,
          mclaren.position.z - Math.cos(mclaren.rotation.y) * 10
        );
        camera.lookAt(lookTarget);
      }

      if (onStateUpdate) {
        onStateUpdate({
          speed: Math.round(rpm * 295),
          lapTime: (time % 72).toFixed(1),
          rpm: Math.round(rpm * 11400),
        });
      }
    }
  };

  const toggleCockpitView = () => {
    isCockpitView = !isCockpitView;
    if (!isCockpitView) {
      camera.position.set(28, 4.5, 18);
      camera.lookAt(35, 1, 0);
      if (controls) controls.target.set(35, 1, 0);
    }
    audioEngine.speakCommentary(
      isCockpitView
        ? "Cockpit VR View active! Sitting inside James Hunt's McLaren M23 in Fuji's torrential rain."
        : "Trackside Spectator Camera active."
    );
    return isCockpitView;
  };

  const triggerRivalryOverhaul = () => {
    audioEngine.speakCommentary(
      "October 24, 1976. Fuji Speedway. Downpour! Niki Lauda voluntarily retires, declaring 'My life is worth more than a title.' James Hunt battles through to finish 3rd and win the World Championship by 1 point!"
    );
  };

  return {
    group: sceneGroup,
    update: updateFn,
    toggleCockpitView,
    triggerRivalryOverhaul,
    cleanup: () => {
      audioEngine.stopF1Engine();
      scene.remove(sceneGroup);
    },
  };
}
