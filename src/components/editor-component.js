import { LitElement, html, css } from 'lit';

export class EditorComponent extends LitElement {
    static properties = {
        abcCode: { type: String }
    };

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .editor-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }

        /* Editor Header Panel */
        .editor-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 16px;
            background: rgba(22, 30, 49, 0.7);
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
            gap: 12px;
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

        /* Preset Loader Select */
        .preset-select {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-family: var(--font-ui);
            font-size: 0.8rem;
            font-weight: 500;
            padding: 5px 24px 5px 10px;
            border-radius: 6px;
            cursor: pointer;
            transition: all var(--transition-fast);
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 12px;
        }

        .preset-select:hover {
            border-color: var(--accent-violet);
            box-shadow: 0 0 8px rgba(139, 92, 246, 0.25);
        }

        .preset-select:focus {
            outline: none;
            border-color: var(--accent-violet);
        }

        /* Action Buttons */
        .action-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-family: var(--font-ui);
            font-size: 0.8rem;
            font-weight: 500;
            padding: 5px 10px;
            border-radius: 6px;
            cursor: pointer;
            transition: all var(--transition-fast);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .action-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
            border-color: var(--border-hover);
        }

        /* Code Editor Input */
        .editor-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            position: relative;
        }

        .editor-input {
            width: 100%;
            height: 100%;
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
            tab-size: 4;
            caret-color: var(--accent-violet);
        }

        /* Custom Keyboard Helper Toolbar */
        .quick-toolbar {
            display: flex;
            flex-wrap: wrap; /* RWD Wrapping! */
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(15, 23, 42, 0.9);
            border-top: 1px solid var(--border-color);
            flex-shrink: 0;
        }

        .toolbar-group {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-wrap: wrap;
        }

        .toolbar-group-label {
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-right: 6px;
            letter-spacing: 0.05em;
        }

        .toolbar-btn {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-family: var(--font-code);
            font-size: 0.8rem;
            font-weight: 600;
            min-width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-fast);
            padding: 0 8px;
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

        @media (max-width: 768px) {
            .editor-header {
                padding: 8px 12px;
            }

            .header-title span {
                display: none;
            }

            .preset-select {
                font-size: 0.75rem;
                padding: 4px 20px 4px 8px;
            }

            .editor-input {
                font-size: 0.8rem;
                padding: 12px;
            }

            .quick-toolbar {
                gap: 6px;
                padding: 6px 10px;
            }

            .toolbar-group {
                gap: 3px;
            }

            .toolbar-divider {
                display: none; /* Hide dividers when items wrap to stack cleanly */
            }

            .toolbar-btn {
                min-width: 28px;
                height: 28px;
                font-size: 0.75rem;
            }
        }
    `;

    constructor() {
        super();
        this.abcCode = '';
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

    handlePresetChange(e) {
        const selectedValue = e.target.value;
        let newABC = '';

        switch (selectedValue) {
            case 'ode-to-joy':
                newABC = `X: 1
T: Ode to Joy
C: Ludwig van Beethoven
M: 4/4
L: 1/4
K: G
|: B B c d | d c B A | G G A B | B > A A2 |
   B B c d | d c B A | G G A B | A > G G2 :|
|: A A B G | A B/c/ B G | A B/c/ B A | G A D2 |
   B B c d | d c B A | G G A B | A > G G2 :|`;
                break;
            case 'c-scale':
                newABC = `X: 1
T: C Major Scale & Arpeggio
M: 4/4
L: 1/4
K: C
C D E F | G A B c | c B A G | F E D C |
C E G c | c G E C | [CEG]4 |]`;
                break;
            case 'happy-birthday':
                newABC = `X: 1
T: Happy Birthday to You
M: 3/4
L: 1/4
K: F
C/2>C/2 D C | F E2 | C/2>C/2 D C | G F2 |
C/2>C/2 c A | F/2>E/2 D B/2>B/2 | A F G | F3 |]`;
                break;
            case 'bach-minuet':
                newABC = `X: 1
T: Minuet in G Major
C: Christian Petzold (JS Bach)
M: 3/4
L: 1/8
K: G
|: d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
   c2 defg | a2 f2 ed | gfedcB | a2 A2 A2 :|
|: b2 GABc | b2 G2 G2 | a2 ABcd | a2 A2 A2 |
   f2 defg | g2 f2 ed | gfedcB | g2 G2 G2 :|`;
                break;
            case 'jazz-chords':
                newABC = `X: 1
T: Jazz ii-V-I Progression
M: 4/4
L: 1/1
K: C
"Dm7"[DFAc] | "G7"[GBdf] | "Cmaj7"[CEGB] | "A7"[^CGA^c] |
"Dm7"[DFAc] | "G7"[GBdf] | "Cmaj7"[CEGB]4 |]`;
                break;
            case 'two-voices':
                newABC = `X: 1
T: Invention No. 1 - Excerpt
C: J.S. Bach
M: 4/4
L: 1/8
K: C
V: 1 clef=treble name="Treble"
z CDE FDEC | G2 c2 B2 c2 | d2 G2 c2 B2 | c8 |
V: 2 clef=bass name="Bass"
C,8 | C,2 D,,E,, F,,D,,E,,C,, | G,,2 C,,2 B,,2 C,,2 | C,8 |]`;
                break;
            default:
                return;
        }

        this.abcCode = newABC;
        this._dispatchABCChanged(newABC);
        
        // Reset the select element visual back to the placeholder/selected preset
        const select = this.shadowRoot.querySelector('.preset-select');
        select.value = selectedValue;
    }

    handleClear() {
        if (confirm('Clear editor contents?')) {
            this.abcCode = '';
            this._dispatchABCChanged('');
            const select = this.shadowRoot.querySelector('.preset-select');
            select.value = '';
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
                        ✏️ <span>ABC Editor</span>
                    </div>
                    <div class="header-controls">
                        <select class="preset-select" @change="${this.handlePresetChange.bind(this)}">
                            <option value="">📂 Select Song Preset</option>
                            <option value="ode-to-joy">Ode to Joy (Beethoven)</option>
                            <option value="c-scale">C Major Scale</option>
                            <option value="happy-birthday">Happy Birthday</option>
                            <option value="bach-minuet">Bach Minuet in G</option>
                            <option value="jazz-chords">Jazz ii-V-I Progression</option>
                            <option value="two-voices">Bach Two-Voices</option>
                        </select>
                        <button class="action-btn" @click="${this.handleClear.bind(this)}" title="Clear all text">
                            🗑️ Clear
                        </button>
                    </div>
                </div>

                <div class="editor-content">
                    <textarea
                        class="editor-input"
                        placeholder="Write your ABC Notation here..."
                        spellcheck="false"
                        .value="${this.abcCode}"
                        @input="${this.handleInput.bind(this)}"
                    ></textarea>
                </div>

                <div class="quick-toolbar">
                    <div class="toolbar-group">
                        <span class="toolbar-group-label">Insert:</span>
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
                </div>
            </div>
        `;
    }
}
