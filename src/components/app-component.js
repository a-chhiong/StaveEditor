import { LitElement, html, css } from 'lit';
import LZString from 'lz-string';
import './header-component.js';
import './editor-component.js';
import './preview-component.js';
import './alert-dialog.js';

export class AppComponent extends LitElement {
    static properties = {
        abcCode: { type: String },
        status: { type: String },
        isError: { type: Boolean },
        splitPercentage: { type: Number },
        isDragging: { type: Boolean },
        isDesktop: { type: Boolean },
        editorVisible: { type: Boolean },
        previewVisible: { type: Boolean },
        alertOpen: { type: Boolean, state: true },
        alertTitle: { type: String, state: true },
        alertMessage: { type: String, state: true }
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        .app-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100vh;
            height: 100dvh;
            background: var(--bg-app-gradient);
            overflow: hidden;
        }



        .app-main {
            display: flex;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            flex-direction: row;
        }

        .editor-area {
            min-width: 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            background: var(--bg-glass);
            border-right: 1px solid var(--border-color);
            box-sizing: border-box;
        }

        .preview-area {
            min-width: 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            background: var(--bg-glass);
            border-left: 1px solid var(--border-color);
            box-sizing: border-box;
        }

        /* Sleek Splitter drag bar */
        .app-splitter {
            background: var(--bg-splitter-line);
            position: relative;
            flex-shrink: 0;
            z-index: 5;
            transition: background var(--transition-fast), box-shadow var(--transition-fast);
        }

        .app-splitter:hover,
        .app-splitter.dragging {
            background: var(--accent-violet);
            box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
        }

