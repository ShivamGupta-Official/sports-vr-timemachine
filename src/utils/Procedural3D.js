import * as THREE from 'three';

// --- ADVANCED PROCEDURAL CANVAS TEXTURES ---

export function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Rich organic grass gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#1b4332');
  grad.addColorStop(0.5, '#2d6a4f');
  grad.addColorStop(1, '#1b4332');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Professional striped lawn pattern (Mower stripes)
  const stripeWidth = 64;
  for (let i = 0; i < 1024; i += stripeWidth * 2) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fillRect(i, 0, stripeWidth, 1024);
  }

  // Realistic grass blade texture noise
  for (let i = 0; i < 60000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = 4 + Math.random() * 8;
    const alpha = 0.15 + Math.random() * 0.2;
    const shade = Math.floor(Math.random() * 60);
    ctx.strokeStyle = `rgba(${30 + shade}, ${110 + shade}, ${60 + shade}, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 4, y - len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createCricketPitchTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Hard dry clay soil pitch texture
  const grad = ctx.createLinearGradient(0, 0, 512, 1024);
  grad.addColorStop(0, '#d4a373');
  grad.addColorStop(0.5, '#e9c46a');
  grad.addColorStop(1, '#d4a373');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Wear & tear footmarks near crease
  ctx.fillStyle = 'rgba(180, 130, 90, 0.4)';
  ctx.beginPath();
  ctx.ellipse(256, 140, 60, 40, 0, 0, Math.PI * 2);
  ctx.ellipse(256, 884, 60, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // White Crease Markings
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.lineWidth = 10;

  // Popping Crease
  ctx.beginPath();
  ctx.moveTo(40, 140);
  ctx.lineTo(472, 140);
  ctx.moveTo(40, 884);
  ctx.lineTo(472, 884);
  ctx.stroke();

  // Bowling Crease
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(120, 80);
  ctx.lineTo(120, 180);
  ctx.moveTo(392, 80);
  ctx.lineTo(392, 180);
  ctx.moveTo(120, 824);
  ctx.lineTo(120, 924);
  ctx.moveTo(392, 824);
  ctx.lineTo(392, 924);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createFootballPitchTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Pitch Base
  ctx.fillStyle = '#1b4d3e';
  ctx.fillRect(0, 0, 1024, 1024);

  // Mowed Lawn Checker/Stripe Pattern
  for (let i = 0; i < 1024; i += 128) {
    if ((i / 128) % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(0, i, 1024, 128);
    }
  }

  // Crisp White Lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 6;

  // Boundary
  ctx.strokeRect(50, 50, 924, 924);

  // Halfway Line
  ctx.beginPath();
  ctx.moveTo(50, 512);
  ctx.lineTo(974, 512);
  ctx.stroke();

  // Center Circle & Spot
  ctx.beginPath();
  ctx.arc(512, 512, 140, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(512, 512, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Penalty Boxes (Top & Bottom)
  ctx.strokeRect(262, 50, 500, 220);
  ctx.strokeRect(262, 754, 500, 220);

  // Goal Boxes
  ctx.strokeRect(387, 50, 250, 80);
  ctx.strokeRect(387, 894, 250, 80);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// --- DETAILED 3D MESH BUILDERS ---

// High-Detail 3D Player Avatar with Jersey & Limbs
export function create3DPlayerMesh({ shirtColor = 0x0033aa, shortsColor = 0xffffff, numberStr = "10" }) {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.4 });
  const shortsMat = new THREE.MeshStandardMaterial({ color: shortsColor, roughness: 0.5 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.5 });

  // Torso / Jersey
  const torsoGeo = new THREE.BoxGeometry(0.55, 0.7, 0.3);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 1.25;
  torso.castShadow = true;
  group.add(torso);

  // Head & Hair
  const headGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.75;
  head.castShadow = true;
  group.add(head);

  const hairGeo = new THREE.SphereGeometry(0.17, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x221100, roughness: 0.8 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 1.76, 0);
  group.add(hair);

  // Shorts
  const shortsGeo = new THREE.BoxGeometry(0.58, 0.35, 0.32);
  const shorts = new THREE.Mesh(shortsGeo, shortsMat);
  shorts.position.y = 0.85;
  shorts.castShadow = true;
  group.add(shorts);

  // Left & Right Legs
  const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 12);
  const leftLeg = new THREE.Mesh(legGeo, skinMat);
  leftLeg.position.set(-0.16, 0.38, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.set(0.16, 0.38, 0);
  group.add(rightLeg);

  // Cleats / Shoes
  const shoeGeo = new THREE.BoxGeometry(0.12, 0.1, 0.28);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(-0.16, 0.05, 0.05);
  group.add(leftShoe);

  const rightShoe = leftShoe.clone();
  rightShoe.position.set(0.16, 0.05, 0.05);
  group.add(rightShoe);

  // Left & Right Arms
  const armGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.65, 12);
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.35, 1.25, 0);
  leftArm.rotation.z = 0.2;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(0.35, 1.25, 0);
  rightArm.rotation.z = -0.2;
  group.add(rightArm);

  return group;
}

// 3D Stadium Floodlight Tower Generator (Glowing volumetric lamps!)
export function createFloodlightTower() {
  const group = new THREE.Group();

  // Steel Truss Tower
  const towerGeo = new THREE.CylinderGeometry(0.4, 0.9, 24, 8);
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x334455,
    metalness: 0.8,
    roughness: 0.3,
    wireframe: false,
  });
  const tower = new THREE.Mesh(towerGeo, steelMat);
  tower.position.y = 12;
  tower.castShadow = true;
  group.add(tower);

  // Light Fixture Grid Rack
  const rackGeo = new THREE.BoxGeometry(6, 3, 0.8);
  const rack = new THREE.Mesh(rackGeo, steelMat);
  rack.position.set(0, 24, 0);
  group.add(rack);

  // Glowing Floodlight Bulb Arrays (4x3 matrix)
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffffdd,
    transparent: true,
    opacity: 0.6,
  });

  for (let row = -1; row <= 1; row++) {
    for (let col = -2; col <= 2; col++) {
      const bulbGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(col * 1.1, 24 + row * 0.9, 0.4);
      group.add(bulb);

      // Light beam flare halo
      const haloGeo = new THREE.SphereGeometry(0.65, 16, 16);
      const halo = new THREE.Mesh(haloGeo, glowMat);
      halo.position.set(col * 1.1, 24 + row * 0.9, 0.5);
      group.add(halo);
    }
  }

  // SpotLight beam pointing down into pitch
  const spotLight = new THREE.SpotLight(0xfffaed, 2.5);
  spotLight.position.set(0, 24, 0.5);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.6;
  spotLight.castShadow = true;
  group.add(spotLight);

  return group;
}

// High-Detail 3D Leather Cricket Ball
export function createCricketBallMesh() {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.14, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x990000,
    roughness: 0.2, // Shiny polished leather
    metalness: 0.15,
  });
  const ball = new THREE.Mesh(geometry, material);
  ball.castShadow = true;
  group.add(ball);

  // Stitched Seam (Torus)
  const seamGeo = new THREE.TorusGeometry(0.141, 0.007, 16, 64);
  const seamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const seam = new THREE.Mesh(seamGeo, seamMat);
  group.add(seam);

  return group;
}

// High-Detail 3D Cricket Bat
export function createCricketBatMesh() {
  const batGroup = new THREE.Group();

  // Bat Blade
  const bladeGeo = new THREE.BoxGeometry(0.14, 0.95, 0.06);
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.3, // Polished English Willow
    metalness: 0.05,
  });
  const blade = new THREE.Mesh(bladeGeo, woodMat);
  blade.position.y = 0.47;
  blade.castShadow = true;
  batGroup.add(blade);

  // Colored Sticker Label on Bat Face
  const stickerGeo = new THREE.PlaneGeometry(0.12, 0.4);
  const stickerMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.2 });
  const sticker = new THREE.Mesh(stickerGeo, stickerMat);
  sticker.position.set(0, 0.55, 0.032);
  batGroup.add(sticker);

  // Rubber Grip Handle
  const handleGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.4, 16);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = 1.05;
  batGroup.add(handle);

  return batGroup;
}

export function createWicketsGroup() {
  const group = new THREE.Group();
  const stumpMat = new THREE.MeshStandardMaterial({ color: 0xe6ccb2, roughness: 0.3 });
  const bailMat = new THREE.MeshStandardMaterial({ color: 0xddb892, roughness: 0.3 });

  for (let i = -1; i <= 1; i++) {
    const stumpGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.76, 16);
    const stump = new THREE.Mesh(stumpGeo, stumpMat);
    stump.position.set(i * 0.11, 0.38, 0);
    stump.castShadow = true;
    group.add(stump);
  }

  const bailGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.13, 12);
  const bail1 = new THREE.Mesh(bailGeo, bailMat);
  bail1.rotation.z = Math.PI / 2;
  bail1.position.set(-0.055, 0.77, 0);
  group.add(bail1);

  const bail2 = bail1.clone();
  bail2.position.set(0.055, 0.77, 0);
  group.add(bail2);

  return group;
}

// Ultra High-Detail 1976 F1 Racing Car (McLaren M23 / Ferrari 312T)
export function createF1CarMesh(colorHex = 0xcc0000, numberText = "1") {
  const carGroup = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.7,
    roughness: 0.25, // Glossy metallic paint finish
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    metalness: 0.95,
    roughness: 0.1,
  });

  const blackMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.8 });

  // Main Low-slung Body Chassis
  const bodyGeo = new THREE.BoxGeometry(1.25, 0.38, 4.0);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.38;
  body.castShadow = true;
  carGroup.add(body);

  // Aerodynamic Wedge Nose
  const noseGeo = new THREE.ConeGeometry(0.5, 1.4, 4);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.rotation.y = Math.PI / 4;
  nose.position.set(0, 0.32, 2.5);
  nose.castShadow = true;
  carGroup.add(nose);

  // Front Wing Endplates
  const fWingGeo = new THREE.BoxGeometry(2.2, 0.06, 0.45);
  const fWing = new THREE.Mesh(fWingGeo, bodyMat);
  fWing.position.set(0, 0.22, 2.9);
  carGroup.add(fWing);

  // Giant 1976 Airbox Intake periscope above driver head
  const airboxGeo = new THREE.BoxGeometry(0.55, 0.85, 0.6);
  const airboxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const airbox = new THREE.Mesh(airboxGeo, airboxMat);
  airbox.position.set(0, 0.95, -0.3);
  airbox.castShadow = true;
  carGroup.add(airbox);

  // Airbox Opening Hole
  const intakeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.1);
  const intake = new THREE.Mesh(intakeGeo, blackMat);
  intake.position.set(0, 1.15, 0.01);
  carGroup.add(intake);

  // Cockpit & Detailed Steering Wheel
  const cockpitGeo = new THREE.BoxGeometry(0.68, 0.32, 1.0);
  const cockpit = new THREE.Mesh(cockpitGeo, blackMat);
  cockpit.position.set(0, 0.48, 0.3);
  carGroup.add(cockpit);

  const wheelGeo = new THREE.TorusGeometry(0.12, 0.025, 12, 24);
  const steeringWheel = new THREE.Mesh(wheelGeo, blackMat);
  steeringWheel.rotation.x = -Math.PI / 4;
  steeringWheel.position.set(0, 0.58, 0.55);
  carGroup.add(steeringWheel);

  // Driver Helmet with Visor
  const helmetGeo = new THREE.SphereGeometry(0.19, 20, 20);
  const helmetMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.4, roughness: 0.3 });
  const helmet = new THREE.Mesh(helmetGeo, helmetMat);
  helmet.position.set(0, 0.62, 0.2);
  carGroup.add(helmet);

  const visorGeo = new THREE.BoxGeometry(0.26, 0.08, 0.12);
  const visorMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.64, 0.32);
  carGroup.add(visor);

  // Exposed V12 / V8 Engine Block & Chrome Exhaust Pipes!
  const engineGeo = new THREE.BoxGeometry(0.8, 0.4, 0.9);
  const engine = new THREE.Mesh(engineGeo, chromeMat);
  engine.position.set(0, 0.45, -1.0);
  carGroup.add(engine);

  for (let side = -1; side <= 1; side += 2) {
    const pipeGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.2, 12);
    const pipe = new THREE.Mesh(pipeGeo, chromeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(side * 0.3, 0.35, -1.7);
    carGroup.add(pipe);
  }

  // Giant Rear Wing
  const rWingGeo = new THREE.BoxGeometry(1.9, 0.1, 0.65);
  const rWing = new THREE.Mesh(rWingGeo, bodyMat);
  rWing.position.set(0, 1.0, -1.9);
  rWing.castShadow = true;
  carGroup.add(rWing);

  const pillarGeo = new THREE.BoxGeometry(0.08, 0.65, 0.08);
  const pillar1 = new THREE.Mesh(pillarGeo, chromeMat);
  pillar1.position.set(-0.45, 0.65, -1.9);
  const pillar2 = pillar1.clone();
  pillar2.position.set(0.45, 0.65, -1.9);
  carGroup.add(pillar1);
  carGroup.add(pillar2);

  // 4 Treaded Wet Rain Tires & Gold Alloy Rims
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });

  const wheelsData = [
    [-0.9, 0.32, 1.6, 0.38, 0.72],
    [0.9, 0.32, 1.6, 0.38, 0.72],
    [-1.0, 0.42, -1.3, 0.55, 0.92],
    [1.0, 0.42, -1.3, 0.55, 0.92],
  ];

  wheelsData.forEach(([x, y, z, width, radius]) => {
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 32);
    const tire = new THREE.Mesh(tireGeo, wheelMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    tire.castShadow = true;

    const rimGeo = new THREE.CylinderGeometry(radius * 0.52, radius * 0.52, width + 0.02, 16);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);

    carGroup.add(tire);
    carGroup.add(rim);
  });

  return carGroup;
}

// Torrential Rain & Spray Particles
export function createRainParticles(count = 5000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = Math.random() * 35;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    velocities[i] = 0.5 + Math.random() * 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xbbddff,
    size: 0.18,
    transparent: true,
    opacity: 0.7,
  });

  const rain = new THREE.Points(geometry, material);
  rain.userData = { velocities, count };
  return rain;
}

// 3D Goalposts
export function createGoalPostsGroup() {
  const group = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

  const crossbarGeo = new THREE.CylinderGeometry(0.09, 0.09, 7.32, 16);
  const crossbar = new THREE.Mesh(crossbarGeo, postMat);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, 2.44, 0);
  crossbar.castShadow = true;
  group.add(crossbar);

  const postGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.44, 16);
  const leftPost = new THREE.Mesh(postGeo, postMat);
  leftPost.position.set(-3.66, 1.22, 0);
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = leftPost.clone();
  rightPost.position.set(3.66, 1.22, 0);
  group.add(rightPost);

  // Net Backing Mesh
  const netGeo = new THREE.PlaneGeometry(7.32, 2.44, 24, 12);
  const netMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.45,
  });
  const net = new THREE.Mesh(netGeo, netMat);
  net.position.set(0, 1.22, -1.8);
  group.add(net);

  return group;
}

// 3D Stadium Crowd Bowl with Camera Flash Dots
export function createCrowdParticles(radius = 40, count = 4000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const palette = [
    new THREE.Color(0xff3333),
    new THREE.Color(0x3388ff),
    new THREE.Color(0xffffff),
    new THREE.Color(0xffd700),
    new THREE.Color(0x00f2fe),
  ];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = radius + Math.random() * 20;
    const y = 3 + Math.random() * 16;

    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * r;

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  });

  return new THREE.Points(geometry, material);
}
