---
description: Bump version + commit + push + build + deploy IDE to Firebase Hosting
---

Run the full release flow for KidBright mAI IDE. Don't skip steps; each one
gates the next.

## 1. Diff against the last release

- `git log <last-version-tag>..HEAD --oneline` (or compare the package.json
  version commit if there are no tags yet) and `git diff --stat <prev>..HEAD`.
- Read the commit subjects + diffs enough to summarize what shipped.
- If there's nothing new since the last release, stop and tell the user.

## 2. Categorize → SemVer bump

Decide MAJOR / MINOR / PATCH against the existing version:
- **MAJOR**: breaking change to a public surface (board protocol, generator
  output that runs differently on hardware, IDE -> server contract). When
  unsure, ask.
- **MINOR**: backward-compatible features (new blocks, new board capabilities,
  new IDE pages). Most "feat:" commits land here.
- **PATCH**: bug fixes, doc-only commits, refactors with no observable
  behaviour change.

## 3. Update version in three places (must stay in sync)

- `package.json` -> top-level `"version"`.
- `src/components/Header.vue` -> the `Version X.Y.Z` span.
- `README.md` -> the `## Version` section: prepend a new
  `### X.Y.Z — <one-line theme>` block with **Added** / **Fixed** /
  **Changed** subsections (Keep-a-Changelog style). Keep the previous
  version's entry for history.

## 4. Commit + push the bump

```bash
git add package.json src/components/Header.vue README.md
git -c user.name="comdet" -c user.email="listzone@hotmail.com" commit -m "chore(release): X.Y.Z — <one-line theme>"
git push
```

The `-c user.*` overrides are needed because the repo's git config has no
identity set globally; match the author of the previous commits.

## 5. Build + deploy

WSL Node is too old for the Firebase CLI, so shell out to Windows:

```bash
cmd.exe /c "F: && cd F:\KidBright_MAI\workspace_kidbright_mai_vue3 && npm run build && firebase deploy --only hosting"
```

Watch the tail of the output for `Deploy complete!`. The hosting URL is
<https://kidbright-mai.web.app>.

## 6. Report back

Tell the user:
- The new version number.
- The hosting URL.
- A one-line recap of what changed (so they can paste it to the team).
