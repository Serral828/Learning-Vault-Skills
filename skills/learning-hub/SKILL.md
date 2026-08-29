---
name: learning-hub
description: 管理跨会话 Learning Quest ID、状态和下一动作，并在继续学习、主题延伸与复习之间路由。用户开始、恢复、列出、切换、暂停或归档学习项目，或 teach、review 需要持久化进度时使用；不负责具体教学、事实核查或掌握评估。
---

# Learning Hub

目标是让每个学习目标拥有稳定、可恢复的身份，并让用户可以把“继续/延伸”和“复习”留到任何未来会话执行。

## 职责边界

- 本 Skill 独占 `.learning/learning-progress.json` 的结构管理和合并写入。
- `teach` 负责教学、调用 `verify` 与 `assess`，并在达标后提议 `distill`。
- `review` 负责主动回忆、迁移评估和复习证据。
- 本 Skill 只解析 Quest、保存状态、管理动作并路由到上述 Skill，不替代它们。
- 不把状态文件当成正式知识，也不借状态授权写入 Concept Note、Topic Map、来源、实践产出或完整 Session Log。

执行任何读取、创建、更新、恢复或归档操作前，读取并遵循 [references/state-model.md](references/state-model.md)。

创建或更新 `01-学习问题/` 中的正式 Quest 文件时，还要读取并遵循 [领域标签注册表](../../docs/domain-tags.md)。`.learning/learning-progress.json` 是过程状态，不需要为了图谱着色而添加领域标签。

## 创建或解析 Quest

`teach` 接收到新学习目标后，先由本 Skill 解析 Quest：

1. 检索状态注册表和 `01-学习问题/`，判断是否已有同一真实目标。标题相似但完成标准不同，不自动合并。
2. 已有匹配 Quest 时复用原 `questId`，不因新会话或重新调用 `teach` 创建新 ID。
3. 确实是新 Quest 时，提出标题、真实目标、完成标准、新 ID 和领域标签，等待用户一次确认。默认一个主领域，真正跨领域时最多两个。
4. 同一次确认可以询问是否允许在该 Quest 生命周期内自动更新非正式检查点。用户同意后，该 Quest 的状态更新无需逐节点重复确认。

若目标不适合现有领域注册表，在这次 Quest 创建提案中同时提出新的宽泛标签、边界和理由；用户确认后先更新注册表，再把标签以 YAML 列表写入正式 Quest 文件。不得使用窄标签或 `domain/other`。

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

用于尚未达到当前完成标准的 Quest。读取对应检查点和掌握证据，简短说明上次停在哪里，然后交给 `teach` 从最近未完成节点继续。不要重新探测或教授已有充分证据的内容。

### `extend`

只在当前 Quest 已达到完成标准，且用户要进入相邻但独立的新能力目标时使用。创建带 `parentQuestId` 的子 Quest，并由 `teach` 为子 Quest 建立自己的完成标准。

如果用户只是继续原 Quest 的未完成节点，不创建子 Quest，改用 `continue`。不要把宽泛主题永久塞进一个永不完成的 Quest。

### `review`

只复习当前 Quest 中已经具有掌握证据的内容。把 Quest ID、合格概念和历史缺口交给 `review`；尚未教授或未形成证据的下一节点不能伪装成复习内容。

用户在教学结束时选择“以后复习”，只保存一个 `review` 动作；用户未来显式执行该动作时才开始复习。查看动作不等于授权立即复习。

### `pause` 与 `archive`

- `pause` 保留检查点和 `pending` 动作，允许以后恢复。
- `archive` 表示不再主动提醒，但保留历史记录；不得物理删除 Quest、动作或正式笔记。

## 接收教学结果

`teach` 到达一个有意义的检查点后，将以下信息交回本 Skill：

- Quest ID；
- 最近完成和当前节点；
- 通过 `assess` 获得的能力证据；
- 仍影响路径的具体缺口；
- 当前完成标准是否已经达到；
- 可行的下一学习目标与可复习内容。

本 Skill 合并写入状态，并生成最多两个主要未来动作：

1. **继续或延伸**：Quest 未完成时为 `continue`；已完成且确有相邻目标时为 `extend`。
2. **复习**：只有存在掌握证据时才创建 `review` 动作。

“暂停且现在不选择”始终是隐含选项，不需要创建第三个菜单项。不要为了凑齐两个选项制造无意义延伸或对未掌握内容安排复习。

结束输出使用稳定、可复制的格式：

```text
学习项目：<标题>
Quest ID：<ID>
状态：<active|paused|completed>
当前位置：<节点或完成状态>

以后可执行：
1. <继续当前路径或延伸主题>
   /skill:learning-hub <continue|extend> <ID>
2. 复习已掌握内容
   /skill:learning-hub review <ID>

现在不需要选择，状态已经保存。
```

无效动作应省略，并简短说明原因。

## 新 Quest 与旧待办

用户开始新学习时照常激活新 Quest，旧 Quest 和旧动作不得被覆盖。每个新学习会话最多低干扰提醒一次：仍有多少旧 Quest 包含待办，以及可用 `/skill:learning-hub list` 查看。不要强迫用户先清空旧待办，也不要每轮重复提醒。

动作完成、取消、被新计划替代或 Quest 归档时及时更新状态。同一 Quest、同一目标的重复动作应合并；收件箱变大时只在用户查看或明确整理时提议取消、合并或归档，不自动丢弃。
