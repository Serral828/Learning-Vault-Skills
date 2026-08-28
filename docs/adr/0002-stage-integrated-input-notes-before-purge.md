# Stage integrated input notes before a separate purge

After a batch reaches full coverage and its generated files have been verified, the Agent may move the confirmed Markdown manifest into the Vault's `.trash/` area and prune empty source directories while preserving `00-原始笔记/`. Integration never permanently deletes inputs; irreversible deletion is a separate operation triggered only when the learner explicitly commands the Agent to clear `.trash/`, which authorizes permanent removal of the entire directory contents without filtering by origin.
