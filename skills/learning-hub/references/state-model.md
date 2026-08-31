# Learning Hub State Model

`.learning/learning-progress.json` 是 Learning Hub 的非正式状态注册表。所有修改使用“读取 → 验证 → 合并 → 回读”的方式，不能根据当前会话重建整个文件。

## ID

- Quest ID 使用 `LQ-YYYYMMDD-XXXX`，其中日期采用 Vault 当前本地日期，`XXXX` 为四位大写字母或数字。
- 创建前检查 `quests` 中是否已存在；冲突时重新生成。
- Quest ID 在标题修改、会话切换、暂停和恢复后保持不变。
- Action ID 使用同样稳定且唯一的 `LA-YYYYMMDD-XXXX` 形式。
- Session ID 只在确有审计需求时使用，不向普通用户展示，也不能代替 Quest ID。

## 最小结构

```json
{
  "version": 1,
  "updatedAt": "ISO-8601 timestamp",
  "activeQuestId": "LQ-20260829-A7F2",
  "quests": {
    "LQ-20260829-A7F2": {
      "title": "机器学习基础",
      "goal": "能够训练和评估一个表格分类基线模型",
      "completionCriteria": [],
      "questPath": "01-学习问题/机器学习基础.md",
      "parentQuestId": null,
      "status": "active",
      "lastCompletedNode": "监督学习中的训练",
      "currentNode": "过拟合与泛化",
      "nodeStates": {
        "过拟合与泛化": {
          "status": "clarifying",
          "requiredEvidenceLevel": 2,
          "evidenceLevel": null,
          "clarificationInsights": [],
          "deferredDependencies": []
        }
      },
      "applicationOutput": {
        "status": "not_ready",
        "kind": null,
        "path": null,
        "summary": null
      },
      "comprehensiveAssessment": {
        "status": "not_ready",
        "evidenceSummary": [],
        "gaps": []
      },
      "distillStatus": "not_ready",
      "topicMapPlan": {
        "status": "not_checked",
        "mapTitle": null,
        "mapPath": null,
        "operation": null,
        "targetSection": null,
        "reorganizationSummary": null
      },
      "conceptLinks": [],
      "conceptRelationPlans": [],
      "evidenceSummary": [],
      "gaps": [],
      "persistenceApproved": true,
      "createdAt": "ISO-8601 timestamp",
      "updatedAt": "ISO-8601 timestamp"
    }
  },
  "inbox": [
    {
      "id": "LA-20260829-C4D1",
      "questId": "LQ-20260829-A7F2",
      "type": "continue",
      "title": "继续学习过拟合与泛化",
      "context": "恢复动作所需的最短上下文",
      "status": "pending",
      "createdAt": "ISO-8601 timestamp",
      "updatedAt": "ISO-8601 timestamp"
    }
  ]
}
```

允许扩展字段，但必须保持：

- `activeQuestId` 只是当前焦点，不代表唯一 Quest。
- Quest 状态只使用 `active`、`paused`、`completed`、`archived`。
- Action 类型至少支持 `continue`、`extend`、`review`；辅助动作可以使用 `session-log`、`distill`、`link-knowledge` 或 `topic-map`。
- Action 状态只使用 `pending`、`in_progress`、`completed`、`cancelled`。
- `inbox` 中每个动作都指向存在的 Quest。
- 同一 Quest、同一目标的重复 `pending` 动作合并更新，不重复追加。
- `completed`、`cancelled` 和 `archived` 项保留历史，不默认删除。
- `nodeStates` 可以在旧状态中缺省，并在下一次教学检查点按需补充；不得因缺少该字段重建整个 Quest。
- `nodeStates.<节点>.clarificationInsights` 保存对正式笔记有长期价值的疑问解答。每项至少包含 `question`、`resolution` 和 `noteUse`，可选 `exampleOrBoundary`；不保存寒暄、流程选择或完整聊天转录。
- `nodeStates.<节点>.deferredDependencies` 只保存 `deferredConceptId`、`impact` 和 `status`。`impact` 使用 `blocking` 或 `supporting`；`status` 使用 `parked`、`learning`、`waiting_return`、`resolved` 或 `cancelled`。完整标题、来源、教学快照和返回点从 `.learning/deferred-concepts.json` 读取，不在两处复制。
- 正式依赖 Quest 可保存 `originDeferredConceptId` 和 `returnTargets`；`returnTargets` 中每项包含原 `questId`、`nodeTitle` 和 `originId`。普通 Quest 可以缺省这些字段。
- 节点状态只使用 `teaching`、`clarifying`、`awaiting_assessment`、`waiting_on_deferred`、`validated`、`assessed_with_gaps`。讲解和实例完成后进入 `clarifying`，先处理用户疑问；只有用户明确要求评估时才进入 `awaiting_assessment`。`waiting_on_deferred` 表示存在尚未解决的阻塞暂存依赖，不能评估或直接放行。用户直接放行只适用于不存在阻塞暂存依赖的正式节点。证据达到 `requiredEvidenceLevel` 时进入 `validated`，否则进入 `assessed_with_gaps`。
- `applicationOutput.status` 只使用 `not_ready`、`pending`、`submitted`。它描述用户整合全部节点的实际成果，不是 Agent 的示例。旧数据中的 `revision_needed` 读取为已提交且有缺口，不要求补做。
- `comprehensiveAssessment.status` 只使用 `not_ready`、`pending`、`passed`、`completed_with_gaps`。只有 `submitted` 的实际应用输出才能进入综合评估。旧数据中的 `failed` 读取为 `completed_with_gaps`，不恢复补测。
- Quest 级 `distillStatus` 只使用 `not_ready`、`ready`、`proposed`、`written`、`declined`。它描述综合评估之后的知识产物状态，不放在单个节点中。
- `topicMapPlan.status` 只使用 `not_checked`、`proposed`、`linked`、`declined`、`not_applicable`。`operation` 只使用 `create` 或 `update`；当地图不存在时必须保存 `create` 计划，不能把缺失地图当作无需处理。`targetSection` 保存新概念的语义分组，`reorganizationSummary` 保存需要新建、重命名、移动或重排的地图结构；只是新增一个分类内条目时也要记录其组内位置。
- `conceptLinks` 中每项包含 `noteTitle`、`notePath`、`role` 和 `status`；`status` 只使用 `proposed`、`linked`、`declined`。`role` 简述该概念如何参与解决 Quest，不保存没有正式笔记目标的占位项。
- `conceptRelationPlans` 保存本次新建或实质更新 Concept Note 后发现的已有概念双向关系。每项至少包含 `newNotePath`、`existingNotePath`、`newSideRelation`、`existingSideRelation`、`reason` 和 `status`；`status` 只使用 `proposed`、`linked`、`declined`。没有直接关系时不造占位项，但在当次 Distill 提案中报告审计范围。

