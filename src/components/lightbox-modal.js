import { LitElement, html, css } from 'lit';

/**
 * <lightbox-modal> — Self-contained Fullscreen Sheet Music Lightbox with Pan, Zoom & Playback.
 * Fully responsive across Mobile, Tablet, and Desktop.
 *
 * Layout:
 * - Top Center: Floating Zoom Controls (Zoom In/Out, %, Reset 1:1, Fit to Screen)
 * - Top Left: Floating Close Button (✕)
 * - Bottom Center: Floating Music Playback Bar (Play/Pause, Stop, Time, Full-Width Progress Scrub, Tempo)
 * - Center: High-Resolution Stave Paper Card with Real-Time Glowing Note Highlighting
 */
export class LightboxModal extends LitElement {
    static properties = {
        svgNode: { type: Object },
        playbackComponent: { type: Object },
        _closing: { type: Boolean, state: true },
        scale: { type: Number, state: true },
        translateX: { type: Number, state: true },
        translateY: { type: Number, state: true },
        isPlaying: { type: Boolean, state: true },
        isBuffering: { type: Boolean, state: true },
        currentTime: { type: String, state: true },
        totalTime: { type: String, state: true },
        progress: { type: Number, state: true },
        tempoMultiplier: { type: Number, state: true }
    };

