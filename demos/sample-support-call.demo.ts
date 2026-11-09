import { createHumanCursor, demoType, expect, withOverlay } from '@argo-video/cli';
import { test } from '../lib/sounds';

// Playwright serves this page itself, so the example needs no running app.
const PAGE = `<!doctype html>
<meta charset="utf-8">
<title>Support desk</title>
<style>
  body { margin: 0; font: 20px/1.5 system-ui, sans-serif; color: #1f2937; background: #f3f4f6; }
  header { padding: 24px 48px; background: #1f3a5f; color: #fff; font-size: 28px; }
  main { max-width: 1000px; margin: 48px auto; padding: 40px; background: #fff; border-radius: 12px; }
  input { width: 100%; box-sizing: border-box; padding: 12px 16px; font: inherit; border: 1px solid #9ca3af; border-radius: 8px; }
  ul { margin: 24px 0 0; padding: 0; list-style: none; }
  li { border-top: 1px solid #e5e7eb; }
  li button { width: 100%; padding: 14px 4px; font: inherit; text-align: left; color: #1d4ed8; background: none; border: 0; }
  h2 { margin: 32px 0 12px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 12px 4px; border-top: 1px solid #e5e7eb; }
  td:last-child { text-align: right; }
  td button { padding: 8px 18px; font: inherit; color: #fff; background: #2563eb; border: 0; border-radius: 8px; }
  [role=status] { margin-top: 24px; padding: 12px 16px; color: #065f46; background: #d1fae5; border-radius: 8px; }
  [hidden] { display: none; }
</style>
<header>Support desk</header>
<main>
  <input id="search" type="search" aria-label="Find a customer" placeholder="Find a customer" autocomplete="off">
  <ul id="customers"></ul>
  <section id="account" hidden>
    <h2 id="company"></h2>
    <table><tbody id="invoices"></tbody></table>
    <div id="sent" role="status" hidden></div>
  </section>
</main>
<script>
  const customers = ['Harbour Books', 'Lumen Dental', 'Oak Street Cafe'];
  const months = ['January', 'February', 'March'];
  const list = document.getElementById('customers');
  function show(filter) {
    list.replaceChildren(...customers
      .filter((name) => name.toLowerCase().includes(filter.toLowerCase()))
      .map((name) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = name;
        button.addEventListener('click', () => open(name));
        item.append(button);
        return item;
      }));
  }
  function open(name) {
    document.getElementById('company').textContent = name;
    document.getElementById('invoices').replaceChildren(...months.map((month) => {
      const row = document.createElement('tr');
      row.innerHTML = '<td>' + month + ' invoice</td><td><button>Send again</button></td>';
      row.querySelector('button').addEventListener('click', () => {
        const sent = document.getElementById('sent');
        sent.textContent = 'Sending ' + month + ' invoice...';
        sent.hidden = false;
        setTimeout(() => {
          sent.textContent = month + ' invoice sent to accounts@harbourbooks.example';
        }, 5500);
      });
      return row;
    }));
    document.getElementById('account').hidden = false;
  }
  document.getElementById('search').addEventListener('input', (event) => show(event.target.value));
  show('');
</script>`;

test('sample-support-call', async ({ page, narration, sounds }) => {
  test.setTimeout(120_000);

  await page.route('**/*', (route) => route.fulfill({ contentType: 'text/html', body: PAGE }));
  await page.goto('/');

  await narration.startRecording(page);
  const cursor = await createHumanCursor(page, { seed: 'sample-support-call', size: 30 });

  // A scene with no text is silent, so the ring plays on its own before anyone speaks.
  narration.mark('ring');
  await withOverlay(page, 'ring', async () => {
    await sounds.play('phone-ring');
  });

  narration.mark('greeting');
  await withOverlay(page, 'greeting', async () => {
    await page.waitForTimeout(narration.durationFor('greeting'));
  });

  narration.mark('problem');
  await withOverlay(page, 'problem', async () => {
    await page.waitForTimeout(narration.durationFor('problem'));
  });

  // Emma works while she talks: the clicks come first, and durationFor then waits only for
  // what remains of the line plus the silence after it. leadOutMs sets that silence, so it
  // doesn't change with the voice speed. Clicks and key presses make their sounds automatically.
  narration.mark('search');
  await withOverlay(page, 'search', async () => {
    const field = page.getByRole('searchbox', { name: 'Find a customer' });
    await cursor.click(field);
    await demoType(page, field, 'Harbour');
    await cursor.click(page.getByRole('button', { name: 'Harbour Books' }));
    await expect(page.getByRole('heading', { name: 'Harbour Books' })).toBeVisible();
    // She reads the account during the silence, then goes to the invoice she's about to mention.
    // A cursor move can run well over its durationMs, so the last wait is what sets the silence.
    const silence = { leadOutMs: 4350 };
    await page.waitForTimeout(Math.max(0, narration.durationFor('search', silence) - 2800));
    await cursor.moveTo(page.getByRole('row', { name: /March/ }), { durationMs: 1000 });
    await page.waitForTimeout(narration.durationFor('search', silence));
  });

  // A period is too short a pause in Kokoro, so a beat inside one person's turn is a scene
  // break with a longer lead-out.
  narration.mark('found');
  await withOverlay(page, 'found', async () => {
    await page.waitForTimeout(narration.durationFor('found', { leadOutMs: 900 }));
  });

  narration.mark('resend');
  await withOverlay(page, 'resend', async () => {
    await cursor.click(page.getByRole('row', { name: /March/ }).getByRole('button', { name: 'Send again' }));
    // Sending takes time, so the next line waits until the app says it's done.
    await expect(page.getByRole('status')).toContainText('Sending');
    await expect(page.getByRole('status')).toContainText('March invoice sent', { timeout: 10_000 });
    await page.waitForTimeout(narration.durationFor('resend', { leadOutMs: 5370 }));
  });

  narration.mark('sent');
  await withOverlay(page, 'sent', async () => {
    await page.waitForTimeout(narration.durationFor('sent'));
  });

  narration.mark('check');
  await withOverlay(page, 'check', async () => {
    await page.waitForTimeout(narration.durationFor('check'));
    // The email has to arrive, so nobody talks until it could have.
    await page.waitForTimeout(4000);
  });

  narration.mark('thanks');
  await withOverlay(page, 'thanks', async () => {
    await page.waitForTimeout(narration.durationFor('thanks'));
  });

  narration.mark('goodbye');
  await withOverlay(page, 'goodbye', async () => {
    await page.waitForTimeout(Math.max(0, narration.durationFor('goodbye') - 700));
    // Argo captures on repaint, so a last move keeps the recording running to the end.
    await cursor.moveTo(page.getByRole('status'), { durationMs: 700 });
  });

  await cursor.dispose();
});
