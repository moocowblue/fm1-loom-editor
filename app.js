/**
 * LOOM-8 Web Editor for M-VAVE FM-1
 * Developed for Loom 8 custom firmware (by Charles Vestal)
 * Supports Web MIDI, SysEx Remote Control, Screen Mirroring, Web Audio Synthesis
 * SPDX-License-Identifier: MIT / GPL-3.0
 */

// ============================================================================
// 1. CONSTANTS & LOOM-8 SPECIFICATIONS
// ============================================================================
const CH_TRACK_START = 0;   // Channels 1-8 (0x0 .. 0x7)
const CH_FX1         = 8;   // Channel 9  (0x8)
const CH_FX2         = 9;   // Channel 10 (0x9)
const CH_MASTER      = 10;  // Channel 11 (0xA)
const CH_SELECTED    = 11;  // Channels 12-16 (0xB .. 0xF)

const NTRK = 8;
const NSCENE = 32;
const DL_NSOUND = 11;

// Synth Engines in Loom-8
const ENGINES = [
  { id: 0, name: "Knit", desc: "Subtractive & Supersaw", knobs: ["Wave/PWM", "Filter Env", "Sub Osc", "Detune"], xknobs: ["Osc 2", "Level", "Sub Vol", "Noise"] },
  { id: 1, name: "Rayon", desc: "2-Operator FM Synth", knobs: ["Ratio", "Mod Depth", "Feedback", "Brightness"], xknobs: ["Fall", "Floor", "Key Scale", "Velocity"] },
  { id: 2, name: "Jacquard", desc: "Wavetable Synthesizer", knobs: ["Table Pos", "Wave Warp", "Formant", "Harmonics"], xknobs: ["Fold", "Drive", "Sub", "Detune"] },
  { id: 3, name: "Bellows", desc: "Organ with Drawbars", knobs: ["Drawbar 16'", "Drawbar 8'", "Drawbar 4'", "Drawbar 2'"], xknobs: ["Drawbar 2 2/3'", "Drawbar 1 1/3'", "Click", "Perc"] },
  { id: 4, name: "Cane", desc: "Physical Modeling (Braids)", knobs: ["Model", "Timbre", "Color", "Damping"], xknobs: ["Exciter", "Stiffness", "Geometry", "Reso"] },
  { id: 5, name: "Voile", desc: "Vocal Synthesizer (Braids)", knobs: ["Vowel/Model", "Timbre", "Color", "Breath"], xknobs: ["Formant 1", "Formant 2", "Vibrato", "Air"] },
  { id: 6, name: "Sample", desc: "Sample Player", knobs: ["Sample ID", "Start Point", "Length", "Mode (1-shot/loop/rev/pp)"], xknobs: ["Tune", "Fine", "Reverse", "Loop XFade"] },
  { id: 7, name: "Slice", desc: "Breakbeat Chopper", knobs: ["Sample ID", "Slices (4/8/16/32)", "Pitch", "Gate Length"], xknobs: ["Reverse", "Stutter", "Filter", "Drive"] },
  { id: 8, name: "Kit", desc: "11-Voice Drumline", knobs: ["Bus Lo Cut", "Bus Comp", "Bus Drive", "Bus Hi Cut"], xknobs: ["Lag", "Attack", "Random", "Length"] }
];

// 11 Drum Sounds in Drumline
const DRUM_SOUNDS = [
  { id: 0, name: "Kick", model: "Analytic Sine + Pitch Env", knobs: ["Pitch", "Length", "Punch", "Tone"] },
  { id: 1, name: "Snare", model: "Dual Sine + Snappy Noise", knobs: ["Pitch", "Length", "Wires", "Punch"] },
  { id: 2, name: "Closed Hat", model: "6-Square Ring Mod Metal", knobs: ["Pitch", "Length", "Metal", "Focus"] },
  { id: 3, name: "Clap", model: "Filtered Noise Bursts", knobs: ["Tone", "Length", "Spread", "Tail"] },
  { id: 4, name: "Shaker", model: "Soft Noise Burst", knobs: ["Color", "Length", "Swell", "Return"] },
  { id: 5, name: "Tambourine", model: "Metal Partials + Hiss", knobs: ["Tone", "Length", "Jingle", "Hiss"] },
  { id: 6, name: "Tom Low", model: "Pitch Swept Resonator", knobs: ["Pitch", "Length", "Sweep", "Rate"] },
  { id: 7, name: "Conga / Tom Hi", model: "Analytic Conga Perc", knobs: ["Pitch", "Length", "Slide", "Drive"] },
  { id: 8, name: "Reso / String", model: "Karplus-Strong String", knobs: ["Pitch", "Length", "Bright", "Pluck"] },
  { id: 9, name: "FM Perc", model: "2-Op Metallic FM", knobs: ["Pitch", "Length", "Mod", "Feedback"] },
  { id: 10, name: "Sample Perc", model: "Bank Sample Player", knobs: ["Sample ID", "Pitch", "Start", "Reverse"] }
];

// FX Types in Loom-8
const FX_TYPES = [
  { id: 0, name: "Chorus", knobs: ["Rate", "Depth", "Feedback", "Width"] },
  { id: 1, name: "Delay", knobs: ["Time (synced)", "Fine (+-25%)", "Repeats", "Tone (LP)"] },
  { id: 2, name: "Lo-Fi", knobs: ["Rate (SR)", "Bits (res)", "Smooth", "Stereo Width"] },
  { id: 3, name: "Phaser", knobs: ["Freq", "Depth", "Rate", "Feedback"] },
  { id: 4, name: "Plate Reverb", knobs: ["Size", "Motion", "Tone", "Damp"] },
  { id: 5, name: "SPU Reverb (Room)", knobs: ["Size", "Decay", "Tone", "Damp"] },
  { id: 6, name: "SPU Reverb (Studio S)", knobs: ["Size", "Decay", "Tone", "Damp"] },
  { id: 7, name: "SPU Reverb (Studio M)", knobs: ["Size", "Decay", "Tone", "Damp"] },
  { id: 8, name: "SPU Reverb (Studio L)", knobs: ["Size", "Decay", "Tone", "Damp"] },
  { id: 9, name: "SPU Reverb (Hall)", knobs: ["Size", "Decay", "Tone", "Damp"] },
  { id: 10, name: "SPU Reverb (Space Echo)", knobs: ["Size", "Decay", "Tone", "Damp"] },
  { id: 11, name: "SPU Reverb (Chaos Echo)", knobs: ["Size", "Decay", "Tone", "Damp"] },
  { id: 12, name: "Lush Reverb (Dattorro)", knobs: ["Size", "Decay", "Tone", "Damp"] }
];

// Character Stage Types
const CHAR_TYPES = ["Off", "Soft Drive", "Wavefolder", "Bitcrush", "Ring Mod", "Tilt EQ", "Worn Tape", "Sampler"];
const FILTER_TYPES = ["LP24 (Aggressive)", "Moog Ladder", "LP12 (Gentle)", "HP12", "BP12 (Bandpass)", "Dynamic (Drums)"];
const LFO_TYPES = ["Off", "Wave (Poly)", "Wobble", "Drift", "Pump"];
const LFO_DESTINATIONS = ["Synth Engine", "Envelope", "Filter", "Voice/Amp"];
const LFO_SHAPES = ["Square", "Sine", "Ramp", "Saw"];

// Track Color Palette
const TRACK_COLORS = [
  "#e0683a", // T1 Drum Kit (Amber)
  "#38a89d", // T2 Bass (Teal)
  "#5686f5", // T3 Lead (Blue)
  "#a855f7", // T4 Poly (Violet)
  "#ec4899", // T5 Pad (Magenta)
  "#10b981", // T6 Keys (Emerald)
  "#f59e0b", // T7 Pluck (Warm Gold)
  "#06b6d4"  // T8 Slice/Sample (Cyan)
];

// SysEx Identifiers (fm1-base and Loom-8)
const SYSEX_LIVE_CTRL   = [0x7D, 0x4C, 0x43]; // 'L', 'C'
const SYSEX_LOG         = [0x7D, 0x4C, 0x47]; // 'L', 'G'
const SYSEX_SCREEN_READ = [0x7D, 0x53, 0x52]; // 'S', 'R'
const SYSEX_SAMPLE_BANK = [0x7D, 0x46, 0x4C]; // 'F', 'L'

