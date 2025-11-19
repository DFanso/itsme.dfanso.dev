import { readdirSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distClientDir = join(__dirname, '..', 'dist', 'client');
const vercelStaticDir = join(__dirname, '..', '.vercel', 'output', 'static');

function ensureDir(path) {
	if (!existsSync(path)) {
		mkdirSync(path, { recursive: true });
	}
}

function copySitemaps() {
	if (!existsSync(distClientDir)) {
		console.warn('[copy-sitemaps] dist/client directory not found. Skipping.');
		return;
	}

	const files = readdirSync(distClientDir).filter((file) => file.startsWith('sitemap') && file.endsWith('.xml'));

	if (files.length === 0) {
		console.warn('[copy-sitemaps] No sitemap files found to copy.');
		return;
	}

	ensureDir(vercelStaticDir);

	for (const file of files) {
		const src = join(distClientDir, file);
		const dest = join(vercelStaticDir, file);

		copyFileSync(src, dest);
		console.log(`[copy-sitemaps] Copied ${file} to .vercel/output/static`);
	}
}

copySitemaps();

