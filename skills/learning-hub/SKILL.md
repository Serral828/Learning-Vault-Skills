---
name: learning-hub
description: 管理跨会话 Learning Quest ID、状态和下一动作，并在继续学习、主题延伸与复习之间路由。用户开始、恢复、列出、切换、暂停或归档学习项目，或 teach、review 需要持久化进度时使用；不负责具体教学、事实核查或掌握评估。
---

# Learning Hub

目标是让每个学习目标拥有稳定、可恢复的身份，并让用户可以把“继续/延伸”和“复习”留到任何未来会话执行。

## 职责边界

- 本 Skill 独占 `.learning/learning-progress.json` 的结构管理和合并写入。
- `teach` 负责教学，在每个规划节点边界调用一次 `assess`；全部节点评估后组织实际应用输出和一次综合评估，评估结束即主动调用 `distill`，不因掌握缺口安排补测。
- `review` 负责主动回忆、迁移评估和复习证据。
- 本 Skill 只解析 Quest、保存状态、管理动作并路由到上述 Skill，不替代它们。
- 不把状态文件当成正式知识，也不借状态授权写入 Concept Note、Topic Map、来源、实践产出或完整 Session Log。

执行任何读取、创建、更新、恢复或归档操作前，读取并遵循 [references/state-model.md](references/state-model.md)。

创建或更新 `01-学习问题/` 中的正式 Quest 文件时，还要读取并遵循 [标签注册表](../../docs/domain-tags.md)：YAML `tags` 必须统一为只包含 `quest`，不得添加 `domain/...` 或其他细分标签。`.learning/learning-progress.json` 是过程状态，不添加图谱标签。

每个正式 Quest 文件必须包含 `## 涉及概念`。这里只收录真实存在于 `02-概念/` 的笔记，并使用带路径的 Wikilink 和一句作用说明：

```markdown
## 涉及概念

- [[02-概念/监督学习中的训练|监督学习中的训练]] — 解释这个学习问题中模型如何从标注数据确定参数。
- [[02-概念/泛化与过拟合|泛化与过拟合]] — 用于判断训练结果能否迁移到未见数据。
```

Quest 刚创建且尚无正式 Concept Note 时写“尚未形成正式概念链接”，不得制造指向不存在文件的占位链接。后续 Distill 新建或复用相关 Concept Note 时，必须把该条目替换或追加为真实链接，并同时在 Concept Note 中反向链接本 Quest。

## 创建或解析 Quest

`teach` 接收到新学习目标后，先由本 Skill 解析 Quest：

1. 检索状态注册表和 `01-学习问题/`，判断是否已有同一真实目标。标题相似但完成标准不同，不自动合并。
2. 已有匹配 Quest 时复用原 `questId`，不因新会话或重新调用 `teach` 创建新 ID。
3. 确实是新 Quest 时，提出标题、真实目标、完成标准、新 ID 和固定标签 `quest`，等待用户一次确认；不再判断或询问 Quest 属于哪个领域。
4. 同一次确认可以询问是否允许在该 Quest 生命周期内自动更新非正式检查点。用户同意后，该 Quest 的状态更新无需逐节点重复确认。

新建 Quest 的 YAML 使用：

```yaml
tags:
  - quest
```

更新已有 Quest 时，如果发现 `domain/...` 或其他标签，在更新计划中明确展示将其统一替换为 `quest`；不因学习主题尚未被领域注册表覆盖而扩展领域标签。

用户拒绝持久化时仍可临时教学，但不要创建 ID 记录或假装能够跨会话恢复。

## 用户入口

支持标题或 ID；存在歧义时优先显示短列表让用户选择，不猜测。

```text
/skill:learning-hub list
/skill:learning-hub show <Quest ID 或标题>
/skill:learning-hub continue <Quest ID 或标题>
/skill:learning-hub extend <Quest ID 或标题>
/skill:learning-hub review <Quest ID 或标题>
/skill:learning-hub pause <Quest ID 或标题>
/skill:learning-hub archive <Quest ID 或标题>
```

### `list` 与 `show`

- `list` 按 `active`、`paused`、`completed` 分组，展示 ID、标题、当前位置和仍为 `pending` 的两个主要动作；默认不展示已归档 Quest。
- `show` 展示一个 Quest 的目标、完成标准、能力证据、缺口、父子关系和动作状态，不倾倒完整聊天记录。

### `continue`

用于尚未完成当前收尾或完成标准的 Quest。读取节点状态和掌握证据，简短说明上次停在哪里，并按以下优先级恢复：

1. 当前节点为 `clarifying`：交给 `teach` 恢复该节点的疑问窗口，不能自动开始评估。
2. 当前节点为 `awaiting_assessment`：说明用户此前已经明确选择评估，再交给 `teach` 调用 `assess`。
3. 全部节点已评估但 `applicationOutput.status` 为 `pending`：恢复实际应用输出任务。
4. 已提交输出但 `comprehensiveAssessment.status` 为 `pending`：交给 `teach` 调用 `assess` 完成首次综合评估。旧数据中的 `failed` 视为已完成且有缺口，不恢复补测。
5. Quest 级 `distillStatus` 为 `ready` 或 `proposed`：调用 `distill` 展示或恢复候选草稿。
6. `conceptRelationPlans` 中存在 `proposed`：交给 `link-knowledge` 按保存的文件对、两侧关系文本和理由恢复已有 Concept Note 的成对更新，不能只把链接留在新笔记中。
7. `conceptLinks` 中存在 `proposed`，或 `distillStatus` 已为 `written` 但 `conceptLinks` 为空：交给 `link-knowledge` 恢复或补查 Learning Quest 与 Concept Note 的双向链接，不允许只保留一侧。
8. Concept Note 已写入但 `topicMapPlan.status` 为 `proposed`：交给 `distill` 或 `link-knowledge` 恢复 Topic Map 新建或更新提案，不能因为地图原先不存在就跳过。
9. 上述收尾都已完成：再由 `teach` 从最近未完成的新节点继续。

