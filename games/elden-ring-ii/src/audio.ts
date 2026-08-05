export type GameSound =
  | "arrowHit"
  | "bossHit"
  | "bossSlam"
  | "bowRelease"
  | "cast"
  | "dodge"
  | "enemyAttack"
  | "enemyDeath"
  | "enemySpawn"
  | "footstep"
  | "gateOpen"
  | "heal"
  | "lockOn"
  | "magicHit"
  | "playerHit"
  | "swordSwing"
  | "victory";

export type EncounterMix = "approach" | "cloister" | "causeway" | "boss";

type SoundProfile = {
  files: string[];
  gain: [number, number];
  rate: [number, number];
  highpass?: number;
  lowpass?: number;
  reverb?: number;
  duck?: number;
};

const staticAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const AUDIO_ROOT = staticAsset("assets/audio/sfx");

const SOUND_PROFILES: Record<GameSound, SoundProfile> = {
  swordSwing: {
    files: [`${AUDIO_ROOT}/knifeSlice.mp3`, `${AUDIO_ROOT}/knifeSlice2.mp3`],
    gain: [0.36, 0.47],
    rate: [0.88, 1.08],
    highpass: 170,
    reverb: 0.16,
  },
  bowRelease: {
    files: [`${AUDIO_ROOT}/cloth1.mp3`, `${AUDIO_ROOT}/knifeSlice2.mp3`],
    gain: [0.22, 0.32],
    rate: [1.2, 1.42],
    highpass: 260,
    reverb: 0.12,
  },
  dodge: {
    files: [`${AUDIO_ROOT}/cloth1.mp3`, `${AUDIO_ROOT}/cloth2.mp3`, `${AUDIO_ROOT}/cloth3.mp3`],
    gain: [0.17, 0.25],
    rate: [0.86, 1.05],
    lowpass: 5200,
    reverb: 0.08,
  },
  footstep: {
    files: [
      `${AUDIO_ROOT}/footstep_concrete_000.mp3`,
      `${AUDIO_ROOT}/footstep_concrete_001.mp3`,
      `${AUDIO_ROOT}/footstep_concrete_002.mp3`,
    ],
    gain: [0.1, 0.16],
    rate: [0.9, 1.08],
    lowpass: 3100,
    reverb: 0.2,
  },
  bossHit: {
    files: [
      `${AUDIO_ROOT}/impactMetal_heavy_000.mp3`,
      `${AUDIO_ROOT}/impactMetal_heavy_001.mp3`,
      `${AUDIO_ROOT}/impactMetal_heavy_002.mp3`,
    ],
    gain: [0.46, 0.58],
    rate: [0.82, 0.99],
    lowpass: 7200,
    reverb: 0.42,
    duck: 0.7,
  },
  arrowHit: {
    files: [
      `${AUDIO_ROOT}/impactMetal_heavy_000.mp3`,
      `${AUDIO_ROOT}/impactMetal_heavy_001.mp3`,
    ],
    gain: [0.3, 0.4],
    rate: [1.2, 1.45],
    highpass: 320,
    reverb: 0.28,
  },
  magicHit: {
    files: [`${AUDIO_ROOT}/impactBell_heavy_000.mp3`, `${AUDIO_ROOT}/impactMining_001.mp3`],
    gain: [0.31, 0.42],
    rate: [1.1, 1.34],
    highpass: 180,
    reverb: 0.55,
    duck: 0.82,
  },
  playerHit: {
    files: [
      `${AUDIO_ROOT}/impactPunch_heavy_000.mp3`,
      `${AUDIO_ROOT}/impactPunch_heavy_001.mp3`,
      `${AUDIO_ROOT}/impactPunch_heavy_002.mp3`,
    ],
    gain: [0.5, 0.63],
    rate: [0.84, 1.02],
    lowpass: 5400,
    reverb: 0.28,
    duck: 0.54,
  },
  bossSlam: {
    files: [`${AUDIO_ROOT}/impactMining_000.mp3`, `${AUDIO_ROOT}/impactMining_001.mp3`],
    gain: [0.48, 0.62],
    rate: [0.66, 0.82],
    lowpass: 4200,
    reverb: 0.58,
    duck: 0.48,
  },
  enemyAttack: {
    files: [`${AUDIO_ROOT}/knifeSlice.mp3`, `${AUDIO_ROOT}/cloth2.mp3`],
    gain: [0.2, 0.3],
    rate: [0.76, 0.94],
    lowpass: 6200,
    reverb: 0.24,
  },
  enemyDeath: {
    files: [`${AUDIO_ROOT}/impactPunch_heavy_001.mp3`, `${AUDIO_ROOT}/impactMining_000.mp3`],
    gain: [0.28, 0.42],
    rate: [0.56, 0.72],
    lowpass: 2600,
    reverb: 0.56,
    duck: 0.82,
  },
  enemySpawn: {
    files: [`${AUDIO_ROOT}/impactMining_001.mp3`, `${AUDIO_ROOT}/impactBell_heavy_000.mp3`],
    gain: [0.2, 0.3],
    rate: [0.48, 0.68],
    lowpass: 2100,
    reverb: 0.68,
  },
  gateOpen: {
    files: [`${AUDIO_ROOT}/impactMining_000.mp3`, `${AUDIO_ROOT}/impactBell_heavy_000.mp3`],
    gain: [0.35, 0.46],
    rate: [0.42, 0.58],
    lowpass: 2800,
    reverb: 0.72,
    duck: 0.64,
  },
  heal: {
    files: [`${AUDIO_ROOT}/impactBell_heavy_000.mp3`],
    gain: [0.25, 0.33],
    rate: [1.08, 1.2],
    highpass: 280,
    reverb: 0.7,
  },
  cast: {
    files: [`${AUDIO_ROOT}/impactBell_heavy_000.mp3`, `${AUDIO_ROOT}/cloth3.mp3`],
    gain: [0.16, 0.24],
    rate: [1.42, 1.66],
    highpass: 360,
    reverb: 0.62,
  },
  lockOn: {
    files: [`${AUDIO_ROOT}/impactMetal_heavy_002.mp3`],
    gain: [0.1, 0.14],
    rate: [1.62, 1.76],
    highpass: 900,
    reverb: 0.14,
  },
  victory: {
    files: [`${AUDIO_ROOT}/impactBell_heavy_000.mp3`],
    gain: [0.38, 0.46],
    rate: [0.7, 0.76],
    highpass: 120,
    reverb: 0.9,
    duck: 0.32,
  },
};

