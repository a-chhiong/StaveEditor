import { LitElement, html, css, unsafeCSS } from 'lit';
import ABCJS from 'abcjs';

export class PreviewComponent extends LitElement {
    static properties = {
        abcCode: { type: String },
        zoom: { type: Number },
        warnings: { type: Array },
        visualObj: { type: Object }
    };

    static styles = css`
        :host {
            container-type: inline-size;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
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

        /* Preview Header Panel */
        .preview-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            padding: 0 16px;
            background: var(--bg-panel-header);
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
            gap: 12px;
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
        }

        .zoom-controls {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--bg-zoom-controls);
            padding: 3px 6px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .zoom-btn, .zoom-reset-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 0.85rem;
            cursor: pointer;
            width: 26px;
            height: 26px;
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
            font-weight: 600;
            color: var(--text-primary);
            min-width: 34px;
            text-align: center;
            user-select: none;
        }



        /* Scrollable Canvas Viewport */
        .preview-canvas {
            flex: 1;
            overflow: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 0;
        }

        /* The Sheet Music Paper */
        .stave-paper {
            background: var(--bg-paper);
            color: var(--text-dark);
            border-radius: 12px;
            box-shadow: var(--shadow-paper);
            padding: 30px;
            transition: width var(--transition-normal), min-width var(--transition-normal);
            margin-bottom: 20px;
            box-sizing: border-box;
            border: 1px solid rgba(0, 0, 0, 0.06);
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
        }

        /* Action Buttons */
        .action-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: var(--midi-btn-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-family: var(--font-ui);
            font-size: 0.82rem;
            font-weight: 600;
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            transition: all var(--transition-fast);
            user-select: none;
            white-space: nowrap;
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
                height: 48px;
                padding: 0 10px;
                gap: 6px;
            }
        }

        ${unsafeCSS(`
        /* Container queries for dynamic splitter resizing sensitivity */
        @container (max-width: 520px) {
            .title-text {
                display: none !important;
            }

            .btn-text {
                display: none !important;
            }

            .action-btn {
                padding: 8px 10px;
                font-size: 0.8rem;
            }

            /* Compact zoom controls on mobile/narrow viewports - touch friendly! */
            .zoom-controls {
                gap: 4px;
                padding: 3px 6px;
                border-radius: 8px;
            }

            .zoom-btn, .zoom-reset-btn {
                width: 24px;
                height: 24px;
                font-size: 0.8rem;
            }

            .zoom-value {
                font-size: 0.7rem;
                min-width: 28px;
            }
        }

        @container (max-width: 380px) {
            .preview-header {
                height: 44px;
                padding: 0 8px;
                gap: 4px;
            }

            .header-controls {
                gap: 4px;
            }

            .action-btn {
                padding: 6px 8px;
                font-size: 0.75rem;
            }
        }
        `)}

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

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._renderTimeout) {
            clearTimeout(this._renderTimeout);
        }
    }

    zoomIn() {
        if (this.zoom < 1.5) {
            this.zoom = parseFloat((this.zoom + 0.1).toFixed(1));
        }
    }

    zoomOut() {
        if (this.zoom > 0.6) {
            this.zoom = parseFloat((this.zoom - 0.1).toFixed(1));
        }
    }

    zoomReset() {
        this.zoom = 1.0;
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
                    add_classes: true // Renders CSS classes on SVGs for future interactivity
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

    handleExportSVG() {
        const svg = this.shadowRoot.querySelector('.notation-display svg');
        if (!svg) {
            alert('Please write some music first!');
            return;
        }

        try {
            const svgString = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'stave.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to export SVG: ' + error.message);
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
                        <button class="zoom-btn" @click="${this.zoomOut}" ?disabled="${this.zoom <= 0.6}" title="Zoom Out">-</button>
                        <span class="zoom-value">${paperWidthPercent}%</span>
                        <button class="zoom-btn" @click="${this.zoomIn}" ?disabled="${this.zoom >= 1.5}" title="Zoom In">+</button>
                        <button class="zoom-reset-btn" @click="${this.zoomReset}" ?disabled="${this.zoom === 1.0}" title="Reset Zoom">
                            ↺
                        </button>
                    </div>

                    <div class="header-controls">
                        <button class="action-btn" @click="${this.handleExportSVG}" title="Download Sheet Music as Vector SVG">
                            📥 <span class="btn-text">Download</span>
                        </button>
                        <button class="action-btn" @click="${this.handleCopySVG}" title="Copy Raw SVG XML Code to Clipboard">
                            📋 <span class="btn-text">Copy</span>
                        </button>
                    </div>
                </div>

                <div class="preview-canvas">
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
