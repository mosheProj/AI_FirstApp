const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const quickReplies = document.getElementById('quick-replies');
const errorPanel = document.getElementById('error-panel');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const newStoryBtn = document.getElementById('new-story-btn');
const chatFooter = document.getElementById('chat-footer');

let conversationToken = 0;

const MAX_SUBJECT = 50;

const STEPS = {
  GREETING: 'greeting',
  SUBJECT: 'subject',
  MOOD: 'mood',
  ENDING: 'ending',
  LENGTH: 'length',
  CREATIVITY: 'creativity',
  GENERATING: 'generating',
  DONE: 'done',
};

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy', reply: '1' },
  { value: 'scary', label: 'Spooky', reply: '2' },
];

const ENDING_OPTIONS = [
  { value: 'good', label: 'Good Ending', reply: '1' },
  { value: 'bad', label: 'Twist ending', reply: '2' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (5 Lines)', reply: '1' },
  { value: 'long', label: 'Long (7 lines)', reply: '2' },
];

const CREATIVITY_OPTIONS = [
  { value: 'low', label: 'Low', reply: '1' },
  { value: 'medium', label: 'Medium', reply: '2' },
  { value: 'high', label: 'High', reply: '3' },
];

const OPTIONAL_STEPS = new Set([
  STEPS.MOOD,
  STEPS.ENDING,
  STEPS.LENGTH,
  STEPS.CREATIVITY,
]);

const state = {
  step: STEPS.GREETING,
  subject: '',
  storyType: '',
  ending: '',
  length: '',
  creativity: '',
};

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(role, content, { isStory = false } = {}) {
  const bubble = document.createElement('div');
  bubble.className = `message message--${role}${isStory ? ' message--story' : ''}`;
  bubble.innerHTML = `<div class="message-bubble">${content}</div>`;
  chatMessages.appendChild(bubble);
  scrollToBottom();
  return bubble;
}

function addBotMessage(text) {
  return addMessage('bot', escapeHtml(text));
}

function addUserMessage(text) {
  return addMessage('user', escapeHtml(text));
}

function addTypingIndicator() {
  const el = document.createElement('div');
  el.className = 'message message--bot message--typing';
  el.id = 'typing-indicator';
  el.innerHTML = `
    <div class="message-bubble">
      <span class="typing-dots"><span></span><span></span><span></span></span>
    </div>
  `;
  chatMessages.appendChild(el);
  scrollToBottom();
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

function setInputEnabled(enabled) {
  chatInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
  newStoryBtn.disabled = state.step === STEPS.GENERATING;
  if (enabled) {
    chatInput.focus();
  }
}

function isActiveConversation(token) {
  return token === conversationToken;
}

function resetState() {
  state.step = STEPS.GREETING;
  state.subject = '';
  state.storyType = '';
  state.ending = '';
  state.length = '';
  state.creativity = '';
}

function setNewStoryProminent(prominent) {
  newStoryBtn.classList.toggle('new-story-btn--prominent', prominent);
  chatFooter?.classList.toggle('chat-footer--prominent', prominent);
}

function resetSession() {
  conversationToken += 1;
  const token = conversationToken;

  chatMessages.innerHTML = '';
  chatInput.value = '';
  hideQuickReplies();
  errorPanel.hidden = true;
  removeTypingIndicator();
  resetState();
  setNewStoryProminent(false);
  updatePlaceholder();
  setInputEnabled(false);

  void startConversation(token);
  return token;
}

function showQuickReplies(options, onSelect, { skippable = false, onSkip } = {}) {
  quickReplies.innerHTML = '';
  quickReplies.hidden = false;

  for (const option of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-reply-btn';
    btn.textContent = `${option.reply}. ${option.label}`;
    btn.addEventListener('click', () => {
      quickReplies.hidden = true;
      onSelect(option);
    });
    quickReplies.appendChild(btn);
  }

  if (skippable && onSkip) {
    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'quick-reply-btn quick-reply-btn--skip';
    skipBtn.textContent = 'Skip';
    skipBtn.addEventListener('click', () => {
      quickReplies.hidden = true;
      onSkip();
    });
    quickReplies.appendChild(skipBtn);
  }
}

function hideQuickReplies() {
  quickReplies.hidden = true;
  quickReplies.innerHTML = '';
}

function updatePlaceholder() {
  const placeholders = {
    [STEPS.SUBJECT]: 'e.g. a brave little rabbit in the moonlight',
    [STEPS.MOOD]: 'Optional — type 1 or 2, or press Enter to skip',
    [STEPS.ENDING]: 'Optional — type 1 or 2, or press Enter to skip',
    [STEPS.LENGTH]: 'Optional — type 1 or 2, or press Enter to skip',
    [STEPS.CREATIVITY]: 'Optional — type 1, 2, or 3, or press Enter to skip',
  };
  chatInput.placeholder = placeholders[state.step] ?? 'Type your answer…';
}

function isSkipInput(input) {
  return ['skip', 'default', 'pass', 'next'].includes(input.trim().toLowerCase());
}

function parseChoice(input, options) {
  const trimmed = input.trim().toLowerCase();

  const byNumber = options.find((o) => o.reply === trimmed);
  if (byNumber) return byNumber;

  const byLabel = options.find(
    (o) =>
      o.label.toLowerCase() === trimmed ||
      o.label.toLowerCase().includes(trimmed) ||
      trimmed.includes(o.label.toLowerCase()),
  );
  if (byLabel) return byLabel;

  const byValue = options.find((o) => o.value === trimmed);
  if (byValue) return byValue;

  return null;
}

function validateSubject(subject) {
  if (!subject) return 'Please tell me what the story should be about.';
  if (subject.length > MAX_SUBJECT) {
    return `Please keep it to ${MAX_SUBJECT} characters or fewer.`;
  }
  return '';
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function botSay(text, pauseMs = 400, token = conversationToken) {
  addTypingIndicator();
  await delay(pauseMs);
  if (!isActiveConversation(token)) return;
  removeTypingIndicator();
  addBotMessage(text);
}

async function askSubject(token = conversationToken) {
  if (!isActiveConversation(token)) return;
  state.step = STEPS.SUBJECT;
  updatePlaceholder();
  setInputEnabled(true);
  await botSay('What subject you want it be?', 400, token);
}

async function askMood(token = conversationToken) {
  if (!isActiveConversation(token)) return;
  state.step = STEPS.MOOD;
  updatePlaceholder();
  setInputEnabled(true);
  await botSay('Select Story mood (optional):\n1. Happy\n2. Spooky', 400, token);
  if (!isActiveConversation(token)) return;

  showQuickReplies(MOOD_OPTIONS, (option) => handleMoodChoice(option), {
    skippable: true,
    onSkip: handleSkipStep,
  });
}

async function askEnding(token = conversationToken) {
  if (!isActiveConversation(token)) return;
  state.step = STEPS.ENDING;
  updatePlaceholder();
  setInputEnabled(true);
  await botSay('Select Ending (optional):\n1. Good Ending\n2. Twist ending', 400, token);
  if (!isActiveConversation(token)) return;

  showQuickReplies(ENDING_OPTIONS, (option) => handleEndingChoice(option), {
    skippable: true,
    onSkip: handleSkipStep,
  });
}

async function askLength(token = conversationToken) {
  if (!isActiveConversation(token)) return;
  state.step = STEPS.LENGTH;
  updatePlaceholder();
  setInputEnabled(true);
  await botSay('Select Story Length (optional):\n1. Short (5 Lines)\n2. Long (7 lines)', 400, token);
  if (!isActiveConversation(token)) return;

  showQuickReplies(LENGTH_OPTIONS, (option) => handleLengthChoice(option), {
    skippable: true,
    onSkip: handleSkipStep,
  });
}

async function askCreativity(token = conversationToken) {
  if (!isActiveConversation(token)) return;
  state.step = STEPS.CREATIVITY;
  updatePlaceholder();
  setInputEnabled(true);
  await botSay('Select Creativity (optional):\n1. Low\n2. Medium\n3. High', 400, token);
  if (!isActiveConversation(token)) return;

  showQuickReplies(CREATIVITY_OPTIONS, (option) => handleCreativityChoice(option), {
    skippable: true,
    onSkip: handleSkipStep,
  });
}

async function handleSkipStep() {
  hideQuickReplies(); 
  addUserMessage('Skip');
  setInputEnabled(false);

  switch (state.step) {
    case STEPS.MOOD:
      await askEnding();
      break;
    case STEPS.ENDING:
      await askLength();
      break;
    case STEPS.LENGTH:
      await askCreativity();
      break;
    case STEPS.CREATIVITY:
      await generateStory();
      break;
  }
}

async function handleMoodChoice(option) {
  hideQuickReplies();
  state.storyType = option.value;
  addUserMessage(`${option.reply}. ${option.label}`);
  setInputEnabled(false);
  await askEnding();
}

async function handleEndingChoice(option) {
  hideQuickReplies();
  state.ending = option.value;
  addUserMessage(`${option.reply}. ${option.label}`);
  setInputEnabled(false);
  await askLength();
}

async function handleLengthChoice(option) {
  hideQuickReplies();
  state.length = option.value;
  addUserMessage(`${option.reply}. ${option.label}`);
  setInputEnabled(false);
  await askCreativity();
}

async function handleCreativityChoice(option) {
  hideQuickReplies();
  state.creativity = option.value;
  addUserMessage(`${option.reply}. ${option.label}`);
  setInputEnabled(false);
  await generateStory();
}

async function generateStory(token = conversationToken) {
  if (!isActiveConversation(token)) return;
  state.step = STEPS.GENERATING;
  hideQuickReplies();
  errorPanel.hidden = true;

  await botSay('Wonderful! Give me a moment while I write your story…', 600, token);
  if (!isActiveConversation(token)) return;

  addTypingIndicator();
  setInputEnabled(false);

  try {
    const payload = { subject: state.subject };
    if (state.storyType) payload.storyType = state.storyType;
    if (state.ending) payload.ending = state.ending;
    if (state.length) payload.length = state.length;
    if (state.creativity) payload.creativity = state.creativity;

    const response = await fetch('/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!isActiveConversation(token)) return;
    if (!response.ok) {
      throw new Error(data.error ?? 'Could not create the story.');
    }

    removeTypingIndicator();
    addBotMessage('Here is your story!');
    addMessage(
      'bot',
      `<article class="story-text">${escapeHtml(data.story)}</article>`,
      { isStory: true },
    );

    state.step = STEPS.DONE;
    setInputEnabled(false);
    setNewStoryProminent(true);
    await botSay('Want another story? Click "Start new Story" below!', 500, token);
  } catch (error) {
    if (!isActiveConversation(token)) return;
    removeTypingIndicator();
    errorMessage.textContent =
      error.message.includes('Failed to fetch')
        ? 'Could not reach the server. Run: cd story-agent && npm run server'
        : error.message;
    errorPanel.hidden = false;
    state.step = STEPS.CREATIVITY;
    setInputEnabled(true);
  }
}

async function handleUserInput(raw) {
  const input = raw.trim();

  if (!input) {
    if (OPTIONAL_STEPS.has(state.step)) {
      await handleSkipStep();
    }
    return;
  }

  if (OPTIONAL_STEPS.has(state.step) && isSkipInput(input)) {
    await handleSkipStep();
    return;
  }

  hideQuickReplies();
  addUserMessage(input);
  setInputEnabled(false);

  if (state.step === STEPS.SUBJECT) {
    const validationError = validateSubject(input);
    if (validationError) {
      await botSay(validationError);
      setInputEnabled(true);
      return;
    }
    state.subject = input;
    await askMood();
    return;
  }

  if (state.step === STEPS.MOOD) {
    const choice = parseChoice(input, MOOD_OPTIONS);
    if (!choice) {
      await botSay('Choose 1 for Happy, 2 for Spooky, or press Enter / Skip to use the default.');
      setInputEnabled(true);
      showQuickReplies(MOOD_OPTIONS, (option) => handleMoodChoice(option), {
        skippable: true,
        onSkip: handleSkipStep,
      });
      return;
    }
    state.storyType = choice.value;
    await askEnding();
    return;
  }

  if (state.step === STEPS.ENDING) {
    const choice = parseChoice(input, ENDING_OPTIONS);
    if (!choice) {
      await botSay('Choose 1 for Good Ending, 2 for Twist ending, or press Enter / Skip to use the default.');
      setInputEnabled(true);
      showQuickReplies(ENDING_OPTIONS, (option) => handleEndingChoice(option), {
        skippable: true,
        onSkip: handleSkipStep,
      });
      return;
    }
    state.ending = choice.value;
    await askLength();
    return;
  }

  if (state.step === STEPS.LENGTH) {
    const choice = parseChoice(input, LENGTH_OPTIONS);
    if (!choice) {
      await botSay('Choose 1 for Short, 2 for Long, or press Enter / Skip to use the default.');
      setInputEnabled(true);
      showQuickReplies(LENGTH_OPTIONS, (option) => handleLengthChoice(option), {
        skippable: true,
        onSkip: handleSkipStep,
      });
      return;
    }
    state.length = choice.value;
    await askCreativity();
    return;
  }

  if (state.step === STEPS.CREATIVITY) {
    const choice = parseChoice(input, CREATIVITY_OPTIONS);
    if (!choice) {
      await botSay('Choose 1 for Low, 2 for Medium, 3 for High, or press Enter / Skip to use the default.');
      setInputEnabled(true);
      showQuickReplies(CREATIVITY_OPTIONS, (option) => handleCreativityChoice(option), {
        skippable: true,
        onSkip: handleSkipStep,
      });
      return;
    }
    state.creativity = choice.value;
    await generateStory();
  }
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const value = chatInput.value;
  chatInput.value = '';
  await handleUserInput(value);
});

retryBtn.addEventListener('click', async () => {
  errorPanel.hidden = true;
  await generateStory();
});

newStoryBtn.addEventListener('click', () => {
  resetSession();
});

async function startConversation(token = conversationToken) {
  if (!isActiveConversation(token)) return;
  setInputEnabled(false);
  addBotMessage('Lets Create an incredible story');
  await delay(500);
  if (!isActiveConversation(token)) return;
  await askSubject(token);
}

startConversation();
