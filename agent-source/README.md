# AI Andrew — agent source

The three markdown files in this folder are the **single source of truth** for the chat agent that lives on the site (`andrew-agent.jsx` in the project root).

| File | What's in it |
| --- | --- |
| `andrew-broughton-knowledge-base.md` | Full bio, project details, career history, philosophy. The "what's true about Andrew" reference. |
| `andrew-agent-personas.md` | The five personas the agent infers (recruiter, designer, hiring manager, team, colleague). Tone and trigger words for each. |
| `andrew-agent-responses.md` | The response library. Every topic + persona variant the agent can return. |

## Workflow to update the agent

1. Edit the relevant markdown file(s) here.
2. Open Claude.ai, paste the updated markdown into a project chat.
3. Say: **"rebuild the agent"** — Claude regenerates `andrew-agent.jsx` based on the new content.
4. Replace the JSX file in the project root with the regenerated version.
5. Commit + push. Vercel redeploys, the live agent updates.

## Notes

- Files in this folder are **not loaded at runtime**. They're documentation / source. Visitors to the site never fetch them.
- If you change the JSX directly without updating the markdown, the markdown will drift out of sync. Keep them aligned by always editing markdown first.
