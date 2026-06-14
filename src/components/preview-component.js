import { LitElement, html, css } from 'lit';
import ABCJS from 'abcjs';
import { jsPDF } from "jspdf";
import 'svg2pdf.js';

export class PreviewComponent extends LitElement {
    static properties = {
        abcCode: { type: String },
        zoom: { type: Number },
        warnings: { type: Array },
        visualObj: { type: Object },
        desktop: { type: Boolean, reflect: true },
        isDragging: { type: Boolean, state: true }
    };

    static styles = css`
        :host {
            container-type: inline-size;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            flex: 1;
            min-height: 0;
            overflow: hidden;
        }

        .preview-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            background: var(--bg-glass);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }

        .preview-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            min-height: 40px;
            padding: 0 16px;
            background: var(--bg-panel-header);
            border-bottom: 1px solid var(--border-color);
            box-sizing: border-box;
            flex-shrink: 0;
            gap: 12px;
            position: relative;
            z-index: 20;
        }

        .header-title {
            flex: 1 1 0%;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            height: 28px;
        }

        .zoom-controls {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--bg-zoom-controls);
            padding: 0 6px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            height: 28px;
            box-sizing: border-box;
        }

        .zoom-btn, .zoom-reset-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 0.75rem;
            cursor: pointer;
            width: 20px;
            height: 20px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-fast);
        }

        .zoom-btn:hover, .zoom-reset-btn:hover {
            background: var(--bg-glass-active);
            color: var(--text-primary);
        }

        .zoom-btn:active, .zoom-reset-btn:active {
            transform: scale(0.9);
        }

        .zoom-btn:disabled, .zoom-reset-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
            background: transparent !important;
            transform: none !important;
        }

        .zoom-value {
            font-family: var(--font-code);
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--text-primary);
            min-width: 34px;
            text-align: center;
            user-select: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 20px;
        }



        /* Scrollable Canvas Viewport */
        .preview-canvas {
            flex: 1;
            overflow: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: flex-start; /* Anchor to left so zoomed paper never clips left edge */
            min-height: 0;
            cursor: grab;
        }

        .preview-canvas.dragging {
            cursor: grabbing;
            user-select: none;
        }

        .preview-canvas.dragging * {
            cursor: grabbing !important;
        }

        .notation-display svg .abcjs-note {
            cursor: pointer;
            transition: opacity var(--transition-fast);
        }

        .notation-display svg .abcjs-note:hover {
            opacity: 0.6;
        }

        .notation-display svg .abcjs-note.user-selected-note,
        .notation-display svg .abcjs-note.user-selected-note * {
            fill: #ef4444 !important;
        }

        /* The Sheet Music Paper */
        .stave-paper {
            background: var(--bg-paper);
            color: var(--text-dark);
            border-radius: 12px;
            box-shadow: var(--shadow-paper);
            padding: 30px;
            transition: width var(--transition-normal), min-width var(--transition-normal);
            margin: 0 auto 20px auto;
            box-sizing: border-box;
            border: 1px solid rgba(0, 0, 0, 0.06);
        }

        @media (max-width: 768px) {
            .preview-header {
                height: 36px;
                min-height: 36px;
                padding: 0 10px;
            }
        }

        @container (max-width: 380px) {
            .preview-header {
                height: 36px;
                min-height: 36px;
                padding: 0 8px;
                gap: 6px;
            }
        }

        .notation-display {
            width: 100%;
            height: auto;
            display: flex;
            flex-direction: column;
            background: transparent;
        }

        /* Force SVGs created by abcjs to be fully responsive inside the paper card */
        .notation-display svg {
            width: 100% !important;
            height: auto !important;
            display: block;
        }

        .empty-state {
            color: var(--text-muted);
            font-size: 0.9rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            gap: 12px;
            text-align: center;
        }

        .empty-icon {
            font-size: 2.5rem;
            opacity: 0.4;
            animation: pulse-slow 3s infinite ease-in-out;
        }

        /* Warnings & Errors Panel */
        .warnings-panel {
            background: var(--warning-bg);
            border: 1px solid var(--warning-border);
            border-radius: 10px;
            padding: 12px 16px;
            margin-top: 12px;
            width: 100%;
            max-width: 800px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            flex-shrink: 0;
        }

        .warnings-header {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--accent-rose);
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .warnings-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .warning-item {
            font-family: var(--font-code);
            font-size: 0.75rem;
            color: var(--warning-text);
            line-height: 1.4;
            padding: 4px 8px;
            background: var(--warning-item-bg);
            border-radius: 4px;
            border-left: 3px solid var(--accent-rose);
        }

        .warning-meta {
            color: var(--text-muted);
            margin-right: 6px;
            font-weight: 500;
        }

        /* Action Controls Group */
        .header-controls {
            flex: 1 1 0%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            height: 28px;
        }

        /* Action Buttons */
        .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--midi-btn-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-family: var(--font-ui);
            font-size: 0.9rem;
            font-weight: 600;
            height: 28px;
            width: 28px;
            border-radius: 6px;
            cursor: pointer;
            transition: all var(--transition-fast);
            user-select: none;
            white-space: nowrap;
            box-sizing: border-box;
            flex-shrink: 0;
        }

        .action-btn:hover {
            background: var(--bg-glass-active);
            border-color: var(--border-hover);
            transform: translateY(-1px);
        }

        .action-btn:active {
            transform: translateY(0);
        }

        .action-btn.primary {
            background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%);
            border: none;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
        }

        .action-btn.primary:hover {
            background: linear-gradient(135deg, var(--accent-indigo) 20%, var(--accent-violet) 100%);
            box-shadow: 0 2px 12px rgba(139, 92, 246, 0.4);
        }

        @media (max-width: 768px) {
            .preview-canvas {
                padding: 12px;
            }

            .stave-paper {
                padding: 16px;
            }

            .preview-header {
                height: 36px;
                min-height: 36px;
                padding: 0 10px;
                gap: 6px;
            }

            .action-btn {
                height: 24px;
                width: 24px;
                font-size: 0.75rem;
            }

            .header-controls {
                height: 24px;
            }

            .zoom-controls {
                height: 24px;
                padding: 0 4px;
            }

            .zoom-btn, .zoom-reset-btn {
                width: 16px;
                height: 16px;
                font-size: 0.65rem;
            }

            .zoom-value {
                font-size: 0.7rem;
                min-width: 28px;
                height: 16px;
            }
        }

        @media (max-width: 480px) {
            .preview-header {
                height: 36px;
                padding: 0 8px;
                gap: 4px;
            }
            .header-controls {
                gap: 4px;
            }
        }

        /* Container queries for dynamic splitter resizing sensitivity */
        @container (max-width: 520px) {
            .title-text {
                display: none !important;
            }

            .btn-text {
                display: none !important;
            }

            .action-btn {
                height: 28px;
                width: 28px;
                font-size: 0.9rem;
            }

            .header-controls {
                height: 28px;
            }

            /* Compact zoom controls on mobile/narrow viewports - touch friendly! */
            .zoom-controls {
                gap: 4px;
                padding: 0 6px;
                border-radius: 8px;
                height: 28px;
            }

            .zoom-btn, .zoom-reset-btn {
                width: 20px;
                height: 20px;
                font-size: 0.75rem;
            }

            .zoom-value {
                font-size: 0.7rem;
                min-width: 28px;
                height: 20px;
            }
        }

        @container (max-width: 380px) {
            .preview-header {
                height: 36px;
                min-height: 36px;
                padding: 0 8px;
                gap: 4px;
            }

            .header-controls {
                gap: 4px;
            }

            .action-btn {
                height: 24px;
                width: 24px;
                font-size: 0.75rem;
            }

            .header-controls {
                height: 24px;
            }

            .zoom-controls {
                height: 24px;
                padding: 0 4px;
            }

            .zoom-btn, .zoom-reset-btn {
                width: 16px;
                height: 16px;
                font-size: 0.65rem;
            }

            .zoom-value {
                font-size: 0.7rem;
                min-width: 28px;
                height: 16px;
            }
        }

        @keyframes pulse-slow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
        }

        /* Interactive Note Highlighting while Playing MIDI */
        .abcjs-note-playing,
        .abcjs-note-playing path,
        .abcjs-note-playing rect {
            fill: var(--accent-violet) !important;
            stroke: var(--accent-violet) !important;
            filter: drop-shadow(0 0 3px rgba(139, 92, 246, 0.8)) !important;
            transition: fill var(--transition-fast), stroke var(--transition-fast);
        }
    `;

