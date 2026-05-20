Project conventions for AI coding agents

Stack:
Next.js + Firebase

Architecture rules:
- Business logic in hooks
- Firestore access in services
- Components must stay presentational when possible
- Avoid large files (>300 lines)

Folder structure:
modules/
components/
lib/
hooks/
services/