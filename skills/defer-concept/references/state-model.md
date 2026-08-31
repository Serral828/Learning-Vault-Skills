# Deferred Concept State Model

`.learning/deferred-concepts.json` 是“现阶段无法理解、以后再学”的独立非正式注册表。它只保存恢复所需上下文，不是正式知识、掌握证据或聊天记录。

结构必须通过 [JSON Schema](../assets/deferred-concepts.schema.json) 校验。所有修改采用“读取 → 校验 → 合并 → 写入 → 回读”的方式，不能根据当前会话覆盖重建整个文件。

## ID 与去重

- Deferred ID 使用稳定的 `DC-NNN`，从 `nextId` 分配；删除或取消后不得复用。
- 标题修改、跨会话恢复、来源 Quest 完成后 ID 保持不变。
- 同一概念可有多个 `originRefs`；每个来源使用稳定的 `originId`，格式为 `DCO-NNN`。
- 只有概念语义明确相同时才合并。仅仅名称相似不能自动合并。

## 状态

概念 `status`：

- `parked`：至少一个来源仍在等待以后学习；
- `resuming`：已经关联正式学习 Quest；
- `addressed`：所有未取消来源都已完成恢复或返回；
- `cancelled`：所有来源都被明确取消。

来源 `status`：

- `parked`：已暂存；
- `learning`：正在通过正式 Quest 学习；
- `waiting_return`：依赖 Quest 已完成，等待返回原节点；
- `resolved`：已经返回并处理原节点，或辅助来源已完成关联；
- `cancelled`：用户明确取消该来源。

来源 `impact`：

- `blocking`：原节点状态必须为 `waiting_on_deferred`，直到依赖解决、取消后重新教学，或路径被明确修改；
- `supporting`：原节点可以继续，但评估和 Distill 不得依赖尚未学习的内容。

## 与 Learning Hub 的交叉引用

完整记录只存在本注册表中。`.learning/learning-progress.json` 的相关节点只保存：

```json
"deferredDependencies": [
  {
    "deferredConceptId": "DC-001",
    "impact": "blocking",
    "status": "parked"
  }
]
```

两处必须使用相同 ID、impact 和来源状态。`learning-hub` 不复制教学快照，也不把暂存项写进 `gaps`、`evidenceSummary` 或 mastery。

## 合并与故障

1. 文件不存在时，只有获得非正式状态持久化授权后才按 Schema 创建空注册表。
2. 更新一个概念时保留其他概念、来源和历史时间戳。
3. 同一来源重复暂存时合并教学快照，并更新 `updatedAt`，不追加重复来源。
4. 与 Learning Hub 同步后回读两个文件；引用缺失、impact 不一致或 JSON 无法解析时停止并报告。
5. 不自动修复未知版本、孤立 Quest ID 或冲突 ID。

