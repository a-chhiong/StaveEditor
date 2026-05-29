# 🎼 StaveEditor

一個專為寫譜設計的精緻 ABC 記譜法編輯器 (ABC Notation Editor Studio)。本專案採用現代化的 **Vite** 構建工具與 **Lit** 網頁組件架構。

---

## 🚀 快速開始 (Getting Started)

### 1. 安裝依賴 (Install Dependencies)
在終端機執行以下命令安裝專案所需依賴套件：
```bash
npm install
```

### 2. 本地開發 (Local Development)
啟動 Vite 開發伺服器，支援模組熱更新 (HMR)：
```bash
npm run dev
```
啟動後會自動在瀏覽器中打開 `http://localhost:3000`。

### 3. 專案打包 (Production Build)
將應用程式打包並進行極致優化與壓縮，輸出至 `/dist` 目錄：
```bash
npm run build
```

### 4. 預覽打包產物 (Preview Build)
在本地啟動一個伺服器來預覽生產環境的打包結果：
```bash
npm run preview
```

---

## 🛠️ 技術架構 (Technology Stack)

- **建置工具 (Build Tool):** [Vite](https://vite.dev/) - 提供極速的開發與模組熱更新體驗。
- **組件架構 (UI Components):** [Lit](https://lit.dev/) - 輕量級的原生 Web Components 框架。
- **五線譜渲染與播放 (Notation & Audio):** [abcjs](https://www.abcjs.net/) - 用於渲染高品質向量 (SVG) 五線譜，並整合音訊合成器 (Synth Player) 與 MIDI 播放。
- **網址壓縮 (URL Compression):** [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html) - 用於將樂譜編碼並壓縮至 URL 中，方便快速分享。
- **設計語彙 (Styling):** Vanilla CSS 變數與 Obsidian/Glassmorphic 微透磨砂設計系統。

---

## 📁 目錄結構 (Project Structure)

```text
StaveEditor/
├── dist/                      # 生產打包輸出目錄
├── public/                    # 靜態資源 (不經 Vite 編譯，直接複製)
│   └── unknown_song.md
├── src/                       # 原始碼目錄
│   ├── components/            # Lit 網頁組件
│   │   ├── app-component.js       # 應用主要佈局與拖拽分割器
│   │   ├── editor-component.js    # ABC 代碼編輯器與輔助輸入欄
│   │   ├── header-component.js    # 頂部導覽列與自動儲存/分享狀態
│   │   ├── playback-component.js  # 音樂合成播放控制條
│   │   └── preview-component.js   # 五線譜即時預覽與 SVG 匯出
│   ├── main.js                # 開發入口引導點 (Bootstrap Entry)
│   └── style.css              # 全局設計系統與自訂主題變數
├── index.html                 # 應用入口 HTML (Vite Native Entry)
├── vite.config.js             # Vite 設定檔
└── package.json               # 專案套件配置表
```
