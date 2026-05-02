---
description: Bump version + push tag — CI builds + deploys to Firebase + creates GitHub release
---

Run the release flow for KidBright mAI IDE. Don't skip steps; each one
gates the next. **Step 3.5 is an explicit approval gate — never skip it,
never commit before the user says go.**

`.github/workflows/release.yml` watches every `vX.Y.Z` tag push and runs
the build + Firebase Hosting deploy + GitHub release. The local job is
*just* to land the right commit and push the right tag — once the tag
is up, GitHub Actions takes over.

## 1. Diff against the last release

- `git log <last-version-tag>..HEAD --oneline` and
  `git diff --stat <prev>..HEAD`.
- Read the commit subjects + diffs enough to summarize what shipped.
- If there's nothing new since the last release, stop and tell the user.

## 2. Categorize → SemVer bump

Decide MAJOR / MINOR / PATCH against the existing version:
- **MAJOR**: breaking change to a public surface (board protocol, generator
  output that runs differently on hardware, IDE → server contract). When
  unsure, ask.
- **MINOR**: backward-compatible features (new blocks, new board capabilities,
  new IDE pages). Most `feat:` commits land here.
- **PATCH**: bug fixes, doc-only commits, refactors with no observable
  behaviour change.

## 3. Update version in three places (must stay in sync)

- `package.json` → top-level `"version"`.
- `src/components/Header.vue` → the `Version X.Y.Z` span.
- `README.md` → the `## Version` section: prepend a new
  `### X.Y.Z — <one-line theme>` block with **Added** / **Fixed** /
  **Changed** subsections (Keep-a-Changelog style). Keep the previous
  version's entry for history.

The CI workflow extracts the matching `### X.Y.Z` section out of
`README.md` to use as the GitHub release body, so the wording you put
here is what the world sees on the Releases page. Write it for them.

## 3.5. PAUSE for user approval (mandatory gate)

Before touching `package.json` / `Header.vue` / `README.md`, before any
commit, tag, release, or deploy, **stop and surface the plan**:

- The proposed version number.
- The drafted `### X.Y.Z` README block (Added / Fixed / Changed).
- The list of commits that will go into this release.
- The URLs that will change (kidbright-mai.web.app, GitHub release).

Then wait for an explicit "go" from the user. Anything ambiguous
("ok", "ดูดี", silence) does **not** count — pushing a `vX.Y.Z` tag
fires the deploy workflow, which is public + irreversible. See
CLAUDE.md §2.

Only after explicit approval, continue with steps 4-5.

## 4. Commit + push the version bump

```bash
git add package.json src/components/Header.vue README.md
git -c user.name="comdet" -c user.email="listzone@hotmail.com" \
  commit -m "chore(release): X.Y.Z — <one-line theme>"
git push
```

The `-c user.*` overrides are needed because the repo has no global git
identity; match the author of previous commits.

## 5. Tag + push tag (this fires the deploy workflow)

```bash
git -c user.name="comdet" -c user.email="listzone@hotmail.com" \
  tag -a vX.Y.Z -m "Release X.Y.Z — <one-line theme>"
git push origin vX.Y.Z
```

The push triggers `.github/workflows/release.yml` which checks out at
the tag, runs `npm ci && npm run build`, deploys `dist/` to Firebase
Hosting via the `FIREBASE_SERVICE_ACCOUNT_KIDBRIGHT_MAI` secret, and
creates the GitHub release with the README section as the body. You
do **not** need to run `npm run build`, `firebase deploy`, or
`gh release create` locally — that's all delegated.

Watch the run:

```bash
GH='/mnt/c/Users/listz/AppData/Local/Microsoft/WinGet/Packages/GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe/bin/gh.exe'
RUN_ID=$("$GH" run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId')
"$GH" run watch "$RUN_ID" --exit-status
```

If the watch command exits non-zero, the workflow failed. Read
`gh run view "$RUN_ID" --log-failed` for the failing step's log and
report to the user before retrying.

## 6. Report back

Once the workflow is green, tell the user:

- The new version number.
- The hosting URL (<https://kidbright-mai.web.app>) and the GitHub
  release URL (<https://github.com/KidBrightAI/kidbright_MAI_ide/releases/tag/vX.Y.Z>).
- A one-line recap of what shipped.
