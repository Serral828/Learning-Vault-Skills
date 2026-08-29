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
          "status": "awaiting_assessment",
          "requiredEvidenceLevel": 2,
          "evidenceLevel": null
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
        "operation": null
      },
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
- Action 类型至少支持 `continue`、`extend`、`review`；辅助动作可以使用 `session-log`、`distill` 或 `topic-map`。
- Action 状态只使用 `pending`、`in_progress`、`completed`、`cancelled`。
- `inbox` 中每个动作都指向存在的 Quest。
- 同一 Quest、同一目标的重复 `pending` 动作合并更新，不重复追加。
- `completed`、`cancelled` 和 `archived` 项保留历史，不默认删除。
- `nodeStates` 可以在旧状态中缺省，并在下一次教学检查点按需补充；不得因缺少该字段重建整个 Quest。
- 节点状态只使用 `teaching`、`awaiting_assessment`、`validated`、`assessed_with_gaps`。每个节点必须有一次独立的 `assess` 记录；证据达到 `requiredEvidenceLevel` 时进入 `validated`，否则进入 `assessed_with_gaps`。两者都表示评估已经完成，不创建补测待办。
- `applicationOutput.status` 只使用 `not_ready`、`pending`、`submitted`。它描述用户整合全部节点的实际成果，不是 Agent 的示例。旧数据中的 `revision_needed` 读取为已提交且有缺口，不要求补做。
- `comprehensiveAssessment.status` 只使用 `not_ready`、`pending`、`passed`、`completed_with_gaps`。只有 `submitted` 的实际应用输出才能进入综合评估。旧数据中的 `failed` 读取为 `completed_with_gaps`，不恢复补测。
- Quest 级 `distillStatus` 只使用 `not_ready`、`ready`、`proposed`、`written`、`declined`。它描述综合评估之后的知识产物状态，不放在单个节点中。
- `topicMapPlan.status` 只使用 `not_checked`、`proposed`、`linked`、`declined`、`not_applicable`。`operation` 只使用 `create` 或 `update`；当地图不存在时必须保存 `create` 计划，不能把缺失地图当作无需处理。

## 状态转换

- 新 Quest 获得确认后：新增为 `active`，原 `active` Quest 如未完成则改为 `paused`。
- `continue`：目标 Quest 改为 `active`，动作改为 `in_progress`；教学完成后根据结果标为 `completed` 或重新生成后续动作。
- 节点讲解与领域实例完成：节点改为 `awaiting_assessment`，不能更新 `lastCompletedNode`。
- 节点完成一次 `assess`：达到要求等级时改为 `validated`，否则改为 `assessed_with_gaps`；两者都写入证据等级、摘要和缺口，并进入下一节点，不补测。
- 所有必需节点均为 `validated` 或 `assessed_with_gaps`：`applicationOutput.status` 改为 `pending`，进入实际应用输出阶段。
- 用户提交实际应用输出：记录类型、路径或摘要，并把状态改为 `submitted`；随后把 `comprehensiveAssessment.status` 改为 `pending`。
- 综合评估达到完成标准：状态改为 `passed`；存在关键掌握缺口时改为 `completed_with_gaps`。两种状态都记录各节点证据与缺口，并把 Quest 级 `distillStatus` 改为 `ready`，不得自动要求修改输出或复评。
- `distill` 展示候选草稿时，同时完成 Topic Map 路由：Quest 级 `distillStatus` 改为 `proposed`；`topicMapPlan` 记录地图标题、路径和 `create`/`update`，状态改为 `proposed`。没有合适现有地图时仍记录创建计划。
- 用户确认 Concept Note 写入后把 `distillStatus` 改为 `written`；确认地图新建或更新后把 `topicMapPlan.status` 改为 `linked`。地图被明确拒绝时改为 `declined`，只是推迟时保持 `proposed` 并创建 `topic-map` 动作。
- 用户明确拒绝 Concept Note 晋升时把 `distillStatus` 改为 `declined`，并把 `topicMapPlan.status` 改为 `not_applicable`。
- Quest 只有在综合评估为 `passed` 或 `completed_with_gaps`，且满足“`distillStatus` 为 `written` 并且 Topic Map 为 `linked` 或 `declined`”或“`distillStatus` 为 `declined` 且 Topic Map 为 `not_applicable`”时才可标记 `completed`。
- 恢复 Quest 时，只把尚无首次结果的 `awaiting_assessment` 和 `comprehensiveAssessment: pending` 当作评估待办；`assessed_with_gaps`、`completed_with_gaps` 以及旧的 `failed` 都不生成补测。随后按实际应用输出 → Distill → Topic Map 的顺序处理。
- `extend`：父 Quest 保持 `completed`，创建具有 `parentQuestId` 的新 Quest。
- `review`：动作改为 `in_progress`，复习结束后写回结果摘要并标记 `completed`；下一次复习时间由 `.learning/review-queue.json` 管理。
- `pause`：Quest 改为 `paused`，不改变其 `pending` 动作。
- `archive`：Quest 改为 `archived`，相关 `pending` 动作改为 `cancelled`，但不删除记录。

## 合并与错误处理

1. 写入前读取现有 JSON；不存在时只有在首次持久化获批后才创建。
2. 验证版本、Quest ID、Action ID、引用关系和状态值。
3. 只修改目标 Quest、相关动作、`activeQuestId` 和顶层更新时间，保留所有其他字段与条目。
4. 写入后回读并验证目标修改存在、其他 Quest 未丢失。
5. JSON 无法解析、版本未知、ID 冲突或引用断裂时停止写入并报告，不静默覆盖或“修复”用户数据。

## 权限

`persistenceApproved: true` 只授权该 Quest 在本状态文件中的非正式检查点更新。它不授权创建正式知识、完整 Session Log、执行全部待办或修改其他未获授权的 Quest。
