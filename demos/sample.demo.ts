import { createHumanCursor, demoType, showOverlay, test, withOverlay } from '@argo-video/cli';

// Playwright serves this page itself, so the sample needs no running app.
const PAGE = `<!doctype html>
<meta charset="utf-8">
<title>Tasks</title>
<style>
  body { margin: 0; font: 20px/1.5 system-ui, sans-serif; color: #1f2937; background: #f3f4f6; }
  header { padding: 24px 48px; background: #1f3a5f; color: #fff; font-size: 28px; }
  main { max-width: 900px; margin: 56px auto; padding: 40px; background: #fff; border-radius: 12px; }
  form { display: flex; gap: 12px; margin-bottom: 32px; }
  input[type=text] { flex: 1; padding: 12px 16px; font: inherit; border: 1px solid #9ca3af; border-radius: 8px; }
  button { padding: 12px 24px; font: inherit; color: #fff; background: #2563eb; border: 0; border-radius: 8px; }
  ul { margin: 0; padding: 0; list-style: none; }
  li { padding: 14px 4px; border-top: 1px solid #e5e7eb; }
  input[type=checkbox] { width: 20px; height: 20px; margin-right: 12px; vertical-align: -3px; }
  input:checked + span { color: #9ca3af; text-decoration: line-through; }
</style>
<header>Tasks</header>
<main>
  <form id="form">
    <input id="field" type="text" aria-label="New task" placeholder="What needs doing?" autocomplete="off">
    <button>Add task</button>
  </form>
  <ul id="list"><li><label><input type="checkbox"><span>Book the venue</span></label></li></ul>
</main>
<script>
  document.getElementById('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const field = document.getElementById('field');
    const item = document.createElement('li');
    const label = document.createElement('label');
    const box = document.createElement('input');
    const text = document.createElement('span');
    box.type = 'checkbox';
    text.textContent = field.value;
    label.append(box, text);
    item.append(label);
    document.getElementById('list').append(item);
    field.value = '';
  });
</script>`;

test('sample', async ({ page, narration }) => {
  await page.route('**/*', (route) => route.fulfill({ contentType: 'text/html', body: PAGE }));
  await page.goto('/');

  await narration.startRecording(page);
  const cursor = await createHumanCursor(page, { seed: 'sample', size: 30 });

  narration.mark('intro');
  await showOverlay(page, 'intro', narration.durationFor('intro'));

  narration.mark('add-task');
  await withOverlay(page, 'add-task', async () => {
    const field = page.getByRole('textbox', { name: 'New task' });
    await cursor.click(field);
    await demoType(page, field, 'Send the invoice');
    await cursor.click(page.getByRole('button', { name: 'Add task' }));
    await page.waitForTimeout(narration.durationFor('add-task'));
  });

  narration.mark('done');
  await cursor.click(page.getByRole('checkbox', { name: 'Send the invoice' }));
  await page.waitForTimeout(narration.durationFor('done'));

  await cursor.dispose();
});
