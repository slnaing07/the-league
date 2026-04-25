import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const COOKIE_FILE = path.join(process.cwd(), '.fantrax-session.json');

const LOCAL_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
];

async function getLaunchOptions(): Promise<{ executablePath: string; args: string[]; headless: boolean | 'new' }> {
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const chromium = (await import('@sparticuz/chromium')).default;
    return {
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    };
  }

  const executablePath = LOCAL_CHROME_PATHS.find(p => fs.existsSync(p)) ?? null;
  if (!executablePath) throw new Error('No local Chrome installation found');
  return {
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  };
}

interface CachedSession {
  cookies: string;
  expiry: number;
}

function readCache(): string | null {
  try {
    const raw = fs.readFileSync(COOKIE_FILE, 'utf-8');
    const data = JSON.parse(raw) as CachedSession;
    if (data.expiry > Date.now()) return data.cookies;
  } catch { /* ignore */ }
  return null;
}

function writeCache(cookies: string): void {
  try {
    const data: CachedSession = { cookies, expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(data));
  } catch { /* ignore — serverless environments may not have a writable cwd */ }
}

let _inFlight: Promise<string> | null = null;

export async function getFantraxBrowserSession(): Promise<string> {
  const cached = readCache();
  if (cached) return cached;

  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    const username = process.env.FANTRAX_USERNAME;
    const password = process.env.FANTRAX_PASSWORD;
    if (!username || !password) return '';

    let launchOptions;
    try {
      launchOptions = await getLaunchOptions();
    } catch {
      return '';
    }

    const browser = await puppeteer.launch({
      executablePath: launchOptions.executablePath,
      args: launchOptions.args,
      headless: launchOptions.headless,
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120'
      );

      await page.goto('https://www.fantrax.com/login', { waitUntil: 'load', timeout: 20000 });
      await page.waitForSelector('#mat-input-0', { timeout: 12000 });

      await page.type('#mat-input-0', username, { delay: 40 });
      await page.type('#mat-input-1', password, { delay: 40 });

      const submitBtn = await page.$('button[type="submit"]') ?? await page.$('button');
      if (!submitBtn) return '';
      await submitBtn.click();

      await page.waitForFunction(() => !window.location.href.includes('/login'), { timeout: 15000 });
      await new Promise(r => setTimeout(r, 2500));

      const cookies = await page.cookies();
      const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

      if (cookieStr) writeCache(cookieStr);
      return cookieStr;
    } catch {
      return '';
    } finally {
      await browser.close();
      _inFlight = null;
    }
  })();

  const result = await _inFlight;
  _inFlight = null;
  return result;
}
