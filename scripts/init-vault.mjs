#!/usr/bin/env node

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const RECOMMENDED_DIRECTORIES = Object.freeze([
  "00-原始笔记",
  "01-学习问题",
  "02-概念",
  "03-主题地图",
  "04-来源",
  "05-实践与产出",
  "90-学习会话",
  "98-代码实验",
  "99-归档",
  ".learning",
  ".trash",
]);

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PI_DIRECTORY = path.resolve(path.dirname(SCRIPT_PATH), "..");

export function resolveDefaultVaultRoot() {
  return path.dirname(PI_DIRECTORY);
}

function createInitialStateFiles(timestamp) {
  return [
    {
      relativePath: path.join(".learning", "learning-progress.json"),
      content: {
        version: 1,
        updatedAt: timestamp,
        activeQuestId: null,
        quests: {},
        inbox: [],
      },
    },
    {
      relativePath: path.join(".learning", "deferred-concepts.json"),
      content: {
        version: 1,
        nextId: 1,
        nextOriginId: 1,
        updatedAt: timestamp,
        concepts: {},
      },
    },
  ];
}

async function getPathType(targetPath) {
  try {
    const info = await stat(targetPath);
    if (info.isDirectory()) return "directory";
    if (info.isFile()) return "file";
    return "other";
  } catch (error) {
    if (error?.code === "ENOENT") return "missing";
    throw error;
  }
}

function assertSafeVaultRoot(vaultRoot) {
  const parsed = path.parse(vaultRoot);
  if (path.normalize(vaultRoot) === path.normalize(parsed.root)) {
    throw new Error(`拒绝把文件系统根目录作为 Vault：${vaultRoot}`);
  }

  if (path.basename(vaultRoot).toLowerCase() === ".pi") {
    throw new Error(
      `目标应是知识库根目录，而不是 .pi 目录：${vaultRoot}`,
    );
  }
}

function createSummary(directories, files) {
  const summary = {
    created: 0,
    existing: 0,
    wouldCreate: 0,
    skipped: 0,
  };

  for (const item of [...directories, ...files]) {
    if (item.status === "created") summary.created += 1;
    if (item.status === "existing") summary.existing += 1;
    if (item.status === "would-create") summary.wouldCreate += 1;
    if (item.status === "skipped") summary.skipped += 1;
  }

  return summary;
}

export async function initializeVault({
  root = resolveDefaultVaultRoot(),
  dryRun = false,
  includeState = true,
  now = () => new Date(),
} = {}) {
  const vaultRoot = path.resolve(root);
  assertSafeVaultRoot(vaultRoot);

  const rootType = await getPathType(vaultRoot);
  if (rootType !== "missing" && rootType !== "directory") {
    throw new Error(`Vault 目标不是目录：${vaultRoot}`);
  }

  if (!dryRun && rootType === "missing") {
    await mkdir(vaultRoot, { recursive: true });
  }

  const warnings = [];
  const expectedPiDirectory = path.join(vaultRoot, ".pi");
  if ((await getPathType(expectedPiDirectory)) !== "directory") {
    warnings.push(
      `目标中未检测到 .pi/：${expectedPiDirectory}。脚本只生成知识库结构，不复制 Skills。`,
    );
  }

  const directories = [];
  for (const relativePath of RECOMMENDED_DIRECTORIES) {
    const targetPath = path.join(vaultRoot, relativePath);
    const targetType = await getPathType(targetPath);

    if (targetType === "directory") {
      directories.push({ path: relativePath, status: "existing" });
      continue;
    }

    if (targetType !== "missing") {
      throw new Error(`目录位置已被非目录占用：${targetPath}`);
    }

    if (dryRun) {
      directories.push({ path: relativePath, status: "would-create" });
      continue;
    }

    await mkdir(targetPath, { recursive: true });
    directories.push({ path: relativePath, status: "created" });
  }

  const files = [];
  const timestamp = now().toISOString();
  for (const stateFile of createInitialStateFiles(timestamp)) {
    if (!includeState) {
      files.push({ path: stateFile.relativePath, status: "skipped" });
      continue;
    }

    const targetPath = path.join(vaultRoot, stateFile.relativePath);
    const targetType = await getPathType(targetPath);

    if (targetType === "file") {
      files.push({ path: stateFile.relativePath, status: "existing" });
      continue;
    }

    if (targetType !== "missing") {
      throw new Error(`状态文件位置已被非文件占用：${targetPath}`);
    }

    if (dryRun) {
      files.push({ path: stateFile.relativePath, status: "would-create" });
      continue;
    }

    const serialized = `${JSON.stringify(stateFile.content, null, 2)}\n`;
    try {
      await writeFile(targetPath, serialized, {
        encoding: "utf8",
        flag: "wx",
      });
      files.push({ path: stateFile.relativePath, status: "created" });
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      files.push({ path: stateFile.relativePath, status: "existing" });
    }
  }

  const piDirectoryDetected =
    (await getPathType(expectedPiDirectory)) === "directory";

  return {
    ok: true,
    dryRun,
    vaultRoot,
    piDirectoryDetected,
    directories,
    files,
    summary: createSummary(directories, files),
    warnings,
  };
}

