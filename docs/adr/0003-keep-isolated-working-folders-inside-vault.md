---
status: accepted
---

# Keep isolated working folders inside the vault

Raw input notes live under `00-原始笔记/` and runnable teaching code under `98-代码实验/`, keeping all learning artifacts inside the Vault. These folders, together with `.trash/`, are excluded from Pi Agent's automatic context attachment and ordinary retrieval, while explicitly invoked skills may still access exact targets; this supersedes ADR-0001's external Learning Labs directory.
