# Refine Forgejo

> Browser extension that simplifies the Forgejo interface and adds useful features

Ported from [Refined GitHub](https://github.com/refined-github/refined-github), adapted for Codeberg/Forgejo.

## Legend

- [x] Ported
- [ ] To be ported
- [+] Already natively supported by Forgejo, no extension needed
- [-] Not applicable in Forgejo

---

### Highlights

- [x] **show-whitespace** – Makes whitespace characters visible
- [x] **unreleased-commits** – Tells you whether you are viewing the latest version of the repository and if there are unreleased commits
- [x] **pr-base-commit** – Shows how many commits the head branch is behind and displays its base commit
- [x] **conversation-activity-filter** – Lets you hide all events except comments or unresolved comments in issues and PRs
- [-] **status-subscription** – Allows you to subscribe to issue open/close events with one click
- [x] **default-branch-button** – Adds a link to the default branch in file lists and files
- [x] **restore-file** – Adds a button in PRs to discard all changes to a single file
- [x] **select-notifications** – Select notifications by type and status

---

### Repositories

- [x] **ci-link** – Shows CI/CD build status icon next to the repository name
- [x] **more-dropdown-links** – Adds tool links to the repository navigation dropdown
- [+] **swap-branches-on-compare** – Adds a link to swap branches on the branch comparison page
- [x] **repo-age** – Shows repository age in the sidebar
- [-] **show-open-prs-of-forks** – Shows the number of PRs to the upstream repository from a forked repository
- [-] **clean-repo-filelist-actions** – Compresses buttons in the repository file list
- [+] **new-repo-disable-projects-and-wikis** – Automatically disables projects and wikis when creating a repository
- [x] **sticky-sidebar** – Sticks the sidebar when scrolling
- [-] **link-to-github-io** – Jumps from a repository to the user's github.io page
- [+] **github-actions-indicators** – Shows manual triggers and next run times in the workflow sidebar
- [x] **quick-repo-deletion** – Simplifies repository deletion; adds a "delete fork" button for 0-star repos
- [x] **archive-forks-link** – Finds forks of an archived repository
- [-] **clean-repo-tabs** – Moves Security/Insights into the repository navigation dropdown
- [+] **repo-avatars** – Shows avatars in the header of public repositories
- [x] **small-user-avatars** – Shows small avatars next to usernames in issue/PR lists
- [+] **action-pr-link** – Shows a link to the PR that triggered a workflow run
- [x] **repo-header-info** – Shows fork status and star count
- [x] **visit-tag** – Adds a link to jump to the release/tag when viewing files at a specific tag
- [x] **actions-run-removal** – Faster cancellation/deletion of workflow runs
- [x] **rerun-workflow** – Expands the rerun button and adds keyboard shortcut `r f`

---

### File management

- [+] **download-folder-button** – Adds a button to download an entire folder
- [x] **quick-file-edit** – Adds an edit button to files in the repository file list
- [x] **repo-wide-file-finder** – Enables keyboard shortcut `t` to search files across the entire repository
- [+] **show-associated-branch-prs-on-fork** – Shows associated PRs on a branch of a forked repository
- [x] **html-preview-link** – Adds a link to preview HTML files
- [x] **file-age-color** – Highlights recently modified files
- [x] **previous-version** – Adds a button to view the previous version of a file

---

### Code

- [x] **linkify-code** – Makes issue/PR references and URLs in code clickable
- [x] **copy-on-y** – Enhances the `y` shortcut to copy a permanent link
- [x] **linkify-symbolic-links** – Makes symbolic link files clickable
- [-] **list-prs-for-file** – Warns when the current file is modified by a PR
- [+] **refined-github.css** – Reduces tab width to 4 spaces
- [x] **esc-to-deselect-line** – Adds `Esc` shortcut to deselect a line
- [x] **vertical-front-matter** – Displays Markdown front matter as a vertical table
- [x] **list-prs-for-branch** – Shows associated PRs in the branch commit list

---

### Writing comments

- [+] **tab-to-indent** – 🔥 Enables Tab/Shift+Tab indentation in comment boxes
- [x] **collapsible-content-button** – Adds a collapsible content button in the text editor
- [x] **fit-textareas** – 🔥 Automatically adjusts comment box height
- [x] **quick-comment-edit** – Adds a button to edit a comment in one click
- [x] **one-key-formatting** – When typing Markdown symbols, replaces selected text instead of wrapping
- [x] **clean-rich-text-editor** – Hides unnecessary comment editor hints and toolbars
- [x] **quick-mention** – Adds an @mention button in issues/PRs
- [+] **table-input** – Adds a "insert table" button in the text editor
- [x] **unfinished-comments** – Notifies users about unfinished comments (in hidden tabs)
- [x] **quick-review-comment-deletion** – Adds a button to delete an in-progress review comment
- [x] **avoid-accidental-submissions** – Disables submitting with Enter (commit/PR/issue title); use Ctrl+Enter instead
- [x] **no-self-reference** – Warns about self-referential links

---

### Reading comments

- [x] **reactions-avatars** – 🔥 Shows avatars of users who reacted to a comment
- [-] **embed-gist-inline** – Inline display of short gists linked to a single line
- [x] **comments-time-machine-links** – Adds links to browse historical versions of repositories and files
- [x] **show-names** – Shows real names next to usernames
- [x] **shorten-links** – Shortens URLs into readable references
- [x] **preview-hidden-comments** – 🔥 Previews collapsed comments on hover
- [x] **highest-rated-comment** – 🔥 Highlights the most useful comment
- [x] **hide-low-quality-comments** – Hides reaction comments (e.g., "+1", "👍") except for maintainers
- [x] **scrollable-areas** – Limits height of code blocks and quotes
- [-] **quick-comment-hiding** – Simplifies the UI for hiding comments
- [x] **open-issue-to-latest-comment** – The comment icon in issue lists links to the last comment
- [-] **expand-all-hidden-comments** – Loads more comments (200) when Alt-clicking "N hidden items"
- [x] **keyboard-navigation** – Adds `j`/`k` shortcuts for navigation, `x` to mark read/unread
- [x] **comment-excess** – Shows the number of hidden comments at the top of long issues; scrolls to hidden comments on Cmd/Ctrl+F (in **hide-low-quality-comments**)

---

### Conversations

- [x] **open-all-conversations** – Opens all visible issues/PRs with one click
- [x] **sticky-conversation-list-toolbar** – Sticks the filter toolbar in issue/PR lists
- [x] **sticky-comment-header** – Sticks the comment header when scrolling
- [x] **conversation-authors** – Highlights issues/PRs opened by you or collaborators
- [x] **align-issue-labels** – Left-aligns labels in issue/PR lists
- [x] **sort-conversations-by-update-time** – 🔥 Changes default sort to "recently updated"
- [-] **global-conversation-list-filters** – Adds "my repositories" and "commented by me" filters to global PR search
- [x] **clean-conversation-sidebar** – 🔥 Hides empty sections in the issue/PR sidebar
- [x] **clean-conversation-filters** – Hides empty Projects filters
- [+] **toggle-everything-with-alt** – Alt+click toggles all similar items
- [-] **extend-conversation-status-filters** – Toggles `is:open`/`is:closed`/`is:merged` filters
- [-] **bugs-tab** – Adds a "Bugs" tab if there are issues labeled "bug"
- [x] **pinned-issues-update-time** – Shows update time instead of creation time for pinned issues
- [x] **clean-pinned-issues** – Changes pinned issue layout from side‑by‑side to standard list
- [x] **quick-label-removal** – Removes labels from issues/PRs with one click
- [x] **clean-conversation-headers** – Removes duplicate information from PR headers
- [x] **dim-bots** – Dims bot commits and PRs
- [x] **esc-to-cancel** – Esc cancels editing PR titles
- [x] **no-duplicate-list-update-time** – Hides update times that are identical to open/close/merge times
- [x] **linkify-user-labels** – Links labels like "Contributor" or "Member" to the author's commits
- [x] **jump-to-conversation-close-event** – Jumps to the last closing event of an issue/PR
- [-] **close-as-unplanned** – Adds a "close as unplanned" button
- [x] **locked-issue** – Shows a label on locked issues/PRs

---

### Viewing pull requests

- [+] **linkify-commit-sha** – Adds links to non-PR commits on the PR commits page
- [x] **pr-filters** – Adds dropdown filters for Checks and Draft PRs in PR lists
- [x] **unclip-checks** – Automatically shows all checks when expanding the checks panel
- [x] **pr-approvals-count** – Shows color-coded review counts in PR lists
- [x] **highlight-non-default-base-branch** – Highlights when a non-default branch is used as the base
- [-] **hide-inactive-deployments** – Hides inactive deployments in PRs
- [+] **previous-next-commit-buttons** – Adds navigation buttons at the bottom of the Commits tab
- [x] **hidden-review-comments-indicator** – Shows an indicator when there are hidden comments in a PR review
- [x] **conflict-marker** – Shows PRs with conflicts in the PR list
- [x] **pr-commit-lines-changed** – Adds diff statistics to PR commits
- [x] **cross-deleted-pr-branches** – Strikes through deleted branches
- [x] **batch-mark-files-as-viewed** – Batch marks files as viewed in the PR Files tab
- [x] **closing-remarks** – 🔥 Shows the first tag a PR was merged into, suggesting a release
- [x] **pr-jump-to-first-non-viewed-file** – Jumps to the first not‑viewed file by clicking the progress bar
- [x] **jump-to-change-requested-comment** – Jumps to the most recent "changes requested" comment
- [-] **view-last-pr-deployment** – Adds a link to open the latest deployment in the PR header
- [x] **no-unnecessary-split-diff-view** – Always uses unified diffs when split diff is not useful
- [+] **emphasize-draft-pr-label** – Makes draft PRs easier to distinguish in lists
- [x] **clean-checks-list** – Shows failing and pending checks first, expands long check names
- [x] **mobile-tabs-pr** – Adapts PR tabs for mobile devices

---

### Editing pull requests

- [+] **sync-pr-commit-title** – 🔥 Uses the PR title as the squash commit title and keeps it in sync
- [x] **update-pr-from-base-branch** – Adds an "Update branch | Rebase" button to each PR
- [+] **one-click-review-submission** – One‑click review (Approve/Reject)
- [x] **pull-request-hotkeys** – Adds shortcuts to cycle through PR tabs
- [+] **pr-branch-auto-delete** – Automatically deletes the branch after merging a PR
- [-] **one-click-pr-or-gist** – Creates a draft PR or public gist with one click
- [+] **clear-pr-merge-commit-message** – Cleans up redundant information in PR merge commit messages
- [x] **quick-review** – Adds a quick review button to the PR sidebar
- [x] **pr-first-commit-title** – Uses the first commit as the title and description of a new PR

---

### Commits

- [x] **patch-diff-links** – Adds .patch and .diff file links on commit pages
- [x] **more-file-links** – Adds links to view raw, blame, and history in PRs/commits
- [x] **one-click-diff-options** – Adds a "Hide whitespace" button and shortcut `d w` on the Compare page
- [x] **extend-diff-expander** – Widens the clickable area of the "Expand diff" button
- [x] **hide-diff-signs** – Hides diff signs (color coding already present)
- [x] **suggest-commit-title-limit** – Suggests limiting commit/PR titles to 72 characters
- [+] **tags-on-commits-list** – Shows tags next to commits
- [+] **mark-merge-commits-in-list** – Marks merge commits in commit lists
- [x] **deep-reblame** – When Alt+clicking "Reblame", first extracts commits from the associated PR
- [x] **new-or-deleted-file** – Shows icons indicating file add/delete status in PRs/commits
- [x] **easy-toggle-files** – Toggles diff by clicking the file header
- [x] **same-branch-author-commits** – Preserves branch and path when viewing all commits by an author
- [+] **easy-toggle-commit-messages** – Toggles commit messages by clicking the commit box
- [-] **link-to-compare-diff** – Makes the "X files changed" text clickable to jump to the diff
- [x] **conventional-commits** – Shows conventional commit type labels before commit messages

---

### Tags and releases

- [+] **release-download-count** – Shows download counts next to release assets
- [x] **releases-tab** – Adds a Releases tab and shortcut `g r` (in **navigation-hotkeys**)
- [+] **releases-dropdown** – Adds a tag search dropdown on the releases page
- [x] **create-release-shortcut** – Adds shortcut `c` to create a new release on the Releases page
- [x] **tag-changes-link** – 🔥 Adds a "Changes since last tag" link for each tag/release
- [x] **convert-release-to-draft** – Adds a button to convert a release to draft
- [x] **confirm-release** – Adds a confirmation dialog when publishing a release
- [x] **link-to-changelog-file** – Adds a button to view the changelog file on the Releases page

---

### Profiles

- [x] **user-profile-follower-badge** – Shows whether a user follows you
- [-] **profile-gists-link** – Adds a link to public gists on user profiles
- [+] **mark-private-orgs** – Marks private organizations on your profile page
- [x] **profile-hotkey** – Adds shortcut `g m` to go to your own profile (in **navigation-hotkeys**)
- [x] **show-user-top-repositories** – Adds a link to the user's most-starred repositories
- [x] **hide-user-forks** – Hides forked and archived repositories by default
- [x] **linkify-user-location** – Makes user location clickable in hovercards and profiles
- [x] **conversation-links-on-repo-lists** – Adds tool links to the user's repository tabs and global search

---

### Notifications

- [x] **open-all-notifications** – Adds a button to open all unread notifications on the notifications page
- [x] **unread-anywhere** – 🔥 Adds a button in the global header to open unread notifications from any page
- [x] **select-all-notifications-shortcut** – Shortcut `a` to select all notifications
- [-] **stop-redirecting-in-notification-bar** – Prevents redirects from the notification bar when holding Alt
- [-] **last-notification-page-button** – Adds a link to the last page of notifications
- [x] **pr-notification-link** – PR notifications point to the Conversation tab instead of the commits page
- [x] **sticky-notifications-actions** – Sticks the notification action bar
- [x] **clean-notifications** – Makes notification lists more compact when grouped by repository

---

### Global

- [x] **useful-not-found-page** – 🔥 Adds possible related pages and alternatives on the 404 page
- [x] **selection-in-new-tab** – When navigating with `j`/`k`, `Shift+O` opens the selected text in a new tab
- [-] **close-out-of-view-modals** – Automatically closes dropdown menus when they go out of view
- [+] **parse-backticks** – Makes backtick‑delimited text clickable where GitHub forgot to do so
- [-] **action-used-by-link** – Shows who uses a given Action
- [x] **improve-shortcut-help** – Shows all Refined GitHub shortcuts in the help modal (`?`) (in **help-modal**)
- [x] **clean-footer** – Dims the footer
- [+] **night-not-found** – Adds dark mode to the 404 page
- [x] **monospace-textareas** – Uses monospace font for fields like commit messages

---

### Netiquette

- [x] **netiquette** – Adds unobtrusive netiquette reminders
- [x] **warn-pr-from-master** – Warns when creating a PR from the default branch
- [x] **warning-for-disallow-edits** – Warns when unchecking "Allow edits from maintainers"

---

### Fixes for GitHub shortcomings

- [-] **github-bugs** – Applies various CSS fixes
- [x] **hide-navigation-hover-highlight** – Removes hover effect from the repository file browser
- [-] **clean-repo-sidebar** – Removes unnecessary clutter from the repository sidebar (TODO(revisit?): https://codeberg.org/forgejo/forgejo/issues/11914)
- [-] **linkify-branch-references** – Makes branch references clickable on the "Quick PR" page
- [x] **actionable-pr-view-file** – The "View file" link in PRs points to the branch instead of the commit
- [x] **reload-failed-proxied-images** – Retries failed image downloads
- [-] **unwrap-unnecessary-dropdowns** – Turns 2‑step dropdowns into 1‑step
- [-] **prevent-link-loss** – Suggests fixes for links incorrectly shortened by GitHub
- [-] **prevent-duplicate-pr-submission** – Prevents duplicate PR creation
- [-] **command-palette-navigation-shortcuts** – Uses `Ctrl+N`/`Ctrl+P` to select items in the command palette
- [x] **prevent-comment-loss** – The preview link when editing a comment opens in a new tab
- [-] **fix-no-pr-search** – Redirects to the repository issue list when a search does not include `is:pr`
- [-] **clean-readme-url** – Removes redundant `readme-ov-file` parameters from repo URLs
- [-] **click-outside-modal** – Closes a modal by clicking outside it
- [-] **linkify-line-numbers** – Adds line number links where GitHub forgot them
- [-] **sidebar-focus-file** – Scrolls the file tree to the current file
- [-] **no-modals** – Disables modals that degrade user experience
- [x] **same-page-links** – Prevents links that should not open in a new tab
- [+] **linkify-text** – Makes certain text clickable, e.g., references in issue titles
- [+] **new-milestone-button** – Adds a "New Milestone" button on the milestone page
- [-] **mark-private-repos** – Highlights private repositories with a different color
- [+] **tab-size** – Reduces the default tab width in code views from 8 to 4
- [x] **sticky-file-header** – Sticks the file header when scrolling
- [x] **sticky-csv-header** – Sticks the first column of CSV/TSV preview when scrolling horizontally
- [x] **reactions-popup** – Improves the reaction popup to be smaller
- [x] **readable-title-change-events** – Stacks old and new titles in title change events for readability
- [-] **cmd-enter** – Fixes `Cmd+Enter` for submitting comments on closed PRs

---

### Extra

- [x] **navigation-hotkeys** – Adds common GitHub navigation shortcuts to Forgejo (`g h`, `g i`, `s`, etc.)
- [x] **help-modal** – Shows a keyboard shortcut help menu when pressing `?`
- [x] **pr-list-lines-changed** – Shows line change statistics for each PR in the PR list
- [x] **file-addition-deletion** – Splits change statistics into `+ added` and `- deleted` in the PR file list

---

## Customization

Most features can be disabled. CSS‑only features can be overridden via the extension's options page.
