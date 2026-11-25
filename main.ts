// Hand-in program for Wok Luck (Node 22+, standard library only).
//
// It copies the static game/ and screenshots/ folders to the output directory, checks
// them against the bounty's caps, and only then writes dossier.json with the vendored
// make.fun library. Any violation prints a plain message and exits non-zero.
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Grader run: node main.ts        (writes /output)

import {
  cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync,
  statSync, writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const MIB = 1024 * 1024;
const CAPS = {
  gameFiles: 993,
  gameBytes: 48 * MIB,
  gamePathBytes: 1000,
  indexBytes: 1 * MIB,
  screenshotsMin: 3,
  screenshotsMax: 4,
  screenshotBytes: 256 * 1024,
  longSide: 1280,
  shortSide: 480,
  dossierBytes: 1.5 * MIB,
};

function fail(message: string): never {
  console.error(`makefun: ${message}`);
  process.exit(1);
}

function outputDirectory(): string {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--output') {
      const value = args[i + 1];
      if (!value) fail('--output needs a directory');
      return value;
    }
    if (args[i].startsWith('--output=')) {
      const value = args[i].slice('--output='.length);
      if (!value) fail('--output needs a directory');
      return value;
    }
  }
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

type Entry = { path: string; relativePath: string; directory: boolean; symlink: boolean };

function walk(directory: string, root = directory): Entry[] {
  const found: Entry[] = [];
  for (const dirent of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, dirent.name);
    const stats = lstatSync(path);
    found.push({
      path,
      relativePath: relative(root, path),
      directory: stats.isDirectory(),
      symlink: stats.isSymbolicLink(),
    });
    if (stats.isDirectory()) found.push(...walk(path, root));
  }
  return found;
}

function verifyGame(gameDirectory: string): { files: number; bytes: number } {
  const indexPath = join(gameDirectory, 'index.html');
  if (!existsSync(indexPath)) fail('game/index.html is missing');
  const indexStats = lstatSync(indexPath);
  if (!indexStats.isFile()) fail('game/index.html is not a regular file');
  if (indexStats.size > CAPS.indexBytes) {
    fail(`game/index.html is ${indexStats.size} bytes, over the ${CAPS.indexBytes} byte cap`);
  }

  const entries = walk(gameDirectory);
  let files = 0;
  let directories = 0;
  let bytes = 0;
  for (const entry of entries) {
    if (entry.symlink) fail(`game/${entry.relativePath} is a symlink`);
    if (Buffer.byteLength(entry.relativePath, 'utf8') > CAPS.gamePathBytes) {
      fail(`game/${entry.relativePath} has a path longer than ${CAPS.gamePathBytes} bytes`);
    }
    if (entry.directory) directories += 1;
    else {
      files += 1;
      bytes += statSync(entry.path).size;
    }
  }
  const totalEntries = files + directories;
  if (totalEntries > CAPS.gameFiles) {
    fail(`game/ holds ${totalEntries} files and directories, over the ${CAPS.gameFiles} cap`);
  }
  if (bytes > CAPS.gameBytes) {
    fail(`game/ holds ${bytes} bytes, over the ${CAPS.gameBytes} byte cap`);
  }
  return { files, bytes };
}

function isPng(buffer: Buffer): boolean {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (buffer.length < 8) return false;
  return signature.every((value, i) => buffer[i] === value);
}

function isJpeg(buffer: Buffer): boolean {
  return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
}

function readPngSize(buffer: Buffer, name: string): { width: number; height: number } {
  let offset = 8;
  let width = 0;
  let height = 0;
  let sawHeader = false;
  let sawEnd = false;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const next = offset + 12 + length;
    if (next > buffer.length) fail(`screenshots/${name} is a truncated PNG`);
    if (type === 'IHDR') {
      if (sawHeader || length !== 13) fail(`screenshots/${name} has a bad PNG header`);
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
      sawHeader = true;
    }
    if (type === 'IEND') {
      if (length !== 0) fail(`screenshots/${name} has a bad PNG ending`);
      sawEnd = true;
      if (next !== buffer.length) fail(`screenshots/${name} has trailing bytes after IEND`);
      break;
    }
    offset = next;
  }
  if (!sawHeader || !sawEnd) fail(`screenshots/${name} is not a whole PNG`);
  return { width, height };
}

