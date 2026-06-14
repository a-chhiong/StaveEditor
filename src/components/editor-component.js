import { LitElement, html, css } from 'lit';

export class EditorComponent extends LitElement {
    static properties = {
        abcCode: { type: String },
        toolbarOpen: { type: Boolean }
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

        .editor-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            min-width: 0;
            background: var(--bg-glass);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }

        /* Editor Header Panel */
        .editor-header {
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
            min-width: 0;
        }

        .header-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Action Buttons */
        .action-btn {
            background: var(--midi-btn-bg);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-family: var(--font-ui);
            font-size: 0.9rem;
            font-weight: 600;
            height: 28px;
            width: 28px;
            border-radius: 6px;
            cursor: pointer;
            transition: all var(--transition-fast);
            display: flex;
            align-items: center;
            justify-content: center;
            outline: none;
            box-sizing: border-box;
            flex-shrink: 0;
        }

        .action-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
            border-color: var(--border-hover);
        }

        .action-btn.primary {
            background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%);
            border: none;
            color: var(--text-primary);
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
        }

        .action-btn.primary:hover {
            background: linear-gradient(135deg, var(--accent-indigo) 20%, var(--accent-violet) 100%);
            box-shadow: 0 2px 12px rgba(139, 92, 246, 0.4);
        }

        .action-btn.danger:hover {
            background: rgba(244, 63, 94, 0.15);
            border-color: var(--accent-rose);
            color: var(--accent-rose);
        }

        /* Active state for toolbar toggle button */
        .action-btn.toolbar-toggle-btn.active {
            background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%);
            border-color: var(--accent-violet);
            color: var(--text-primary);
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.35);
        }

        /* Code Editor Input Area */
        .editor-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            min-width: 0;
            overflow: hidden;
            position: relative;
        }

        .editor-input {
            flex: 1;            /* Dynamic expansion: Take up exactly what's left in the flex layout */
            width: 100%;
            height: 100%;
            min-height: 0;      /* CRITICAL: Force the layout engine to clamp it and use its scrollbar */
            min-width: 0;      /* CRITICAL: Force the layout engine to clamp it and use its scrollbar */
            padding: 16px;
            font-family: var(--font-code);
            font-size: 0.85rem;
            color: var(--text-primary);
            background: transparent;
            border: none;
            resize: none;
            line-height: 1.6;
            outline: none;
            overflow-y: auto;
            overflow-x: auto;
            white-space: pre;
            word-wrap: normal;
            tab-size: 4;
            caret-color: var(--accent-violet);
            box-sizing: border-box; /* Ensures the 16px padding doesn't create artificial overflow scrolling */
        }

        /* ─── Toolbar Drawer ──────────────────────────────────────────────── */

        /* Backdrop — closes drawer when clicking outside */
        .toolbar-backdrop {
            position: absolute;
            inset: 0;
            z-index: 10;
            background: transparent;
            pointer-events: none;
            opacity: 0;
        }

        .toolbar-backdrop.open {
            pointer-events: auto;
        }

        /* Drawer panel that slides up from the bottom of .editor-content */
        .quick-toolbar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 11;
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: var(--bg-toolbar);
            border-top: 1px solid var(--border-color);
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
            overflow-x: auto;
            scrollbar-width: none;

            /* Slide transition */
            transform: translateY(100%);
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.25s ease;
        }

        .quick-toolbar::-webkit-scrollbar {
            display: none;
        }

        .quick-toolbar.open {
            transform: translateY(0);
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
        }

        /* ─── Toolbar Contents ────────────────────────────────────────────── */

        .toolbar-group {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-wrap: nowrap;
        }

        .toolbar-group-label {
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-right: 6px;
            letter-spacing: 0.05em;
            flex-shrink: 0;
        }

        .toolbar-btn {
            background: var(--midi-btn-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-family: var(--font-code);
            font-size: 0.85rem;
            font-weight: 600;
            min-width: 36px;
            height: 36px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-fast);
            padding: 0 10px;
            flex-shrink: 0;
        }

        .toolbar-btn:hover {
            background: var(--bg-glass-active);
            border-color: var(--accent-indigo);
            color: var(--accent-indigo);
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .toolbar-btn:active {
            transform: translateY(0);
        }

        .toolbar-divider {
            width: 1px;
            height: 20px;
            background: var(--border-color);
            margin: 0 4px;
            flex-shrink: 0;
        }

        /* Invisible trailing spacer — mirrors the leading padding-left on the first button */
        .toolbar-end-spacer {
            width: 12px;
            flex-shrink: 0;
        }

        @media (max-width: 768px) {
            .editor-header {
                height: 36px;
                min-height: 36px;
                padding: 0 10px;
            }

            .action-btn {
                height: 24px;
                width: 24px;
                font-size: 0.75rem;
            }

            .editor-input {
                font-size: 0.8rem;
                padding: 12px;
            }

            .quick-toolbar {
                gap: 6px;
                padding: 8px 12px;
            }

            .toolbar-group {
                gap: 3px;
                flex-wrap: nowrap;
            }

            .toolbar-divider {
                display: block;
            }

            .toolbar-btn {
                min-width: 34px;
                height: 34px;
                font-size: 0.8rem;
            }
        }

        @media (max-width: 480px) {
            .editor-header {
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
        }

        @container (max-width: 380px) {
            .editor-header {
                height: 36px;
                min-height: 36px;
                padding: 0 8px;
                gap: 6px;
            }

            .header-controls {
                gap: 4px;
            }

            .action-btn {
                height: 24px;
                width: 24px;
                font-size: 0.75rem;
            }
        }
    `;

    constructor() {
        super();
        this.abcCode = '';
        this.toolbarOpen = false;
    }

    toggleToolbar() {
        this.toolbarOpen = !this.toolbarOpen;
    }

    closeToolbar() {
        this.toolbarOpen = false;
    }

    handleInput(e) {
        this._dispatchABCChanged(e.target.value);
    }

    _dispatchABCChanged(value) {
        this.dispatchEvent(new CustomEvent('abc-changed', {
            detail: value,
            bubbles: true,
            composed: true,
        }));
    }

    triggerFileInput() {
        const fileInput = this.shadowRoot.getElementById('abc-file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    handleLoadABCFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            this.abcCode = content;
            this._dispatchABCChanged(content);
            e.target.value = '';
        };
        reader.readAsText(file);
    }

    _parseABCField(field) {
        if (!this.abcCode) return '';
        const match = this.abcCode.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'));
        return match ? match[1].trim() : '';
    }

    handleSaveABCFile() {
        if (!this.abcCode || !this.abcCode.trim()) {
            alert('Please write some music first!');
            return;
        }

        try {
            const title = this._parseABCField('T') || 'stave';
            const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'stave';

            const blob = new Blob([this.abcCode], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${cleanTitle}.abc`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to save ABC file: ' + error.message);
        }
    }

    handleClear() {
        if (!this.abcCode || !this.abcCode.trim()) return;

        if (confirm('⚠️ WARNING: This will delete everything in the editor.\n\nAre you sure you want to clear all contents? This action cannot be undone.')) {
            this.abcCode = '';
            this._dispatchABCChanged('');
        }
    }

    insertSymbol(symbol) {
        const textarea = this.shadowRoot.querySelector('.editor-input');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        const newValue = before + symbol + after;
        this.abcCode = newValue;
        textarea.value = newValue;

        // Reposition cursor
        const newCursorPos = start + symbol.length;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        textarea.focus();

        this._dispatchABCChanged(newValue);
    }

    render() {
        return html`
            <div class="editor-container">
                <div class="editor-header">
                    <div class="header-title">
                        ✏️ <span class="title-text">ABC Editor</span>
                    </div>
                    <div class="header-controls">
                        <input type="file" id="abc-file-input" accept=".abc,.txt" style="display: none;" @change="${this.handleLoadABCFile}">

                        <button
                            class="action-btn toolbar-toggle-btn ${this.toolbarOpen ? 'active' : ''}"
                            @click="${this.toggleToolbar}"
                            title="Toggle symbol toolbar"
                        >
                            🎹
                        </button>

                        <button class="action-btn" @click="${this.triggerFileInput}" title="Load .abc notation file from your device">
                            📂
                        </button>
                        <button class="action-btn" @click="${this.handleSaveABCFile}" title="Save current composition as a raw .abc file">
                            💾
                        </button>
                        <button class="action-btn danger" @click="${this.handleClear}" title="Clear all text">
                            🗑️
                        </button>
                    </div>
                </div>

                <div class="editor-content">
                    <textarea
                        class="editor-input"
                        placeholder="Write your ABC Notation here..."
                        spellcheck="false"
                        wrap="off"
                        .value="${this.abcCode}"
                        @input="${this.handleInput.bind(this)}"
                    ></textarea>

                    <!-- Backdrop: clicking it closes the drawer -->
                    <div
                        class="toolbar-backdrop ${this.toolbarOpen ? 'open' : ''}"
                        @click="${this.closeToolbar}"
                    ></div>

                    <!-- Drawer panel -->
                    <div class="quick-toolbar ${this.toolbarOpen ? 'open' : ''}">
                        <div class="toolbar-group">
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('|')}" title="Barline">|</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('|:')}" title="Start Repeat">|:</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol(':|')}" title="End Repeat">:|</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('::')}" title="Double Repeat">::</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('[|')}" title="Double Barline">[|</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('|]')}" title="Thin-thick Double Bar">|]</button>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('^')}" title="Sharp (accidentals)">^</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('_')}" title="Flat (accidentals)">_</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('=')}" title="Natural (accidentals)">=</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('/')}" title="Shorten note half">/</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('>')}" title="Dotted rhythm (longer > shorter)">></button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('<')}" title="Dotted rhythm (shorter < longer)">&lt;</button>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('z')}" title="Rest">z</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('[]')}" title="Chord brackets">[ ]</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('()')}" title="Slur brackets">( )</button>
                            <button class="toolbar-btn" @click="${() => this.insertSymbol('V: 1 clef=treble\\nV: 2 clef=bass\\n')}" title="Insert Two Voices">V:1/2</button>
                        </div>

                        <div class="toolbar-end-spacer"></div>
                    </div>
                </div>
            </div>
        `;
    }
}
