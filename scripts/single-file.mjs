import { rollup } from 'rollup';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT  = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = resolve(ROOT, 'build');
const ENTRY = `${BUILD}/_app/immutable/entry`;
const ASSET = `${BUILD}/_app/immutable/assets`;

const startJs = readdirSync(ENTRY).find(f => f.startsWith('start.'));
const appJs   = readdirSync(ENTRY).find(f => f.startsWith('app.'));

if (!startJs || !appJs) {
	console.error('Could not find start.js or app.js in', ENTRY);
	process.exit(1);
}

const cssPlugin = {
	name: 'inline-css',
	resolveId(id, importer) {
		if (!id.endsWith('.css')) return null;
		return resolve(dirname(importer), id);
	},
	load(id) {
		if (!id.endsWith('.css')) return null;
		const css = readFileSync(id, 'utf8');
		return `const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);export default s;`;
	},
};

const bundle = await rollup({
	input: '\0sk-entry',
	plugins: [
		{
			name: 'sk-entry',
			resolveId(id) { if (id === '\0sk-entry') return id; },
			load(id) {
				if (id !== '\0sk-entry') return null;
				return `
import { start } from '${ENTRY}/${startJs}';
import * as app   from '${ENTRY}/${appJs}';
start(app, document.currentScript.parentElement);
`;
			},
		},
		cssPlugin,
	],
	onwarn(w, warn) { if (w.code !== 'CIRCULAR_DEPENDENCY') warn(w); },
});

const { output } = await bundle.generate({
	format: 'iife',
	inlineDynamicImports: true,
	name: '_sk',
});

const js = output[0].code;

const css = readdirSync(ASSET)
	.filter(f => f.endsWith('.css'))
	.map(f => readFileSync(`${ASSET}/${f}`, 'utf8'))
	.join('\n');

let html = readFileSync(`${BUILD}/404.html`, 'utf8');
html = html
	.replace(/<link[^>]+rel="modulepreload"[^>]*>\s*/g, '')
	.replace(/<link[^>]+\.css"[^>]*>\s*/g, '')
	.replace('</head>', `<style>\n${css}\n</style>\n</head>`)
	.replace(
		/<div style="display: contents">\s*<script>[\s\S]*?<\/script>\s*<\/div>/,
		`<div style="display: contents"><script>\n${js}\n</script></div>`,
	);

const outPath = `${BUILD}/pwdgen.html`;
writeFileSync(outPath, html);
console.log(`Written: ${outPath}`);
console.log(`Size: ${(html.length / 1024).toFixed(1)} KB`);
