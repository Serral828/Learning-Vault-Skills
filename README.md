# Learning Vault Skills

一套用于 Markdown / Obsidian 知识库的学习工作流。它主要解决两件事：

1. 从一个真实问题开始学习，经过讲解、应用和评估后生成正式知识笔记；
2. 把你已经写在 `00-原始笔记/` 中的内容，完整且忠实地整理进知识库。

如果你是第一次使用，先完成下面的“5 分钟准备”，然后直接选择一条快速上手路线。设计原理和高级规则都放在后面，不影响开始使用。

## 先选一个入口

| 你的目标 | 直接输入 |
| --- | --- |
| 学习一个新问题 | `/skill:teach <你最终想做到什么>` |
| 整理自己已经写好的笔记 | `/skill:integrate-learning <00-原始笔记下的相对路径>` |
| 恢复以前没有完成的学习 | `/skill:learning-hub list` |

最常用的两个例子：

```text
/skill:teach 我想理解 PID，并能够诊断两轮平衡车的振荡问题
```

```text
/skill:integrate-learning 00-原始笔记/机器学习/
```

## 5 分钟准备

### 1. 准备目录

推荐的 Vault 结构：

```text
你的知识库/
├── .pi/
│   ├── settings.json
│   └── skills/
├── 00-原始笔记/
├── 01-学习问题/
├── 02-概念/
├── 03-主题地图/
├── 04-来源/
├── 05-实践与产出/
├── 90-学习会话/
├── 98-代码实验/
├── 99-归档/
├── .learning/
└── .trash/
```

如果是新 Vault，在 Windows PowerShell 中执行：

```powershell
Set-Location -LiteralPath 'C:\path\to\your-vault'
git clone https://github.com/Serral828/Learning-Vault-Skills.git .pi
```

如果已经有 `.pi/`，不要直接覆盖。只合并本仓库的 `skills/` 和 `docs/`，并检查现有配置。

### 2. 启用 Skill 命令

`.pi/settings.json` 至少包含：

```json
{
  "enableSkillCommands": true
}
```

需要显式配置工具时，可以使用：

```json
{
  "enableSkillCommands": true,
  "defaultTools": [
    "read",
    "powershell",
    "edit",
    "write",
    "grep",
    "find",
    "ls"
  ]
}
```

### 3. 从 Vault 根目录启动

```powershell
Set-Location -LiteralPath 'E:\Document\Vault'
pi.cmd
```

不要从 `.pi/` 子目录或 WSL 启动。Agent 应直接运行在 Windows 中，以 Vault 为当前目录，并使用 Windows 原生 PowerShell。

## 快速上手 A：整理原始笔记

这条路线适合你已经写过课程笔记、读书笔记、项目记录或个人总结，希望把它们整理成 Concept Note、Topic Map、来源或实践笔记。

### 第 1 步：把 Markdown 放进 `00-原始笔记/`

例如：

```text
00-原始笔记/
└── 机器学习/
    ├── KNN.md
    └── 特征表示.md
```

只处理你明确指定的 `.md` 文件或目录，不会默认扫描整个 `00-原始笔记/`。

### 第 2 步：给每张图片写紧邻说明

原始笔记中的每张图片，下一物理行必须是一段由英文括号 `(...)` 或中文括号 `（...）` 完整包围的说明。图片和说明之间不能有空行：

```markdown
![[附件/KNN决策边界.png]]
（二维分类图：K=1 时边界曲折，K=15 时更平滑，用于说明较小的 K 更容易受噪声影响。）
```

Markdown 图片也一样：

```markdown
![电源纹波波形](附件/ripple.png)
(示波器 CH1 测量 3.3 V 输出；负载突变时出现约 180 mV 峰峰值纹波，用于判断当前去耦不足。)
```

装饰图片也要注明：

```markdown
![[课程封面.jpg]]
（装饰性图片，不承载知识内容。）
```

以下情况会被判定为缺少有效说明：

- 图片下一行为空或中间隔了一行；
- 括号缺失、中英文括号混配或内容为空；
- 只写“见图”“如上”“示意图”等无法说明图片含义的文字。

Agent 会一次列出所有问题的文件、行号和图片名，提醒你补充。修复前不会猜图、不会晋升依赖该图片的内容，也不会清理原始笔记。完整约定见 [原始笔记图片说明约定](docs/raw-note-images.md)。

### 第 3 步：执行整合

