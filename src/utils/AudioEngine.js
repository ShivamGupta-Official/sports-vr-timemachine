// Web Audio API Spatial Audio Engine for TimeVault VR

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.crowdNode = null;
    this.engineNode = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.masterGain = null;
    this.panner = null;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;
    
    // Spatial Panner for VR Audio
    if (this.ctx.createPanner) {
      this.panner = this.ctx.createPanner();
      this.panner.panningModel = 'HRTF';
      this.panner.distanceModel = 'inverse';
      this.panner.refDistance = 5;
      this.panner.maxDistance = 100;
      this.panner.connect(this.masterGain);
    } else {
      this.panner = this.masterGain;
    }
    
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  // Play synthesized cricket bat hit sound (Thwack!)
  playBatHit() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    
    // Low frequency thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.panner);
    osc.start(now);
    osc.stop(now + 0.15);

    // High frequency wood crack (Noise burst)
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 3;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.panner);

    noise.start(now);
  }

  // Play synthesized football kick (Thump!)
  playBallKick() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    gain.gain.setValueAtTime(1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.panner);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Start continuous synthesized F1 engine sound (RPM adjustable)
  startF1Engine() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();
    if (this.engineOsc) return;

    const now = this.ctx.currentTime;
    
    // Dual saw oscillators for rich vintage V12 / V8 engine roar
    this.engineOsc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.type = 'sawtooth';
    subOsc.type = 'square';

    this.engineOsc.frequency.setValueAtTime(140, now); // ~4000 RPM base
    subOsc.frequency.setValueAtTime(70, now);

    // Low pass filter to simulate engine block & exhaust
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    this.engineGain.gain.setValueAtTime(0.35, now);

    this.engineOsc.connect(filter);
    subOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.panner);

    this.engineOsc.start(now);
    subOsc.start(now);

    this.subOsc = subOsc;
  }

  // Update F1 Engine RPM pitch (freq ~ 80Hz to 450Hz)
  updateEngineRPM(rpmNormalized) {
    if (!this.engineOsc || !this.ctx) return;
    const targetFreq = 90 + rpmNormalized * 320;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    if (this.subOsc) {
      this.subOsc.frequency.setTargetAtTime(targetFreq * 0.5, this.ctx.currentTime, 0.05);
    }
  }

  stopF1Engine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        if (this.subOsc) this.subOsc.stop();
      } catch (e) {}
      this.engineOsc = null;
      this.subOsc = null;
    }
  }

  // Stadium crowd cheer / roar
  startCrowdRoar(intensity = 0.5) {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();
    if (this.crowdNode) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Pink noise generation for realistic stadium ambiance
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const crowdFilter = this.ctx.createBiquadFilter();
    crowdFilter.type = 'bandpass';
    crowdFilter.frequency.value = 800;
    crowdFilter.Q.value = 0.8;

    this.crowdGain = this.ctx.createGain();
    this.crowdGain.gain.setValueAtTime(intensity * 0.25, this.ctx.currentTime);

    whiteNoise.connect(crowdFilter);
    crowdFilter.connect(this.crowdGain);
    this.crowdGain.connect(this.masterGain);

    whiteNoise.start(0);
    this.crowdNode = whiteNoise;
  }

  stopCrowdRoar() {
    if (this.crowdNode) {
      try {
        this.crowdNode.stop();
      } catch (e) {}
      this.crowdNode = null;
    }
  }

  // Historic Commentary Speech Synthesis
  speakCommentary(text) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    
    // Select an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (britishVoice) utterance.voice = britishVoice;
    
    window.speechSynthesis.speak(utterance);
  }

  stopAll() {
    this.stopF1Engine();
    this.stopCrowdRoar();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