不要跳过待澄清、用户已选择的待评估或待提炼状态，也不要重新教授已有充分证据的内容。

### `extend`

只在当前 Quest 已达到完成标准，且用户要进入相邻但独立的新能力目标时使用。创建带 `parentQuestId` 的子 Quest，并由 `teach` 为子 Quest 建立自己的完成标准。

如果用户只是继续原 Quest 的未完成节点，不创建子 Quest，改用 `continue`。不要把宽泛主题永久塞进一个永不完成的 Quest。

### `review`

只复习当前 Quest 中已经具有掌握证据的内容。把 Quest ID、合格概念和历史缺口交给 `review`；尚未教授或未形成证据的下一节点不能伪装成复习内容。

用户在教学结束时选择“以后复习”，只保存一个 `review` 动作；用户未来显式执行该动作时才开始复习。查看动作不等于授权立即复习。

### `pause` 与 `archive`

- `pause` 保留检查点和 `pending` 动作，允许以后恢复。
- `archive` 表示不再主动提醒，但保留历史记录；不得物理删除 Quest、动作或正式笔记。

所有节点分别完成一次评估并不等于 Quest 已完成。只有实际应用输出已经提交、综合评估为 `passed` 或 `completed_with_gaps`，Distill 提案已经由用户写入或明确拒绝；若 Concept Note 已写入，`conceptLinks` 必须至少有一项且全部为 `linked` 或被明确 `declined`，`conceptRelationPlans` 也不得留有 `proposed`；同时 Topic Map 计划已经链接、明确拒绝或因未晋升而不适用，才可把 Quest 标为 `completed`。空的 `conceptLinks` 或仍待更新的旧概念关系不能被当成“没有待办”。

## 接收教学结果

`teach` 到达一个有意义的检查点后，将以下信息交回本 Skill：

- Quest ID；
- 最近完成和当前节点；
- 每个节点的 `clarificationInsights`，包括用户的实质性疑问、最终解答、新增例子或边界以及建议写入笔记的位置；
- 通过 `assess` 获得的能力证据；
- 每个已教授节点的状态、要求证据等级和实际证据等级；
- 实际应用输出的类型、位置或摘要及其状态；
- 综合评估的整体状态、各节点在输出中的证据和剩余缺口；
- Quest 级 `distillStatus`，包括 `not_ready`、`ready`、`proposed`、`written` 或 `declined`；
- Quest 与 Concept Note 的 `conceptLinks`，包括概念标题、路径、它在解决该问题中的作用和双向链接状态；
- 新 Concept Note 与已有 Concept Note 的 `conceptRelationPlans`，包括两侧路径、各自关系文本、共同语义理由和双向写入状态；
- Topic Map 计划的状态、地图标题、目标路径、`create`/`update` 操作、新概念所属语义分组以及旧条目需要移动或重排的结构摘要；找不到现有地图时也必须记录创建计划；
- 仍影响路径的具体缺口；
- 当前完成标准是否已经达到；
- 可行的下一学习目标与可复习内容。

本 Skill 合并写入状态，并按优先级生成最多两个主要未来动作：

1. **完成当前收尾**：按“待疑问澄清 → 待首次节点评估 → 待实际应用输出 → 待首次综合评估 → 待 Distill → 待新旧 Concept Note 双向关系 → 待 Quest–Concept 双向链接 → 待 Topic Map”的顺序，为最早未执行阶段创建 `continue`、`distill`、`link-knowledge` 或 `topic-map` 动作。评估已有结果但带缺口时不创建补测动作。
2. **继续或延伸**：上述教学与晋升阶段都已完成时，Quest 未完成使用 `continue`；已完成且确有相邻目标时使用 `extend`。
3. **复习**：还有名额且存在掌握证据时才创建 `review` 动作。

“暂停且现在不选择”始终是隐含选项，不需要创建第三个菜单项。不要为了凑齐两个选项制造无意义延伸或对未掌握内容安排复习；也不要在存在待评估或待提炼收尾时先推荐延伸新主题。

结束输出使用稳定、可复制的格式：

```text
学习项目：<标题>
Quest ID：<ID>
状态：<active|paused|completed>
当前位置：<节点或完成状态>

以后可执行：
1. <完成待节点评估/实际应用输出/综合评估/Distill/Topic Map，或继续当前路径/延伸主题>
   /skill:learning-hub <continue|extend> <ID> 或 /skill:distill <节点>
2. 复习已掌握内容
   /skill:learning-hub review <ID>

现在不需要选择，状态已经保存。
```

无效动作应省略，并简短说明原因。

## 新 Quest 与旧待办

用户开始新学习时照常激活新 Quest，旧 Quest 和旧动作不得被覆盖。每个新学习会话最多低干扰提醒一次：仍有多少旧 Quest 包含待办，以及可用 `/skill:learning-hub list` 查看。不要强迫用户先清空旧待办，也不要每轮重复提醒。

动作完成、取消、被新计划替代或 Quest 归档时及时更新状态。同一 Quest、同一目标的重复动作应合并；收件箱变大时只在用户查看或明确整理时提议取消、合并或归档，不自动丢弃。