function readJpegSize(buffer: Buffer, name: string): { width: number; height: number } {
  if (buffer[buffer.length - 2] !== 0xff || buffer[buffer.length - 1] !== 0xd9) {
    fail(`screenshots/${name} is a truncated JPEG`);
  }
  let offset = 2;
  let width = 0;
  let height = 0;
  let sawFrame = false;
  while (offset < buffer.length - 2) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    let marker = buffer[offset + 1];
    while (marker === 0xff && offset + 2 < buffer.length) {
      offset += 1;
      marker = buffer[offset + 1];
    }
    offset += 2;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (marker === 0xd9) break;
    if (marker === 0xda) break;
    if (offset + 2 > buffer.length) fail(`screenshots/${name} is a truncated JPEG`);
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) {
      fail(`screenshots/${name} has a bad JPEG segment`);
    }
    const isFrame = (marker >= 0xc0 && marker <= 0xc3)
      || (marker >= 0xc5 && marker <= 0xc7)
      || (marker >= 0xc9 && marker <= 0xcb)
      || (marker >= 0xcd && marker <= 0xcf);
    if (isFrame) {
      if (length < 7) fail(`screenshots/${name} has a bad JPEG frame header`);
      height = buffer.readUInt16BE(offset + 3);
      width = buffer.readUInt16BE(offset + 5);
      sawFrame = true;
    }
    offset += length;
  }
  if (!sawFrame) fail(`screenshots/${name} has no JPEG frame header`);
  return { width, height };
}

function verifyScreenshots(screenshotDirectory: string): string[] {
  if (!existsSync(screenshotDirectory)) fail('screenshots/ is missing');
  const names = readdirSync(screenshotDirectory)
    .filter((name) => !name.startsWith('.'))
    .sort();
  if (names.length < CAPS.screenshotsMin || names.length > CAPS.screenshotsMax) {
    fail(`screenshots/ holds ${names.length} images; the entry needs 3 or 4`);
  }
  for (const name of names) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(name)) {
      fail(`screenshots/${name} has a name the gate does not allow`);
    }
    const path = join(screenshotDirectory, name);
    const stats = lstatSync(path);
    if (stats.isSymbolicLink()) fail(`screenshots/${name} is a symlink`);
    if (!stats.isFile()) fail(`screenshots/${name} is not a regular file`);
    if (stats.size === 0) fail(`screenshots/${name} is empty`);
    if (stats.size > CAPS.screenshotBytes) {
      fail(`screenshots/${name} is ${stats.size} bytes, over the 256 KiB cap`);
    }
    const buffer = readFileSync(path);
    let size: { width: number; height: number };
    if (isPng(buffer)) size = readPngSize(buffer, name);
    else if (isJpeg(buffer)) size = readJpegSize(buffer, name);
    else fail(`screenshots/${name} is neither a whole PNG nor a whole JPEG`);
    const longSide = Math.max(size.width, size.height);
    const shortSide = Math.min(size.width, size.height);
    if (longSide > CAPS.longSide) {
      fail(`screenshots/${name} is ${size.width}x${size.height}; long side over ${CAPS.longSide}`);
    }
    if (shortSide < CAPS.shortSide) {
      fail(`screenshots/${name} is ${size.width}x${size.height}; short side under ${CAPS.shortSide}`);
    }
  }
  return names;
}

function main(): void {
  const out = resolve(outputDirectory());
  if (out === resolve(ROOT)) fail('the output directory must not be the repository root');
  mkdirSync(out, { recursive: true });
  rmSync(join(out, 'game'), { recursive: true, force: true });
  rmSync(join(out, 'screenshots'), { recursive: true, force: true });
  rmSync(join(out, 'dossier.json'), { force: true });

  const sourceGame = join(ROOT, 'game');
  const sourceScreenshots = join(ROOT, 'screenshots');
  if (!existsSync(sourceGame)) fail('game/ is missing beside main.ts');
  if (!existsSync(sourceScreenshots)) fail('screenshots/ is missing beside main.ts');

  cpSync(sourceGame, join(out, 'game'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  cpSync(sourceScreenshots, join(out, 'screenshots'), { recursive: true });

  const game = verifyGame(join(out, 'game'));
  const screenshots = verifyScreenshots(join(out, 'screenshots'));

  const dossier = buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(out, 'dossier.json'), dossier);
  const dossierBytes = statSync(join(out, 'dossier.json')).size;
  if (dossierBytes > CAPS.dossierBytes) {
    fail(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
  }

  console.log(`wok luck: game/ ${game.files} files, ${game.bytes} bytes`);
  console.log(`wok luck: ${screenshots.length} screenshots (${screenshots.join(', ')})`);
  console.log(`wok luck: dossier.json ${dossierBytes} bytes, written last to ${out}`);
}

main();
