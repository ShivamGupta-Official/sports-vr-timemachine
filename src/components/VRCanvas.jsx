import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { setupCricket1983Scene } from '../scenes/Cricket1983Scene';
import { setupF11976Scene } from '../scenes/F11976Scene';
import { setupFootball1986Scene } from '../scenes/Football1986Scene';
import { audioEngine } from '../utils/AudioEngine';

export function VRCanvas({ activeMoment, onSceneReady, onStateUpdate, setActiveMoment }) {
  const mountRef = useRef(null);
  const activeSceneInstanceRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060810);
    scene.fog = new THREE.FogExp2(0x060810, 0.012);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    // VR Camera Dolly Rig for 6DOF VR Headset Navigation
    const cameraRig = new THREE.Group();
    cameraRig.name = 'VR_Camera_Rig';
    cameraRig.add(camera);
    scene.add(cameraRig);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 2. WebXR Hardware Feature Configuration
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    container.appendChild(renderer.domElement);

    // VRButton with extended WebXR sessionInit options
    const vrButton = VRButton.createButton(renderer, {
      sessionInit: {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      },
    });

    vrButton.style.position = 'absolute';
    vrButton.style.bottom = '24px';
    vrButton.style.left = '50%';
    vrButton.style.transform = 'translateX(-50%)';
    vrButton.style.zIndex = '99';
    vrButton.style.padding = '16px 32px';
    vrButton.style.background = 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
    vrButton.style.color = '#000000';
    vrButton.style.fontWeight = '900';
    vrButton.style.fontSize = '1.05rem';
    vrButton.style.border = '2px solid rgba(255, 255, 255, 0.8)';
    vrButton.style.borderRadius = '35px';
    vrButton.style.boxShadow = '0 0 35px rgba(0, 242, 254, 0.8)';
    vrButton.style.cursor = 'pointer';
    vrButton.style.letterSpacing = '1px';
    container.appendChild(vrButton);

    // 3. WebXR Dual 6DOF Controllers & Laser Pointers
    const controllerModelFactory = new XRControllerModelFactory();

    // Left VR Controller (Controller 0)
    const controller0 = renderer.xr.getController(0);
    const controllerGrip0 = renderer.xr.getControllerGrip(0);
    controllerGrip0.add(controllerModelFactory.createControllerModel(controllerGrip0));
    cameraRig.add(controller0);
    cameraRig.add(controllerGrip0);

    // Right VR Controller (Controller 1)
    const controller1 = renderer.xr.getController(1);
    const controllerGrip1 = renderer.xr.getControllerGrip(1);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    cameraRig.add(controller1);
    cameraRig.add(controllerGrip1);

    // Laser Ray Lines for VR Pointing & Selecting
    const rayGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -6),
    ]);
    const rayMat = new THREE.LineBasicMaterial({ color: 0x00f2fe, linewidth: 3 });

    const laser0 = new THREE.Line(rayGeo, rayMat);
    controller0.add(laser0);

    const laser1 = new THREE.Line(rayGeo, rayMat);
    controller1.add(laser1);

    // 4. In-VR 3D Spatial Floating Menu (Renders inside Headset)
    const vrMenuPanel = new THREE.Group();
    vrMenuPanel.position.set(0, 1.4, -1.8);
    cameraRig.add(vrMenuPanel);

    // Panel Backplate
    const panelGeo = new THREE.PlaneGeometry(1.6, 0.9);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    vrMenuPanel.add(panel);

    // Border Frame
    const frameGeo = new THREE.BoxGeometry(1.64, 0.94, 0.02);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, emissive: 0x00aacc, emissiveIntensity: 0.4 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -0.01;
    vrMenuPanel.add(frame);

    // Interactive 3D VR Menu Buttons
    const vrButtonsGroup = new THREE.Group();
    vrMenuPanel.add(vrButtonsGroup);

    const btnConfigs = [
      { id: 'cricket1983', label: '1983 CRICKET', x: -0.5, y: 0.15, color: 0x4facfe },
      { id: 'f11976', label: '1976 F1 FUJI', x: 0.0, y: 0.15, color: 0xff4b2b },
      { id: 'football1986', label: '1986 AZTECA', x: 0.5, y: 0.15, color: 0xffd700 },
      { id: 'action', label: '▶ REPLAY ACTION', x: 0.0, y: -0.22, color: 0x00f2fe },
    ];

    const vrButtonMeshes = [];
    btnConfigs.forEach((cfg) => {
      const bGeo = new THREE.BoxGeometry(cfg.id === 'action' ? 1.3 : 0.45, 0.22, 0.04);
      const bMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.3,
        metalness: 0.5,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(cfg.x, cfg.y, 0.03);
      bMesh.userData = { id: cfg.id };
      vrButtonsGroup.add(bMesh);
      vrButtonMeshes.push(bMesh);
    });

    // Raycaster for VR Controller Clicks
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();

    const handleVRSelect = (event) => {
      const controller = event.target;
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      const intersects = raycaster.intersectObjects(vrButtonMeshes);
      if (intersects.length > 0) {
        const hitBtn = intersects[0].object;
        const targetId = hitBtn.userData.id;
        audioEngine.playBatHit();

        if (targetId === 'action') {
          const sc = activeSceneInstanceRef.current;
          if (sc) {
            if (sc.triggerKapilCatch) sc.triggerKapilCatch();
            if (sc.toggleCockpitView) sc.toggleCockpitView();
            if (sc.triggerMaradonaRun) sc.triggerMaradonaRun();
          }
        } else {
          setActiveMoment(targetId);
        }
      }
    };

    controller0.addEventListener('selectstart', handleVRSelect);
    controller1.addEventListener('selectstart', handleVRSelect);

    // 5. Post-Processing Bloom & Desktop OrbitControls
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.45,
        0.4,
        0.85
      )
    );
    composer.addPass(new OutputPass());

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;

    // Load Moment Scene
    let activeScene = null;
    const loadMomentScene = (momentId) => {
      if (activeScene && activeScene.cleanup) activeScene.cleanup();

      if (momentId === 'cricket1983') {
        activeScene = setupCricket1983Scene(scene, camera, controls, onStateUpdate);
      } else if (momentId === 'f11976') {
        activeScene = setupF11976Scene(scene, camera, controls, onStateUpdate);
      } else if (momentId === 'football1986') {
        activeScene = setupFootball1986Scene(scene, camera, controls, onStateUpdate);
      }

      activeSceneInstanceRef.current = activeScene;
      if (onSceneReady) onSceneReady(activeScene);
    };

    loadMomentScene(activeMoment);

    // Clock & Render Loop
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (activeScene && activeScene.update) {
        activeScene.update(delta, time);
      }

      // Show floating VR Menu inside headset, hide on desktop 2D
      vrMenuPanel.visible = renderer.xr.isPresenting;

      if (!renderer.xr.isPresenting) {
        controls.update();
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    });

    // Resize Listener
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      controller0.removeEventListener('selectstart', handleVRSelect);
      controller1.removeEventListener('selectstart', handleVRSelect);
      renderer.setAnimationLoop(null);
      if (activeScene && activeScene.cleanup) activeScene.cleanup();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      if (container.contains(vrButton)) container.removeChild(vrButton);
    };
  }, [activeMoment]);

  return <div ref={mountRef} className="vr-canvas-container" />;
}