指定单篇笔记：

```text
/skill:integrate-learning 00-原始笔记/机器学习/KNN.md
```

指定整个目录：

```text
/skill:integrate-learning 00-原始笔记/机器学习/
```

### 第 4 步：Agent 先盘点，不立即写入

`integrate-learning` 会按以下顺序处理：

1. 冻结本批次 Markdown 文件清单，避免处理中悄悄扩大范围；
2. 检查全部图片是否有合格的下一行括号说明；
3. 把原文穷尽拆成带文件和行号的原子知识点；
4. 为每个知识点建立覆盖账本；
5. 查重并决定进入 Concept Note、Topic Map、来源、实践笔记，还是保留为待核查内容；
6. 展示完整计划，等待你一次确认；
7. 确认后写入，并从输入到输出、再从输出到输入进行双向检查；
8. 报告覆盖率和每个知识点的最终去向；
9. 100% 覆盖后，才询问是否把原始 Markdown 可恢复地移入 `.trash/`。

这里有两条硬规则，贯穿整个流程。

#### 不遗漏原始知识点

以下内容都必须进入覆盖账本：

- 定义、命题和机制；
- 前提、条件、限制、例外和反例；
- 步骤、参数、公式、数值和单位；
- 例子、实验、观察和失败经验；
- 疑问、冲突、不确定判断和待核查内容；
- 图片及其括号说明；
- 原文明确表达的知识关系。

重复内容可以合并，但每个原始位置仍要指向合并后的段落。疑似错误或不完整内容不能被静默删除，应忠实保留并标记待核查。

#### 不扩写原始笔记之外的知识

Agent 可以重组、去重、调整措辞、拆分笔记和增加结构性标题，但不能补写原文没有的：

- 定义、机制或因果；
- 案例、反例或应用场景；
- 代码、公式、参数、数值或结论；
- 来自模型常识、网络搜索或已有 Vault 笔记正文的知识。

检索已有 Vault 内容只用于查重、确定文件、选择 Topic Map 和避免覆盖。原始材料不足以达到正式 Concept Note 标准时，内容保留为“待补充后晋升”，不会由 Agent 自行扩写补齐。完整规则见 [原始笔记的封闭语料转换边界](docs/raw-note-conversion-boundary.md)。

### 第 5 步：审阅一次完整计划

计划至少会告诉你：

- 本批次处理哪些文件；
- 每个知识点准备去哪里；
- 哪些重复内容会合并；
- 哪些疑问或冲突会保留为待核查；
- 哪些已有正式笔记会被最小更新；
- 图片将进入哪篇笔记、哪个章节，以及最终链接和括号说明；
- Topic Map 如何分类和排列新概念；
- 是否存在未处理内容。

确认时只需要回复：

```text
可以，按这个计划执行
```

计划没有确认前，不会写入正式知识。

### 第 6 步：检查结果

覆盖报告使用以下状态：

```text
已整合 → <目标文件>
已合并 → <目标文件#段落>
已保留 → <精确位置>
明确丢弃 → <你已接受的理由>
未处理 → <原因>
```

只有纯排版噪声、无知识含义的残留或你明确不要的内容，才允许“明确丢弃”。只要存在一个“未处理”，原始输入就留在原位。

如果图片内容进入正式笔记，图片和说明必须一起出现，并保持物理相邻：

```markdown
### K 值如何改变决策边界

![[附件/KNN决策边界.png]]
（二维分类图：K=1 时边界曲折，K=15 时更平滑，用于说明较小的 K 更容易受噪声影响。）

后续正文继续解释该现象……
```

不能只留下图片、只摘录说明，或把图片统一堆在文末。附件路径不能稳定解析时，该单元继续保持未处理。

### 第 7 步：查看转换外建议

完成忠实转换后，Agent 可以另外输出：

```markdown
## 转换外建议

> 以下内容未写入正式笔记，不属于本批次转换内容，也不计入覆盖率。

### 建议
...

### 延伸
...

### 质疑与待核查
...
```

这些内容不会混入正式笔记。你选择其中一项后，才把它作为新的学习、核查或笔记更新任务处理。

### 第 8 步：可选清理原始输入

只有覆盖率达到 100%、输出没有无来源扩写、图片链接移动后仍可解析时，Agent 才会询问是否把精确的 Markdown 清单移入 `.trash/`。

这只是可恢复移动，不是永久删除。图片等非 Markdown 附件不会被静默移动或删除。永久清空只能由你明确调用：

