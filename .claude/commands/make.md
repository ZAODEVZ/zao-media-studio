---
description: Make one format from one ZM item - /make <recap|reel|show-notes|clip-brief> <ZM link>
argument-hint: <format> <ZM item link>
---

Arguments: $ARGUMENTS

1. Open the ZM item page from the link and read its summary, chapters and transcript.
2. Copy `kickoffs/<format>.md`, fill every bracket from the item, and save it as `out/<slug>/kickoff-<format>.md`.
3. Run the right agent on that kickoff: clip-brief uses the editor; recap, reel and show-notes use the writer.
4. Report the file it wrote and the one line it hangs on. Nothing gets posted.
