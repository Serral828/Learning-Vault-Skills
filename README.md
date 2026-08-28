# Pi Learning Workspace

在此 Vault 根目录启动 Pi：

```bash
pi
```

首次进入项目时确认信任此目录，然后使用：

- `/skill:teach <学习问题>`：从真实问题出发建立学习路径并逐节点教学。
- `/skill:assess`：用真实案例、故障诊断或方案决策检验能否迁移应用。
- `/skill:verify`：核查即将教授或写入的事实、公式、来源与适用条件；不用于考察用户。
- `/skill:distill`：把已有掌握证据的理解晋升为 Concept Note。
- `/skill:link-knowledge`：建立和检查知识关系。
- `/skill:review`：从长期学习状态生成复习与应用任务。

## 验证边界

`verify` 面向知识内容，回答“这个断言是否可靠”；`assess` 面向学习状态，回答“用户能否在新情境中运用”。`teach` 和 `review` 需要掌握证据时调用 `assess`，不得用连续反问代替评估。