function parseArguments(argv) {
  const options = {
    root: undefined,
    dryRun: false,
    includeState: true,
    json: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (argument === "--no-state") {
      options.includeState = false;
      continue;
    }
    if (argument === "--json") {
      options.json = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    if (argument === "--root") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--root 后必须提供知识库路径");
      }
      options.root = value;
      index += 1;
      continue;
    }
    if (argument.startsWith("--root=")) {
      const value = argument.slice("--root=".length);
      if (!value) throw new Error("--root 后必须提供知识库路径");
      options.root = value;
      continue;
    }

    throw new Error(`未知参数：${argument}`);
  }

  return options;
}

function helpText() {
  return `生成 Learning Vault 推荐目录和初始状态文件

用法：
  node .pi/scripts/init-vault.mjs [选项]

选项：
  --root <路径>  指定知识库根目录；默认使用脚本所在 .pi 的父目录
  --dry-run      只预览，不创建任何目录或文件
  --no-state     只创建目录，不初始化 .learning/*.json
  --json         输出便于 Agent 读取的 JSON 结果
  -h, --help     显示帮助

安全行为：
  - 可以重复运行；已有目录和文件保持不变
  - 永不覆盖已有状态文件
  - 拒绝把磁盘根目录或 .pi 本身作为目标
`;
}

function printTextResult(result) {
  const mode = result.dryRun ? "预览" : "执行";
  console.log(`${mode}目标：${result.vaultRoot}`);
  console.log("");

  const labels = {
    created: "已创建",
    existing: "已存在",
    "would-create": "将创建",
    skipped: "已跳过",
  };

  for (const item of result.directories) {
    console.log(`[${labels[item.status]}] ${item.path}${path.sep}`);
  }
  for (const item of result.files) {
    console.log(`[${labels[item.status]}] ${item.path}`);
  }

  if (result.warnings.length > 0) {
    console.log("");
    for (const warning of result.warnings) {
      console.log(`[提醒] ${warning}`);
    }
  }

  console.log("");
  console.log(
    `汇总：创建 ${result.summary.created}，已存在 ${result.summary.existing}，` +
      `将创建 ${result.summary.wouldCreate}，跳过 ${result.summary.skipped}`,
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const result = await initializeVault(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printTextResult(result);
  }
}

const invokedPath = process.argv[1]
  ? path.normalize(path.resolve(process.argv[1])).toLowerCase()
  : "";
const currentModulePath = path.normalize(SCRIPT_PATH).toLowerCase();

if (invokedPath === currentModulePath) {
  main().catch((error) => {
    console.error(`[失败] ${error.message}`);
    process.exitCode = 1;
  });
}
