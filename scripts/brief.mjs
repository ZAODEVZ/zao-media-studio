// Sunday brief data pull. No dependencies, Node 18+.
// Reads the live ZM CRM and WaveWarZ stats, writes briefs/<today>.md.
// Usage: node scripts/brief.mjs [--days 7] [--stdout]

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CRM = 'https://bettercallzaal.github.io/zao-media/media-crm.csv';
const WW = 'https://wavewarz.info/api/public/stats';

const args = process.argv.slice(2);
const days = Number(args[args.indexOf('--days') + 1]) || 7;
const toStdout = args.includes('--stdout');

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

async function get(url, as = 'text') {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`${res.status}`);
    return as === 'json' ? res.json() : res.text();
  } catch (e) {
    console.error(`could not read ${url}: ${e.message}`);
    return null;
  }
}

const today = new Date();
const iso = d => d.toISOString().slice(0, 10);
const since = new Date(today - days * 864e5);

const csv = await get(CRM);
if (!csv) process.exit(1);
const items = parseCsv(csv).sort((a, b) => b.Date.localeCompare(a.Date));

const fresh = items.filter(i => new Date(i.Date) >= since);
const waiting = items.filter(i => i['Needs publish'] === 'YES');
const last = items[0];
const gap = Math.floor((today - new Date(last.Date)) / 864e5);
const month = items.filter(i => new Date(i.Date) >= new Date(today - 30 * 864e5));
const noTranscript = month.filter(i => i.Transcript !== 'YES');

const ww = await get(WW, 'json');
const line = i => `- ${i.Date} | ${i.Show || i.Class} | ${i.Title} | ${i['ZM page']}${i.Notes ? `\n  notes: ${i.Notes}` : ''}`;

const md = `# ZAO media brief, week of ${iso(today)}

status: data filled, Start / Stop / Keep open for the producer

## Numbers
- ZM items in total: ${items.length}
- Logged in the last ${days} days: ${fresh.length}
- Last item logged: ${last.Date} (${gap} days ago)${gap >= 7 ? ' **- ZM has gone quiet, log the missing items first**' : ''}
- Items in the last 30 days without a transcript: ${noTranscript.length} of ${month.length}
${ww ? `- WaveWarZ (wavewarz.info, ${iso(today)}): ${ww.battles?.total ?? ww.totalBattles ?? '?'} battles, ${Math.floor(ww.volume?.totalSol ?? 0)} SOL traded (~$${Math.floor(ww.volume?.totalUsd ?? 0).toLocaleString('en-US')}), ${(ww.artistPayouts?.totalSol ?? 0).toFixed(2)} SOL paid to artists, ${(ww.volume?.last7dSol ?? 0).toFixed(1)} SOL traded this week` : '- WaveWarZ stats: not reachable today'}

## Shipped in the last ${days} days
${fresh.length ? fresh.map(line).join('\n') : '- nothing logged in ZM'}

## Waiting to publish (CRM "Needs publish" = YES)
${waiting.length ? waiting.slice(0, 15).map(line).join('\n') : '- none'}

## Last 5 logged
${items.slice(0, 5).map(line).join('\n')}

## Start
-

## Stop
-

## Keep
-

## Plan (slug -> format -> agent)
-
`;

if (toStdout) { console.log(md); process.exit(0); }
const dir = join(ROOT, 'briefs');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const file = join(dir, `${iso(today)}.md`);
writeFileSync(file, md);
console.log(`wrote ${file}`);
