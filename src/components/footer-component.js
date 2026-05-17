import { LitElement, html, css } from 'lit';

export class FooterComponent extends LitElement {
    static properties = {
        status: { type: String },
        isError: { type: Boolean },
        abcCode: { type: String }
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            flex-shrink: 0;
            z-index: 10;
        }

        .footer-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            background: rgba(22, 30, 49, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid var(--border-color);
            gap: 16px;
        }

        /* Status Area */
        .status-area {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 99px;
            white-space: nowrap;
            letter-spacing: 0.02em;
            transition: all var(--transition-fast);
        }

        .status-badge.ready {
            background: rgba(16, 185, 129, 0.12);
            color: var(--accent-emerald);
            border: 1px solid rgba(16, 185, 129, 0.2);
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
        }

        .status-badge.error {
            background: rgba(244, 63, 94, 0.12);
            color: var(--accent-rose);
            border: 1px solid rgba(244, 63, 94, 0.2);
            box-shadow: 0 0 10px rgba(244, 63, 94, 0.15);
        }

        .status-text {
            font-size: 0.8rem;
            color: var(--text-secondary);
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Export Action Buttons */
        .export-area {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
            justify-content: flex-end;
        }

        .export-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-family: var(--font-ui);
            font-size: 0.8rem;
            font-weight: 600;
            height: 32px;
            padding: 0 12px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all var(--transition-fast);
            white-space: nowrap;
        }

        .export-btn.primary {
            background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%);
            border: none;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .export-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--border-hover);
            transform: translateY(-1px);
        }

        .export-btn.primary:hover {
            background: linear-gradient(135deg, var(--accent-indigo) 20%, var(--accent-violet) 100%);
            box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        }

        .export-btn:active {
            transform: translateY(0);
        }

        /* Layout responsive adaptations */
        @media (max-width: 768px) {
            .footer-container {
                flex-direction: column;
                align-items: stretch;
                padding: 12px 16px;
                gap: 12px;
            }

            .status-area {
                order: 1;
            }

            .export-area {
                order: 2;
                justify-content: space-between;
                width: 100%;
                gap: 6px;
            }

            .export-btn {
                flex: 1;
                justify-content: center;
            }
        }

        @media (max-width: 480px) {
            .export-area {
                flex-direction: column;
                gap: 6px;
            }
            .export-btn {
                width: 100%;
            }
        }
    `;

    constructor() {
        super();
        this.status = 'Ready';
        this.isError = false;
        this.abcCode = '';
    }

    _getActiveSVG() {
        // Clean shadow traversal to extract active SVG
        const app = document.querySelector('abc-app');
        if (!app) return null;
        
        const preview = app.shadowRoot.querySelector('preview-component');
        if (!preview) return null;
        
        const svg = preview.shadowRoot.querySelector('.notation-display svg');
        return svg;
    }

    handleExportSVG() {
        const svg = this._getActiveSVG();
        if (!svg) {
            alert('Please load or write some music first!');
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
        const svg = this._getActiveSVG();
        if (!svg) {
            alert('Please load or write some music first!');
            return;
        }

        try {
            const svgString = new XMLSerializer().serializeToString(svg);
            navigator.clipboard.writeText(svgString).then(() => {
                alert('✓ SVG Code copied to clipboard!');
            }).catch(err => {
                console.error("Clipboard API failed, trying fallback:", err);
                // Fallback copy
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
        const badgeClass = this.isError ? 'status-badge error' : 'status-badge ready';
        const badgeText = this.isError ? 'Error' : 'Ready';

        return html`
            <footer class="footer-container">
                <div class="status-area">
                    <span class="${badgeClass}">${badgeText}</span>
                    <span class="status-text">${this.status}</span>
                </div>

                <div class="export-area">
                    <button class="export-btn primary" @click="${this.handleExportSVG}" title="Download Sheet Music as Vector SVG">
                        📥 SVG Stave
                    </button>
                    <button class="export-btn" @click="${this.handleCopySVG}" title="Copy Raw SVG XML Code to Clipboard">
                        📋 Copy SVG
                    </button>
                </div>
            </footer>
        `;
    }
}