    constructor() {
        super();
        this.abcCode = '';
        this.zoom = 1.0;
        this.warnings = [];
        this.visualObj = null;
        this._renderTimeout = null;

        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.startScrollLeft = 0;
        this.startScrollTop = 0;
    }

    updated(changedProperties) {
        if (changedProperties.has('abcCode')) {
            if (this._renderTimeout) {
                clearTimeout(this._renderTimeout);
            }
            this._renderTimeout = setTimeout(() => {
                this.renderABC();
            }, 250); // Debounce rendering slightly for smooth keypresses
        }
    }

    firstUpdated() {
        const canvas = this.shadowRoot.querySelector('.preview-canvas');
        if (canvas) {
            // Attach wheel listener with passive: false to allow e.preventDefault()
            canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._renderTimeout) {
            clearTimeout(this._renderTimeout);
        }
    }

    zoomIn() {
        this.zoom = Math.min(5.0, parseFloat((this.zoom + 0.1).toFixed(1)));
    }

    zoomOut() {
        this.zoom = Math.max(0.4, parseFloat((this.zoom - 0.1).toFixed(1)));
    }

    zoomReset() {
        this.zoom = 1.0;
    }

    handleMouseDown(e) {
        if (e.button !== 0) return; // Left click only
        
        // Don't drag if clicking inside the warnings panel
        if (e.target.closest('.warnings-panel')) {
            return;
        }

        const canvas = this.shadowRoot.querySelector('.preview-canvas');
        if (!canvas) return;
        
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startScrollLeft = canvas.scrollLeft;
        this.startScrollTop = canvas.scrollTop;

        this._onMouseMove = this.handleMouseMove.bind(this);
        this._onMouseUp = this.handleMouseUp.bind(this);
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const canvas = this.shadowRoot.querySelector('.preview-canvas');
        if (!canvas) return;

        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        
        canvas.scrollLeft = this.startScrollLeft - dx;
        canvas.scrollTop = this.startScrollTop - dy;
    }

