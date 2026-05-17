// Bootstrap - Import and register all components
import { EditorComponent } from './components/editor-component.js';
import { PreviewComponent } from './components/preview-component.js';
import { HeaderComponent } from './components/header-component.js';
import { AppComponent } from './components/app-component.js';
import { PlaybackComponent } from './components/playback-component.js';

// Register custom elements
customElements.define('editor-component', EditorComponent);
customElements.define('preview-component', PreviewComponent);
customElements.define('playback-component', PlaybackComponent);
customElements.define('header-component', HeaderComponent);
customElements.define('abc-app', AppComponent);

console.log('ABC Editor initialized with Lit components');

