# 知识库结构初始化脚本

`init-vault.mjs` 用来生成本项目推荐的 Learning Vault 目录结构。它不复制 `.pi/`、不安装依赖，也不修改已有笔记。

## 默认生成内容

脚本默认以自身所在 `.pi/` 的父目录为 Vault 根目录，创建缺失的目录：

```text
00-原始笔记/
01-学习问题/
02-概念/
03-主题地图/
04-来源/
05-实践与产出/
90-学习会话/
98-代码实验/
99-归档/
.learning/
.trash/
```

默认还会在不存在时创建两个空状态文件：

```text
.learning/learning-progress.json
.learning/deferred-concepts.json
```

它们分别供 `learning-hub` 和 `defer-concept` 使用，初始结构与当前状态规范一致。已有状态文件始终保持原样，即使其中包含旧版本或用户数据，脚本也不会替换或“修复”。

## 用户自己运行

在 Vault 根目录先预览：

```powershell
node .pi/scripts/init-vault.mjs --dry-run
```

确认输出中的绝对目标路径正确，再正式执行：

```powershell
node .pi/scripts/init-vault.mjs
```

如果当前目录是 `.pi/`：

```powershell
node scripts/init-vault.mjs --dry-run
node scripts/init-vault.mjs
```

脚本只使用 Node.js 内置模块，不需要 `npm install`。

## 让 Agent 执行

用户不需要知道或输入 Node.js 命令，直接描述目标：

```text
帮我初始化推荐的知识库结构
```

也可以说：

```text
帮我把这个 Vault 的目录补齐
检查一下知识库目录是否完整
只创建知识目录，不要初始化学习状态
```

Agent 会自动调用 `init-vault` Skill，由 Skill 负责定位和运行本脚本。Agent 执行时应遵循：

1. 先运行 `--dry-run --json`；
2. 解析并核对 Vault 绝对路径、将创建的目录和状态文件；
3. 用户已经明确要求“初始化”“创建”或“补齐”当前 Vault 时，直接去掉 `--dry-run` 正式执行，不再让用户确认命令；如果用户只要求检查，则报告预览而不写入；
4. 执行后再次运行 `--dry-run --json` 或检查返回结果，确认所有项目均已存在；
5. 不使用不存在于预览中的额外路径，不覆盖已有状态文件。

仅当路径存在歧义、目标超出当前 Vault 或同时发现多个候选时，Agent 才需要先询问用户。

## 参数

| 参数 | 作用 |
| --- | --- |
| `--root <路径>` | 指定 Vault 根目录；相对路径按当前终端目录解析 |
| `--dry-run` | 只返回创建计划，不写入文件系统 |
| `--no-state` | 创建目录，但跳过两个初始状态文件 |
| `--json` | 输出结构化 JSON，适合 Agent 读取 |
| `-h`, `--help` | 显示命令帮助 |

指定其他 Vault：

```powershell
node .pi/scripts/init-vault.mjs --root 'D:\Notes\MyVault' --dry-run
node .pi/scripts/init-vault.mjs --root 'D:\Notes\MyVault'
```

若目标中没有 `.pi/`，脚本会给出提醒，但仍可创建知识目录；它不会把当前 Skills 复制到目标中。

## 安全行为

- 重复运行是安全的：已有目录报告为 `existing`；
- 使用独占创建方式写入状态文件，执行期间即使文件被其他进程创建，也不会覆盖；
- 路径应是 Vault 根目录，不能传入 `.pi/` 本身；
- 拒绝把 Windows 盘符根目录或 Linux 文件系统根目录作为目标；
- 不删除、移动、重命名任何现有内容；
- 不创建 `.gitkeep`，因此空目录不会自动进入 Git 提交，但会保留在本地文件系统中。

## 验证脚本

在 `.pi/` 目录运行：

```powershell
node --test scripts/init-vault.test.mjs
```

测试只使用系统临时目录，不会修改真实 Vault。