    handleMouseUp(e) {
        this.isDragging = false;
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
    }

    handleWheel(e) {
        // Only zoom if Ctrl is pressed (this also captures native pinch-to-zoom on touchpads)
        if (!e.ctrlKey) {
            return; // Let browser perform standard scroll
        }

        // Prevent default to stop browser page zoom
        e.preventDefault();
        
        const zoomFactor = 1.1;
        let newZoom;
        if (e.deltaY < 0) {
            newZoom = this.zoom * zoomFactor;
        } else {
            newZoom = this.zoom / zoomFactor;
        }
        this.zoom = Math.max(0.4, Math.min(5.0, parseFloat(newZoom.toFixed(2))));
    }

    renderABC() {
        const code = this.abcCode?.trim();
        const displayDiv = this.shadowRoot.querySelector('.notation-display');

        if (!displayDiv) return;

        if (!code) {
            displayDiv.innerHTML = '';
            this.warnings = [];
            this.visualObj = null;
            this.dispatchEvent(new CustomEvent('status-changed', {
                detail: { status: 'Ready', isError: false },
                bubbles: true,
                composed: true
            }));
            this.dispatchEvent(new CustomEvent('render-completed', {
                detail: { visualObj: null },
                bubbles: true,
                composed: true
            }));
            return;
        }

        try {
            // Render ABC using abcjs
            const visualObjArray = ABCJS.renderAbc(
                displayDiv,
                code,
                {
                    responsive: 'resize',
                    staffwidth: 700, // Width optimized for vector layout scaling
                    paddingtop: 10,
                    paddingbottom: 10,
                    paddingright: 10,
                    paddingleft: 10,
                    add_classes: true, // Renders CSS classes on SVGs for future interactivity
                    clickListener: (abcElem, tuneNumber, classes, analysis, drag, mouseEvent) => {
                        // Prevent accidental clicks when dragging the canvas
                        const dx = Math.abs(mouseEvent.clientX - this.startX);
                        const dy = Math.abs(mouseEvent.clientY - this.startY);
                        const wasDragging = dx > 5 || dy > 5;

                        const clickedNote = mouseEvent.target.closest('.abcjs-note');
                        
                        if (clickedNote) {
                            if (!wasDragging) {
                                // Toggle the custom class for multi-selection only if it was a real click
                                clickedNote.classList.toggle('user-selected-note');
                            }
                            
                            // Defeat ABCJS's internal single-selection styling regardless
                            // to ensure dragging doesn't leave a stray red highlight
                            setTimeout(() => {
                                clickedNote.classList.remove('abcjs-note_selected');
                                clickedNote.removeAttribute('fill');
                                clickedNote.style.fill = '';
                                clickedNote.querySelectorAll('*').forEach(p => {
                                    p.removeAttribute('fill');
                                    p.style.fill = '';
                                });
                            }, 0);
                        }

                        if (wasDragging) return;

                        // Dispatch event for other components, abcjs handles highlighting automatically
                        this.dispatchEvent(new CustomEvent('note-clicked', {
                            detail: { abcElem, classes },
                            bubbles: true,
                            composed: true
                        }));
                    }
                }
            );

            if (visualObjArray && visualObjArray.length > 0) {
                const visualObj = visualObjArray[0];
                this.visualObj = visualObj;

                // Read parsing warnings
                const warnings = visualObj.warnings || [];
                this.warnings = warnings;

                const hasErrors = warnings.length > 0;

                this.dispatchEvent(new CustomEvent('status-changed', {
                    detail: {
                        status: hasErrors ? `✓ Rendered (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : '✓ Sheet Music Ready',
                        isError: false // Non-fatal rendering
                    },
                    bubbles: true,
                    composed: true
                }));

                // Dispatch completed rendering containing the visualObj (to feed the audio synth player)
                this.dispatchEvent(new CustomEvent('render-completed', {
                    detail: { visualObj: visualObj },
                    bubbles: true,
                    composed: true
                }));
            }
        } catch (error) {
            console.error(error);
            displayDiv.innerHTML = '';
            this.visualObj = null;
            this.warnings = [{ message: error.message, line: 'System', column: '' }];

            this.dispatchEvent(new CustomEvent('status-changed', {
                detail: { status: '✗ Compilation Error', isError: true },
                bubbles: true,
                composed: true
            }));

            this.dispatchEvent(new CustomEvent('render-completed', {
                detail: { visualObj: null },
                bubbles: true,
                composed: true
            }));
        }
    }

    _parseABCField(field) {
        if (!this.abcCode) return '';
        const match = this.abcCode.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'));
        return match ? match[1].trim() : '';
    }

    handleExportSVG() {
        const svg = this.shadowRoot.querySelector('.notation-display svg');
        if (!svg) {
            alert('Please write some music first!');
            return;
        }

        try {
            const title = this._parseABCField('T') || 'stave';
            const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'stave';

            const svgString = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${cleanTitle}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to export SVG: ' + error.message);
        }
    }

    async handleExportPDF() {
        const svg = this.shadowRoot.querySelector('.notation-display svg');
        if (!svg) {
            alert('Please write some music first!');
            return;
        }

        try {
            const title = this._parseABCField('T') || 'stave';
            const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'stave';

            let width = svg.width?.baseVal?.value || svg.getBoundingClientRect().width;
            let height = svg.height?.baseVal?.value || svg.getBoundingClientRect().height;

            if (!width || !height) {
                const viewBox = svg.getAttribute('viewBox');
                if (viewBox) {
                    const parts = viewBox.split(' ');
                    width = parseFloat(parts[2]);
                    height = parseFloat(parts[3]);
                } else {
                    width = 800;
                    height = 1131;
                }
            }

            const doc = new jsPDF({
                orientation: width > height ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [width, height]
            });

            await doc.svg(svg, {
                x: 0,
                y: 0,
                width: width,
                height: height
            });

            doc.save(`${cleanTitle}.pdf`);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('Failed to export PDF: ' + error.message);
        }
    }

    handleCopySVG() {
        const svg = this.shadowRoot.querySelector('.notation-display svg');
        if (!svg) {
            alert('Please write some music first!');
            return;
        }

        try {
            const svgString = new XMLSerializer().serializeToString(svg);
            navigator.clipboard.writeText(svgString).then(() => {
                alert('✓ SVG Code copied to clipboard!');
            }).catch(err => {
                console.error("Clipboard API failed, trying fallback:", err);
                const textarea = document.createElement('textarea');
                textarea.value = svgString;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('✓ SVG Code copied to clipboard!');
            });
        } catch (error) {
            alert('Failed to copy SVG: ' + error.message);
        }
    }

    render() {
        const hasCode = this.abcCode?.trim().length > 0;
        const paperWidthPercent = Math.round(this.zoom * 100);

        return html`
            <div class="preview-container">
                <div class="preview-header">
                    <div class="header-title">
                        🎶 <span class="title-text">Sheet Preview</span>
                    </div>
                    
                    <div class="zoom-controls">
                        <button class="zoom-btn" @click="${this.zoomOut}" ?disabled="${this.zoom <= 0.4}" title="Zoom Out">-</button>
                        <span class="zoom-value">${paperWidthPercent}%</span>
                        <button class="zoom-btn" @click="${this.zoomIn}" ?disabled="${this.zoom >= 5.0}" title="Zoom In">+</button>
                        <button class="zoom-reset-btn" @click="${this.zoomReset}" ?disabled="${this.zoom === 1.0}" title="Reset Zoom">↺</button>
                    </div>

                    <div class="header-controls">

                        <button class="action-btn" @click="${this.handleExportPDF}" title="Print / Download Sheet Music as PDF">
                            🖨️
                        </button>
                        <button class="action-btn" @click="${this.handleExportSVG}" title="Download Sheet Music as SVG">
                            📥
                        </button>
                        <button class="action-btn" @click="${this.handleCopySVG}" title="Copy Raw SVG XML Code to Clipboard">
                            📋
                        </button>
                    </div>
                </div>

                <div class="preview-canvas ${this.isDragging ? 'dragging' : ''}"
                     @mousedown="${this.handleMouseDown}">
                    ${!hasCode ? html`
                        <div class="empty-state">
                            <span class="empty-icon">🎵</span>
                            <p>StaveEditor is ready.<br>Type ABC notation or choose a Preset to begin.</p>
                        </div>
                    ` : html`
                        <div class="stave-paper" style="${`width: ${paperWidthPercent}%; min-width: ${paperWidthPercent}%;`}">
                            <div class="notation-display"></div>
                        </div>
                    `}

                    ${this.warnings && this.warnings.length > 0 ? html`
                        <div class="warnings-panel">
                            <div class="warnings-header">
                                ⚠️ Syntax Warnings / Errors (${this.warnings.length})
                            </div>
                            <ul class="warnings-list">
                                ${this.warnings.map(w => html`
                                    <li class="warning-item">
                                        <span class="warning-meta">${w.line !== 'System' ? `Line ${w.line}` : 'System'}${w.column ? `, Col ${w.column}` : ''}:</span>
                                        ${w.message}
                                    </li>
                                `)}
                            </ul>
                        </div>
                    ` : ''}
                </div>

                <playback-component
                    .visualObj="${this.visualObj}"
                ></playback-component>
            </div>
        `;
    }
}
