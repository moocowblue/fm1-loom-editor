# LOOM-8 Web Editor for M-VAVE FM-1

A comprehensive, real-time Web Editor, Performance Controller, and Screen Mirror for the **M-VAVE FM-1** running the open-source **[Loom 8 (fm1-loom)](https://github.com/charlesvestal/fm1-loom)** firmware by Charles Vestal.

---

## 🌟 Key Features

1. **8-Track Groovebox Mixer**:
   - Bi-directional control of Tracks 1–8: Levels (dB faders, CC 7), Pan (CC 10), Send I (CC 91), Send II (CC 93), Mutes (CC 9), Solo, Low Cut (CC 14), and High Cut (CC 15).
   - Instant visual feedback: when you turn physical knobs on the FM-1 (with `CC OUT` on), the mixer updates on your computer screen in real time.

2. **Deep Sound & Synth Engine Editor**:
   - Full parameter control for all 9 sound engines in Loom 8:
     - **Knit**: Subtractive supersaw/pulse/noise/sub oscillator.
     - **Rayon**: 2-Operator FM synthesis with ratio, mod depth, feedback, brightness.
     - **Jacquard**: Wavetable synthesizer with warp, formant, harmonics.
     - **Bellows**: Organ with authentic 6-drawbar control.
     - **Cane**: Physical modeling synthesis (Braids: pluck, bow, reed, flute, bell, drum).
     - **Voile**: Vocal synthesis (Braids: vosim, vowel, choir, whisper).
     - **Sample**: User sample playback with start point, length, looping modes.
     - **Slice**: Breakbeat chopper with 4/8/16/32 slice division, pitch, gate.
     - **Kit**: 11-voice Drumline drum machine.
   - **Interactive Visualizers**:
     - Live **ADSR Amp Envelope** curve (Attack CC 73, Decay CC 75, Sustain, Release CC 72).
     - Live **State-Variable Filter** frequency response (Cutoff CC 74, Reso CC 71).
     - Live **Character Stage** transfer curve (Soft Drive, Wavefolder, Bitcrush, Ring Mod, Tilt EQ, Tape, Sampler).
     - **LFO Modulation** (Wave, Wobble, Drift, Pump) with synced divisions or free Hz (CC 1).
     - **Play Mode & Arpeggiator**: Polyphonic, Monophonic, Legato, Glide (CC 5), Octave shift.

3. **11-Voice Drum Kit Studio (Drumline)**:
   - 11 Drum sound pads (Kick, Snare, Closed Hat, Clap, Shaker, Tambourine, Tom Low, Conga, Reso/String, FM, Sample).
   - Individual drum sound Mutes (CC 16–26), Pans (CC 80–90), Levels (CC 102–112).
   - Kit Bus Dynamic Filter: Low cut (CC 71), High cut (CC 74), Attack (CC 73), Length (CC 72), Sends (CC 91 & 93).

4. **Master & Send FX Rack**:
   - **Send FX I (Channel 9)**: Chorus, Delay, Lo-Fi, Phaser, Plate & SPU Reverbs with return level (CC 7), 4 knobs (CC 16–19), Low-pass (CC 74), High-pass (CC 75), Feed to FX II (CC 93).
   - **Send FX II (Channel 10)**: Return level (CC 7), 4 knobs (CC 16–19), Low-pass (CC 74), High-pass (CC 75).
   - **Master Bus Processor (Channel 11)**:
     - 3-Band Parametric EQ: Low (CC 16), Mid (CC 17), High (CC 18) with live spectrum curve.
     - Master Color: Tape Saturation & Vintage Sampler (CC 20–23).
     - Dynamics & Sidechain Pump: Percussive drive (CC 24), Melodic comp (CC 25), Master comp (CC 26), Sidechain pump depth (CC 27), Pump release (CC 28), Master output level (CC 7).

5. **32-Scene Performance Matrix**:
   - 32 Launchpad buttons triggering Scene changes via MIDI Channel 11 (Program Change 0..31 and Notes 36..67 / C1..D#3).

6. **Virtual FM-1 Remote & Live Screen Mirror**:
   - Exact front panel SVG replica of the FM-1 with 27-key keyboard, 14 buttons, and 7 rotary encoders.
   - **Live 240x240 RGB565 Screen Streaming**: Decodes the FM-1 screen mirror protocol (`0x00, 0x59`, `MR_RECT`, `MR_FILL`, `MR_INPUT`) directly into an HTML5 canvas!
   - Hardware button LED lit feedback (syncs with physical button LEDs).
   - Real-time Screen Reader text readout.

7. **Built-in Web Audio Preview Synthesizer**:
   - Allows auditioning sounds and tweaking patches directly in the browser even without the physical hardware connected (Demo / Mock Mode).
   - Play with mouse or computer keyboard (`A`, `W`, `S`, `E`, `D`, `F`, `T`, `G` ...).

8. **MIDI Monitor & Diagnostics Log**:
   - Real-time logging of all incoming and outgoing MIDI events (CC, Program Change, Notes, SysEx) with raw byte inspection.

9. **Project Backup & Preset Storage**:
   - Export and import all tracks, parameters, drum machines, and scenes to JSON files.

---

## 🚀 Quick Start

### 1. Launch the Web Editor

Because modern browsers (Google Chrome, Microsoft Edge, Opera, Brave) require a secure origin (`http://localhost` or `https://`) for the Web MIDI API with full SysEx permissions, a local Python launcher is included:

- **Option A (Windows double-click):**
  Double click `run_editor.bat`.
- **Option B (Command line):**
  ```powershell
  python run_server.py
  ```
  The browser will automatically open to `http://localhost:8080/index.html`.

### 2. Connect your M-VAVE FM-1

1. Plug your M-VAVE FM-1 into your PC using a USB-C data cable.
2. In the web editor header, select **M-VAVE FM-1** in the **IN** and **OUT** dropdown menus.
3. Click **Connect**.
4. The status indicator will turn solid green, and the virtual screen will begin mirroring your device!

*(Note: If you don't have the FM-1 connected yet, click **Demo Mode** to test all features with the built-in Web Audio synthesis engine!)*

---

## 🎹 Loom 8 MIDI CC Mapping Reference

Loom 8 assigns **fixed channels** to tracks and sections:

| Channel | Assignment | Purpose |
|---|---|---|
| **1 – 8** | Tracks T1 – T8 | 8 Instrument tracks |
| **9** | FX I | Send FX 1 Processor |
| **10** | FX II | Send FX 2 Processor |
| **11** | Master & Scenes | Master EQ, Color, Dynamics, and Scene selection |
| **12 – 16** | Selected Track | Targets currently selected track (`inst_trk`) |

### Key CC Numbers:

- **Tracks 1–8**:
  - `CC 7`: Volume Level
  - `CC 10`: Pan (64 = Center)
  - `CC 91 / 93`: Send I / Send II
  - `CC 9`: Mute (>= 64 Muted, < 64 Unmuted)
  - `CC 14 / 15`: Low Cut / High Cut
  - `CC 74 / 71`: Cutoff / Resonance
  - `CC 73 / 75 / 72`: Attack / Decay / Release
  - `CC 5`: Portamento / Glide
  - `CC 1`: LFO Depth
- **Drum Kits (Channel 1 / Drum Track)**:
  - `CC 16 – 26`: Mute Drum Sounds 1–11
  - `CC 80 – 90`: Pan Drum Sounds 1–11
  - `CC 102 – 112`: Volume Level Drum Sounds 1–11
  - `CC 74 / 71`: Kit Bus High Cut / Low Cut
  - `CC 73 / 72`: Kit Attack / Length
- **FX I & II (Channels 9 & 10)**:
  - `CC 7`: Return Level
  - `CC 16 – 19`: Algorithm Knobs 1 to 4
  - `CC 74 / 75`: Low-pass / High-pass Cutoffs
  - `CC 93`: Feed FX I into FX II (Channel 9 only)
- **Master (Channel 11)**:
  - `CC 7`: Master Output Level
  - `CC 16 – 18`: 3-Band EQ (Low, Mid, High)
  - `CC 20 – 23`: Master Color (Type, Amount, Tone, Mix)
  - `CC 24 – 28`: Dynamics (Perc, Melodic, Comp, Sidechain Pump, Pump Release)
- **Scenes (Channel 11)**:
  - `Program Change 0 – 31`: Cue / Select Scene 1 – 32
  - `Notes 36 – 67 (C1 – D#3)`: Cue / Select Scene 1 – 32