// Mirror Protocol (0x00, 0x59)
const MR_REQ = 0x50, MR_RECT = 0x51, MR_FILL = 0x52, MR_INPUT = 0x53, MR_REMOTE = 0x54;

// Physical FM-1 Button & Knob indices
const FM1_BTNS = ["FX", "SEL", "ENV", "LFO", "EDIT", "GLO", "HOME", "SAVE", "ARP", "SEQ", "PLAY", "REC", "OCT-", "OCT+"];
const FM1_ENCS = ["SELECT", "ALGORITHM", "PRESETS", "KNOB1", "KNOB2", "KNOB3", "KNOB4"];

// ============================================================================
// 2. STATE STORE
// ============================================================================
class EditorState {
  constructor() {
    this.selectedTrack = 0; // 0..7
    this.selectedDrumSound = 0; // 0..10
    this.activeScene = 0;   // 0..31
    this.cuedScene = -1;
    this.tempo = 120.0;
    this.isPlaying = false;
    this.isRecording = false;
    this.mockMode = false;

    // 8 Tracks state
    this.tracks = Array.from({ length: NTRK }, (_, i) => ({
      index: i,
      channel: i,
      name: `Track ${i + 1}`,
      engine: i === 0 ? 8 : (i === 1 ? 0 : (i === 2 ? 1 : (i === 3 ? 2 : (i === 4 ? 3 : (i === 5 ? 4 : (i === 6 ? 6 : 7)))))), // T1 is kit, T2 knit, T3 rayon...
      level: 100, // 0..127, 100 = 0 dB
      pan: 64,    // 0..127
      send1: 30,  // 0..127
      send2: 20,  // 0..127
      mute: false,
      solo: false,
      locut: 0,
      hicut: 127,
      cutoff: 90,
      resonance: 30,
      attack: 5,
      decay: 40,
      sustain: 64,
      release: 25,
      porta: 0,
      lfoAmt: 0,
      filterType: 0, // LP24
      vmode: 0, // Poly
      octave: 2, // 0..4 (-2..+2)
      charType: 0,
      charAmt: 0,
      charTone: 64,
      charMix: 0,
      lfoType: 0,
      lfoSpeed: 4, // 1/8
      lfoDest: 2,  // Filter
      lfoShape: 1, // Sine
      player: 0,   // Off
      e1: 64, e2: 64, e3: 64, e4: 64,
      x1: 64, x2: 64, x3: 64, x4: 64
    }));

    // Drum Kit state (11 sounds)
    this.drums = Array.from({ length: DL_NSOUND }, (_, i) => ({
      id: i,
      name: DRUM_SOUNDS[i].name,
      model: i,
      mute: false,
      level: 100,
      pan: 64,
      send1: 20,
      send2: 15,
      attack: 0,
      hold: 0,
      decay: 90,
      lag: 0,
      cutoff: 127,
      reso: 0,
      drive: 0,
      ftype: 0,
      k1: 64, k2: 64, k3: 64, k4: 64
    }));

    // Kit Bus controls
    this.kitBus = {
      attack: 0,
      length: 64,
      locut: 0,
      hicut: 127,
      send1: 30,
      send2: 20
    };

    // FX I & FX II
    this.fx1 = {
      pick: 1, // Delay
      level: 90,
      k1: 64, k2: 64, k3: 64, k4: 64,
      cutoff: 127, // Low-pass
      fenv: 0,     // High-pass
      feedFx2: 25  // CC 93
    };

    this.fx2 = {
      pick: 4, // Plate Reverb
      level: 90,
      k1: 70, k2: 60, k3: 50, k4: 40,
      cutoff: 127,
      fenv: 0
    };

    // Master Bus
    this.master = {
      level: 100,
      eqLo: 64,
      eqMid: 64,
      eqHi: 64,
      colorType: 1, // Tape
      colorAmt: 40,
      colorTone: 64,
      colorMix: 40,
      perc: 20,
      mel: 15,
      comp: 45,
      pump: 30,
      pumpRel: 60
    };

    // Scenes (32)
    this.scenes = Array.from({ length: NSCENE }, (_, i) => ({
      id: i,
      name: `Scene ${i + 1}`,
      barLength: 4
    }));
  }
}

// ============================================================================
// 3. WEB MIDI & SYSEX PROTOCOL ENGINE
// ============================================================================
class MidiEngine {
  constructor(state, onActivity, onScreenMessage) {
    this.state = state;
    this.onActivity = onActivity;
    this.onScreenMessage = onScreenMessage;
    this.midiAccess = null;
    this.inputPort = null;
    this.outputPort = null;
    this.isConnected = false;
    this.rxLedTimer = null;
    this.txLedTimer = null;

    // Mirror decoder instance
    this.mirror = null;
  }