```text
/skill:purge-trash
```

## 快速上手 B：从一个真实问题开始学习

### 第 1 步：描述最终想做到什么

比起“学习 PID”，更推荐写清楚实际能力：

```text
/skill:teach 我想让两轮平衡车保持直立。我会写单片机代码，但控制理论基础较弱，希望最后能诊断振荡和响应迟缓。
```

`teach` 会创建或复用一个稳定的 Quest ID，确认你的已有基础，并生成完成当前目标所需的最小路径。例如：

```text
姿态误差 → 反馈控制 → PID → 离散采样 → 执行器饱和
```

### 第 2 步：逐节点学习和提问

Agent 一次只讲一个必要节点，并提供可以推演的具体例子。讲解结束后不会直接考试，而会询问：

```text
这一节点还有哪里需要解释？如果没有，是否现在进入评估？
```

你可以继续追问“为什么”“能否再举一个例子”“和另一个概念有什么区别”。这些解答会进入之后生成的正式笔记，不会被丢成聊天记录。

只有你确认进入评估后，Agent 才会出题。如果你不想评估，直接说下面任意类似表达即可：

```text
可以通过
下一步
继续
```

Agent 会直接判定当前节点通过，不继续追问，也不记录缺口。

### 第 3 步：完成一次真实应用输出

所有节点各评估一次后，你需要完成一个联合使用这些知识的实际成果，例如：

- 可运行程序；
- 硬件诊断方案；
- 完整演算；
- 实验设计；
- 带约束的决策分析。

已有真实项目能够覆盖目标时，可以直接作为输出，不需要重复造练习。

### 第 4 步：综合评估并生成笔记

Agent 会对整体成果做一次综合评估，记录为 `passed` 或 `completed_with_gaps`。评估只执行一次，不补测；缺口会保存在学习状态中，但不会阻止整理准确知识。

随后 `teach` 会主动调用 `distill`，展示候选 Concept Note、旧概念关系更新、Learning Quest 双链和 Topic Map 更新。你确认后才写文件，不需要另行调用其他 Skill。

### 第 5 步：暂停或跨会话恢复

学习进度会以稳定 Quest ID 保存。现在没时间处理延伸、复习、Distill 或关系更新时，不需要当场选择。

新会话中输入：

```text
/skill:learning-hub list
```

或者直接继续：

```text
/skill:learning-hub continue <Quest ID 或标题>
```

开始新的学习项目不会覆盖旧 Quest；旧的待办仍然保留。

完整教学顺序是：

```text
建立 Quest
→ 逐节点讲解
→ 开放疑问窗口
→ 用户确认后进行一次节点评估
→ 完成实际应用输出
→ 一次综合评估
→ Distill 候选正式笔记
→ 双向关系与 Topic Map
→ Learning Hub 保存后续动作
```

> 新手读到这里就可以开始使用了。下面是命令索引、正式知识组织方式和高级规则，遇到对应问题时再查阅即可。

## 我该调用哪个 Skill？

多数情况下只需要记住 `teach` 和 `integrate-learning`。其他命令用于直接进入某个阶段。

| 你现在想做什么 | 命令 | Skill |
| --- | --- | --- |
| 从真实问题开始学习 | `/skill:teach <目标>` | `teach` |
| 查看或恢复学习项目 | `/skill:learning-hub <动作> <Quest ID>` | `learning-hub` |
| 单独检查自己会不会用 | `/skill:assess <能力>` | `assess` |
| 核查事实、公式、定义或来源 | `/skill:verify <断言>` | `verify` |
| 整理已经完成教学流程的知识 | `/skill:distill <概念>` | `distill` |
| 整理自己以前写的 Markdown | `/skill:integrate-learning <相对路径>` | `integrate-learning` |
| 给现有知识建立语义关系 | `/skill:link-knowledge <范围>` | `link-knowledge` |
| 根据遗忘和历史错误复习 | `/skill:review <可选范围>` | `review` |
| 永久清空 `.trash/` | `/skill:purge-trash` | `purge-trash` |

`teach` 会在一次学习中自行编排 `verify`、`assess`、`distill` 和 `link-knowledge`。你不需要手工依次调用它们。

## 目录分别放什么

