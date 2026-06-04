import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import {
  MAX_SUBJECT_LENGTH,
  SENTENCE_LIMITS,
  validateOptions,
  validateSubject,
} from './prompts.js';

async function askChoice(rl, question, choices) {
  const lines = choices.map((c, i) => `  ${i + 1}) ${c.label}`);
  const validValues = choices.map((c) => c.value);
  const validNumbers = choices.map((_, i) => String(i + 1));

  while (true) {
    console.log(`\n${question}`);
    lines.forEach((line) => console.log(line));
    const answer = (await rl.question('> ')).trim().toLowerCase();

    const num = parseInt(answer, 10);
    if (num >= 1 && num <= choices.length) {
      return choices[num - 1].value;
    }

    const byLabel = choices.find(
      (c) => c.value === answer || c.label.toLowerCase().includes(answer),
    );
    if (byLabel) return byLabel.value;

    console.log(`Please enter ${validNumbers.join(', ')} or: ${validValues.join(', ')}`);
  }
}

async function askSubject(rl) {
  console.log(`\nWhat is your story about? (max ${MAX_SUBJECT_LENGTH} characters)`);

  while (true) {
    const answer = (await rl.question('> ')).trim();
    try {
      return validateSubject(answer);
    } catch (error) {
      console.log(`  ${error.message}`);
    }
  }
}

async function askYesNo(rl, question, defaultYes = true) {
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  while (true) {
    const answer = (await rl.question(`${question} ${hint} `)).trim().toLowerCase();
    if (!answer) return defaultYes;
    if (answer === 'y' || answer === 'yes') return true;
    if (answer === 'n' || answer === 'no') return false;
    console.log('Please enter y or n.');
  }
}

export async function collectStoryParams() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("\n📖 Welcome to the Children's Story Agent!\n");
    console.log("I'll ask a few questions, then write your story.\n");

    const subject = await askSubject(rl);

    const storyType = await askChoice(rl, 'What kind of story?', [
      { label: 'Happy story', value: 'happy' },
      { label: 'Scary story (kid-friendly spooky)', value: 'scary' },
    ]);

    const ending = await askChoice(rl, 'How should the story end?', [
      { label: 'Good ending', value: 'good' },
      { label: 'Bad / unresolved ending', value: 'bad' },
    ]);

    const length = await askChoice(rl, 'How long should the story be?', [
      { label: `Short (max ${SENTENCE_LIMITS.short} sentences)`, value: 'short' },
      { label: `Long (max ${SENTENCE_LIMITS.long} sentences)`, value: 'long' },
    ]);

    const options = validateOptions({ storyType, ending, length });

    console.log('\n--- Your choices ---');
    console.log(`  Subject: ${subject}`);
    console.log(`  Type:    ${options.storyType}`);
    console.log(`  Ending:  ${options.ending}`);
    console.log(`  Length:  ${options.length} (max ${SENTENCE_LIMITS[options.length]} sentences)`);

    const proceed = await askYesNo(rl, '\nCreate the story now?', true);
    if (!proceed) {
      console.log('\nCancelled. Run again when you are ready!\n');
      process.exit(0);
    }

    return { subject, options };
  } finally {
    rl.close();
  }
}
