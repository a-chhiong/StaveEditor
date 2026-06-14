import { LitElement, html, css } from 'lit';

export class PanelToggles extends LitElement {
    static properties = {
        editorVisible: { type: Boolean },
        previewVisible: { type: Boolean }
    };

    static styles = css`
        :host {
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--bg-zoom-controls, rgba(0,0,0,0.05));
            padding: 4px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            background-color: transparent;
            border: none;
            border-radius: 6px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all var(--transition-fast);
            width: 28px;
            height: 28px;
            box-sizing: border-box;
        }

        .btn:hover {
            background-color: var(--bg-glass-active);
            color: var(--text-primary);
        }

        .btn.active {
            background-color: var(--accent-violet);
            color: white;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        .btn svg {
            width: 16px;
            height: 16px;
        }
    `;

    constructor() {
        super();
        this.editorVisible = true;
        this.previewVisible = true;
    }

    _toggleEditor() {
        this.dispatchEvent(new CustomEvent('toggle-panel', {
            detail: { panel: 'editor', state: !this.editorVisible },
            bubbles: true,
            composed: true
        }));
    }

    _togglePreview() {
        this.dispatchEvent(new CustomEvent('toggle-panel', {
            detail: { panel: 'preview', state: !this.previewVisible },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <button class="btn ${this.editorVisible ? 'active' : ''}" @click="${this._toggleEditor}" title="Toggle Editor Panel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
            </button>
            <button class="btn ${this.previewVisible ? 'active' : ''}" @click="${this._togglePreview}" title="Toggle Preview Panel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            </button>
        `;
    }
}