| 目录 | 用途 |
| --- | --- |
| `00-原始笔记/` | 你亲自写下、等待忠实整合的 Markdown |
| `01-学习问题/` | 真实问题、完成标准和知识路径；标签固定为 `quest` |
| `02-概念/` | 边界清楚、只有一个核心命题的 Concept Note |
| `03-主题地图/` | 分类组织概念的主题导航；标签固定为 `map` |
| `04-来源/` | 书籍、论文、课程、视频和网页等来源记录 |
| `05-实践与产出/` | 方法、检查清单、实验、项目和应用成果 |
| `90-学习会话/` | 学习过程和暂未晋升的内容 |
| `98-代码实验/` | 可运行教学代码和说明 |
| `99-归档/` | 不再活跃但仍需保留的内容 |
| `.learning/` | Quest、掌握状态和复习队列 |
| `.trash/` | 已整合输入的可恢复暂存 |
| `.pi/skills/` | Agent 行为规则 |

## 正式知识会如何组织

### Concept Note

教学流程生成的 Concept Note 通常包含：

```text
核心命题
→ 概念与机制
→ 嵌入机制中的实际应用案例
→ 适用边界与常见误区
→ 有理由的 Obsidian 关系
→ 必要时添加参考
```

不会机械生成“我的理解”“理解验证”“来源与证据”等学习过程章节。掌握证据保存在 `.learning/` 或 `90-学习会话/`。

教学生成的解释型笔记需要领域匹配的实际应用：软件使用代码、配置、数据或日志；硬件使用器件参数、连接、测量和故障现象；数学使用完整数值演算；其他领域使用相应的真实材料。正式代码块必须包含知识解释性注释，而不只是翻译语法。

这项完整度要求不能用于扩写原始笔记。`integrate-learning` 发现原文材料不足时会保留待补充，而不是自行生成案例。

详细规范见 [正式笔记的实例与链接规范](docs/concept-note-writing.md)。

### Concept Note 之间的关系

每条关系都使用 Wikilink，并写明关系类型和理由：

```markdown
## 关系

- 前置：[[数据表示与特征向量]] — KNN 需要先把样本表示到同一特征空间才能计算距离。
```

新概念出现时，系统会同时检查旧 Concept Note 是否需要反向更新。例如：

```text
数据表示与特征向量 → 应用于 KNN
KNN → 前置是数据表示与特征向量
```

两侧关系词可以不同，但必须表达同一条真实语义。`integrate-learning` 只写原始输入已经支持的关系；输入之外的候选关系放到转换外建议。

### Learning Quest 与 Concept Note

Quest 的 `## 涉及概念` 链接相关 Concept Note，Concept Note 的“关系”反向链接 Quest。两侧都要写清它如何参与解决问题，不能只更新其中一侧。

### Topic Map

Topic Map 不是“已晋升概念”的平铺清单。每次加入概念时，系统会读取已有条目，选择适合当前主题的组织轴，按语义角色、系统层次、工作阶段或问题类型分类，并在组内按依赖或领域自然顺序排列。

例如机器学习地图可以在当前内容下组织为：

```markdown
## 知识结构

### 数据与表示

- [[数据表示与特征向量]] — 为后续模型提供统一输入空间。

### 监督学习模型

- [[K 近邻分类（KNN）]] — 基于特征空间距离完成分类。
- [[线性回归]] — 通过特征线性组合预测连续值。
```

分类标题随领域生成，不把机器学习模板机械套到其他主题。完整规则见 [Topic Map 创建与归属规范](docs/topic-map-writing.md)。

### 标签和图谱颜色

- Learning Quest：只使用 `quest`；
- Topic Map：只使用 `map`；
- Concept Note、来源和实践：使用一个宽泛主领域标签，真正跨领域时最多两个。

```yaml
tags:
  - domain/ai
```

Obsidian Graph view 可以添加 Groups：

```text
tag:#domain/ai
tag:#domain/web
tag:#domain/hardware
tag:#quest
tag:#map
```

领域注册表可以随新学科扩展，不使用 `domain/other` 强行兜底。完整规则见 [领域标签注册表](docs/domain-tags.md)。

## 写入、移动和删除边界

| 操作 | 何时执行 |
| --- | --- |
| 建立 Learning Quest | 展示目标后由你确认 |
| 写入 Concept Note | 展示路径和完整草稿后由你确认 |
| 修改知识链接 | 展示关系、理由和受影响文件后确认 |
| 批次整合原始笔记 | 你一次批准完整整合计划 |
| 把输入移入 `.trash/` | 100% 覆盖后针对精确清单再次确认 |
| 永久清空 `.trash/` | 你明确调用 `purge-trash` 即授权 |

