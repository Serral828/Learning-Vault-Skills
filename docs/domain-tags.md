# 领域标签注册表

领域标签用于让 Obsidian 关系图谱按宽泛知识领域分组和着色。它只回答“这篇笔记主要属于哪类知识”，不替代 `topics`、Topic Map、文件夹或语义链接。

## 写入格式

正式知识笔记的 YAML 使用列表格式；标签值里不写 `#`：

```yaml
tags:
  - domain/ai
```

- 每篇笔记必须有一个主领域。
- 只有核心命题确实横跨两个领域时才增加第二个；最多两个。
- 保留笔记中已有的无关标签，不静默覆盖整个 `tags` 列表。
- 细粒度主题继续写入 `topics` 或正文链接，不创建 `domain/machine-learning`、`domain/react`、`domain/stm32` 这类窄标签。
- 来源笔记按内容所属领域分类，不按“书籍”“视频”“网页”等媒介分类。

这套规则适用于 Agent 新建或更新的长期正式知识：

- `01-学习问题/`
- `02-概念/`
- `03-主题地图/`
- `04-来源/`
- `05-实践与产出/`

它不要求给 `00-原始笔记/`、`90-学习会话/`、`98-代码实验/`、`.learning/`、`.trash/` 中的临时或过程文件添加领域标签。

## 当前注册表

以下只是初始集合，不是对未来知识范围的限制：

| 标签 | 覆盖范围示例 |
| --- | --- |
| `domain/ai` | 人工智能、机器学习、深度学习、LLM、NLP、计算机视觉 |
| `domain/software` | 通用编程、算法、操作系统、软件架构、开发工具 |
| `domain/web` | 前端、后端、浏览器、HTTP、Web 架构与平台 |
| `domain/hardware` | 电子、电路、嵌入式、芯片、传感器、PCB |
| `domain/data` | 数据库、数据工程、数据分析、数据治理 |
| `domain/math` | 数学、统计、概率、逻辑与形式方法 |
| `domain/natural-science` | 物理、化学、生物、地球与空间科学 |
| `domain/social-science` | 经济学、心理学、社会学、政治学与法学 |
| `domain/humanities` | 历史、哲学、语言、文学与文化研究 |
| `domain/business` | 商业、金融、管理、营销与创业 |
| `domain/design` | 用户体验、视觉、产品与工业设计 |
| `domain/arts` | 音乐、美术、影视、摄影与表演艺术 |
| `domain/health` | 医学、健康、营养、运动与身心福祉 |
| `domain/education` | 学习科学、教学法、课程与教育实践 |

## 选择规则

1. 依据笔记的核心问题选择主领域，不因为正文借用了另一个领域的工具就自动增加标签。
2. 优先复用注册表中足够宽泛的标签，不按课程名、框架名、设备名或单个概念造标签。
3. 真正跨领域时最多使用两个标签，并把最能解释核心问题的标签列在前面。
4. 不使用 `domain/other`、`domain/misc` 等兜底标签。

示例：

| 笔记 | 领域标签 | 原因 |
| --- | --- | --- |
| 泛化与过拟合 | `domain/ai` | 核心问题是模型学习与泛化；不因涉及概率就自动加 `domain/math` |
| 边缘设备上的目标检测 | `domain/ai`、`domain/hardware` | 模型能力与硬件约束共同构成核心问题 |
| React 服务端渲染 | `domain/web` | 框架名属于细粒度主题，不单独创建领域 |
| 假设检验 | `domain/math` | 核心是统计推断 |
| 行为经济学中的损失厌恶 | `domain/social-science`、`domain/business` | 同时涉及心理机制和经济决策应用 |

## 遇到尚未覆盖的新领域

注册表可以扩展。若未来知识无法自然归入现有标签，Agent 必须：

1. 提议一个新的、仍然宽泛的 `domain/<slug>`；
2. 说明它的边界、典型内容以及为什么现有标签不合适；
3. 把“新增注册表项”和本次笔记写入放在同一个确认计划中；
4. 用户确认后，先把新标签加入本注册表，再用于正式笔记。

不要为了完成当前写入而擅自造标签，也不要强行把新学科塞进不合适的现有领域。

## Obsidian 图谱分组

Obsidian 的颜色由 Graph view 的 **Groups** 设置，而不是由 Markdown 标签本身存储。为实际使用到的领域逐个添加查询，例如：

```text
tag:#domain/ai
tag:#domain/web
tag:#domain/hardware
```

然后在每个 Group 右侧选择颜色。注册表新增领域后，只需为新标签增加一个 Group；无需重写旧笔记或预先为尚未使用的领域配置颜色。

参考：[Obsidian Graph view](https://obsidian.md/help/plugins/graph)、[Obsidian Search](https://obsidian.md/help/plugins/search)、[Obsidian Tags](https://obsidian.md/help/tags)。
