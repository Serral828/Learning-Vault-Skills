---
status: superseded by ADR-0003
---

# Separate runnable learning labs from the knowledge vault

Runnable code, dependencies, tests, build output, and nested Git repositories live in an external Learning Labs directory; the knowledge vault keeps only the corresponding experiment record and knowledge links. This sacrifices single-directory convenience in order to prevent generated artifacts from polluting search and sync, while preserving a durable connection between executable evidence and formal knowledge.
