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

## 5. Tag + GitHub release

Tag the release commit, push the tag, and create a GitHub release with the
README's `### X.Y.Z` block as the body so it shows up at
<https://github.com/KidBrightAI/kidbright_MAI_ide/releases>.

```bash
# extract the X.Y.Z section out of README.md
python3 -c "
import re
md = open('README.md').read()
m = re.search(r'### X\.Y\.Z[^\n]*\n(.*?)(?=\n### |\n---)', md, re.DOTALL)
print(m.group(1).strip() if m else '')
" > release-notes.tmp.md

git -c user.name="comdet" -c user.email="listzone@hotmail.com" tag -a vX.Y.Z -m "Release X.Y.Z — <one-line theme>"
git push origin vX.Y.Z

GH='/mnt/c/Users/listz/AppData/Local/Microsoft/WinGet/Packages/GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe/bin/gh.exe'
"$GH" release create vX.Y.Z --title "vX.Y.Z — <one-line theme>" --notes-file release-notes.tmp.md
rm release-notes.tmp.md
```

gh.exe lives in user winget scope so its full path is hardcoded; calling
it directly from WSL works through the interop layer (no cmd.exe shim
needed for this one).

## 6. Build + deploy

WSL Node is too old for the Firebase CLI, so shell out to Windows:

```bash
cmd.exe /c "F: && cd F:\KidBright_MAI\workspace_kidbright_mai_vue3 && npm run build && firebase deploy --only hosting"
```

Watch the tail of the output for `Deploy complete!`. The hosting URL is
<https://kidbright-mai.web.app>.

## 7. Report back

Tell the user:
- The new version number.
- The hosting URL + GitHub release URL.
- A one-line recap of what changed (so they can paste it to the team).