    static styles = css`
        :host {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            z-index: 99999;
            pointer-events: none;
        }

        /* ── Backdrop ──────────────────────────────────────────────────── */
        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.78);
            backdrop-filter: blur(22px);
            -webkit-backdrop-filter: blur(22px);
            pointer-events: all;
            animation: lb-open 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            overflow: hidden;
        }

        .overlay.closing {
            animation: lb-close 0.16s ease forwards;
            pointer-events: none;
        }

        /* ── SVG Viewport & Paper ───────────────────────────────────────── */
        .svg-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
            cursor: grab;
            background: var(--bg-primary, #f8fafc);
            user-select: none;
            touch-action: none;
            z-index: 1;
        }

        .svg-wrapper:active {
            cursor: grabbing;
        }

        .svg-content-holder {
            position: absolute;
            left: 0;
            top: 0;
            transform-origin: 0 0;
            will-change: transform;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-paper, #ffffff);
            color: var(--text-dark, #0f172a);
            border-radius: 12px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18), 0 0 0 1px var(--border-color, rgba(0, 0, 0, 0.08));
            padding: 30px;
            box-sizing: border-box;
        }

        .svg-content-holder svg {
            width: 100%;
            height: 100%;
            display: block;
        }

        /* Real-time active notehead glow during playback */
        .svg-content-holder .abcjs-note-playing,
        .svg-content-holder .abcjs-note-playing path,
        .svg-content-holder .abcjs-note-playing rect {
            fill: var(--accent-violet, #7c3aed) !important;
            stroke: var(--accent-violet, #7c3aed) !important;
            filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.85)) !important;
            transition: fill 0.12s ease, stroke 0.12s ease;
        }

        /* ── Close button (Top Left) ───────────────────────────────────── */
        .close-btn {
            position: absolute;
            top: 16px;
            left: 20px;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
            background: var(--bg-toolbar, rgba(255, 255, 255, 0.9));
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: var(--text-primary, #0f172a);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-fast, 0.15s ease);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            flex-shrink: 0;
            pointer-events: auto;
        }

        .close-btn:hover {
            background: var(--bg-glass-active, rgba(255, 255, 255, 0.95));
            border-color: var(--border-hover, rgba(0, 0, 0, 0.2));
            transform: scale(1.08);
        }

        .close-btn:active {
            transform: scale(0.92);
        }

        /* ── TOP CENTER: Zoom Controls Toolbar ─────────────────────────── */
        .zoom-toolbar {
            position: absolute;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--bg-toolbar, rgba(255, 255, 255, 0.94));
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            padding: 5px 14px;
            border-radius: 99px;
            box-shadow: 
                0 8px 24px rgba(0, 0, 0, 0.14), 
                0 0 0 1px var(--border-color, rgba(0, 0, 0, 0.08));
            z-index: 1000;
            user-select: none;
            pointer-events: auto;
        }

        .zoom-btn {
            background: transparent;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-primary, #0f172a);
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-fast, 0.15s ease);
        }

        .zoom-btn:hover {
            background: var(--bg-glass-active, rgba(0, 0, 0, 0.06));
        }

        .zoom-btn:active {
            transform: scale(0.9);
        }

        .zoom-btn.reset {
            font-size: 0.85rem;
            font-weight: 700;
            padding: 0 4px;
            min-width: 30px;
        }

        .zoom-btn.fit {
            font-size: 0.95rem;
        }

        .zoom-text {
            font-family: var(--font-ui, sans-serif);
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-primary, #0f172a);
            min-width: 40px;
            text-align: center;
            user-select: none;
        }

        /* ── BOTTOM CENTER: Full-Width Music Playback Toolbar ──────────── */
        .playback-toolbar {
            position: absolute;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--bg-toolbar, rgba(255, 255, 255, 0.95));
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            padding: 8px 20px;
            border-radius: 99px;
            box-shadow: 
                0 12px 36px rgba(0, 0, 0, 0.22), 
                0 0 0 1px var(--border-color, rgba(0, 0, 0, 0.08));
            z-index: 1000;
            width: auto;
            min-width: 340px;
            max-width: min(720px, calc(100vw - 32px));
            box-sizing: border-box;
            user-select: none;
            pointer-events: auto;
        }

        .playback-btn-group {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }

        .play-btn, .stop-btn {
            background: transparent;
            border: none;
            color: var(--text-primary, #0f172a);
            cursor: pointer;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            transition: all var(--transition-fast, 0.15s ease);
        }

        .play-btn {
            background: linear-gradient(135deg, var(--accent-indigo, #4f46e5) 0%, var(--accent-violet, #7c3aed) 100%);
            color: #ffffff;
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35);
            font-size: 0.9rem;
        }

        .play-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 3px 12px rgba(124, 58, 237, 0.5);
        }

        .stop-btn:hover {
            background: var(--bg-glass-active, rgba(0, 0, 0, 0.06));
            transform: scale(1.08);
        }

        .play-btn:active, .stop-btn:active {
            transform: scale(0.92);
        }

        .progress-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 120px;
        }

        .time-text {
            font-family: var(--font-code, monospace);
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--text-secondary, #475569);
            min-width: 28px;
            text-align: center;
            flex-shrink: 0;
        }

        .time-sep {
            color: var(--text-muted, #94a3b8);
            font-size: 0.7rem;
            flex-shrink: 0;
        }

        .slider-box {
            flex: 1;
            min-width: 50px;
            position: relative;
            display: flex;
            align-items: center;
        }

        .progress-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 5px;
            border-radius: 99px;
            background: var(--midi-progress-bg, rgba(0, 0, 0, 0.12));
            outline: none;
            cursor: pointer;
            transition: all var(--transition-fast, 0.15s ease);
        }

        .progress-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--accent-violet, #7c3aed);
            box-shadow: 0 0 6px rgba(124, 58, 237, 0.6);
            transition: transform 0.15s ease;
        }

        .progress-slider:hover::-webkit-slider-thumb {
            transform: scale(1.25);
        }

        .speed-dropdown {
            background: var(--midi-btn-bg, rgba(0, 0, 0, 0.05));
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
            color: var(--text-primary, #0f172a);
            font-family: var(--font-ui, sans-serif);
            font-size: 0.78rem;
            font-weight: 600;
            padding: 4px 18px 4px 8px;
            border-radius: 6px;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 4px center;
            background-size: 8px;
            flex-shrink: 0;
        }

        .speed-dropdown:focus {
            outline: none;
            border-color: var(--accent-violet, #7c3aed);
        }

        .buffering-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid var(--border-color, rgba(0, 0, 0, 0.15));
            border-top-color: var(--accent-violet, #7c3aed);
            border-radius: 50%;
            animation: lb-spin 0.8s linear infinite;
        }

        /* ── Hint footer (Desktop only) ────────────────────────────────── */
        .hint {
            position: absolute;
            bottom: 78px;
            left: 50%;
            transform: translateX(-50%);
            font-family: var(--font-ui, sans-serif);
            font-size: 0.72rem;
            letter-spacing: 0.03em;
            color: var(--text-secondary, rgba(30, 41, 59, 0.65));
            pointer-events: none;
            white-space: nowrap;
            user-select: none;
            z-index: 999;
        }

        /* ── Animations ────────────────────────────────────────────────── */
        @keyframes lb-open {
            from { opacity: 0; transform: scale(0.96); }
            to   { opacity: 1; transform: scale(1); }
        }

        @keyframes lb-close {
            from { opacity: 1; transform: scale(1); }
            to   { opacity: 0; transform: scale(0.97); }
        }

        @keyframes lb-spin {
            to { transform: rotate(360deg); }
        }

        /* ── Responsive Mobile & Tablet Rules (RWD) ─────────────────────── */
        @media (max-width: 640px) {
            .close-btn {
                top: 12px;
                left: 12px;
                width: 34px;
                height: 34px;
            }

            .zoom-toolbar {
                top: 12px;
                padding: 4px 10px;
                gap: 3px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            }

            .zoom-btn {
                width: 28px;
                height: 28px;
                font-size: 0.95rem;
            }

            .zoom-text {
                font-size: 0.74rem;
                min-width: 36px;
            }

            .playback-toolbar {
                bottom: 16px;
                left: 12px;
                right: 12px;
                transform: none;
                width: auto;
                max-width: none;
                min-width: 0;
                padding: 6px 12px;
                gap: 8px;
            }

            .playback-btn-group {
                gap: 4px;
            }

            .play-btn, .stop-btn {
                width: 30px;
                height: 30px;
                font-size: 0.85rem;
            }

            .progress-group {
                min-width: 0;
                gap: 6px;
            }

            .time-text {
                font-size: 0.68rem;
                min-width: 24px;
            }

            .speed-dropdown {
                font-size: 0.7rem;
                padding: 3px 14px 3px 6px;
            }

            .svg-content-holder {
                padding: 16px;
            }

            .hint {
                display: none;
            }
        }
    `;

