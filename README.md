# ZAO Media Studio

The production side of ZAO media. [ZM (zao-media)](https://github.com/bettercallzaal/zao-media) is the archive: every show, Space, stream and appearance, logged once. This repo is where those items get **turned into things people see**: recaps, clips, reels, show notes and posts.

The shape comes from ZAOresearch doc 2509 (How I AI, William Imoh): one role agent per job, a fixed kickoff prompt per format, and a Sunday brief that says what to start, stop and keep doing.

## The four role agents

| Agent | Job | Reads | Writes |
|---|---|---|---|
| **producer** | Plans the media week; runs the Sunday brief | ZM feed + CRM, `briefs/` | `briefs/<date>.md`, the week's plan |
| **editor** | Picks clips from Spaces, battles, streams and YapZ | transcripts, chapters, ZM item pages | `out/<slug>/clip-brief.md` |
| **writer** | Recaps, show notes, post copy in the right ZAO voice | the item, the clip brief, the voice guides | `out/<slug>/recap.md`, `show-notes.md`, `posts.md` |
| **publisher** | Packs approved drafts for the queue; never posts | `out/<slug>/` | `out/<slug>/queue.md` (handoff to Zaal) |

They live in `.claude/agents/`. In Claude Code: "use the producer agent to plan this week".

## The flow

```
ZM item (zao-media content JSON)
  -> producer   picks what gets made this week
  -> editor     clip brief (timestamps, why each clip)
  -> writer     recap / show notes / posts, one voice per surface
  -> publisher  queue.md, waiting on Zaal's yes
```

Nothing leaves this repo without Zaal's approval. ZAO X posting is paused (3 Nov) until he says otherwise.

## Commands

| Command | What it does |
|---|---|
| `npm run brief` | Pulls the live ZM feed and CRM, writes `briefs/<today>.md`: what shipped in 7 days, what is waiting to publish, how long since the last log |
| `/sunday-brief` | The producer reads that file and fills in start / stop / keep |
| `/make <format> <ZM link>` | Runs the kickoff for one format (recap, reel, show-notes, clip-brief) on one item |

No dependencies. Node 18+.

## Kickoff prompts

`kickoffs/` holds one template per format, all in the same four parts from doc 2509:

1. **Who and why:** the audience and the one thing they should take away
2. **The one central piece:** the moment, quote or number the whole thing hangs on
3. **References:** the voice guide, past examples, what it must look and sound like
4. **The role:** "act as the ZAO's editor / writer", with hard limits (length, no hype, sources)

## What this repo reuses (does not rebuild)

- **ZM** for the item list, transcripts, chapters and the CRM (`needs publish`)
- **Newsletter voice** from [zaoonparagraph VOICE.md](https://github.com/ZAODEVZ/zaoonparagraph/blob/main/VOICE.md) for long recaps
- **ZAO 101 reel style** from [zao101-reels STYLE.md](https://github.com/ZAODEVZ/zao101-reels/blob/main/STYLE.md) for reel scripts
- **ZM brand kit** ([docs/brand-kit.md](https://github.com/bettercallzaal/zao-media/blob/main/docs/brand-kit.md)) for spellings and the "generate outward" pass
- **RewindZ** recaps from the ZAO Music Discord as raw input for Spaces
- **Postiz / the ZAO social queue** as the only place a post goes, after approval

No new paid tools.

## Layout

```
.claude/agents/     producer, editor, writer, publisher
.claude/commands/   sunday-brief, make
kickoffs/           recap, reel, show-notes, clip-brief
scripts/brief.mjs   the Sunday brief data pull
briefs/             one file per week
out/<slug>/         everything made from one ZM item
CLAUDE.md           the rules every agent follows
```
