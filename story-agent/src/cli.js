import { writeStory } from './agent.js';
import { collectStoryParams } from './interactive.js';
import { DEFAULT_OPTIONS } from './prompts.js';

const FLAG_MAP = {
  '--happy': { storyType: 'happy' },
  '--scary': { storyType: 'scary' },
  '--good-end': { ending: 'good' },
  '--bad-end': { ending: 'bad' },
  '--short': { length: 'short' },
  '--long': { length: 'long' },
};

function printUsage() {
  console.log(`
Children's Story Agent
======================

Interactive mode (asks questions):
  npm start
  npm run story

  WRONG:  npm start story   (npm passes "story" as subject text)

One-shot mode (pass subject and options):
  npm run story -- "<subject>" [options]

Options:
  --happy       Happy story (default)
  --scary       Scary story (kid-friendly spooky)
  --good-end    Good ending (default)
  --bad-end     Bad / unresolved ending
  --short       Short story, max 5 sentences (default)
  --long        Long story, max 7 sentences
  -i, --interactive   Force interactive mode

Examples:
  npm run story
  npm run story -- "a brave little rabbit"
  npm run story -- "a haunted treehouse" --scary --bad-end --long

Setup:
  cd story-agent
  npm install
  copy .env.example .env
  # Set OPENROUTER_API_KEY in .env

Rules:
  - Subject: max 50 characters
  - Short: max 5 sentences | Long: max 7 sentences
`);
}

function parseArgs(argv) {
  const options = { ...DEFAULT_OPTIONS };
  const subjectParts = [];
  let interactive = false;
  let help = false;

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--interactive' || arg === '-i') {
      interactive = true;
    } else if (FLAG_MAP[arg]) {
      Object.assign(options, FLAG_MAP[arg]);
    } else {
      subjectParts.push(arg);
    }
  }

  const subject = subjectParts.join(' ').trim();
  return { help, interactive, subject, options };
}

function hasCliFlags(argv) {
  return argv.some((arg) => arg.startsWith('--') || arg === '-i');
}

/** npm start story passes "story" as argv — that is not a subject, start interactive mode */
function isStartStoryMistake(argv) {
  return (
    argv.length === 1 &&
    argv[0].toLowerCase() === 'story' &&
    !hasCliFlags(argv)
  );
}

function shouldUseInteractive(argv, parsed) {
  if (parsed.interactive) return true;
  if (isStartStoryMistake(argv)) return true;
  if (!parsed.subject && !hasCliFlags(argv)) return true;
  return false;
}

async function main() {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);

  if (parsed.help) {
    printUsage();
    process.exit(0);
  }

  let subject = parsed.subject;
  let options = parsed.options;

  const useInteractive = shouldUseInteractive(argv, parsed);

  if (isStartStoryMistake(argv)) {
    console.log(
      '\nTip: You ran "npm start story" — npm passes the word "story" as an argument.',
    );
    console.log('Use "npm start" or "npm run story" (no extra word) for interactive mode.\n');
  }

  if (useInteractive) {
    const collected = await collectStoryParams();
    subject = collected.subject;
    options = collected.options;
  } else if (!subject) {
    printUsage();
    process.exit(1);
  }

  try {
    console.log('\nWriting your story...');
    console.log(
      `  Type: ${options.storyType} | Ending: ${options.ending} | Length: ${options.length}\n`,
    );
    const story = await writeStory(subject, options);
    console.log(story);
    console.log('');
  } catch (error) {
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

main();