        .app-splitter::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 2px;
            height: 24px;
            background: var(--text-secondary);
            border-radius: 99px;
            opacity: 0.8;
            transition: background var(--transition-fast), opacity var(--transition-fast);
            z-index: 6;
            pointer-events: none;
        }

        .app-splitter:hover::before,
        .app-splitter.dragging::before {
            background: var(--text-primary);
            opacity: 1;
        }

        .app-splitter::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
        }

        /* Desktop split defaults */
        .app-splitter {
            width: 4px;
            height: 100%;
            cursor: col-resize;
        }

        .app-splitter::after {
            width: 16px;
            height: 100%;
        }

        /* Tablet & Mobile Layout */
        .app-container.layout-mobile .app-main {
            flex-direction: column-reverse;
        }

        .app-container.layout-mobile .app-splitter {
            width: 100%;
            height: 4px;
            cursor: row-resize;
        }

        .app-container.layout-mobile .app-splitter::before {
            width: 24px;
            height: 2px;
            background-image: none;
        }

        .app-container.layout-mobile .app-splitter::after {
            width: 100%;
            height: 16px;
        }

        /* Sleek compact statusbar at the bottom */
        .app-statusbar {
            display: flex;
            align-items: center;
            height: 22px;
            padding: 0 10px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            box-sizing: border-box;
            user-select: none;
            gap: 8px;
            font-family: var(--font-ui);
            font-size: 0.7rem;
            color: var(--text-secondary);
            z-index: 10;
            flex-shrink: 0;
        }

        .status-badge {
            font-size: 0.62rem;
            font-weight: 700;
            text-transform: uppercase;
            padding: 1px 6px;
            border-radius: 3px;
            letter-spacing: 0.05em;
            transition: all var(--transition-fast);
            line-height: 1.2;
            display: inline-flex;
            align-items: center;
        }

        .status-badge.ready {
            background: rgba(16, 185, 129, 0.15);
            color: var(--accent-emerald);
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-badge.error {
            background: rgba(244, 63, 94, 0.15);
            color: var(--accent-rose);
            border: 1px solid rgba(244, 63, 94, 0.25);
        }

        .status-text {
            font-weight: 500;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .placeholder-view {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: var(--text-muted);
            font-size: 1.1rem;
            text-align: center;
            gap: 16px;
        }

        .placeholder-icon {
            font-size: 3rem;
            opacity: 0.5;
            animation: pulse-slow 3s infinite ease-in-out;
        }

        @keyframes pulse-slow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }

        @media (max-width: 480px) {
            .status-text {
                max-width: 150px;
            }
        }
    `;

    constructor() {
        super();
        this.abcCode = this._loadFromUrl() || this._loadFromStorage() || this._getDefaultABC();
        this.status = 'Ready';
        this.isError = false;
        this.splitPercentage = 50; // default 50/50 split
        this.isDragging = false;
        this.isDesktop = this._checkIsDesktop();
        this.editorVisible = true;
        this.previewVisible = true;
        this.alertOpen = false;
        this.alertTitle = '';
        this.alertMessage = '';
    }

    _checkIsDesktop() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w >= 1366 && h >= 768) {
            return true;
        }
        return (w / h) >= 1.2;
    }

    connectedCallback() {
        super.connectedCallback();
        this._onWindowResize = () => {
            this.isDesktop = this._checkIsDesktop();
            this.requestUpdate();
        };
        window.addEventListener('resize', this._onWindowResize);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this._onWindowResize);
    }

    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        
        // Bind window-level handlers so drag doesn't drop when cursor leaves splitter
        this._onDragMove = this.onDragMove.bind(this);
        this._onDragEnd = this.onDragEnd.bind(this);
        
        window.addEventListener('mousemove', this._onDragMove);
        window.addEventListener('mouseup', this._onDragEnd);
        window.addEventListener('touchmove', this._onDragMove, { passive: false });
        window.addEventListener('touchend', this._onDragEnd);
    }

    onDragMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const mainEl = this.shadowRoot.querySelector('.app-main');
        if (!mainEl) return;
        
        const rect = mainEl.getBoundingClientRect();
        
        let percentage;
        if (this.isDesktop) {
            percentage = ((clientX - rect.left) / rect.width) * 100;
        } else {
            // column-reverse layout: editor is at the bottom, preview is at the top
            percentage = ((rect.bottom - clientY) / rect.height) * 100;
        }
        
        // Constrain resize range between 15% and 85%
        this.splitPercentage = Math.max(15, Math.min(85, percentage));
    }

    onDragEnd() {
        this.isDragging = false;
        
        window.removeEventListener('mousemove', this._onDragMove);
        window.removeEventListener('mouseup', this._onDragEnd);
        window.removeEventListener('touchmove', this._onDragMove);
        window.removeEventListener('touchend', this._onDragEnd);
        
        // Dispatch window resize event so that abcjs can recalculate and fit SVG responsively!
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }

    _loadFromUrl() {
        let encoded = null;
        if (window.location.hash.startsWith('#abc/')) {
            encoded = window.location.hash.substring(5);
        } else {
            const params = new URLSearchParams(window.location.search);
            encoded = params.get('abc');
        }

        if (encoded && LZString) {
            try {
                const decoded = LZString.decompressFromEncodedURIComponent(encoded);
                if (decoded) return decoded;
            } catch (e) {
                console.error("Failed to parse ABC from URL", e);
            }
        }
        return null;
    }

    _getDefaultABC() {
        return `X: 1
T: Ode to Joy
C: Ludwig van Beethoven
M: 4/4
L: 1/4
K: G
|: B B c d | d c B A | G G A B | B > A A2 |
   B B c d | d c B A | G G A B | A > G G2 :|
|: A A B G | A B/c/ B G | A B/c/ B A | G A D2 |
   B B c d | d c B A | G G A B | A > G G2 :|`;
    }

    _loadFromStorage() {
        return localStorage.getItem('abcNotation');
    }

    handleABCChanged(e) {
        this.abcCode = e.detail;
        localStorage.setItem('abcNotation', this.abcCode);
        
        if (LZString) {
            const compressed = LZString.compressToEncodedURIComponent(this.abcCode);
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '#abc/' + compressed;
            window.history.replaceState({ path: newUrl }, '', newUrl);
        }
    }

    handleStatusChanged(e) {
        this.status = e.detail.status;
        this.isError = e.detail.isError;
    }

    handlePanelToggle(e) {
        if (e.detail.panel === 'editor') {
            this.editorVisible = e.detail.state;
        } else if (e.detail.panel === 'preview') {
            this.previewVisible = e.detail.state;
        }
        // Trigger resize so that abcjs can reflow when switching layouts
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }

    handleShowAlert(e) {
        this.alertTitle = e.detail.title || 'Alert';
        this.alertMessage = e.detail.message || '';
        this.alertOpen = true;
    }

    render() {
        const badgeClass = this.isError ? 'status-badge error' : 'status-badge ready';
        const badgeText = this.isError ? 'Error' : 'Ready';
        
        return html`
            <div class="app-container ${this.isDesktop ? 'layout-desktop' : 'layout-mobile'}" 
                 @toggle-panel="${this.handlePanelToggle}"
                 @show-alert="${this.handleShowAlert}">
                <header-component
                    .abcCode="${this.abcCode}"
                    .editorVisible="${this.editorVisible}"
                    .previewVisible="${this.previewVisible}"
                ></header-component>

                <main class="app-main">
                    ${!this.editorVisible && !this.previewVisible ? html`
                        <div class="placeholder-view">
                            <span class="placeholder-icon">🎵</span>
                            <div>All panels hidden.<br>Toggle them from the header to start.</div>
                        </div>
                    ` : html`
                        ${this.editorVisible ? html`
                            <div class="editor-area" style="${this.isDesktop ? `width: calc(${this.previewVisible ? this.splitPercentage : 100}% - ${this.previewVisible ? 2 : 0}px); flex: none;` : `height: calc(${this.previewVisible ? this.splitPercentage : 100}% - ${this.previewVisible ? 2 : 0}px); flex: none;`}">
                                <editor-component
                                    .abcCode="${this.abcCode}"
                                    @abc-changed="${this.handleABCChanged.bind(this)}"
                                ></editor-component>
                            </div>
                        ` : ''}
                        
                        ${this.editorVisible && this.previewVisible ? html`
                            <div class="app-splitter ${this.isDragging ? 'dragging' : ''}" 
                                 @mousedown="${this.startDrag}" 
                                 @touchstart="${this.startDrag}"></div>
                        ` : ''}
                        
                        ${this.previewVisible ? html`
                            <div class="preview-area" style="${this.isDesktop ? `width: calc(${this.editorVisible ? 100 - this.splitPercentage : 100}% - ${this.editorVisible ? 2 : 0}px); flex: none;` : `height: calc(${this.editorVisible ? 100 - this.splitPercentage : 100}% - ${this.editorVisible ? 2 : 0}px); flex: none;`}">
                                <preview-component
                                    .abcCode="${this.abcCode}"
                                    ?desktop="${this.isDesktop}"
                                    @status-changed="${this.handleStatusChanged.bind(this)}"
                                ></preview-component>
                            </div>
                        ` : ''}
                    `}
                </main>

                <footer class="app-statusbar">
                    <span class="${badgeClass}">${badgeText}</span>
                    <span class="status-text">${this.status}</span>
                </footer>

                <alert-dialog
                    ?open="${this.alertOpen}"
                    .title="${this.alertTitle}"
                    .message="${this.alertMessage}"
                    @alert-closed="${() => this.alertOpen = false}"
                ></alert-dialog>
            </div>
        `;
    }
}
