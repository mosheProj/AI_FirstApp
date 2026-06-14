import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

config({ path: join(rootDir, '.env') });

export { rootDir };