const MUSIC_TRACKS: Record<"world" | "boss", string> = {
  world: staticAsset("assets/audio/music/dream-2-ambience-cc0.m4a"),
  boss: staticAsset("assets/audio/music/mists-in-the-elven-lands-cc0.m4a"),
};

const randomBetween = ([min, max]: [number, number]) => min + Math.random() * (max - min);

export class GameAudio {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private ambienceBus: GainNode | null = null;
  private reverbInput: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private musicSources: Record<"world" | "boss", MediaElementAudioSourceNode | null> = {
    world: null,
    boss: null,
  };
  private musicGains: Record<"world" | "boss", GainNode | null> = {
    world: null,
    boss: null,
  };
  private readonly musicElements: Record<"world" | "boss", HTMLAudioElement> = {
    world: new Audio(MUSIC_TRACKS.world),
    boss: new Audio(MUSIC_TRACKS.boss),
  };
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly recentFile = new Map<GameSound, string>();
  private readonly ambienceSources: AudioScheduledSourceNode[] = [];
  private preloadPromise: Promise<void> | null = null;
  private muted = false;
  private encounter: EncounterMix = "approach";
  private listenerX = 0;
  private listenerZ = 0;

  constructor() {
    Object.values(this.musicElements).forEach((music) => {
      music.loop = true;
      music.preload = "none";
      music.crossOrigin = "anonymous";
    });
  }

