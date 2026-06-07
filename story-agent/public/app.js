const form = document.getElementById('story-form');
const subjectInput = document.getElementById('subject');
const charCount = document.getElementById('char-count');
const subjectError = document.getElementById('subject-error');
const submitBtn = document.getElementById('submit-btn');
const btnLabel = submitBtn.querySelector('.btn-label');
const btnSpinner = submitBtn.querySelector('.btn-spinner');
const resultPanel = document.getElementById('result-panel');
const errorPanel = document.getElementById('error-panel');
const storyOutput = document.getElementById('story-output');
const meta = document.getElementById('meta');
const errorMessage = document.getElementById('error-message');
const copyBtn = document.getElementById('copy-btn');
const copyFeedback = document.getElementById('copy-feedback');

const MAX_SUBJECT = 50;

const LABELS = {
  storyType: { happy: 'Happy', scary: 'Spooky' },
  ending: { good: 'Good ending', bad: 'Twist ending' },
  length: { short: 'Short (5 sentences)', long: 'Long (7 sentences)' },
};

function updateCharCount() {
  const len = subjectInput.value.length;
  charCount.textContent = `${len} / ${MAX_SUBJECT}`;
  charCount.classList.toggle('warn', len >= MAX_SUBJECT - 5);
}

function getFormPayload() {
  const data = new FormData(form);
  return {
    subject: data.get('subject')?.toString().trim() ?? '',
    storyType: data.get('storyType')?.toString() ?? 'happy',
    ending: data.get('ending')?.toString() ?? 'good',
    length: data.get('length')?.toString() ?? 'short',
  };
}

function validateSubject(subject) {
  if (!subject) return 'Please tell us what the story is about.';
  if (subject.length > MAX_SUBJECT) {
    return `Subject must be at most ${MAX_SUBJECT} characters.`;
  }
  return '';
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnSpinner.hidden = !loading;
  btnLabel.textContent = loading ? 'Writing your story…' : 'Create my story';
}

function hidePanels() {
  resultPanel.hidden = true;
  errorPanel.hidden = true;
  copyFeedback.hidden = true;
}

function renderMeta({ subject, options }) {
  meta.innerHTML = `
    <div><dt>Subject</dt><dd>${escapeHtml(subject)}</dd></div>
    <div><dt>Mood</dt><dd>${escapeHtml(LABELS.storyType[options.storyType])}</dd></div>
    <div><dt>Ending</dt><dd>${escapeHtml(LABELS.ending[options.ending])}</dd></div>
    <div><dt>Length</dt><dd>${escapeHtml(LABELS.length[options.length])}</dd></div>
  `;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

subjectInput.addEventListener('input', () => {
  subjectError.hidden = true;
  updateCharCount();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hidePanels();

  const payload = getFormPayload();
  const validationError = validateSubject(payload.subject);
  if (validationError) {
    subjectError.textContent = validationError;
    subjectError.hidden = false;
    subjectInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? 'Could not create the story.');
    }

    renderMeta(data);
    storyOutput.textContent = data.story;
    resultPanel.hidden = false;
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    errorMessage.textContent =
      error.message.includes('Failed to fetch')
        ? 'Could not reach the server. Run: cd story-agent && npm run server'
        : error.message;
    errorPanel.hidden = false;
    errorPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } finally {
    setLoading(false);
  }
});

copyBtn.addEventListener('click', async () => {
  const text = storyOutput.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.hidden = false;
    setTimeout(() => {
      copyFeedback.hidden = true;
    }, 2000);
  } catch {
    copyFeedback.textContent = 'Could not copy — select the text manually.';
    copyFeedback.hidden = false;
  }
});

updateCharCount();