  async init() {
    if (!navigator.requestMIDIAccess) {
      console.warn("Web MIDI API not supported in this browser.");
      return false;
    }
    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
      this.midiAccess.onstatechange = (e) => this.handleStateChange(e);
      return true;
    } catch (err) {
      console.error("Failed to acquire Web MIDI with SysEx access:", err);
      return false;
    }
  }

  getInputs() {
    if (!this.midiAccess) return [];
    return Array.from(this.midiAccess.inputs.values());
  }

  getOutputs() {
    if (!this.midiAccess) return [];
    return Array.from(this.midiAccess.outputs.values());
  }

  connect(inPortId, outPortId) {
    if (!this.midiAccess) return false;

    // Disconnect old
    if (this.inputPort) {
      this.inputPort.onmidimessage = null;
    }

    this.inputPort = this.midiAccess.inputs.get(inPortId) || null;
    this.outputPort = this.midiAccess.outputs.get(outPortId) || null;

    if (this.inputPort) {
      this.inputPort.onmidimessage = (msg) => this.handleIncomingMessage(msg);
    }

    this.isConnected = !!(this.inputPort || this.outputPort);

    // If connected, send Mirror keep-alive & Screen Reader query
    if (this.outputPort) {
      this.sendMirrorRequest(1); // Turn mirror on
      this.sendScreenReaderHello();
    }

    return this.isConnected;
  }

  handleStateChange(e) {
    console.log("MIDI state change:", e.port.name, e.port.state);
    if (window.editorApp) {
      window.editorApp.updatePortLists();
    }
  }

  flashRx() {
    const rx = document.getElementById("led-rx");
    if (!rx) return;
    rx.classList.add("active");
    clearTimeout(this.rxLedTimer);
    this.rxLedTimer = setTimeout(() => rx.classList.remove("active"), 80);
  }

  flashTx() {
    const tx = document.getElementById("led-tx");
    if (!tx) return;
    tx.classList.add("active");
    clearTimeout(this.txLedTimer);
    this.txLedTimer = setTimeout(() => tx.classList.remove("active"), 80);
  }

  sendRaw(bytes) {
    if (!this.outputPort) {
      if (this.state.mockMode) {
        this.flashTx();
        this.logMidiEvent("OUT [MOCK]", bytes);
      }
      return;
    }
    try {
      this.outputPort.send(bytes);
      this.flashTx();
      this.logMidiEvent("OUT", bytes);
    } catch (err) {
      console.error("Error sending MIDI bytes:", err);
    }
  }

  // Send MIDI CC (0xB0 | channel, cc, value)
  sendCC(channel, cc, val) {
    const clampedVal = Math.max(0, Math.min(127, Math.round(val)));
    const st = 0xB0 | (channel & 0x0F);
    this.sendRaw([st, cc & 0x7F, clampedVal]);
  }

  // Send Program Change (0xC0 | channel, program)
  sendProgramChange(channel, program) {
    const st = 0xC0 | (channel & 0x0F);
    this.sendRaw([st, program & 0x7F]);
  }

  // Send Note On / Note Off
  sendNoteOn(channel, note, velocity = 100) {
    const st = 0x90 | (channel & 0x0F);
    this.sendRaw([st, note & 0x7F, velocity & 0x7F]);
  }

  sendNoteOff(channel, note) {
    const st = 0x80 | (channel & 0x0F);
    this.sendRaw([st, note & 0x7F, 0]);
  }

  // Live Control SysEx (0xF0, 0x7D, 0x4C, 0x43, ...)
  sendButtonPress(buttonMask) {
    const b0 = buttonMask & 0x7F;
    const b1 = (buttonMask >> 7) & 0x7F;
    this.sendRaw([0xF0, ...SYSEX_LIVE_CTRL, 1, b0, b1, 0xF7]);
  }

  sendKeysSend(keysMask) {
    const k0 = keysMask & 0x7F;
    const k1 = (keysMask >> 7) & 0x7F;
    const k2 = (keysMask >> 14) & 0x7F;
    const k3 = (keysMask >> 21) & 0x7F;
    this.sendRaw([0xF0, ...SYSEX_LIVE_CTRL, 2, k0, k1, k2, k3, 0xF7]);
  }

  sendEncoderTurn(encIndex, delta) {
    const step = Math.max(-63, Math.min(63, delta));
    this.sendRaw([0xF0, ...SYSEX_LIVE_CTRL, 3, encIndex & 0x7F, 64 + step, 0xF7]);
  }

  sendMasterPot(vol) {
    const v = Math.max(0, Math.min(4096, vol));
    this.sendRaw([0xF0, ...SYSEX_LIVE_CTRL, 4, v & 0x7F, (v >> 7) & 0x7F, 0xF7]);
  }

  // Screen Reader SysEx (0xF0, 0x7D, 0x53, 0x52, ...)
  sendScreenReaderHello() {
    this.sendRaw([0xF0, ...SYSEX_SCREEN_READ, 1, 1, 0xF7]);
  }

  queryScreenReader() {
    this.sendRaw([0xF0, ...SYSEX_SCREEN_READ, 3, 0xF7]);
  }

  // Mirror Request (0x00, 0x59, MR_REQ)
  sendMirrorRequest(op) {
    const packed = this.mrPack7([0x00, 0x59, MR_REQ, 1, 0, 0, op, ~op & 0xFF]);
    this.sendRaw([0xF0, ...packed, 0xF7]);
  }

  mrPack7(bytes) {
    const out = [];
    let acc = 0, nb = 0;
    for (const b of bytes) {
      acc |= b << nb; nb += 8;
      while (nb >= 7) { out.push(acc & 0x7F); acc >>= 7; nb -= 7; }
    }
    if (nb) out.push(acc & 0x7F);
    return out;
  }

  mrUnpack7(src) {
    const out = [];
    let acc = 0, nb = 0;
    for (const b of src) {
      acc |= (b & 0x7F) << nb; nb += 7;
      while (nb >= 8) { out.push(acc & 0xFF); acc >>= 8; nb -= 8; }
    }
    return out;
  }

  handleIncomingMessage(msg) {
    const data = msg.data;
    this.flashRx();
    this.logMidiEvent("IN", data);

    if (!data || data.length === 0) return;

    // Check for SysEx (0xF0 ... 0xF7)
    if (data[0] === 0xF0) {
      this.handleSysEx(data);
      return;
    }

    const st = data[0] & 0xF0;
    const ch = data[0] & 0x0F;
    const d1 = data.length > 1 ? data[1] : 0;
    const d2 = data.length > 2 ? data[2] : 0;

    // Program Change on Channel 11 (Scenes)
    if (st === 0xC0 && ch === CH_MASTER) {
      this.state.activeScene = d1;
      if (window.editorApp) window.editorApp.updateSceneUI();
      return;
    }

    // Note On
    if (st === 0x90 && d2 > 0) {
      if (ch === CH_MASTER && d1 >= 36 && d1 <= 67) {
        // Notes 36..67 on Master pick scenes 1..32
        this.state.activeScene = d1 - 36;
        if (window.editorApp) window.editorApp.updateSceneUI();
      }
      return;
    }

    // MIDI CC (0xB0)
    if (st === 0xB0) {
      this.handleIncomingCC(ch, d1, d2);
    }
  }

  handleIncomingCC(ch, cc, val) {
    // Channel 1-8: Tracks 1-8
    if (ch >= CH_TRACK_START && ch < CH_TRACK_START + NTRK) {
      const t = ch - CH_TRACK_START;
      const trk = this.state.tracks[t];
      const isKit = trk.engine === 8;

      if (isKit) {
        // Kit Mutes (CC 16-26)
        if (cc >= 16 && cc <= 26) {
          const snd = cc - 16;
          this.state.drums[snd].mute = val >= 64;
          if (window.editorApp) window.editorApp.updateDrumUI();
          return;
        }
        // Kit Pans (CC 80-90)
        if (cc >= 80 && cc <= 90) {
          const snd = cc - 80;
          this.state.drums[snd].pan = val;
          if (window.editorApp) window.editorApp.updateDrumUI();
          return;
        }
        // Kit Levels (CC 102-112)
        if (cc >= 102 && cc <= 112) {
          const snd = cc - 102;
          this.state.drums[snd].level = val;
          if (window.editorApp) window.editorApp.updateDrumUI();
          return;
        }
        // Kit Bus Parameters
        if (cc === 74) trk.hicut = val; // Bus High cut
        if (cc === 71) trk.locut = val; // Bus Low cut
        if (cc === 73) this.state.kitBus.attack = val;
        if (cc === 72) this.state.kitBus.length = val;
      } else {
        // Synth Track Specific
        if (cc === 74) trk.cutoff = val;
        if (cc === 71) trk.resonance = val;
        if (cc === 73) trk.attack = val;
        if (cc === 75) trk.decay = val;
        if (cc === 72) trk.release = val;
        if (cc === 5)  trk.porta = val;
        if (cc === 1)  trk.lfoAmt = val;
      }

      // Common Track Parameters
      if (cc === 7)  trk.level = val;
      if (cc === 10) trk.pan = val;
      if (cc === 91) trk.send1 = val;
      if (cc === 93) trk.send2 = val;
      if (cc === 9)  trk.mute = val >= 64;
      if (cc === 14) trk.locut = val;
      if (cc === 15) trk.hicut = val;

      if (window.editorApp) {
        window.editorApp.updateMixerUI();
        if (this.state.selectedTrack === t) {
          window.editorApp.updateTrackDetailUI();
        }
      }
      return;
    }

    // Channel 9: FX I
    if (ch === CH_FX1) {
      if (cc === 7)  this.state.fx1.level = val;
      if (cc === 16) this.state.fx1.k1 = val;
      if (cc === 17) this.state.fx1.k2 = val;
      if (cc === 18) this.state.fx1.k3 = val;
      if (cc === 19) this.state.fx1.k4 = val;
      if (cc === 74) this.state.fx1.cutoff = val;
      if (cc === 75) this.state.fx1.fenv = val;
      if (cc === 93) this.state.fx1.feedFx2 = val;
      if (window.editorApp) window.editorApp.updateFxUI();
      return;
    }

    // Channel 10: FX II
    if (ch === CH_FX2) {
      if (cc === 7)  this.state.fx2.level = val;
      if (cc === 16) this.state.fx2.k1 = val;
      if (cc === 17) this.state.fx2.k2 = val;
      if (cc === 18) this.state.fx2.k3 = val;
      if (cc === 19) this.state.fx2.k4 = val;
      if (cc === 74) this.state.fx2.cutoff = val;
      if (cc === 75) this.state.fx2.fenv = val;
      if (window.editorApp) window.editorApp.updateFxUI();
      return;
    }

    // Channel 11: Master Bus
    if (ch === CH_MASTER) {
      if (cc === 7)  this.state.master.level = val;
      if (cc === 16) this.state.master.eqLo = val;
      if (cc === 17) this.state.master.eqMid = val;
      if (cc === 18) this.state.master.eqHi = val;
      if (cc === 20) this.state.master.colorType = val;
      if (cc === 21) this.state.master.colorAmt = val;
      if (cc === 22) this.state.master.colorTone = val;
      if (cc === 23) this.state.master.colorMix = val;
      if (cc === 24) this.state.master.perc = val;
      if (cc === 25) this.state.master.mel = val;
      if (cc === 26) this.state.master.comp = val;
      if (cc === 27) this.state.master.pump = val;
      if (cc === 28) this.state.master.pumpRel = val;
      if (window.editorApp) window.editorApp.updateMasterUI();
      return;
    }
  }

  handleSysEx(raw) {
    if (raw.length < 4) return;

    // Check Screen Reader SysEx (0xF0, 0x7D, 0x53, 0x52 ...)
    if (raw[1] === SYSEX_SCREEN_READ[0] && raw[2] === SYSEX_SCREEN_READ[1] && raw[3] === SYSEX_SCREEN_READ[2]) {
      const payload = raw.slice(4, -1);
      if (payload[0] === 16) {
        // Speech text
        const text = new TextDecoder("latin1").decode(payload.slice(2));
        if (this.onScreenMessage) this.onScreenMessage(text);
      }
      return;
    }

    // Check Mirror SysEx (F0 mrPack7(00 59 ...) F7)
    if (this.mirror) {
      this.mirror.feed(raw);
    }
  }

  logMidiEvent(dir, bytes) {
    const tbody = document.getElementById("monitor-tbody");
    if (!tbody) return;

    const tr = document.createElement("tr");
    const time = new Date().toTimeString().split(' ')[0] + '.' + String(Date.now() % 1000).padStart(3, '0');
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

    let desc = "";
    if (bytes[0] >= 0x80 && bytes[0] <= 0xEF) {
      const st = bytes[0] & 0xF0;
      const ch = (bytes[0] & 0x0F) + 1;
      if (st === 0xB0) desc = `CC #${bytes[1]} Val: ${bytes[2]} (Ch ${ch})`;
      else if (st === 0x90) desc = `Note On #${bytes[1]} Vel: ${bytes[2]} (Ch ${ch})`;
      else if (st === 0x80) desc = `Note Off #${bytes[1]} (Ch ${ch})`;
      else if (st === 0xC0) desc = `Program Change #${bytes[1]} (Ch ${ch})`;
    } else if (bytes[0] === 0xF0) {
      desc = "SysEx Message";
    }

    tr.innerHTML = `
      <td>${time}</td>
      <td class="${dir === 'IN' ? 'dir-in' : 'dir-out'}">${dir}</td>
      <td>${hex}</td>
      <td>${desc}</td>
    `;

    tbody.insertBefore(tr, tbody.firstChild);

    // Keep log table from growing indefinitely
    if (tbody.children.length > 80) {
      tbody.removeChild(tbody.lastChild);
    }
  }
}

