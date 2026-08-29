---
name: link-knowledge
description: 检查和建立 Concept Note、Topic Map、Learning Quest、来源及产出之间有明确语义的关系。用户要求连接知识或新概念晋升后使用。
---

# Link Knowledge

## 原则

- 开始前读取并遵循 [领域标签注册表](../../docs/domain-tags.md)。
- 开始前读取 [正式笔记的关系写法](../../docs/concept-note-writing.md#关系必须写成-obsidian-链接)，并按其中的 Wikilink 格式写入。
- 先搜索已有笔记，再提出关系。
- 不因为词语相似就建立链接。
- 不因为两篇笔记拥有相同领域标签就建立链接；标签用于宽泛分组，链接必须表达具体语义。
- 每条关系必须能用一句自然语言说明。
- 优先在正文中使用带上下文的 Markdown 链接，而不是堆砌“相关链接”。

## 常用关系

- `requires`：理解 A 需要先理解 B。
- `explains`：A 解释 B 的机制或原因。
- `applies-to`：A 被用于 B。
- `contrasts-with`：A 与 B 在某个维度形成对比。
- `causes`：A 在明确条件下导致 B。
- `evidence-for`：A 是 B 的证据。
- `generalizes`：A 是 B 的更一般形式。

## 更新规则

- 宽泛主题进入 `03-主题地图/`，不要把 Topic Map 写成百科全书。
- 新 Concept Note 晋升后，读取并遵循 [Topic Map 创建与归属规范](../../docs/topic-map-writing.md)，必须为它处理至少一个最直接的上位 Topic Map。合适地图不存在时，提出创建最小地图；不得只报告未找到后结束。
- 一个概念可以属于多个 Topic Map，不通过深文件夹强制唯一归属。
- 新建或更新 Topic Map 时，YAML `tags` 统一只保留 `map`，不添加 `domain/...`；Concept Note 等其他正式知识仍按领域标签注册表分类。
- 提出新增或修改链接时，展示关系、理由、将写入的 `[[目标笔记]]` 和受影响文件，等待用户确认后再写入。
- 正文关系必须采用“关系类型 + Wikilink + 一句话理由”；不得写成纯文本目标、裸 URL 或只有链接没有语义的清单。存在同名歧义时使用带路径和别名的 Wikilink。
- 若 YAML 的 `prerequisites` 表达笔记关系，使用带引号的 Wikilink；写入后确认目标能够解析。没有可靠目标时明确写“暂无已验证关系”，不制造链接。
- 同时检查受影响正式笔记的标签是否缺失或明显不一致：Topic Map 应为 `map`，其他正式知识检查领域标签。标签修正与链接修改分项展示，并在同一次确认后执行；不要把标签修正伪装成链接的附带副作用。
- 若需要新的宽泛领域标签，先在确认计划中说明边界与理由，用户确认后更新注册表再使用；不得创建窄标签或兜底标签。
