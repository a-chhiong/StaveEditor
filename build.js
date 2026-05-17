/**
 * StaveEditor - Custom Framework Universal Build Script
 * Bundles and minifies JS (including Lit HTML & CSS templates) and CSS.
 * Outputs to /dist containing exactly index.html, bundle.js, bundle.css.
 */

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { minifyHTMLLiterals } = require('minify-html-literals');
const { minify } = require('html-minifier-terser');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists and is clean
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// esbuild plugin to find and minify Lit html`...` and css`...` tagged template literals
const minifyLitTemplatesPlugin = {
    name: 'minifyLitTemplates',
    setup(build) {
        build.onLoad({ filter: /\.js$/ }, async (args) => {
            // Ignore node_modules
            if (args.path.includes('node_modules')) {
                return;
            }

            const text = await fs.promises.readFile(args.path, 'utf8');
            try {
                const result = minifyHTMLLiterals(text, {
                    fileName: args.path
                });
                
                if (result && result.code) {
                    return {
                        contents: result.code,
                        loader: 'js'
                    };
                }
            } catch (error) {
                console.warn(`[minifyLitTemplates] Skip ${path.basename(args.path)}: ${error.message}`);
            }

            return {
                contents: text,
                loader: 'js'
            };
        });
    }
};

async function build() {
    console.log('⚡ Starting build process...');

    try {
        // 1. Bundle and Minify JS
        console.log('📦 Bundling and minifying JavaScript & Lit elements...');
        await esbuild.build({
            entryPoints: [path.join(srcDir, 'script.js')],
            bundle: true,
            minify: true,
            sourcemap: false,
            format: 'esm',
            target: ['es2020'],
            outfile: path.join(distDir, 'bundle.js'),
            external: ['lit', 'lit/*'],
            plugins: [minifyLitTemplatesPlugin],
        });
        console.log('✓ JS successfully compiled to dist/bundle.js');

        // 2. Bundle and Minify CSS
        console.log('🎨 Bundling and minifying CSS...');
        await esbuild.build({
            entryPoints: [path.join(srcDir, 'style.css')],
            bundle: true,
            minify: true,
            outfile: path.join(distDir, 'bundle.css'),
        });
        console.log('✓ CSS successfully compiled to dist/bundle.css');

        // 3. Process, rewire, and minify index.html
        console.log('📄 Minifying index.html and rewiring imports...');
        const htmlPath = path.join(srcDir, 'index.html');
        let htmlContent = await fs.promises.readFile(htmlPath, 'utf8');

        // Rewire references:
        // href="style.css" or href="./style.css" -> href="bundle.css"
        htmlContent = htmlContent.replace(/(href=)["'](?:\.\/)?style\.css["']/g, '$1"bundle.css"');
        
        // src="script.js" or src="./script.js" -> src="bundle.js"
        htmlContent = htmlContent.replace(/(src=)["'](?:\.\/)?script\.js["']/g, '$1"bundle.js"');

        // Minify HTML content
        const minifiedHtml = await minify(htmlContent, {
            removeAttributeQuotes: false,
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true
        });

        await fs.promises.writeFile(path.join(distDir, 'index.html'), minifiedHtml, 'utf8');
        console.log('✓ HTML successfully compiled to dist/index.html');

        console.log('\n🎉 Build completed successfully! All assets minified and saved to /dist.');
    } catch (err) {
        console.error('❌ Build failed:', err);
        process.exit(1);
    }
}

build();