// ============================================================================
// 4. SCREEN MIRROR DECODER (240x240 RGB565)
// ============================================================================
function createScreenMirror(canvas, onInput) {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(240, 240);
  const screen = new Uint16Array(240 * 240);
  let buf = [], inSx = false, seq = -1;

  const R5 = Array.from({ length: 32 }, (_, i) => Math.round(i * 255 / 31));
  const G6 = Array.from({ length: 64 }, (_, i) => Math.round(i * 255 / 63));

  function mrHash(c) {
    return (Math.imul(c, 40503) >>> 10) & 63;
  }

  function mrUnpack7(src) {
    const out = [];
    let acc = 0, nb = 0;
    for (const b of src) {
      acc |= (b & 0x7F) << nb; nb += 7;
      while (nb >= 8) { out.push(acc & 0xFF); acc >>= 8; nb -= 8; }
    }
    return out;
  }

  function rect(b) {
    const x = b[0], y = b[1], w = b[2], h = b[3], total = w * h, cache = new Uint16Array(64);
    let i = 5, p = 0, cur = 0;
    if (!w || !h || x + w > 240 || y + h > 240) return false;
    const put = (c, n) => {
      if (p + n > total) return false;
      for (let k = 0; k < n; k++, p++) screen[(y + (p / w | 0)) * 240 + x + p % w] = c;
      return true;
    };
    while (i < b.length) {
      const op = b[i++];
      if (op < 0x80) { if (!put(cur, op + 1)) return false; }
      else if (op < 0xC0) { cur = cache[op & 63]; if (!put(cur, 1)) return false; }
      else {
        if (i + 2 > b.length) return false;
        cur = b[i] << 8 | b[i + 1]; i += 2;
        cache[mrHash(cur)] = cur;
        if (!put(cur, (op & 63) + 1)) return false;
      }
    }
    return p === total;
  }

  function paint() {
    const d = imgData.data;
    for (let p = 0; p < 240 * 240; p++) {
      const v = screen[p];
      const o = p * 4;
      d[o]     = R5[v >> 11];
      d[o + 1] = G6[(v >> 5) & 63];
      d[o + 2] = R5[v & 31];
      d[o + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function frame(raw) {
    const m = mrUnpack7(raw);
    if (m.length < 7 || m[0] !== 0 || m[1] !== 0x59) return;
    const n = m[3] | m[4] << 8 | m[5] << 16;
    let sum = 0;
    for (let i = 6; i < 6 + n; i++) sum += m[i];
    if (n + 7 !== m.length || (~sum & 0xFF) !== m[6 + n]) return;

    const cmd = m[2], b = m.slice(6, 6 + n);
    if (cmd === MR_RECT) {
      if (rect(b)) paint();
    } else if (cmd === MR_FILL && n >= 7) {
      const c = b[5] << 8 | b[6], x = b[0], y = b[1], w = b[2], h = b[3];
      for (let j = y; j < Math.min(240, y + h); j++) {
        screen.fill(c, j * 240 + x, j * 240 + Math.min(240, x + w));
      }
      paint();
    } else if (cmd === MR_INPUT && n >= 21) {
      const u32 = (o) => (b[o] | b[o + 1] << 8 | b[o + 2] << 16 | b[o + 3] << 24) >>> 0;
      const lit = b[15] | b[16] << 8;
      if (onInput) {
        onInput({
          buttons: b[0] | b[1] << 8,
          keys: u32(2),
          enc: Array.from(b.slice(6, 13), (v) => (v << 24) >> 24),
          master: b[13] | b[14] << 8,
          litButtons: lit & 0x7FFF,
          playRed: !!(lit & 0x8000),
          litKeys: u32(17)
        });
      }
    }
  }

  function feed(data) {
    for (const v of data) {
      if (v === 0xF0) { inSx = true; buf = []; }
      else if (!inSx || v >= 0xF8) continue;
      else if (v === 0xF7) { inSx = false; frame(buf); }
      else if (v & 0x80) inSx = false;
      else buf.push(v);
    }
  }

  return { feed, screen, paint, resync() { seq = -1; } };
}

// ============================================================================
// 5. INTERACTIVE WEB AUDIO PREVIEW SYNTHESIZER
// ============================================================================
class WebAudioPreview {
  constructor(state) {
    this.state = state;
    this.ctx = null;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playNote(trackIdx, midiNote, velocity = 100) {
    this.init();
    if (!this.ctx) return;

    const trk = this.state.tracks[trackIdx];
    if (trk.mute) return;

    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const envGain = this.ctx.createGain();
    const panNode = this.ctx.createStereoPanner();

    // Engine wave shape
    if (trk.engine === 0) osc.type = "sawtooth";      // Knit
    else if (trk.engine === 1) osc.type = "square";   // Rayon FM approx
    else if (trk.engine === 2) osc.type = "triangle"; // Jacquard
    else if (trk.engine === 3) osc.type = "sine";     // Bellows organ
    else osc.type = "sawtooth";

    osc.frequency.setValueAtTime(freq, now);

    // Filter
    filter.type = "lowpass";
    const cutoffFreq = 50 * Math.pow(400, trk.cutoff / 127);
    filter.frequency.setValueAtTime(cutoffFreq, now);
    filter.Q.setValueAtTime((trk.resonance / 127) * 12, now);

    // Envelope
    const a = Math.max(0.005, (trk.attack / 127) * 1.5);
    const d = Math.max(0.02, (trk.decay / 127) * 2.0);
    const s = (trk.sustain / 127) * 0.8;
    const r = Math.max(0.05, (trk.release / 127) * 3.0);
    const vol = (trk.level / 127) * (velocity / 127);

    envGain.gain.setValueAtTime(0, now);
    envGain.gain.linearRampToValueAtTime(vol, now + a);
    envGain.gain.linearRampToValueAtTime(vol * s, now + a + d);
    envGain.gain.exponentialRampToValueAtTime(0.0001, now + a + d + r);

    // Pan
    panNode.pan.setValueAtTime((trk.pan - 64) / 64, now);

    osc.connect(filter);
    filter.connect(envGain);
    envGain.connect(panNode);
    panNode.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + a + d + r + 0.1);
  }

  playDrumSound(soundIdx, velocity = 100) {
    this.init();
    if (!this.ctx) return;

    const snd = this.state.drums[soundIdx];
    if (snd.mute) return;

    const now = this.ctx.currentTime;
    const vol = (snd.level / 127) * (velocity / 127);

    if (soundIdx === 0) {
      // Kick: pitch envelope down
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (soundIdx === 1) {
      // Snare: noise burst + body
      const node = this.ctx.createBufferSource();
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      node.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(900, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      node.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      node.start(now);
    } else if (soundIdx === 2 || soundIdx === 3) {
      // Hat / Clap: highpassed noise
      const node = this.ctx.createBufferSource();
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      node.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(7000, now);
      filter.Q.setValueAtTime(3, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (soundIdx === 2 ? 0.05 : 0.12));
      node.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      node.start(now);
    } else {
      // Percussive blip
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220 + soundIdx * 45, now);
      gain.gain.setValueAtTime(vol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  }
}

// ============================================================================
// 6. MAIN EDITOR APPLICATION CONTROLLER
// ============================================================================
class LoomEditorApp {
  constructor() {
    this.state = new EditorState();
    this.audioPreview = new WebAudioPreview(this.state);
    this.midi = new MidiEngine(
      this.state,
      () => {},
      (text) => this.onScreenReaderText(text)
    );
  }

  async start() {
    console.log("Starting Loom-8 Web Editor...");
    const midiOk = await this.midi.init();
    this.updatePortLists();

    this.initUI();
    this.initVirtualDevice();
    this.initKeyboardListeners();

    // Select first track by default
    this.selectTrack(0);

    // Default status text
    const statusText = document.getElementById("connection-status-text");
    if (statusText) {
      statusText.textContent = midiOk ? "MIDI Ready (Select Ports)" : "Web MIDI Unavailable";
    }
  }

  updatePortLists() {
    const inSel = document.getElementById("select-midi-in");
    const outSel = document.getElementById("select-midi-out");
    if (!inSel || !outSel) return;

    const inputs = this.midi.getInputs();
    const outputs = this.midi.getOutputs();

    inSel.innerHTML = '<option value="">-- MIDI IN --</option>';
    outSel.innerHTML = '<option value="">-- MIDI OUT --</option>';

    inputs.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      if (/FM-1|MVAVE|LOOM/i.test(p.name)) opt.selected = true;
      inSel.appendChild(opt);
    });

    outputs.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      if (/FM-1|MVAVE|LOOM/i.test(p.name)) opt.selected = true;
      outSel.appendChild(opt);
    });
  }

  connectPorts() {
    const inSel = document.getElementById("select-midi-in");
    const outSel = document.getElementById("select-midi-out");
    const inId = inSel ? inSel.value : "";
    const outId = outSel ? outSel.value : "";

    const connected = this.midi.connect(inId, outId);
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("connection-status-text");
    const btn = document.getElementById("btn-connect");

    if (connected) {
      if (dot) dot.className = "status-dot connected";
      if (text) text.textContent = "FM-1 Connected (Live)";
      if (btn) { btn.textContent = "Disconnect"; btn.classList.add("active"); }
    } else {
      if (dot) dot.className = "status-dot";
      if (text) text.textContent = "Disconnected";
      if (btn) { btn.textContent = "Connect"; btn.classList.remove("active"); }
    }
  }

  toggleMockMode() {
    this.state.mockMode = !this.state.mockMode;
    const btn = document.getElementById("btn-mock-mode");
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("connection-status-text");

    if (this.state.mockMode) {
      if (btn) btn.classList.add("active");
      if (dot) dot.className = "status-dot connected";
      if (text) text.textContent = "Demo / Mock Mode Active";
    } else {
      if (btn) btn.classList.remove("active");
      if (!this.midi.isConnected) {
        if (dot) dot.className = "status-dot";
        if (text) text.textContent = "Disconnected";
      }
    }
  }

  onScreenReaderText(txt) {
    const el = document.getElementById("screen-reader-output");
    if (el) el.textContent = txt;
  }

  // ==========================================================================
  // TAB NAVIGATION & UI BUILDERS
  // ==========================================================================
  initUI() {
    // Navigation Tabs
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.target;
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        const targetPane = document.getElementById(target);
        if (targetPane) targetPane.classList.add("active");
      });
    });

    // Connection button
    const btnConnect = document.getElementById("btn-connect");
    if (btnConnect) {
      btnConnect.addEventListener("click", () => {
        if (this.midi.isConnected) {
          this.midi.connect("", "");
          this.connectPorts();
        } else {
          this.connectPorts();
        }
      });
    }

    // Mock Mode button
    const btnMock = document.getElementById("btn-mock-mode");
    if (btnMock) {
      btnMock.addEventListener("click", () => this.toggleMockMode());
    }

    this.buildMixerChannels();
    this.buildTrackDetail();
    this.buildDrumKitStudio();
    this.buildMasterAndFx();
    this.buildScenesMatrix();
  }

  // --------------------------------------------------------------------------
  // MIXER VIEW BUILDER
  // --------------------------------------------------------------------------
  buildMixerChannels() {
    const grid = document.getElementById("mixer-grid");
    if (!grid) return;
    grid.innerHTML = "";

    this.state.tracks.forEach((trk, idx) => {
      const col = document.createElement("div");
      col.className = `mixer-channel ${this.state.selectedTrack === idx ? "selected" : ""}`;
      col.id = `mix-chan-${idx}`;
      col.style.setProperty("--trk-color", TRACK_COLORS[idx]);

      col.innerHTML = `
        <div class="channel-header">
          <button class="channel-tag" onclick="window.editorApp.selectTrack(${idx})">T${idx + 1}: ${trk.name}</button>
          <span class="channel-engine-name" id="mix-engine-name-${idx}">${ENGINES[trk.engine].name}</span>
        </div>

        <div class="channel-strip">
          <!-- Pan Rotary -->
          <div class="rotary-group">
            <span class="rotary-label">PAN</span>
            <div class="rotary-knob" data-knob="pan" data-trk="${idx}">
              <svg viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="#1f2124" stroke="#44474c" stroke-width="2"/>
                <line x1="22" y1="22" x2="22" y2="8" stroke="${TRACK_COLORS[idx]}" stroke-width="3" stroke-linecap="round" class="knob-line" id="knob-pan-line-${idx}"/>
              </svg>
            </div>
            <span class="rotary-value-text" id="knob-pan-val-${idx}">${trk.pan === 64 ? "C" : (trk.pan < 64 ? "L" + (64 - trk.pan) : "R" + (trk.pan - 64))}</span>
          </div>

          <!-- Sends Rotaries -->
          <div style="display:flex; gap:6px; width:100%;">
            <div class="rotary-group">
              <span class="rotary-label">SEND I</span>
              <div class="rotary-knob" data-knob="send1" data-trk="${idx}">
                <svg viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="#1f2124" stroke="#44474c" stroke-width="2"/>
                  <line x1="22" y1="22" x2="22" y2="8" stroke="#4cc3b6" stroke-width="3" stroke-linecap="round" class="knob-line" id="knob-send1-line-${idx}"/>
                </svg>
              </div>
              <span class="rotary-value-text" id="knob-send1-val-${idx}">${trk.send1}</span>
            </div>
            <div class="rotary-group">
              <span class="rotary-label">SEND II</span>
              <div class="rotary-knob" data-knob="send2" data-trk="${idx}">
                <svg viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="#1f2124" stroke="#44474c" stroke-width="2"/>
                  <line x1="22" y1="22" x2="22" y2="8" stroke="#f28a5a" stroke-width="3" stroke-linecap="round" class="knob-line" id="knob-send2-line-${idx}"/>
                </svg>
              </div>
              <span class="rotary-value-text" id="knob-send2-val-${idx}">${trk.send2}</span>
            </div>
          </div>

          <!-- Vertical Volume Fader -->
          <div class="fader-group">
            <span class="fader-db-readout" id="fader-db-${idx}">${this.levelToDb(trk.level)}</span>
            <div class="fader-track-container" data-trk="${idx}">
              <div class="fader-slot">
                <div class="fader-level-fill" id="fader-fill-${idx}" style="height: ${(trk.level / 127) * 100}%;"></div>
                <div class="fader-cap" id="fader-cap-${idx}" style="bottom: ${(trk.level / 127) * 100}%;"></div>
              </div>
            </div>
          </div>

          <!-- Mute / Solo -->
          <div class="channel-actions">
            <button class="btn-mute ${trk.mute ? "active" : ""}" id="btn-mute-${idx}" onclick="window.editorApp.toggleMute(${idx})">MUTE</button>
            <button class="btn-solo ${trk.solo ? "active" : ""}" id="btn-solo-${idx}" onclick="window.editorApp.toggleSolo(${idx})">SOLO</button>
          </div>

          <button class="btn-edit-trk" onclick="window.editorApp.selectTrack(${idx}, true)">EDIT SOUND &rarr;</button>
        </div>
      `;

      grid.appendChild(col);
    });

    this.initMixerInteractivity();
  }

  levelToDb(val) {
    if (val === 0) return "-inf dB";
    if (val === 100) return "0.0 dB";
    const gain = Math.pow(val * 0.01, 3);
    const db = 20 * Math.log10(gain);
    return (db > 0 ? "+" : "") + db.toFixed(1) + " dB";
  }

  initMixerInteractivity() {
    // Faders drag
    document.querySelectorAll(".fader-track-container").forEach(el => {
      let isDragging = false;
      const trkIdx = parseInt(el.dataset.trk);

      const updateFader = (e) => {
        const rect = el.getBoundingClientRect();
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        const val = Math.round(ratio * 127);
        this.setTrackLevel(trkIdx, val);
      };

      el.addEventListener("mousedown", (e) => {
        isDragging = true;
        updateFader(e);
        const onMove = (moveEvt) => { if (isDragging) updateFader(moveEvt); };
        const onUp = () => { isDragging = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      });

      el.addEventListener("touchstart", (e) => {
        isDragging = true;
        updateFader(e);
        const onTouchMove = (moveEvt) => { if (isDragging) updateFader(moveEvt); };
        const onTouchEnd = () => { isDragging = false; window.removeEventListener("touchmove", onTouchMove); window.removeEventListener("touchend", onTouchEnd); };
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);
      }, { passive: false });
    });

    // Rotary Knobs drag
    document.querySelectorAll(".rotary-knob").forEach(el => {
      let startY = 0;
      let startVal = 0;
      const trkIdx = parseInt(el.dataset.trk);
      const knobType = el.dataset.knob;

      el.addEventListener("mousedown", (e) => {
        startY = e.clientY;
        startVal = knobType === "pan" ? this.state.tracks[trkIdx].pan : (knobType === "send1" ? this.state.tracks[trkIdx].send1 : this.state.tracks[trkIdx].send2);

        const onMove = (moveEvt) => {
          const dy = startY - moveEvt.clientY;
          const delta = Math.round(dy * 0.7);
          const newVal = Math.max(0, Math.min(127, startVal + delta));

          if (knobType === "pan") this.setTrackPan(trkIdx, newVal);
          else if (knobType === "send1") this.setTrackSend1(trkIdx, newVal);
          else if (knobType === "send2") this.setTrackSend2(trkIdx, newVal);
        };

        const onUp = () => {
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      });
    });
  }

  setTrackLevel(trkIdx, val) {
    this.state.tracks[trkIdx].level = val;
    // CC 7 on track channel
    this.midi.sendCC(trkIdx, 7, val);
    const fill = document.getElementById(`fader-fill-${trkIdx}`);
    const cap = document.getElementById(`fader-cap-${trkIdx}`);
    const db = document.getElementById(`fader-db-${trkIdx}`);
    if (fill) fill.style.height = `${(val / 127) * 100}%`;
    if (cap) cap.style.bottom = `${(val / 127) * 100}%`;
    if (db) db.textContent = this.levelToDb(val);
  }

  setTrackPan(trkIdx, val) {
    this.state.tracks[trkIdx].pan = val;
    // CC 10 on track channel
    this.midi.sendCC(trkIdx, 10, val);
    const line = document.getElementById(`knob-pan-line-${trkIdx}`);
    const valText = document.getElementById(`knob-pan-val-${trkIdx}`);
    const angle = ((val - 64) / 64) * 135;
    if (line) line.setAttribute("transform", `rotate(${angle} 22 22)`);
    if (valText) valText.textContent = val === 64 ? "C" : (val < 64 ? `L${64 - val}` : `R${val - 64}`);
  }

  setTrackSend1(trkIdx, val) {
    this.state.tracks[trkIdx].send1 = val;
    // CC 91 on track channel
    this.midi.sendCC(trkIdx, 91, val);
    const line = document.getElementById(`knob-send1-line-${trkIdx}`);
    const valText = document.getElementById(`knob-send1-val-${trkIdx}`);
    const angle = (val / 127) * 270 - 135;
    if (line) line.setAttribute("transform", `rotate(${angle} 22 22)`);
    if (valText) valText.textContent = val;
  }

  setTrackSend2(trkIdx, val) {
    this.state.tracks[trkIdx].send2 = val;
    // CC 93 on track channel
    this.midi.sendCC(trkIdx, 93, val);
    const line = document.getElementById(`knob-send2-line-${trkIdx}`);
    const valText = document.getElementById(`knob-send2-val-${trkIdx}`);
    const angle = (val / 127) * 270 - 135;
    if (line) line.setAttribute("transform", `rotate(${angle} 22 22)`);
    if (valText) valText.textContent = val;
  }

  toggleMute(trkIdx) {
    const trk = this.state.tracks[trkIdx];
    trk.mute = !trk.mute;
    // CC 9 (>= 64 Muted, < 64 Unmuted)
    this.midi.sendCC(trkIdx, 9, trk.mute ? 127 : 0);
    const btn = document.getElementById(`btn-mute-${trkIdx}`);
    if (btn) btn.classList.toggle("active", trk.mute);
  }

  toggleSolo(trkIdx) {
    const trk = this.state.tracks[trkIdx];
    trk.solo = !trk.solo;
    const btn = document.getElementById(`btn-solo-${trkIdx}`);
    if (btn) btn.classList.toggle("active", trk.solo);
  }

  selectTrack(trkIdx, switchToTab = false) {
    this.state.selectedTrack = trkIdx;
    document.querySelectorAll(".mixer-channel").forEach((el, i) => {
      el.classList.toggle("selected", i === trkIdx);
    });
    document.querySelectorAll(".trk-pill-btn").forEach((el, i) => {
      el.classList.toggle("active", i === trkIdx);
    });

    this.updateTrackDetailUI();

    if (switchToTab) {
      const detailTab = document.querySelector('[data-target="tab-track-detail"]');
      if (detailTab) detailTab.click();
    }
  }

  // --------------------------------------------------------------------------
  // TRACK SOUND / SYNTH ENGINE VIEW
  // --------------------------------------------------------------------------
  buildTrackDetail() {
    const container = document.getElementById("editor-track-pills");
    if (!container) return;
    container.innerHTML = "";

    this.state.tracks.forEach((trk, idx) => {
      const btn = document.createElement("button");
      btn.className = `trk-pill-btn ${this.state.selectedTrack === idx ? "active" : ""}`;
      btn.style.setProperty("--trk-color", TRACK_COLORS[idx]);
      btn.textContent = `T${idx + 1} (${ENGINES[trk.engine].name})`;
      btn.onclick = () => this.selectTrack(idx);
      container.appendChild(btn);
    });
  }

  updateTrackDetailUI() {
    const trk = this.state.tracks[this.state.selectedTrack];
    const eng = ENGINES[trk.engine];

    // Engine Select Dropdown
    const engSel = document.getElementById("engine-select");
    if (engSel) engSel.value = trk.engine;

    // Set Knob Labels for chosen engine
    for (let i = 0; i < 4; i++) {
      const lbl = document.getElementById(`eng-k${i + 1}-label`);
      if (lbl) lbl.textContent = eng.knobs[i] || `E${i + 1}`;
    }
    for (let i = 0; i < 4; i++) {
      const lbl = document.getElementById(`eng-x${i + 1}-label`);
      if (lbl) lbl.textContent = eng.xknobs[i] || `X${i + 1}`;
    }

    // Update Envelopes & Sliders
    this.setSliderVal("synth-attack", trk.attack);
    this.setSliderVal("synth-decay", trk.decay);
    this.setSliderVal("synth-sustain", trk.sustain);
    this.setSliderVal("synth-release", trk.release);

    this.setSliderVal("filter-cutoff", trk.cutoff);
    this.setSliderVal("filter-reso", trk.resonance);
    this.setSliderVal("filter-type", trk.filterType);

    this.setSliderVal("char-type", trk.charType);
    this.setSliderVal("char-amt", trk.charAmt);
    this.setSliderVal("char-tone", trk.charTone);
    this.setSliderVal("char-mix", trk.charMix);

    this.setSliderVal("lfo-type", trk.lfoType);
    this.setSliderVal("lfo-speed", trk.lfoSpeed);
    this.setSliderVal("lfo-amt", trk.lfoAmt);

    this.drawAdsrCurve();
    this.drawFilterCurve();
    this.drawCharCurve();
  }

  setSliderVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
    const readout = document.getElementById(`${id}-val`);
    if (readout) readout.textContent = val;
  }

  drawAdsrCurve() {
    const canvas = document.getElementById("adsr-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const trk = this.state.tracks[this.state.selectedTrack];
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const aWidth = (trk.attack / 127) * (w * 0.25);
    const dWidth = (trk.decay / 127) * (w * 0.25);
    const sLevel = h - (trk.sustain / 127) * (h * 0.8) - 10;
    const rWidth = (trk.release / 127) * (w * 0.3);

    ctx.beginPath();
    ctx.moveTo(10, h - 10);
    ctx.lineTo(10 + aWidth, 10);
    ctx.lineTo(10 + aWidth + dWidth, sLevel);
    ctx.lineTo(w - rWidth - 10, sLevel);
    ctx.lineTo(w - 10, h - 10);

    ctx.strokeStyle = TRACK_COLORS[this.state.selectedTrack];
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "rgba(242, 138, 90, 0.1)";
    ctx.lineTo(10, h - 10);
    ctx.fill();
  }

  drawFilterCurve() {
    const canvas = document.getElementById("filter-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const trk = this.state.tracks[this.state.selectedTrack];
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cutoffX = (trk.cutoff / 127) * (w - 40) + 20;
    const peakH = (trk.resonance / 127) * (h * 0.4);

    ctx.beginPath();
    ctx.moveTo(10, 20);
    ctx.lineTo(cutoffX - 20, 20);
    ctx.quadraticCurveTo(cutoffX, 20 - peakH, cutoffX + 25, h - 10);
    ctx.lineTo(w - 10, h - 10);

    ctx.strokeStyle = "#4cc3b6";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  drawCharCurve() {
    const canvas = document.getElementById("char-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const trk = this.state.tracks[this.state.selectedTrack];
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const u = (x / w) * 2 - 1; // -1 to +1
      let y = u;
      const amt = trk.charAmt / 127;

      if (trk.charType === 1) { // Soft drive
        y = Math.tanh(u * (1 + amt * 4));
      } else if (trk.charType === 2) { // Wavefolder
        y = Math.sin(u * (Math.PI + amt * Math.PI * 3));
      } else if (trk.charType === 3) { // Bitcrush
        const steps = Math.max(2, Math.floor(16 * (1 - amt * 0.9)));
        y = Math.round(u * steps) / steps;
      }

      const canvasY = h / 2 - y * (h / 2 - 10);
      if (x === 0) ctx.moveTo(x, canvasY);
      else ctx.lineTo(x, canvasY);
    }

    ctx.strokeStyle = "#f2c744";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // DRUM KIT STUDIO BUILDER
  // --------------------------------------------------------------------------
  buildDrumKitStudio() {
    const grid = document.getElementById("drum-pads-container");
    if (!grid) return;
    grid.innerHTML = "";

    this.state.drums.forEach((snd, idx) => {
      const pad = document.createElement("div");
      pad.className = `drum-pad ${this.state.selectedDrumSound === idx ? "selected" : ""}`;
      pad.id = `drum-pad-${idx}`;

      pad.innerHTML = `
        <span class="drum-pad-name">${snd.name}</span>
        <span class="drum-pad-keynum">PAD #${idx + 1} &bull; CC ${16 + idx}</span>
        <div class="drum-pad-quick-controls">
          <label><input type="checkbox" ${snd.mute ? "checked" : ""} onchange="window.editorApp.toggleDrumMute(${idx})"> MUTE</label>
          <span>VOL: ${snd.level}</span>
        </div>
      `;

      pad.addEventListener("mousedown", () => {
        this.triggerDrumPad(idx);
      });

      grid.appendChild(pad);
    });
  }

  triggerDrumPad(idx) {
    this.state.selectedDrumSound = idx;
    document.querySelectorAll(".drum-pad").forEach((p, i) => {
      p.classList.toggle("selected", i === idx);
    });

    const pad = document.getElementById(`drum-pad-${idx}`);
    if (pad) {
      pad.classList.add("hit");
      setTimeout(() => pad.classList.remove("hit"), 120);
    }

    // Play preview sound
    this.audioPreview.playDrumSound(idx);

    // Send MIDI Note On to Track 1 (or drum channel)
    const midiNote = 36 + idx;
    this.midi.sendNoteOn(0, midiNote, 110);
    setTimeout(() => this.midi.sendNoteOff(0, midiNote), 100);
  }

  toggleDrumMute(soundIdx) {
    const snd = this.state.drums[soundIdx];
    snd.mute = !snd.mute;
    // CC 16-26
    this.midi.sendCC(0, 16 + soundIdx, snd.mute ? 127 : 0);
  }

  // --------------------------------------------------------------------------
  // MASTER & FX RACK BUILDER
  // --------------------------------------------------------------------------
  buildMasterAndFx() {
    // FX I Pick dropdown
    const fx1Sel = document.getElementById("fx1-pick");
    if (fx1Sel) {
      fx1Sel.innerHTML = FX_TYPES.map(f => `<option value="${f.id}">${f.name}</option>`).join("");
      fx1Sel.value = this.state.fx1.pick;
      fx1Sel.onchange = (e) => {
        this.state.fx1.pick = parseInt(e.target.value);
        this.updateFxUI();
      };
    }

    // FX II Pick dropdown
    const fx2Sel = document.getElementById("fx2-pick");
    if (fx2Sel) {
      fx2Sel.innerHTML = FX_TYPES.map(f => `<option value="${f.id}">${f.name}</option>`).join("");
      fx2Sel.value = this.state.fx2.pick;
      fx2Sel.onchange = (e) => {
        this.state.fx2.pick = parseInt(e.target.value);
        this.updateFxUI();
      };
    }

    this.updateFxUI();
    this.updateMasterUI();
  }

  updateFxUI() {
    const f1 = FX_TYPES[this.state.fx1.pick] || FX_TYPES[0];
    const f2 = FX_TYPES[this.state.fx2.pick] || FX_TYPES[0];

    for (let i = 0; i < 4; i++) {
      const lbl1 = document.getElementById(`fx1-k${i + 1}-label`);
      if (lbl1) lbl1.textContent = f1.knobs[i] || `K${i + 1}`;
      const lbl2 = document.getElementById(`fx2-k${i + 1}-label`);
      if (lbl2) lbl2.textContent = f2.knobs[i] || `K${i + 1}`;
    }

    this.setSliderVal("fx1-level", this.state.fx1.level);
    this.setSliderVal("fx1-k1", this.state.fx1.k1);
    this.setSliderVal("fx1-k2", this.state.fx1.k2);
    this.setSliderVal("fx1-k3", this.state.fx1.k3);
    this.setSliderVal("fx1-k4", this.state.fx1.k4);
    this.setSliderVal("fx1-cut", this.state.fx1.cutoff);
    this.setSliderVal("fx1-hp", this.state.fx1.fenv);
    this.setSliderVal("fx1-feed2", this.state.fx1.feedFx2);

    this.setSliderVal("fx2-level", this.state.fx2.level);
    this.setSliderVal("fx2-k1", this.state.fx2.k1);
    this.setSliderVal("fx2-k2", this.state.fx2.k2);
    this.setSliderVal("fx2-k3", this.state.fx2.k3);
    this.setSliderVal("fx2-k4", this.state.fx2.k4);
  }

  updateMasterUI() {
    this.setSliderVal("master-level", this.state.master.level);
    this.setSliderVal("master-eq-lo", this.state.master.eqLo);
    this.setSliderVal("master-eq-mid", this.state.master.eqMid);
    this.setSliderVal("master-eq-hi", this.state.master.eqHi);
    this.setSliderVal("master-color-type", this.state.master.colorType);
    this.setSliderVal("master-color-amt", this.state.master.colorAmt);
    this.setSliderVal("master-color-tone", this.state.master.colorTone);
    this.setSliderVal("master-color-mix", this.state.master.colorMix);
    this.setSliderVal("master-perc", this.state.master.perc);
    this.setSliderVal("master-mel", this.state.master.mel);
    this.setSliderVal("master-comp", this.state.master.comp);
    this.setSliderVal("master-pump", this.state.master.pump);
    this.setSliderVal("master-pump-rel", this.state.master.pumpRel);

    this.drawMasterSpectrum();
  }

  drawMasterSpectrum() {
    const canvas = document.getElementById("master-spectrum-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const m = this.state.master;

    ctx.clearRect(0, 0, w, h);

    const loGain = ((m.eqLo - 64) / 64) * 35;
    const midGain = ((m.eqMid - 64) / 64) * 35;
    const hiGain = ((m.eqHi - 64) / 64) * 35;

    ctx.beginPath();
    ctx.moveTo(10, h / 2 - loGain);
    ctx.quadraticCurveTo(w * 0.25, h / 2 - loGain, w * 0.45, h / 2 - midGain);
    ctx.quadraticCurveTo(w * 0.7, h / 2 - hiGain, w - 10, h / 2 - hiGain);

    ctx.strokeStyle = "#4cc3b6";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center 0dB dashed line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#383c46";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // --------------------------------------------------------------------------
  // SCENES PERFORMANCE MATRIX BUILDER
  // --------------------------------------------------------------------------
  buildScenesMatrix() {
    const grid = document.getElementById("scenes-grid");
    if (!grid) return;
    grid.innerHTML = "";

    this.state.scenes.forEach((sc, idx) => {
      const btn = document.createElement("div");
      btn.className = `scene-button ${this.state.activeScene === idx ? "active" : ""}`;
      btn.id = `scene-btn-${idx}`;

      btn.innerHTML = `
        <span class="scene-num">${idx + 1}</span>
        <span class="scene-note-label">PC ${idx} &bull; Note ${36 + idx}</span>
      `;

      btn.onclick = () => this.triggerScene(idx);
      grid.appendChild(btn);
    });
  }

  triggerScene(sceneIdx) {
    this.state.activeScene = sceneIdx;
    this.updateSceneUI();

    // Send Program Change on Channel 11
    this.midi.sendProgramChange(CH_MASTER, sceneIdx);
    // Also send Note On 36..67 on Channel 11 for pad controllers
    this.midi.sendNoteOn(CH_MASTER, 36 + sceneIdx, 100);
    setTimeout(() => this.midi.sendNoteOff(CH_MASTER, 36 + sceneIdx), 80);
  }

  updateSceneUI() {
    document.querySelectorAll(".scene-button").forEach((btn, idx) => {
      btn.classList.toggle("active", idx === this.state.activeScene);
    });
  }

  // --------------------------------------------------------------------------
  // VIRTUAL HARDWARE DEVICE & LIVE SCREEN MIRROR
  // --------------------------------------------------------------------------
  initVirtualDevice() {
    const canvas = document.getElementById("mirror-canvas");
    if (canvas) {
      this.midi.mirror = createScreenMirror(canvas, (inputState) => {
        this.updateVirtualHardwareInput(inputState);
      });
      // Initial test screen pattern
      this.renderMirrorTestPattern(canvas);
    }

    // Connect hardware button clicks on SVG
    FM1_BTNS.forEach((bName, bit) => {
      const btnEl = document.getElementById(`hw-btn-${bName}`);
      if (btnEl) {
        btnEl.addEventListener("mousedown", () => {
          this.midi.sendButtonPress(1 << bit);
        });
        btnEl.addEventListener("mouseup", () => {
          this.midi.sendButtonPress(0);
        });
      }
    });

    // 27 Keyboard keys on SVG
    for (let k = 0; k < 27; k++) {
      const keyEl = document.getElementById(`hw-key-${k}`);
      if (keyEl) {
        keyEl.addEventListener("mousedown", () => {
          this.midi.sendKeysSend(1 << k);
          this.audioPreview.playNote(this.state.selectedTrack, 48 + k, 100);
        });
        keyEl.addEventListener("mouseup", () => {
          this.midi.sendKeysSend(0);
        });
      }
    }
  }

  updateVirtualHardwareInput(s) {
    FM1_BTNS.forEach((bName, bit) => {
      const el = document.getElementById(`hw-btn-${bName}`);
      if (el) {
        const isHeld = !!(s.buttons & (1 << bit));
        const isLit = !!(s.litButtons & (1 << bit));
        el.classList.toggle("held", isHeld);
        el.classList.toggle("lit", isLit);
      }
    });

    for (let k = 0; k < 27; k++) {
      const el = document.getElementById(`hw-key-${k}`);
      if (el) {
        const isHeld = !!(s.keys & (1 << k));
        const isLit = !!(s.litKeys & (1 << k));
        el.classList.toggle("held", isHeld);
        el.classList.toggle("lit", isLit);
      }
    }
  }

  renderMirrorTestPattern(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#16181d";
    ctx.fillRect(0, 0, 240, 240);

    ctx.fillStyle = "#f28a5a";
    ctx.font = "bold 22px 'Barlow Semi Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LOOM-8", 120, 90);

    ctx.fillStyle = "#9aa1b0";
    ctx.font = "14px 'Barlow', sans-serif";
    ctx.fillText("M-VAVE FM-1", 120, 115);

    ctx.fillStyle = "#4cc3b6";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText("Connect USB-MIDI for", 120, 150);
    ctx.fillText("Real-time Screen Mirror", 120, 168);
  }

  initKeyboardListeners() {
    // Computer keyboard as musical piano
    const keyMap = {
      'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7,
      'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12, 'o': 13, 'l': 14, 'p': 15
    };

    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      const k = e.key.toLowerCase();
      if (keyMap[k] !== undefined && !e.repeat) {
        const noteOffset = keyMap[k];
        const midiNote = 48 + noteOffset;
        this.audioPreview.playNote(this.state.selectedTrack, midiNote, 105);
        this.midi.sendNoteOn(this.state.selectedTrack, midiNote, 105);
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      const k = e.key.toLowerCase();
      if (keyMap[k] !== undefined) {
        const noteOffset = keyMap[k];
        const midiNote = 48 + noteOffset;
        this.midi.sendNoteOff(this.state.selectedTrack, midiNote);
      }
    });
  }

  // ==========================================================================
  // PRESET & PROJECT MANAGEMENT (JSON EXPORT/IMPORT)
  // ==========================================================================
  exportProjectJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `loom8_project_${Date.now()}.json`);
    dlAnchor.click();
  }

  importProjectJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loaded = JSON.parse(e.target.result);
        if (loaded.tracks && loaded.master) {
          Object.assign(this.state, loaded);
          this.buildMixerChannels();
          this.updateTrackDetailUI();
          this.updateDrumUI();
          this.updateFxUI();
          this.updateMasterUI();
          this.updateSceneUI();
          alert("Loom-8 Project loaded successfully!");
        } else {
          alert("Invalid Loom-8 project file.");
        }
      } catch (err) {
        alert("Error parsing JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}

// Instantiate and expose globally
window.addEventListener("DOMContentLoaded", () => {
  window.editorApp = new LoomEditorApp();
  window.editorApp.start();
});
