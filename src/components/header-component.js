import { LitElement, html, css } from 'lit';
import LZString from 'lz-string';

export class HeaderComponent extends LitElement {
    static properties = {
        status: { type: String },
        isError: { type: Boolean },
        abcCode: { type: String },
        isFullscreen: { type: Boolean },
        currentTheme: { type: String },
        shareSuccess: { type: Boolean }
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .header-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            padding: 0 20px;
            background: var(--bg-glass);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-color);
            box-sizing: border-box;
        }

        .logo-area {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .logo-icon {
            font-size: 1.4rem;
            animation: pulse-glow-logo 2s infinite ease-in-out;
        }

        .logo-title {
            font-size: 1.15rem;
            font-weight: 700;
            background: linear-gradient(135deg, #a78bfa 0%, #6366f1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.02em;
        }

        .logo-subtitle {
            font-size: 0.75rem;
            color: var(--text-muted);
            font-weight: 500;
            border-left: 1px solid var(--border-color);
            padding-left: 10px;
            margin-left: 2px;
            display: inline-block;
        }

        /* Status & Autosave Area */
        .status-area {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .status-badge {
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            padding: 3px 8px;
            border-radius: 4px;
            letter-spacing: 0.05em;
            transition: all var(--transition-fast);
        }

        .status-badge.ready {
            background: rgba(16, 185, 129, 0.15);
            color: var(--accent-emerald);
            border: 1px solid rgba(16, 185, 129, 0.2);
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.1);
        }

        .status-badge.error {
            background: rgba(244, 63, 94, 0.15);
            color: var(--accent-rose);
            border: 1px solid rgba(244, 63, 94, 0.25);
            box-shadow: 0 0 8px rgba(244, 63, 94, 0.1);
        }

        .status-text {
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--text-secondary);
            font-family: var(--font-ui);
            max-width: 250px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .header-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            font-size: 1.1rem;
            color: var(--text-secondary);
            background: var(--midi-btn-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin-left: 8px;
            cursor: pointer;
            transition: all var(--transition-fast);
            outline: none;
            padding: 0;
            flex-shrink: 0;
        }

        .header-btn:hover {
            background: var(--bg-glass-active);
            border-color: var(--accent-violet);
            color: var(--text-primary);
            transform: scale(1.05);
        }

        .header-btn:active {
            transform: scale(0.95);
        }

        @keyframes pulse-glow-logo {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(167, 139, 250, 0.2)); }
            50% { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.6)); }
        }


        @media (max-width: 768px) {
            .header-container {
                padding: 0 8px;
                height: 48px;
            }

            .logo-subtitle {
                display: none;
            }

            .logo-area {
                gap: 6px;
            }

            .logo-icon {
                font-size: 1.1rem;
            }

            .logo-title {
                font-size: 0.95rem;
            }

            .status-area {
                gap: 6px;
            }

            .status-badge {
                font-size: 0.62rem;
                padding: 2px 6px;
            }

            .status-text {
                font-size: 0.65rem;
                max-width: 90px;
                margin-left: 2px;
            }

            .header-btn {
                width: 38px;
                height: 38px;
                font-size: 1rem;
                margin-left: 4px;
            }
        }

        @media (max-width: 480px) {
            .status-text {
                display: none;
            }

        }
    `;

    constructor() {
        super();
        this.status = 'Ready';
        this.isError = false;
        this.isFullscreen = false;
        this.shareSuccess = false;
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    }

    connectedCallback() {
        super.connectedCallback();
        this._onFullscreenChange = () => {
            this.isFullscreen = !!document.fullscreenElement;
        };
        document.addEventListener('fullscreenchange', this._onFullscreenChange);
    }

    disconnectedCallback() {
        document.removeEventListener('fullscreenchange', this._onFullscreenChange);
        super.disconnectedCallback();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    async copyTextToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (!success) {
                throw new Error('execCommand copy failed');
            }
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('staveEditorTheme', newTheme);
        this.currentTheme = newTheme;
    }

    async handleShare() {
        try {
            let shareUrl = window.location.href;
            if (LZString && this.abcCode) {
                const compressed = LZString.compressToEncodedURIComponent(this.abcCode);
                shareUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?abc=' + compressed;
                window.history.replaceState({ path: shareUrl }, '', shareUrl);
            }
            await this.copyTextToClipboard(shareUrl);
            this.shareSuccess = true;
            setTimeout(() => {
                this.shareSuccess = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    }

    render() {
        const badgeClass = this.isError ? 'status-badge error' : 'status-badge ready';
        const badgeText = this.isError ? 'Error' : 'Ready';

        return html`
            <div class="header-container">
                <div class="logo-area">
                    <span class="logo-icon">🎼</span>
                    <span class="logo-title">StaveEditor</span>
                    <span class="logo-subtitle">ABC Studio</span>
                </div>

                <div class="status-area">
                    <span class="${badgeClass}">${badgeText}</span>
                    <span class="status-text">${this.status}</span>
                    
                    <button class="header-btn" @click="${this.handleShare}" title="Copy shareable link to clipboard">
                        ${this.shareSuccess ? '✅' : '🔗'}
                    </button>

                    <button class="header-btn" @click="${this.toggleFullscreen}" title="Toggle fullscreen mode">
                        ${this.isFullscreen
                            ? html`
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                                  <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>`
                            : html`
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>`
                        }
                    </button>
                    
                    <button class="header-btn" @click="${this.toggleTheme}" title="Toggle between light and dark themes">
                        ${this.currentTheme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>
        `;
    }
}