  async start() {
    if (!this.context) this.createGraph();
    if (!this.context) return;
    await this.context.resume();
    this.preloadPromise ??= this.preload();
    const activeTrack = this.encounter === "boss" ? "boss" : "world";
    void this.musicElements[activeTrack].play().catch(() => undefined);
    await this.preloadPromise;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.context || !this.masterGain) return;
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.88, now, 0.025);
  }

  setEncounter(encounter: EncounterMix) {
    if (encounter === this.encounter) return;
    this.encounter = encounter;
    if (!this.context) return;
    const now = this.context.currentTime;
    const bossActive = encounter === "boss";
    this.crossfadeTrack("world", bossActive ? 0 : encounter === "cloister" ? 0.13 : 0.17, now);
    this.crossfadeTrack("boss", bossActive ? 0.2 : 0, now);
    if (this.ambienceBus) {
      this.ambienceBus.gain.cancelScheduledValues(now);
      this.ambienceBus.gain.setTargetAtTime(bossActive ? 0.19 : encounter === "cloister" ? 0.15 : 0.12, now, 1.2);
    }
  }

  updateListener(x: number, z: number, forwardX: number, forwardZ: number) {
    this.listenerX = x;
    this.listenerZ = z;
    const listener = this.context?.listener;
    if (!listener) return;
    if (listener.positionX) {
      listener.positionX.value = x;
      listener.positionY.value = 1.5;
      listener.positionZ.value = z;
      listener.forwardX.value = forwardX;
      listener.forwardY.value = 0;
      listener.forwardZ.value = forwardZ;
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    } else {
      listener.setPosition(x, 1.5, z);
      listener.setOrientation(forwardX, 0, forwardZ, 0, 1, 0);
    }
  }

  play(event: GameSound, sourceX = this.listenerX, sourceZ = this.listenerZ) {
    const context = this.context;
    const output = this.sfxBus;
    if (!context || !output || this.muted) return;

    const profile = SOUND_PROFILES[event];
    const lastFile = this.recentFile.get(event);
    const choices = profile.files.length > 1
      ? profile.files.filter((file) => file !== lastFile)
      : profile.files;
    const file = choices[Math.floor(Math.random() * choices.length)];
    const buffer = this.buffers.get(file);
    if (buffer) {
      this.recentFile.set(event, file);
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const panner = this.createPanner(sourceX, sourceZ);
      source.buffer = buffer;
      source.playbackRate.value = randomBetween(profile.rate);
      filter.type = profile.highpass ? "highpass" : "lowpass";
      filter.frequency.value = profile.highpass ?? profile.lowpass ?? 18000;
      filter.Q.value = 0.48;
      gain.gain.value = randomBetween(profile.gain);
      source.connect(filter).connect(gain).connect(panner).connect(output);
      if (profile.reverb && this.reverbInput) {
        const send = context.createGain();
        send.gain.value = profile.reverb;
        panner.connect(send).connect(this.reverbInput);
      }
      source.start();
    }

    this.playDesignedLayer(event, sourceX, sourceZ);
    if (profile.duck) this.duckMusic(profile.duck);
  }

  destroy() {
    Object.values(this.musicElements).forEach((music) => {
      music.pause();
      music.removeAttribute("src");
      music.load();
    });
    this.ambienceSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // The source may already have ended.
      }
      source.disconnect();
    });
    Object.values(this.musicSources).forEach((source) => source?.disconnect());
    this.masterGain?.disconnect();
    this.compressor?.disconnect();
    void this.context?.close();
    this.context = null;
  }

  private createGraph() {
    this.context = new AudioContext({ latencyHint: "interactive" });
    const context = this.context;
    this.masterGain = context.createGain();
    this.musicBus = context.createGain();
    this.sfxBus = context.createGain();
    this.ambienceBus = context.createGain();
    this.reverbInput = context.createGain();
    this.reverbGain = context.createGain();
    this.compressor = context.createDynamicsCompressor();
    const convolver = context.createConvolver();

    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 3.5;
    this.compressor.attack.value = 0.004;
    this.compressor.release.value = 0.24;
    this.masterGain.gain.value = this.muted ? 0 : 0.88;
    this.musicBus.gain.value = 1;
    this.sfxBus.gain.value = 0.92;
    this.ambienceBus.gain.value = 0.12;
    this.reverbGain.gain.value = 0.26;
    convolver.buffer = this.createImpulseResponse(2.9, 2.8);

    this.musicBus.connect(this.masterGain);
    this.sfxBus.connect(this.masterGain);
    this.ambienceBus.connect(this.masterGain);
    this.reverbInput.connect(convolver).connect(this.reverbGain).connect(this.masterGain);
    this.masterGain.connect(this.compressor).connect(context.destination);

    (["world", "boss"] as const).forEach((track) => {
      const source = context.createMediaElementSource(this.musicElements[track]);
      const gain = context.createGain();
      gain.gain.value = track === "world" ? 0.17 : 0;
      source.connect(gain).connect(this.musicBus!);
      this.musicSources[track] = source;
      this.musicGains[track] = gain;
    });
    this.startProceduralAmbience();
  }

  private createPanner(x: number, z: number) {
    const panner = this.context!.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = 2.2;
    panner.maxDistance = 42;
    panner.rolloffFactor = 1.05;
    panner.positionX.value = x;
    panner.positionY.value = 1.1;
    panner.positionZ.value = z;
    return panner;
  }

  private createImpulseResponse(seconds: number, decay: number) {
    const context = this.context!;
    const length = Math.floor(context.sampleRate * seconds);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        const envelope = Math.pow(1 - index / length, decay);
        const earlyReflection = index % 1187 < 6 ? 0.34 : 0;
        data[index] = ((Math.random() * 2 - 1) * 0.76 + earlyReflection) * envelope;
      }
    }
    return impulse;
  }

  private startProceduralAmbience() {
    const context = this.context!;
    const ambience = this.ambienceBus!;
    const noiseLength = context.sampleRate * 7;
    const noiseBuffer = context.createBuffer(2, noiseLength, context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const samples = noiseBuffer.getChannelData(channel);
      let brown = 0;
      for (let index = 0; index < noiseLength; index += 1) {
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.025 * white) / 1.025;
        samples[index] = brown * 3.2;
      }
    }
    const wind = context.createBufferSource();
    const windFilter = context.createBiquadFilter();
    const windGain = context.createGain();
    const lfo = context.createOscillator();
    const lfoDepth = context.createGain();
    wind.buffer = noiseBuffer;
    wind.loop = true;
    windFilter.type = "bandpass";
    windFilter.frequency.value = 430;
    windFilter.Q.value = 0.55;
    windGain.gain.value = 0.26;
    lfo.frequency.value = 0.073;
    lfoDepth.gain.value = 0.075;
    lfo.connect(lfoDepth).connect(windGain.gain);
    wind.connect(windFilter).connect(windGain).connect(ambience);
    wind.start();
    lfo.start();
    this.ambienceSources.push(wind, lfo);

    [54.8, 82.2].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index === 0 ? -4 : 7;
      filter.type = "lowpass";
      filter.frequency.value = index === 0 ? 180 : 240;
      gain.gain.value = index === 0 ? 0.045 : 0.018;
      oscillator.connect(filter).connect(gain).connect(ambience);
      oscillator.start();
      this.ambienceSources.push(oscillator);
    });
  }

  private playDesignedLayer(event: GameSound, x: number, z: number) {
    const context = this.context!;
    const output = this.sfxBus!;
    const now = context.currentTime;
    const lowEvents: Partial<Record<GameSound, [number, number, number]>> = {
      bossHit: [78, 42, 0.2],
      bossSlam: [64, 31, 0.46],
      enemyDeath: [92, 48, 0.25],
      enemySpawn: [118, 63, 0.38],
      gateOpen: [74, 37, 0.65],
      magicHit: [240, 96, 0.28],
      playerHit: [105, 58, 0.18],
      victory: [220, 110, 1.2],
    };
    const layer = lowEvents[event];
    if (!layer) return;
    const [startFrequency, endFrequency, duration] = layer;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const panner = this.createPanner(x, z);
    oscillator.type = event === "victory" || event === "magicHit" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 20), now + duration);
    filter.type = "lowpass";
    filter.frequency.value = event === "victory" ? 1800 : 620;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(event === "bossSlam" ? 0.34 : 0.18, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(filter).connect(gain).connect(panner).connect(output);
    if (this.reverbInput) panner.connect(this.reverbInput);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  private crossfadeTrack(track: "world" | "boss", target: number, now: number) {
    const gain = this.musicGains[track];
    if (!gain) return;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(target, now, 1.1);
    if (target > 0) void this.musicElements[track].play().catch(() => undefined);
  }

  private async preload() {
    const files = [...new Set(Object.values(SOUND_PROFILES).flatMap(({ files }) => files))];
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
        const data = await response.arrayBuffer();
        const buffer = await this.context!.decodeAudioData(data);
        this.buffers.set(file, buffer);
      }),
    );
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length) console.warn(`Unable to decode ${failures.length} sound effect asset(s).`);
  }

  private duckMusic(level: number) {
    if (!this.context) return;
    const now = this.context.currentTime;
    (["world", "boss"] as const).forEach((track) => {
      const gain = this.musicGains[track];
      if (!gain) return;
      const base = track === "boss" ? 0.2 : this.encounter === "cloister" ? 0.13 : 0.17;
      const active = track === "boss" ? this.encounter === "boss" : this.encounter !== "boss";
      if (!active) return;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(base * level, now, 0.012);
      gain.gain.setTargetAtTime(base, now + 0.2, 0.13);
    });
  }
}