## 状态转换

- 新 Quest 获得确认后：新增为 `active`，原 `active` Quest 如未完成则改为 `paused`。
- `continue`：目标 Quest 改为 `active`，动作改为 `in_progress`；教学完成后根据结果标为 `completed` 或重新生成后续动作。
- 节点讲解与领域实例完成：节点改为 `clarifying`，明确开放疑问窗口，不能立即改为 `awaiting_assessment`，也不能更新 `lastCompletedNode`。
- 用户在 `clarifying` 阶段提问：保持 `clarifying`，回答后继续等待；用户明确说“开始评估”时才改为 `awaiting_assessment`。
- 用户只表示“没听懂”或继续提问：保持当前节点状态并交给 `teach` 澄清，不创建暂存引用。
- 用户明确调用 `defer-concept` 暂存：在目标节点合并 `deferredDependencies` 引用。`blocking` 时把节点改为 `waiting_on_deferred`，不得写入 gaps、evidence 或 mastery；`supporting` 时保持原节点状态。
- `defer-concept resume`：已有依赖 Quest 时切换并继续；否则创建带 `originDeferredConceptId` 和 `returnTargets` 的正式 Quest，将对应引用改为 `learning`。原阻塞节点保持 `waiting_on_deferred`。
- 依赖 Quest 完成：把暂存来源和轻量引用改为 `waiting_return`，为每个仍有效的阻塞来源合并创建指向原 Quest 的 `continue` 动作。不得自动验证原节点。
- 返回原阻塞节点：引用改为 `resolved`，节点改为 `teaching`，由 Teach 重新连接依赖与主问题。辅助来源解决后只更新引用，不要求重做已完成节点。
- 取消辅助来源：引用改为 `cancelled`。取消阻塞来源时不得自动通过节点；返回 `teaching` 重新处理依赖，或者由 Teach 经用户确认修改路径和完成标准。
- 每次解决实质性疑问后：把精炼后的问题、解答、新增例子或边界及 `noteUse` 合并进当前节点的 `clarificationInsights`；同一问题追加完善，不重复堆叠。该字段必须随 Quest 传给 `distill`。
- 节点完成一次 `assess`：达到要求等级时改为 `validated`，否则改为 `assessed_with_gaps`；两者都写入证据等级、摘要和缺口，并进入下一节点，不补测。
- 节点不存在未解决的 `blocking` 暂存依赖时，用户明确说“可以通过”“下一步”“继续”或同义推进表达：节点直接改为 `validated`，`evidenceLevel` 写入 `requiredEvidenceLevel`，`gaps` 写为空数组；不得创建追问或补测动作。节点处于 `waiting_on_deferred` 时，同类表达只表示暂停或切换，不验证节点。
- 所有必需节点均为 `validated` 或 `assessed_with_gaps`：`applicationOutput.status` 改为 `pending`，进入实际应用输出阶段。
- 用户提交实际应用输出：记录类型、路径或摘要，并把状态改为 `submitted`；随后把 `comprehensiveAssessment.status` 改为 `pending`。
- 综合评估达到完成标准：状态改为 `passed`；存在关键掌握缺口时改为 `completed_with_gaps`。两种状态都记录各节点证据与缺口，并把 Quest 级 `distillStatus` 改为 `ready`，不得自动要求修改输出或复评。
- 用户在综合评估中明确要求“可以通过”“下一步”“继续生成笔记”或同义推进：直接改为 `passed`，`gaps` 写为空数组，`distillStatus` 改为 `ready`，不得继续追问。
- `distill` 展示候选草稿时，同时完成已有 Concept Note 增量关系审计、Quest–Concept 双向链接和 Topic Map 路由：Quest 级 `distillStatus` 改为 `proposed`；成立的新旧概念关系合并进 `conceptRelationPlans`；`conceptLinks` 新增或合并对应概念的 `proposed` 项；`topicMapPlan` 记录地图标题、路径、`create`/`update`、目标语义分组和结构调整摘要，状态改为 `proposed`。
- 用户确认新 Concept Note 与已有 Concept Note 的成对更新并回读验证后，把相应 `conceptRelationPlans.status` 改为 `linked`；明确拒绝时改为 `declined`；只是推迟时保持 `proposed`，并创建包含两侧文件、链接文本和理由的 `link-knowledge` 动作。
- 用户确认 Concept Note 与 Quest 双向更新并回读验证后，把对应 `conceptLinks.status` 改为 `linked`；明确拒绝时改为 `declined`；只是推迟时保持 `proposed` 并创建 `link-knowledge` 动作。
- 用户确认 Concept Note 写入后把 `distillStatus` 改为 `written`；确认地图新建或更新后，回读验证新概念位于保存的 `targetSection`、必要的 `reorganizationSummary` 已落实、原有链接未丢失且不存在空分组或笼统平铺清单，再把 `topicMapPlan.status` 改为 `linked`。地图被明确拒绝时改为 `declined`，只是推迟时保持 `proposed` 并创建包含目标分组和重排摘要的 `topic-map` 动作。
- 用户明确拒绝 Concept Note 晋升时把 `distillStatus` 改为 `declined`，并把 `topicMapPlan.status` 改为 `not_applicable`。
- Quest 只有在不存在未解决的 `blocking` 暂存引用，综合评估为 `passed` 或 `completed_with_gaps`，并满足以下之一时才可标记 `completed`：一是 `distillStatus` 为 `written`、`conceptLinks` 非空且不存在 `proposed`、`conceptRelationPlans` 不存在 `proposed`、Topic Map 为 `linked` 或 `declined`；二是 `distillStatus` 为 `declined` 且 Topic Map 为 `not_applicable`。Concept Note 已写入但 `conceptLinks` 为空时必须创建 `link-knowledge` 审计动作；存在未完成的 `conceptRelationPlans` 时也必须保留对应动作，不能视为完成。`supporting` 暂存引用不阻塞 Quest 完成。
- 恢复 Quest 时先检查 `waiting_on_deferred` 和未解决的 `blocking` 引用：存在时通过 `defer-concept` 展示恢复入口，不得直接评估。`waiting_return` 优先返回原节点并重新教学连接；之后 `clarifying` 才恢复疑问窗口，只有用户此前已经明确选择评估的 `awaiting_assessment` 和 `comprehensiveAssessment: pending` 才是评估待办。`assessed_with_gaps`、`completed_with_gaps` 以及旧的 `failed` 都不生成补测。随后按实际应用输出 → Distill → 新旧 Concept Note 双向关系 → Quest–Concept 双向链接 → Topic Map 的顺序处理。
- `extend`：父 Quest 保持 `completed`，创建具有 `parentQuestId` 的新 Quest。
- `review`：动作改为 `in_progress`，复习结束后写回结果摘要并标记 `completed`；下一次复习时间由 `.learning/review-queue.json` 管理。
- `pause`：Quest 改为 `paused`，不改变其 `pending` 动作。
- `archive`：Quest 改为 `archived`，相关 `pending` 动作改为 `cancelled`，但不删除记录；`.learning/deferred-concepts.json` 中尚未处理的来源继续保留，并仍出现在 Learning Hub 的“待学习概念”区域，除非用户另行调用 `defer-concept cancel`。

## 合并与错误处理

1. 写入前读取现有 JSON；不存在时只有在首次持久化获批后才创建。
2. 验证版本、Quest ID、Action ID、引用关系和状态值。
3. 只修改目标 Quest、相关动作、`activeQuestId` 和顶层更新时间，保留所有其他字段与条目。
4. 写入后回读并验证目标修改存在、其他 Quest 未丢失。
5. JSON 无法解析、版本未知、ID 冲突或引用断裂时停止写入并报告，不静默覆盖或“修复”用户数据。

## 权限

`persistenceApproved: true` 只授权该 Quest 在本状态文件中的非正式检查点更新。它不授权创建正式知识、完整 Session Log、执行全部待办或修改其他未获授权的 Quest。
