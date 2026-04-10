/**
 * generate-pdf.mjs
 * 
 * Generates public/resume.pdf from the /resume page.
 * Usage:
 *   yarn generate:cv          # starts dev server, captures PDF, stops server
 *   yarn generate:cv --no-serve  # if dev server already running on port 4321
 */

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'public', 'resume.pdf');
const URL   = 'http://localhost:4321/resume';
const PORT  = 4321;
const NO_SERVE = process.argv.includes('--no-serve');

// ── Helpers ──────────────────────────────────────────────────────────────────

function waitForServer(url, timeout = 30_000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const check = async () => {
            try {
                const r = await fetch(url);
                if (r.ok) return resolve();
            } catch {}
            if (Date.now() - start > timeout) return reject(new Error('Server timeout'));
            setTimeout(check, 500);
        };
        check();
    });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    let server = null;

    try {
        if (!NO_SERVE) {
            console.log('🚀  Starting Astro dev server…');
            server = spawn('node', ['node_modules/.bin/astro', 'dev', '--port', String(PORT)], {
                cwd: ROOT,
                stdio: 'pipe',
                shell: true,
            });
            server.stderr.on('data', d => process.stderr.write(d));

            console.log('⏳  Waiting for server to be ready…');
            await waitForServer(`http://localhost:${PORT}/`);
            // Small extra delay for hydration
            await new Promise(r => setTimeout(r, 1500));
        }

        console.log('🖨  Launching headless browser…');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 794, height: 1123 }); // A4 at 96dpi

        console.log(`📄  Navigating to ${URL}…`);
        await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30_000 });

        // Wait for Google Fonts to load
        await new Promise(r => setTimeout(r, 1500));

        // Ensure output directory exists
        if (!existsSync(resolve(ROOT, 'public'))) {
            mkdirSync(resolve(ROOT, 'public'), { recursive: true });
        }

        console.log(`💾  Generating PDF → ${OUTPUT}`);
        await page.pdf({
            path: OUTPUT,
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
            preferCSSPageSize: true,
        });

        await browser.close();
        console.log('✅  resume.pdf generated successfully!');

    } finally {
        if (server) {
            server.kill();
            console.log('🛑  Dev server stopped.');
        }
    }
}

main().catch(err => {
    console.error('❌ ', err.message);
    process.exit(1);
});
