// Bootstrap - Import and register all components
import { EditorComponent } from './components/editor-component.js';
import { PreviewComponent } from './components/preview-component.js';
import { FooterComponent } from './components/footer-component.js';
import { AppComponent } from './components/app-component.js';

// Register custom elements
customElements.define('editor-component', EditorComponent);
customElements.define('preview-component', PreviewComponent);
customElements.define('footer-component', FooterComponent);
customElements.define('abc-app', AppComponent);

console.log('ABC Editor initialized with Lit components');