    constructor() {
        super();
        this._closing = false;
        this.scale = 1.0;
        this.translateX = 0;
        this.translateY = 0;

        // Playback Sync State
        this.isPlaying = false;
        this.isBuffering = false;
        this.currentTime = '0:00';
        this.totalTime = '0:00';
        this.progress = 0;
        this.tempoMultiplier = 1.0;
        this._isSeeking = false;

        // Pan state
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.panX = 0;
        this.panY = 0;

        this._observer = null;
        this._syncInterval = null;
        this._onResize = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._onKeyDown = (e) => {
            if (e.key === 'Escape') this._close();
            if (e.code === 'Space' && !e.target.matches('input, select, textarea')) {
                e.preventDefault();
                this.togglePlay();
            }
        };
        window.addEventListener('keydown', this._onKeyDown);

        // Auto refit on viewport resize / rotation
        this._onResize = () => {
            this.fitToScreen();
        };
        window.addEventListener('resize', this._onResize);

        // Start playback state sync
        this._syncInterval = setInterval(() => this._syncPlaybackState(), 50);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('keydown', this._onKeyDown);
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
        }
        if (this._syncInterval) {
            clearInterval(this._syncInterval);
        }
        if (this._observer) {
            this._observer.disconnect();
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('svgNode') && this.svgNode) {
            this._injectSvg();
        }
    }

    _injectSvg() {
        const wrapper = this.shadowRoot?.querySelector('.svg-content-holder');
        if (!wrapper || !this.svgNode) return;
        wrapper.innerHTML = '';

        // Index nodes in source SVG for deterministic note highlighting
        const sourceNotes = this.svgNode.querySelectorAll('.abcjs-note, .abcjs-rest, .abcjs-beam-elem');
        sourceNotes.forEach((el, i) => el.setAttribute('data-note-idx', i.toString()));

        // Clone node
        const clone = this.svgNode.cloneNode(true);
        clone.removeAttribute('style');

        // Check if viewBox exists, or compute it
        let viewBox = clone.getAttribute('viewBox');
        if (!viewBox) {
            const w = this.svgNode.getAttribute('width') || clone.getAttribute('width');
            const h = this.svgNode.getAttribute('height') || clone.getAttribute('height');
            if (w && h) {
                const wVal = parseFloat(w.toString().replace('px', '').trim());
                const hVal = parseFloat(h.toString().replace('px', '').trim());
                if (!isNaN(wVal) && !isNaN(hVal)) {
                    viewBox = `0 0 ${wVal} ${hVal}`;
                    clone.setAttribute('viewBox', viewBox);
                }
            }
        }

        if (viewBox) {
            const parts = viewBox.trim().split(/[\s,]+/).map(Number);
            if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
                clone.setAttribute('width', parts[2]);
                clone.setAttribute('height', parts[3]);
            }
        }
        wrapper.appendChild(clone);

        // Setup real-time note highlighting sync
        this._setupHighlightSync();

        // Initial fit (multiple ticks to ensure full layout geometry computation)
        requestAnimationFrame(() => {
            this.fitToScreen();
        });
        setTimeout(() => {
            this.fitToScreen();
        }, 50);
        setTimeout(() => {
            this.fitToScreen();
        }, 150);
    }

    _setupHighlightSync() {
        if (this._observer) {
            this._observer.disconnect();
        }

        const sourceSvg = this.svgNode;
        const clonedSvg = this.shadowRoot?.querySelector('.svg-content-holder svg');
        if (!sourceSvg || !clonedSvg) return;

        const syncClasses = () => {
            const sourcePlaying = sourceSvg.querySelectorAll('.abcjs-note-playing');
            const clonedPlaying = clonedSvg.querySelectorAll('.abcjs-note-playing');
            clonedPlaying.forEach(el => el.classList.remove('abcjs-note-playing'));

            sourcePlaying.forEach(sourceEl => {
                const idx = sourceEl.getAttribute('data-note-idx');
                if (idx !== null) {
                    const target = clonedSvg.querySelector(`[data-note-idx="${idx}"]`);
                    if (target) {
                        target.classList.add('abcjs-note-playing');
                    }
                } else {
                    const classes = Array.from(sourceEl.classList).filter(c => c !== 'abcjs-note-playing');
                    if (classes.length > 0) {
                        const target = clonedSvg.querySelector('.' + classes.map(c => CSS.escape(c)).join('.'));
                        if (target) target.classList.add('abcjs-note-playing');
                    }
                }
            });
        };

        this._observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    syncClasses();
                    break;
                }
            }
        });

        this._observer.observe(sourceSvg, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });

        syncClasses();
    }

    _syncPlaybackState() {
        if (!this.playbackComponent) return;

        this.isPlaying = !!this.playbackComponent.isPlaying;
        this.isBuffering = !!this.playbackComponent.isBuffering;
        this.currentTime = this.playbackComponent.currentTime || '0:00';
        this.totalTime = this.playbackComponent.totalTime || '0:00';
        if (!this._isSeeking) {
            this.progress = this.playbackComponent.progress || 0;
        }
        this.tempoMultiplier = this.playbackComponent.tempoMultiplier || 1.0;
    }

    togglePlay() {
        if (this.playbackComponent?.togglePlay) {
            this.playbackComponent.togglePlay();
            this._syncPlaybackState();
        }
    }

    stopPlayback() {
        if (this.playbackComponent?.stopPlayback) {
            this.playbackComponent.stopPlayback();
            this._syncPlaybackState();
        }
    }

    handleSeekStart() {
        this._isSeeking = true;
        if (this.playbackComponent?.handleSeekStart) {
            this.playbackComponent.handleSeekStart();
        }
    }

    handleSeek(e) {
        this.progress = parseFloat(e.target.value);
        if (this.playbackComponent?.handleSeek) {
            this.playbackComponent.handleSeek(e);
        }
    }

    async handleSeekEnd(e) {
        if (this.playbackComponent?.handleSeekEnd) {
            await this.playbackComponent.handleSeekEnd(e);
        }
        this._isSeeking = false;
        this._syncPlaybackState();
    }

    changeSpeed(speed) {
        if (this.playbackComponent?.changeSpeed) {
            this.playbackComponent.changeSpeed(speed);
            this.tempoMultiplier = speed;
        }
    }

    _close() {
        if (this._closing) return;
        this._closing = true;

        if (this._observer) {
            this._observer.disconnect();
        }

        // Clean note index tags from source
        if (this.svgNode) {
            const notes = this.svgNode.querySelectorAll('[data-note-idx]');
            notes.forEach(el => el.removeAttribute('data-note-idx'));
        }

        const overlay = this.shadowRoot?.querySelector('.overlay');
        if (overlay) {
            overlay.classList.add('closing');
            overlay.addEventListener('animationend', () => this.remove(), { once: true });
        } else {
            this.remove();
        }
    }

    applyTransform(smooth = false) {
        const canvas = this.shadowRoot?.querySelector('.svg-content-holder');
        if (!canvas) return;

        if (smooth) {
            canvas.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (canvas.style.transition && canvas.style.transition.includes('transform')) {
                    canvas.style.transition = 'none';
                }
            }, 200);
        } else {
            canvas.style.transition = 'none';
        }

        canvas.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`;
    }

    fitToScreen() {
        const viewport = this.shadowRoot?.querySelector('.svg-wrapper');
        const canvas = this.shadowRoot?.querySelector('.svg-content-holder');
        if (!viewport || !canvas) return;

        const svg = canvas.querySelector('svg');
        if (!svg) return;

        // Reset temporary styles to read native size
        canvas.style.width = '';
        canvas.style.height = '';
        svg.style.width = '';
        svg.style.height = '';

        let svgWidth = 0;
        let svgHeight = 0;

        const viewBoxAttr = svg.getAttribute('viewBox');
        if (viewBoxAttr) {
            const parts = viewBoxAttr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
            if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                svgWidth = parts[2];
                svgHeight = parts[3];
            }
        }

        if (!svgWidth || !svgHeight) {
            const wAttr = parseFloat(svg.getAttribute('width'));
            const hAttr = parseFloat(svg.getAttribute('height'));
            if (!isNaN(wAttr) && !isNaN(hAttr) && wAttr > 0 && hAttr > 0) {
                svgWidth = wAttr;
                svgHeight = hAttr;
            } else {
                const rect = svg.getBoundingClientRect();
                svgWidth = rect.width || 720;
                svgHeight = rect.height || 500;
            }
        }

        const viewportWidth = viewport.clientWidth;
        const viewportHeight = viewport.clientHeight;
        if (!viewportWidth || !viewportHeight) return;

        const isMobile = viewportWidth <= 640;
        const padding = isMobile ? 32 : 60; // 16px padding on mobile, 30px on desktop
        const paperWidth = svgWidth + padding;
        const paperHeight = svgHeight + padding;

        canvas.style.width = `${paperWidth}px`;
        canvas.style.height = `${paperHeight}px`;
        svg.style.width = '100%';
        svg.style.height = '100%';

        // Space allocation: top zoom toolbar, bottom playback toolbar
        const topMargin = isMobile ? 54 : 64;
        const bottomMargin = isMobile ? 66 : 76;
        const availableWidth = viewportWidth * (isMobile ? 0.94 : 0.88);
        const availableHeight = Math.max(80, viewportHeight - (topMargin + bottomMargin));

        const scaleX = availableWidth / paperWidth;
        const scaleY = availableHeight / paperHeight;
        const fitScale = Math.min(scaleX, scaleY, 3.5);

        this.scale = fitScale;
        this.translateX = (viewportWidth - paperWidth * fitScale) / 2;
        this.translateY = topMargin + (availableHeight - paperHeight * fitScale) / 2;

        this.applyTransform(true);
    }

    resetZoom() {
        const viewport = this.shadowRoot?.querySelector('.svg-wrapper');
        const canvas = this.shadowRoot?.querySelector('.svg-content-holder');
        if (!viewport || !canvas) return;

        const paperWidth = parseFloat(canvas.style.width) || 760;
        const paperHeight = parseFloat(canvas.style.height) || 560;

        this.scale = 1.0;
        this.translateX = (viewport.clientWidth - paperWidth) / 2;
        this.translateY = (viewport.clientHeight - paperHeight) / 2;

        this.applyTransform(true);
    }

    zoomIn() {
        this.zoomBy(1.15);
    }

    zoomOut() {
        this.zoomBy(1 / 1.15);
    }

    zoomBy(factor) {
        const viewport = this.shadowRoot?.querySelector('.svg-wrapper');
        if (!viewport) return;

        const oldScale = this.scale;
        let newScale = Math.max(0.1, Math.min(10, this.scale * factor));

        const mouseX = viewport.clientWidth / 2;
        const mouseY = viewport.clientHeight / 2;

        this.translateX = mouseX - (mouseX - this.translateX) * (newScale / oldScale);
        this.translateY = mouseY - (mouseY - this.translateY) * (newScale / oldScale);
        this.scale = newScale;

        this.applyTransform(true);
    }

    onPointerDown(e) {
        if (e.button !== 0) return;
        if (e.target.closest('.playback-toolbar') || e.target.closest('.zoom-toolbar') || e.target.closest('.close-btn')) return;

        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.panX = this.translateX;
        this.panY = this.translateY;

        const viewport = this.shadowRoot?.querySelector('.svg-wrapper');
        if (viewport) {
            viewport.setPointerCapture(e.pointerId);
        }
    }

    onPointerMove(e) {
        if (!this.isDragging) return;
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        this.translateX = this.panX + dx;
        this.translateY = this.panY + dy;
        this.applyTransform(false);
    }

    onPointerUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        const viewport = this.shadowRoot?.querySelector('.svg-wrapper');
        if (viewport) {
            viewport.releasePointerCapture(e.pointerId);
        }
    }

    onWheel(e) {
        e.preventDefault();

        if (e.ctrlKey) {
            let zoomFactor = 1.08;
            if (Math.abs(e.deltaY) < 10) {
                zoomFactor = 1 + (Math.abs(e.deltaY) * 0.03);
            }

            const direction = e.deltaY < 0 ? 1 : -1;
            const oldScale = this.scale;
            let newScale = direction > 0 ? this.scale * zoomFactor : this.scale / zoomFactor;
            newScale = Math.max(0.1, Math.min(10, newScale));

            const viewport = this.shadowRoot?.querySelector('.svg-wrapper');
            if (!viewport) return;

            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.translateX = mouseX - (mouseX - this.translateX) * (newScale / oldScale);
            this.translateY = mouseY - (mouseY - this.translateY) * (newScale / oldScale);
            this.scale = newScale;

            this.applyTransform(false);
        } else {
            this.translateX -= e.deltaX;
            this.translateY -= e.deltaY;
            this.applyTransform(false);
        }
    }

    onDoubleClick(e) {
        if (e.target.closest('.playback-toolbar') || e.target.closest('.zoom-toolbar') || e.target.closest('.close-btn')) return;
        this.fitToScreen();
    }

    handleTouchStart(e) {
        if (e.touches.length === 2) {
            this.isDragging = false;
            this.startDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            this.startScale = this.scale;
        }
    }

    handleTouchMove(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (dist > 10 && this.startDist > 0) {
                const factor = dist / this.startDist;
                const oldScale = this.scale;
                let newScale = Math.max(0.1, Math.min(10, this.startScale * factor));

                const viewport = this.shadowRoot?.querySelector('.svg-wrapper');
                if (!viewport) return;
                const rect = viewport.getBoundingClientRect();
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

                this.translateX = midX - (midX - this.translateX) * (newScale / oldScale);
                this.translateY = midY - (midY - this.translateY) * (newScale / oldScale);
                this.scale = newScale;

                this.applyTransform(false);
            }
        }
    }

    render() {
        const zoomPct = Math.round(this.scale * 100);

        return html`
            <div class="overlay" role="dialog" aria-modal="true" aria-label="Fullscreen sheet music lightbox">
                <!-- Top Left: Close Button -->
                <button class="close-btn" @click="${this._close}" title="Close Fullscreen (Esc)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;pointer-events:none">
                        <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <!-- TOP CENTER: Compact Zoom Controls -->
                <div class="zoom-toolbar">
                    <button class="zoom-btn" @click="${this.zoomOut}" title="Zoom Out">－</button>
                    <span class="zoom-text">${zoomPct}%</span>
                    <button class="zoom-btn" @click="${this.zoomIn}" title="Zoom In">＋</button>
                    <button class="zoom-btn reset" @click="${this.resetZoom}" title="Actual Size (1:1)">1:1</button>
                    <button class="zoom-btn fit" @click="${this.fitToScreen}" title="Fit to Screen">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                    </button>
                </div>

                <!-- Canvas Viewport -->
                <div class="svg-wrapper"
                     @pointerdown=${this.onPointerDown}
                     @pointermove=${this.onPointerMove}
                     @pointerup=${this.onPointerUp}
                     @pointercancel=${this.onPointerUp}
                     @wheel=${this.onWheel}
                     @dblclick=${this.onDoubleClick}
                     @touchstart=${this.handleTouchStart}
                     @touchmove=${this.handleTouchMove}>
                    <div class="svg-content-holder">
                        <!-- Cloned SVG injected here -->
                    </div>
                </div>

                <!-- Hint text (Desktop) -->
                <div class="hint">Drag to pan • Pinch / Scroll to zoom • Space to play/pause • Esc to close</div>

                <!-- BOTTOM CENTER: Full-Width Music Playback Controls -->
                <div class="playback-toolbar">
                    <div class="playback-btn-group">
                        ${this.isBuffering ? html`
                            <div class="play-btn" style="cursor: wait;">
                                <span class="buffering-spinner"></span>
                            </div>
                        ` : html`
                            <button class="play-btn" @click="${this.togglePlay}" title="${this.isPlaying ? 'Pause Playback (Space)' : 'Play Music (Space)'}">
                                ${this.isPlaying ? '⏸' : '▶'}
                            </button>
                        `}
                        <button class="stop-btn" @click="${this.stopPlayback}" title="Stop & Reset">
                            ⏹
                        </button>
                    </div>

                    <div class="progress-group">
                        <span class="time-text">${this.currentTime}</span>
                        <span class="time-sep">/</span>
                        <span class="time-text">${this.totalTime}</span>
                        <div class="slider-box">
                            <input type="range" 
                                   class="progress-slider" 
                                   min="0" 
                                   max="100" 
                                   step="0.1"
                                   .value="${this.progress}"
                                   @mousedown="${this.handleSeekStart}"
                                   @touchstart="${this.handleSeekStart}"
                                   @input="${this.handleSeek}"
                                   @change="${this.handleSeekEnd}">
                        </div>
                    </div>

                    <select class="speed-dropdown" @change="${(e) => this.changeSpeed(parseFloat(e.target.value))}" title="Playback speed">
                        ${[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(s => html`
                            <option value="${s}" ?selected="${this.tempoMultiplier === s}">
                                ${s}x
                            </option>
                        `)}
                    </select>
                </div>
            </div>
        `;
    }
}

customElements.define('lightbox-modal', LightboxModal);
