import { LitElement, html, css } from 'lit';

export class AlertDialog extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        message: { type: String }
    };

    static styles = css`
        :host {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            align-items: center;
            justify-content: center;
        }

        :host([open]) {
            display: flex;
        }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            animation: fadeIn 0.2s ease-out;
        }

        .dialog-box {
            position: relative;
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-sizing: border-box;
            animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
        }

        .message {
            font-size: 0.95rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
        }

        .btn-ok {
            background: var(--accent-violet);
            color: #ffffff;
            border: none;
            padding: 8px 24px;
            border-radius: 6px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: opacity var(--transition-fast), transform var(--transition-fast);
        }

        .btn-ok:hover {
            opacity: 0.9;
            transform: scale(1.02);
        }

        .btn-ok:active {
            transform: scale(0.98);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.title = 'Alert';
        this.message = '';
    }

    close() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('alert-closed', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="overlay" @click="${this.close}"></div>
            <div class="dialog-box">
                <h3 class="title">${this.title}</h3>
                <p class="message">${this.message}</p>
                <div class="actions">
                    <button class="btn-ok" @click="${this.close}">OK</button>
                </div>
            </div>
        `;
    }
}

customElements.define('alert-dialog', AlertDialog);
