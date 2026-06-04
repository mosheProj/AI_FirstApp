export const MAX_SUBJECT_LENGTH = 50;
export const SENTENCE_LIMITS = { short: 5, long: 7 };

export const STORY_TYPES = ['happy', 'scary'];
export const ENDINGS = ['good', 'bad'];
export const LENGTHS = ['short', 'long'];

export const DEFAULT_OPTIONS = {
  storyType: 'happy',
  ending: 'good',
  length: 'short',
};

export function buildSystemPrompt({ storyType, ending, length }) {
  const maxSentences = SENTENCE_LIMITS[length];

  const moodBlock =
    storyType === 'happy'
      ? `- The story must feel happy, warm, safe, and uplifting.
- Use a gentle, playful tone with vivid, cheerful imagery.
- Include wonder, friendship, or a small joyful discovery.`
      : `- The story should feel spooky and mysterious, but still safe for children.
- Use suspense, shadows, and goosebumps — never graphic violence or trauma.
- Keep the scare age-appropriate (think friendly ghosts, creaky attics, brave kids).`;

  const endingBlock =
    ending === 'good'
      ? `- End with a satisfying, positive resolution that leaves the reader smiling or relieved.
- Problems are solved, fears are overcome, or kindness wins.`
      : `- End with an unexpected twist or bittersweet outcome — not cruel, but not fully resolved.
- Leave a hint of mystery, loss, or an unfinished feeling (still kid-safe, no gore).`;

  return `You are an imaginative children's story writer for ages 4–8.

Rules:
- Write ONLY the story text. No title, no labels, no explanation.
- Use simple words and clear sentences.
${moodBlock}
${endingBlock}
- Maximum ${maxSentences} sentences total. Never exceed ${maxSentences} sentences.`;
}

export function buildUserPrompt(subject, { storyType, ending, length }) {
  const maxSentences = SENTENCE_LIMITS[length];
  const moodLabel = storyType === 'happy' ? 'happy' : 'spooky (kid-friendly scary)';
  const endingLabel = ending === 'good' ? 'good ending' : 'bad/unresolved ending';

  return `Write a ${moodLabel} children's story about: "${subject}"

Requirements:
- ${endingLabel}
- ${length === 'long' ? 'Long' : 'Short'} format: maximum ${maxSentences} sentences`;
}

export function validateSubject(subject) {
  if (!subject || typeof subject !== 'string') {
    throw new Error('Story subject is required.');
  }

  const trimmed = subject.trim();
  if (!trimmed) {
    throw new Error('Story subject cannot be empty.');
  }
  if (trimmed.length > MAX_SUBJECT_LENGTH) {
    throw new Error(
      `Story subject must be at most ${MAX_SUBJECT_LENGTH} characters (got ${trimmed.length}).`,
    );
  }
  return trimmed;
}

export function validateOptions(options = {}) {
  const storyType = options.storyType ?? DEFAULT_OPTIONS.storyType;
  const ending = options.ending ?? DEFAULT_OPTIONS.ending;
  const length = options.length ?? DEFAULT_OPTIONS.length;

  if (!STORY_TYPES.includes(storyType)) {
    throw new Error(`storyType must be one of: ${STORY_TYPES.join(', ')}`);
  }
  if (!ENDINGS.includes(ending)) {
    throw new Error(`ending must be one of: ${ENDINGS.join(', ')}`);
  }
  if (!LENGTHS.includes(length)) {
    throw new Error(`length must be one of: ${LENGTHS.join(', ')}`);
  }

  return { storyType, ending, length };
}

export function limitToSentences(text, maxSentences) {
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .match(/[^.!?]+[.!?]+/g);

  if (!sentences) return text.trim();
  return sentences.slice(0, maxSentences).join(' ').trim();
}
