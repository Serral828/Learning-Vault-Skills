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
- Action 类型至少支持 `continue`、`extend`、`review`；辅助动作可以使用 `session-log` 或 `distill`。
- Action 状态只使用 `pending`、`in_progress`、`completed`、`cancelled`。
- `inbox` 中每个动作都指向存在的 Quest。
- 同一 Quest、同一目标的重复 `pending` 动作合并更新，不重复追加。
- `completed`、`cancelled` 和 `archived` 项保留历史，不默认删除。

## 状态转换

- 新 Quest 获得确认后：新增为 `active`，原 `active` Quest 如未完成则改为 `paused`。
- `continue`：目标 Quest 改为 `active`，动作改为 `in_progress`；教学完成后根据结果标为 `completed` 或重新生成后续动作。
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
