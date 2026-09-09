import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  initializeVault,
  RECOMMENDED_DIRECTORIES,
} from "./init-vault.mjs";

const FIXED_TIME = new Date("2026-09-09T00:00:00.000Z");

async function createTestRoot(t) {
  const parent = await mkdtemp(path.join(os.tmpdir(), "learning-vault-init-"));
  t.after(async () => {
    await rm(parent, { recursive: true, force: true });
  });
  return path.join(parent, "Vault");
}

test("dry-run reports the full plan without writing", async (t) => {
  const root = await createTestRoot(t);
  const result = await initializeVault({
    root,
    dryRun: true,
    now: () => FIXED_TIME,
  });

  assert.equal(result.dryRun, true);
  assert.equal(result.directories.length, RECOMMENDED_DIRECTORIES.length);
  assert.ok(result.directories.every((item) => item.status === "would-create"));
  assert.ok(result.files.every((item) => item.status === "would-create"));
  await assert.rejects(readFile(path.join(root, ".learning", "learning-progress.json")));
});

test("first run creates the structure and valid empty state", async (t) => {
  const root = await createTestRoot(t);
  const result = await initializeVault({ root, now: () => FIXED_TIME });

  assert.equal(result.summary.created, RECOMMENDED_DIRECTORIES.length + 2);

  const progress = JSON.parse(
    await readFile(path.join(root, ".learning", "learning-progress.json"), "utf8"),
  );
  assert.deepEqual(progress, {
    version: 1,
    updatedAt: FIXED_TIME.toISOString(),
    activeQuestId: null,
    quests: {},
    inbox: [],
  });

  const deferred = JSON.parse(
    await readFile(path.join(root, ".learning", "deferred-concepts.json"), "utf8"),
  );
  assert.deepEqual(deferred, {
    version: 1,
    nextId: 1,
    nextOriginId: 1,
    updatedAt: FIXED_TIME.toISOString(),
    concepts: {},
  });
});

test("repeated runs preserve existing state files", async (t) => {
  const root = await createTestRoot(t);
  await initializeVault({ root, now: () => FIXED_TIME });

  const progressPath = path.join(root, ".learning", "learning-progress.json");
  const customContent = '{"userData":"keep me"}\n';
  await writeFile(progressPath, customContent, "utf8");

  const result = await initializeVault({ root, now: () => new Date() });

  assert.equal(await readFile(progressPath, "utf8"), customContent);
  assert.ok(result.directories.every((item) => item.status === "existing"));
  assert.ok(result.files.every((item) => item.status === "existing"));
});

test("--no-state behavior leaves state files absent", async (t) => {
  const root = await createTestRoot(t);
  const result = await initializeVault({ root, includeState: false });

  assert.ok(result.files.every((item) => item.status === "skipped"));
  await assert.rejects(readFile(path.join(root, ".learning", "learning-progress.json")));
});

test("filesystem roots and .pi directories are rejected", async () => {
  await assert.rejects(
    initializeVault({ root: path.parse(process.cwd()).root, dryRun: true }),
    /文件系统根目录/,
  );
  await assert.rejects(
    initializeVault({ root: path.join(process.cwd(), ".pi"), dryRun: true }),
    /不是 .pi 目录/,
  );
});
