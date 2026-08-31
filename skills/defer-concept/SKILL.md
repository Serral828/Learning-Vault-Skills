---
name: defer-concept
description: 在 Teach 过程中，用户明确表示某个概念现阶段无法理解并希望以后再学时，将它跨会话暂存，区分阻塞依赖与辅助知识，并负责列出、查看、恢复或取消暂存。普通的“没听懂”仍由 Teach 继续解释，不自动触发本 Skill。
---

# Defer Concept

把“这个概念现在学不动，但以后不能丢”保存成可恢复状态。它不是教学、评估、掌握证据或正式笔记。

执行任何写入前，读取并遵循 [状态规范](references/state-model.md)。`.learning/deferred-concepts.json` 由本 Skill 独占结构管理；`learning-hub` 可以读取它，并只通过本 Skill 请求合并更新。

## 用户入口

```text
/skill:defer-concept <概念>
/skill:defer-concept list
/skill:defer-concept show <Deferred ID 或概念名>
/skill:defer-concept resume <Deferred ID 或概念名>
/skill:defer-concept cancel <Deferred ID 或概念名>
```

也接受“这个概念现阶段无法理解，先暂存”“以后再专门学习这个概念”等明确表达。

“这里没听懂”“再举个例子”“为什么”只表示继续澄清，必须留在 `teach`；不得自动调用本 Skill。用户没有明确暂缓意图时，Agent 也不得因为推测用户基础不足而代为暂存。

## 暂存流程

1. 从当前 Teach 上下文确定概念名、Quest ID、当前节点、它为何被引入、已经讲过的内容、已有实例和返回点。只保存精炼快照，不保存完整聊天记录。
2. 如果用户已说明卡点就保存；没有说明则写 `null`，不得为了暂存追加测试或追问。
3. 搜索现有记录。相同且语义明确的概念复用 Deferred ID，并新增或合并 `originRefs`；同名但可能不是同一概念时才询问一次。
4. 根据当前节点的完成标准判断本次来源中的依赖影响：
   - `blocking`：拿掉该概念后，当前节点无法完成原定的解释、判断、设计或操作。
   - `supporting`：拿掉它仍可完成当前节点，它只提供扩展、实现手段或额外解释。
5. 明确告诉用户判断、理由和流程后果。用户可以纠正分类；分类判断不需要知识测试。
6. 如果原 Quest 已有 `persistenceApproved: true`，该授权覆盖本次非正式检查点；否则在首次写入前请求一次确认。
7. 写入 `.learning/deferred-concepts.json`，再调用 `learning-hub` 合并原节点中的轻量引用，最后回读两处状态。任一步失败都停止后续写入并报告，不根据当前会话重建文件。

## 两种依赖的流程

### 阻塞依赖

- 在原节点的 `deferredDependencies` 中加入 Deferred ID、`blocking` 和 `parked`。
- 原节点改为 `waiting_on_deferred`，禁止评估、直接放行、实际应用汇总和 Distill。
- 原 Quest 还有不依赖该概念的节点时可以继续那些节点；没有时保留检查点并暂停 Quest。
- 用户说“下一步”“可以通过”只表示离开或暂停这个受阻节点，不能把它改成 `validated`。
- 恢复并完成对应正式学习 Quest 后，原节点回到 `teaching`，由 Teach 重新连接前置概念与主问题，再进入正常疑问和评估流程。

### 辅助知识

- 在原节点的 `deferredDependencies` 中加入 Deferred ID、`supporting` 和 `parked`，节点本身保持原状态。
- Teach 可以继续当前节点；Assess 必须排除暂存概念；Quest 可以正常完成。
- 暂存项独立保留，直到用户主动恢复或取消；它不自动占用原 Quest 的后续动作名额。

同一概念在不同 `originRefs` 中可以有不同影响。例如“电压跟随器”在“设计运放缓冲级”中可以是 `blocking`，在“用输出电阻解释负载压降”中可以是 `supporting`。

## 列出与查看

- `list` 默认按“阻塞中的概念、辅助知识、正在恢复”分组，展示 Deferred ID、标题、来源 Quest/节点、影响和恢复命令；不显示 `addressed` 或 `cancelled`，除非用户要求历史。
- `show` 展示引入原因、教学快照、卡点、所有来源、恢复起点和返回点；不得把它显示为掌握缺口或已掌握概念。
- `learning-hub list` 必须显示全部未处理来源的独立摘要，不受来源 Quest 是否完成或归档影响；`learning-hub show <Quest>` 只显示该 Quest 的相关来源。`learning-hub deferred` 路由到本 Skill 的完整 `list`。Learning Hub 不得复制或修改完整注册表。

## 恢复

执行 `resume` 时：

1. 读取教学快照，简短说明它最初为何出现、讲到哪里、卡在哪里以及需要返回哪些节点。
2. 已有 `linkedLearningQuestId` 时，交给 `learning-hub continue`；否则由 `learning-hub` 创建一个正式依赖 Quest，记录 `originDeferredConceptId` 和返回目标，再交给 `teach` 正常 Probe、规划、教学、疑问、评估、实际应用和 Distill。不得从暂存快照推断用户已经掌握其中内容。
3. 把概念状态改为 `resuming`，相关来源改为 `learning`。恢复一个概念不会自动验证原节点。
4. 依赖 Quest 完成后，把相关来源改为 `waiting_return`，并由 `learning-hub` 为每个仍有效的阻塞来源合并创建一个指向原 Quest 的 `continue` 动作。
5. 返回原阻塞节点时，把依赖引用改为 `resolved`，原节点从 `waiting_on_deferred` 改为 `teaching`；Teach 先重新解释概念间的联系。辅助来源只改为 `resolved`，不要求重做已经完成的原节点。
6. 所有未取消来源都已解决后，概念状态改为 `addressed`。

## 取消

`cancel` 保留历史但停止提醒：

- 辅助来源可直接改为 `cancelled`。
- 阻塞来源不能靠取消记录自动通过。若用户准备继续原目标，原节点回到 `teaching` 重新处理该依赖；若用户不再需要该节点，交给 `teach` 明确修改 Quest 路径和完成标准。
- 不物理删除 Deferred ID、来源或教学快照。

## 知识边界

- 暂存概念不进入 mastery、review queue、Concept Note 或 Topic Map。
- 已存在同名 Concept Note 时可以记录其路径，表示 Vault 中已有资料；这不表示用户已经掌握。
- `distill` 不得用暂存快照补写尚未学会的机制，也不得自动为暂存概念创建笔记。
- 恢复后的正式 Quest 只有经过正常流程，才可能生成 Concept Note、关系和复习记录。

## 完成回执

暂存后使用稳定格式：

```text
已暂存：<概念>（<Deferred ID>）
来源：<Quest ID> / <节点>
影响：<阻塞依赖|辅助知识> — <判断理由>
当前处理：<节点暂停并可继续其他节点|原节点继续且评估排除该概念>
以后恢复：/skill:defer-concept resume <Deferred ID>
```
