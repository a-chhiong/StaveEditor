import { LitElement, html, css } from 'lit';
import LZString from 'lz-string';

export class AppComponent extends LitElement {
    static properties = {
        abcCode: { type: String },
        status: { type: String },
        isError: { type: Boolean },
        visualObj: { type: Object },
        splitPercentage: { type: Number },
        isDragging: { type: Boolean }
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
            background: radial-gradient(circle at 10% 20%, #1e1b4b 0%, #0f172a 90%);
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
            background: rgba(15, 23, 42, 0.25);
        }

        .preview-area {
            min-width: 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            background: rgba(11, 15, 25, 0.4);
        }

        /* Sleek Splitter drag bar */
        .app-splitter {
            background: rgba(255, 255, 255, 0.08);
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
        @media (max-width: 1024px) {
            .app-main {
                flex-direction: column-reverse;
            }

            .app-splitter {
                width: 100%;
                height: 4px;
                cursor: row-resize;
            }

            .app-splitter::after {
                width: 100%;
                height: 16px;
            }

        }
    `;

    constructor() {
        super();
        this.abcCode = this._loadFromUrl() || this._loadFromStorage() || this._getDefaultABC();
        this.status = 'Ready';
        this.isError = false;
        this.visualObj = null;
        this.splitPercentage = 50; // default 50/50 split
        this.isDragging = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._onWindowResize = () => this.requestUpdate();
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
        const isDesktop = window.innerWidth > 1024;
        
        let percentage;
        if (isDesktop) {
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
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('abc');
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
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?abc=' + compressed;
            window.history.replaceState({ path: newUrl }, '', newUrl);
        }
    }

    handleStatusChanged(e) {
        this.status = e.detail.status;
        this.isError = e.detail.isError;
    }

    handleRenderCompleted(e) {
        this.visualObj = e.detail.visualObj;
    }

    render() {
        const isDesktop = window.innerWidth > 1024;
        
        return html`
            <div class="app-container">
                <header-component
                    .status="${this.status}"
                    .isError="${this.isError}"
                    .abcCode="${this.abcCode}"
                ></header-component>

                <main class="app-main">
                    <div class="editor-area" style="${isDesktop ? `width: ${this.splitPercentage}%; flex: none;` : `height: ${this.splitPercentage}%; flex: none;`}">
                        <editor-component
                            .abcCode="${this.abcCode}"
                            @abc-changed="${this.handleABCChanged.bind(this)}"
                        ></editor-component>
                    </div>
                    
                    <div class="app-splitter ${this.isDragging ? 'dragging' : ''}" 
                         @mousedown="${this.startDrag}" 
                         @touchstart="${this.startDrag}"></div>
                    
                    <div class="preview-area" style="${isDesktop ? `width: ${100 - this.splitPercentage}%; flex: none;` : `height: ${100 - this.splitPercentage}%; flex: none;`}">
                        <preview-component
                            .abcCode="${this.abcCode}"
                            @status-changed="${this.handleStatusChanged.bind(this)}"
                            @render-completed="${this.handleRenderCompleted.bind(this)}"
                        ></preview-component>
                    </div>
                </main>

                <playback-component
                    .visualObj="${this.visualObj}"
                ></playback-component>
            </div>
        `;
    }
}