`integrate-learning` 不会永久删除输入。永久清空是独立、不可恢复的操作。

## 跨会话状态

`.learning/learning-progress.json` 保存多个 Quest 的 ID、当前位置和待办。`.learning/mastery-state.json` 保存掌握证据，`.learning/review-queue.json` 保存复习队列。

常用命令：

```text
/skill:learning-hub list
/skill:learning-hub show <Quest ID>
/skill:learning-hub continue <Quest ID>
/skill:learning-hub extend <Quest ID>
/skill:learning-hub review <Quest ID>
/skill:learning-hub pause <Quest ID>
```

Quest 状态不会授权系统静默写入正式笔记；正式知识仍需单独确认。

## 默认隔离

建议把以下目录排除在普通自动上下文和常规检索之外：

```text
00-原始笔记/
98-代码实验/
.trash/
```

只有显式调用相应 Skill 并给出精确目标时才访问。这是上下文治理策略，不是操作系统权限隔离。

## 常见问题

### 使用 `teach` 时，需要自己依次调用其他 Skill 吗？

不需要。`teach` 会按需编排事实核查、节点评估、实际应用输出、综合评估、Distill、关系更新和状态保存。

### 我只是快速问一个问题，也要走完整流程吗？

不需要。简单事实可以直接询问；只有希望形成可验证、可沉淀的理解时才使用 `teach`。

### 原始笔记可以直接成为 Concept Note 吗？

不会直接复制。`integrate-learning` 会先穷尽拆分、建立覆盖账本、查重和决定去向。只有边界清楚且原始材料足够的内容才晋升；材料不足时保留待补充，不会由 Agent 扩写。

### 原始笔记里有图片怎么办？

每张图片下一行写 `(...)` 或 `（...）` 说明。缺失时 Agent 会集中提醒；图片进入正式笔记时，图片与说明会一起写入并保持物理相邻。

### `integrate-learning` 和 `distill` 有什么区别？

- `integrate-learning` 忠实转换你以前写在 `00-原始笔记/` 中的内容，不补写新知识；
- `distill` 整理当前教学流程中已经完成解释、应用和综合评估的知识。

### 学习结束时没时间处理后续动作怎么办？

不用当场选择。下次输入 `/skill:learning-hub list`，未完成的 Distill、关系、Topic Map、延伸和复习动作都会保留。

### `/skill:...` 没有出现或无法识别怎么办？

依次检查：

1. 是否从 Vault 根目录启动；
2. Skill 是否位于 `<Vault>/.pi/skills/<name>/SKILL.md`；
3. `.pi/settings.json` 是否设置 `enableSkillCommands: true`；
4. 修改后是否重启了 Agent。

### 怎样确认使用的是 Windows 原生 PowerShell？

让 Agent 执行：

```powershell
$PSVersionTable.PSVersion
[System.Environment]::OSVersion
Get-Location
```

路径应类似 `E:\Document\Vault`，而不是 `/mnt/e/...`；不应出现 WSL 环境变量或 Linux 内核版本。

### 可以不使用 Obsidian 吗？

可以。核心内容仍是普通目录、Markdown 和 Wikilink；Obsidian 主要提供关系图谱和浏览体验。

## 自定义

可以调整：

- Learning Quest 与 Concept Note 模板；
- 掌握证据门槛和复习间隔；
- 不同领域的案例偏好；
- 关系类型和 Topic Map 组织方式；
- 代码实验目录与编辑器命令；
- 学习者档案中的能力、困难和交互偏好。

个人知识、学习状态和密钥应保留在自己的 Vault，不要提交到公共仓库。

## 进一步了解

- [原始笔记的封闭语料转换边界](docs/raw-note-conversion-boundary.md)
- [原始笔记图片说明约定](docs/raw-note-images.md)
- [正式笔记的实例与链接规范](docs/concept-note-writing.md)
- [Topic Map 创建与归属规范](docs/topic-map-writing.md)
- [领域标签注册表](docs/domain-tags.md)
- [ADR-0002：整合后的输入先进入回收暂存](docs/adr/0002-stage-integrated-input-notes-before-purge.md)
- [ADR-0003：原始输入和代码实验默认隔离](docs/adr/0003-keep-isolated-working-folders-inside-vault.md)
