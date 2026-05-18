import { LitElement, html, css } from 'lit';

export class HeaderComponent extends LitElement {
    static properties = {
        status: { type: String },
        isError: { type: Boolean }
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
            background: rgba(15, 23, 42, 0.6);
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
            border-left: 1px solid rgba(255, 255, 255, 0.15);
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

        .autosave-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.72rem;
            font-weight: 600;
            color: var(--text-muted);
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 4px 10px;
            border-radius: 99px;
            margin-left: 8px;
            transition: all var(--transition-fast);
        }

        .autosave-pulse {
            width: 6px;
            height: 6px;
            background-color: var(--accent-emerald);
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 6px var(--accent-emerald);
            animation: pulse-glow-emerald 2s infinite ease-in-out;
        }

        .autosave-text-short {
            display: none;
        }

        .share-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-primary);
            background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%);
            border: none;
            padding: 5px 12px;
            border-radius: 6px;
            margin-left: 8px;
            cursor: pointer;
            transition: all var(--transition-fast);
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
        }

        .share-btn:hover {
            background: linear-gradient(135deg, var(--accent-indigo) 20%, var(--accent-violet) 100%);
            box-shadow: 0 2px 12px rgba(139, 92, 246, 0.4);
            transform: translateY(-1px);
        }

        .share-btn:active {
            transform: translateY(0);
        }

        @keyframes pulse-glow-logo {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(167, 139, 250, 0.2)); }
            50% { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.6)); }
        }

        @keyframes pulse-glow-emerald {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.2); opacity: 1; }
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

            .autosave-badge {
                padding: 3px 6px;
                font-size: 0.65rem;
                margin-left: 2px;
                gap: 4px;
            }

            .autosave-pulse {
                width: 4px;
                height: 4px;
            }

            .autosave-text-full {
                display: none;
            }

            .autosave-text-short {
                display: inline;
            }

            .share-btn {
                padding: 4px 10px;
                font-size: 0.7rem;
                margin-left: 2px;
                gap: 4px;
            }
        }

        @media (max-width: 480px) {
            .status-text {
                display: none;
            }
            .autosave-badge {
                padding: 2px 4px;
                font-size: 0.6rem;
                gap: 2px;
            }
        }
    `;

    constructor() {
        super();
        this.status = 'Ready';
        this.isError = false;
        this.shareText = 'Share';
    }

    async handleShare() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            this.shareText = 'Copied!';
            this.requestUpdate();
            setTimeout(() => {
                this.shareText = 'Share';
                this.requestUpdate();
            }, 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
            this.shareText = 'Failed';
            this.requestUpdate();
            setTimeout(() => {
                this.shareText = 'Share';
                this.requestUpdate();
            }, 2000);
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
                    <span class="logo-subtitle">Lit-based ABC Studio</span>
                </div>

                <div class="status-area">
                    <span class="${badgeClass}">${badgeText}</span>
                    <span class="status-text">${this.status}</span>
                    
                    <span class="autosave-badge" title="Automatically backed up to local storage regularly">
                        <span class="autosave-pulse"></span>
                        <span class="autosave-text-full">Autosave Active</span>
                        <span class="autosave-text-short">Autosave</span>
                    </span>
                    
                    <button class="share-btn" @click="${this.handleShare}" title="Copy link to this composition">
                        🔗 <span>${this.shareText}</span>
                    </button>
                </div>
            </div>
        `;
    }
}


