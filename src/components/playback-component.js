import { LitElement, html, css } from 'lit';
import ABCJS from 'abcjs';

export class PlaybackComponent extends LitElement {
    static properties = {
        visualObj: { type: Object },
        tempoMultiplier: { type: Number }
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 52px;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid var(--border-color);
            flex-shrink: 0;
            z-index: 10;
            box-sizing: border-box;
        }

        .player-container {
            width: 100%;
            height: 100%;
            padding: 0 20px;
            box-sizing: border-box;
        }

        .player-inner {
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .controls-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        /* Control Buttons */
        .control-btn {
            background: transparent;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            transition: all var(--transition-fast);
        }

        .control-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1);
            color: var(--accent-violet);
            transform: scale(1.08);
        }

        .control-btn:active:not(:disabled) {
            transform: scale(0.92);
        }

        .control-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .control-btn.play-btn {
            background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%);
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
            font-size: 0.75rem;
        }

        .control-btn.play-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, var(--accent-indigo) 20%, var(--accent-violet) 100%);
            box-shadow: 0 2px 12px rgba(139, 92, 246, 0.5);
            color: var(--text-primary);
        }

        /* Progress Slider */
        .progress-bar-container {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 140px;
        }

        .time-display {
            font-family: var(--font-code);
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--text-secondary);
            min-width: 30px;
            text-align: center;
            user-select: none;
        }

        .time-divider {
            color: var(--text-muted);
            font-size: 0.7rem;
        }

        .slider-wrapper {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
        }

        .progress-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            border-radius: 99px;
            background: rgba(255, 255, 255, 0.1);
            outline: none;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .progress-slider::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            background: transparent;
        }

        .progress-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--accent-violet);
            box-shadow: 0 0 8px var(--accent-violet);
            transition: all var(--transition-fast);
            margin-top: -3px; /* Center thumb on track */
        }

        .progress-slider:hover::-webkit-slider-thumb {
            transform: scale(1.3);
            background: var(--text-primary);
            box-shadow: 0 0 12px var(--accent-violet);
        }

        /* Buffering / Loading State */
        .buffering-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-top-color: var(--accent-violet);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Tempo Multiplier Select Dropdown */
        .tempo-select-container {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
            margin-left: 4px;
        }

        .speed-select {
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-family: var(--font-ui);
            font-size: 0.72rem;
            font-weight: 600;
            padding: 4px 20px 4px 8px;
            border-radius: 6px;
            cursor: pointer;
            transition: all var(--transition-fast);
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 6px center;
            background-size: 10px;
        }

        .speed-select:hover {
            border-color: var(--accent-violet);
            box-shadow: 0 0 8px rgba(139, 92, 246, 0.25);
        }

        .speed-select:focus {
            outline: none;
            border-color: var(--accent-violet);
        }

        .speed-select option {
            background: #1e293b;
            color: var(--text-primary);
        }

        @media (max-width: 480px) {
            .player-container {
                gap: 6px;
                padding: 4px 10px;
            }
            .time-display {
                font-size: 0.7rem;
            }
            .speed-select {
                font-size: 0.65rem;
                padding: 3px 16px 3px 6px;
                background-position: right 4px center;
                background-size: 8px;
            }
        }
    `;

    constructor() {
        super();
        this.isPlaying = false;
        this.isInitialized = false;
        this.isPrimed = false;
        this.isSeeking = false;
        this.isBuffering = false;
        this.progress = 0;
        this.currentTime = '0:00';
        this.totalTime = '0:00';
        this.tempoMultiplier = 1.0;
        
        this.audioContext = null;
        this.synth = null;
        this.timingCallbacks = null;
    }

    updated(changedProperties) {
        if (changedProperties.has('visualObj')) {
            this.handleVisualObjChanged();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopPlayback();
    }

    handleVisualObjChanged() {
        this.stopPlayback();
        this.isInitialized = false;
        this.isPrimed = false;
        this.progress = 0;
        this.currentTime = '0:00';
        this.totalTime = '0:00';
        this.tempoMultiplier = 1.0;
        this.synth = null;
        this.timingCallbacks = null;
        this.requestUpdate();
    }

    getTempo() {
        let qpm = 120; // default fallback
        
        if (this.visualObj) {
            if (this.visualObj.metaText && this.visualObj.metaText.tempo) {
                const tempoStr = this.visualObj.metaText.tempo.toString();
                const match = tempoStr.match(/\d+/g);
                if (match && match.length > 0) {
                    qpm = parseInt(match[match.length - 1], 10);
                }
            } else if (this.visualObj.getTempo) {
                qpm = this.visualObj.getTempo();
            } else if (this.visualObj.midi && this.visualObj.midi.tempo) {
                qpm = this.visualObj.midi.tempo;
            }
        }
        
        return qpm * this.tempoMultiplier;
    }

    async initAudio() {
        if (this.isInitialized) return;
        if (!this.visualObj) return;

        try {
            this.isBuffering = true;
            this.requestUpdate();

            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const qpm = this.getTempo();
            this.synth = new ABCJS.synth.CreateSynth();

            await this.synth.init({
                visualObj: this.visualObj,
                audioContext: this.audioContext,
                options: {
                    soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/",
                    qpm: qpm
                }
            });

            await this.synth.prime();

            this.isInitialized = true;
            this.isPrimed = true;
            this.isBuffering = false;
            this.requestUpdate();
        } catch (error) {
            console.error("Failed to initialize audio synth:", error);
            this.isBuffering = false;
            this.requestUpdate();
            alert("Could not load synth instruments: " + error.message);
        }
    }

    initTimingCallbacks() {
        if (this.timingCallbacks) {
            this.timingCallbacks.stop();
        }

        const qpm = this.getTempo();

        this.timingCallbacks = new ABCJS.TimingCallbacks(this.visualObj, {
            qpm: qpm,
            beatCallback: (beatNumber, totalBeats, totalTime) => {
                if (this.isSeeking) return;

                const percent = beatNumber / totalBeats;
                this.progress = Math.min(100, Math.max(0, percent * 100));

                const elapsedSec = (percent * totalTime) / 1000;
                const totalSec = totalTime / 1000;

                this.currentTime = this.formatTime(elapsedSec);
                this.totalTime = this.formatTime(totalSec);

                this.requestUpdate();
            },
            eventCallback: (event) => {
                if (event === null) {
                    this.handlePlaybackEnded();
                    return;
                }
                if (event && event.elements) {
                    this.highlightElements(event.elements);
                }
            }
        });
    }

    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    highlightElements(elements) {
        this.clearHighlighting();
        
        elements.forEach(group => {
            if (Array.isArray(group)) {
                group.forEach(el => {
                    if (el && el.classList) {
                        el.classList.add('abcjs-note-playing');
                    }
                });
            } else if (group && group.classList) {
                group.classList.add('abcjs-note-playing');
            }
        });
    }

    clearHighlighting() {
        const app = document.querySelector('abc-app');
        if (!app) return;
        const preview = app.shadowRoot.querySelector('preview-component');
        if (!preview) return;
        
        const playingNotes = preview.shadowRoot.querySelectorAll('.abcjs-note-playing');
        playingNotes.forEach(el => el.classList.remove('abcjs-note-playing'));
    }

    async togglePlay() {
        if (!this.visualObj) return;

        if (!this.isInitialized) {
            await this.initAudio();
        }

        if (!this.isInitialized) return;

        if (!this.timingCallbacks) {
            this.initTimingCallbacks();
        }

        if (this.isPlaying) {
            if (this.synth) this.synth.pause();
            if (this.timingCallbacks) this.timingCallbacks.pause();
            this.isPlaying = false;
        } else {
            if (this.synth) this.synth.start();
            if (this.timingCallbacks) this.timingCallbacks.start();
            this.isPlaying = true;
        }
        this.requestUpdate();
    }

    stopPlayback() {
        if (this.synth) {
            try {
                this.synth.stop();
            } catch (e) {
                console.warn(e);
            }
        }
        if (this.timingCallbacks) {
            try {
                this.timingCallbacks.stop();
            } catch (e) {
                console.warn(e);
            }
        }
        this.isPlaying = false;
        this.progress = 0;
        this.currentTime = '0:00';
        this.clearHighlighting();
        this.requestUpdate();
    }

    handlePlaybackEnded() {
        this.stopPlayback();
    }

    handleSeekStart() {
        this.isSeeking = true;
    }

    handleSeek(e) {
        const percent = parseFloat(e.target.value) / 100;
        if (this.timingCallbacks && this.timingCallbacks.totalTime) {
            const currentMs = percent * this.timingCallbacks.totalTime;
            this.currentTime = this.formatTime(currentMs / 1000);
        }
        this.progress = e.target.value;
    }

    async handleSeekEnd(e) {
        const percent = parseFloat(e.target.value) / 100;

        if (!this.isInitialized) {
            await this.initAudio();
        }

        if (this.isInitialized) {
            if (!this.timingCallbacks) {
                this.initTimingCallbacks();
            }

            if (this.synth) {
                this.synth.seek(percent, 'percent');
            }
            if (this.timingCallbacks) {
                this.timingCallbacks.setProgress(percent, 'percent');
            }
        }

        this.isSeeking = false;
        this.requestUpdate();
    }

    async changeSpeed(mult) {
        if (this.tempoMultiplier === mult) return;
        this.tempoMultiplier = mult;

        const wasPlaying = this.isPlaying;
        
        // Stop current audio/visual timing callbacks
        this.stopPlayback();
        
        // Force re-init on next play so it calculates the new tempo
        this.isInitialized = false;
        this.isPrimed = false;
        this.synth = null;
        this.timingCallbacks = null;
        
        if (wasPlaying) {
            await this.togglePlay();
        } else {
            this.requestUpdate();
        }
    }

    render() {
        const hasVisual = !!this.visualObj;
        
        return html`
            <div class="player-container">
                <div class="player-inner">
                    <div class="controls-group">
                        <!-- Play / Pause Button -->
                        ${this.isBuffering ? html`
                            <div class="control-btn" style="cursor: wait;">
                                <span class="buffering-spinner"></span>
                            </div>
                        ` : html`
                            <button class="control-btn play-btn" 
                                    @click="${this.togglePlay}" 
                                    ?disabled="${!hasVisual}"
                                    title="${this.isPlaying ? 'Pause Playback' : 'Start Playback'}">
                                ${this.isPlaying ? '⏸️' : '▶️'}
                            </button>
                        `}

                        <!-- Stop Button -->
                        <button class="control-btn" 
                                @click="${this.stopPlayback}" 
                                ?disabled="${!hasVisual || (!this.isPlaying && this.progress === 0)}"
                                title="Stop and Reset">
                            ⏹️
                        </button>
                    </div>

                    <!-- Progress Bar and Timer -->
                    <div class="progress-bar-container">
                        <span class="time-display">${this.currentTime}</span>
                        <span class="time-divider">/</span>
                        <span class="time-display">${this.totalTime}</span>
                        
                        <div class="slider-wrapper">
                            <input type="range" 
                                   class="progress-slider" 
                                   min="0" 
                                   max="100" 
                                   step="0.1"
                                   .value="${this.progress}"
                                   ?disabled="${!hasVisual}"
                                   @mousedown="${this.handleSeekStart}"
                                   @touchstart="${this.handleSeekStart}"
                                   @input="${this.handleSeek}"
                                   @change="${this.handleSeekEnd}">
                        </div>
                    </div>

                    <!-- Tempo Selector Dropdown -->
                    <div class="tempo-select-container" title="Adjust audio & visual playback speed">
                        <select class="speed-select" @change="${(e) => this.changeSpeed(parseFloat(e.target.value))}">
                            ${[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(mult => html`
                                <option value="${mult}" ?selected="${this.tempoMultiplier === mult}">
                                    ${mult}x
                                </option>
                            `)}
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
}
