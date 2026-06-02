# 🚀 NSITM Website — Complete Git Collaboration Guide

> **Repository:** `https://github.com/NSITM-ORG/NSITM-Website.git`
> **Audience:** Developers new to Git and collaborative workflows
> **Purpose:** A single reference for every Git situation you will encounter — from day one to production.

---

## 📖 TABLE OF CONTENTS

1. [What Is Git? (Quick Mental Model)](#1-what-is-git-quick-mental-model)
2. [Installation & Identity Setup — Do This Once](#2-installation--identity-setup--do-this-once)
3. [PHASE 1 — Starting Out: Clone the Project](#3-phase-1--starting-out-clone-the-project)
4. [PHASE 2 — Daily Workflow: The Loop You Will Live In](#4-phase-2--daily-workflow-the-loop-you-will-live-in)
5. [PHASE 3 — Branches: Working Without Breaking Things](#5-phase-3--branches-working-without-breaking-things)
6. [PHASE 4 — Staying Up to Date: Pull & Fetch](#6-phase-4--staying-up-to-date-pull--fetch)
7. [PHASE 5 — Pushing Your Work](#7-phase-5--pushing-your-work)
8. [PHASE 6 — Handling Merge Conflicts (The Scary Part, Demystified)](#8-phase-6--handling-merge-conflicts-the-scary-part-demystified)
9. [PHASE 7 — Undoing Mistakes & Recovery Commands](#9-phase-7--undoing-mistakes--recovery-commands)
10. [PHASE 8 — Inspection & Diagnosis Commands](#10-phase-8--inspection--diagnosis-commands)
11. [PHASE 9 — Advanced But Necessary Situations](#11-phase-9--advanced-but-necessary-situations)
12. [PHASE 10 — Setting Up a Brand New Project (for the lead)](#12-phase-10--setting-up-a-brand-new-project-for-the-lead)
13. [Git Rules for This Team](#13-git-rules-for-this-team)
14. [Quick Reference Cheatsheet](#14-quick-reference-cheatsheet)

---

## 1. What Is Git? (Quick Mental Model)

Think of Git as a **save-game system** for code.

- Your **local machine** is your personal copy of the game.
- **GitHub** (the remote) is the shared cloud save that everyone syncs to.
- A **branch** is a parallel universe of the game where you can experiment without ruining the main story.
- A **commit** is a save point — it records exactly what changed and when.
- A **push** sends your save to the cloud.
- A **pull** downloads the latest cloud save to your machine.

That's all Git really is.

---

## 2. Installation & Identity Setup — Do This Once

### 2.1 Install Git

```bash
# Ubuntu / Debian / WSL
sudo apt update && sudo apt install git -y

# macOS (using Homebrew)
brew install git

# Windows
# Download installer from: https://git-scm.com/download/win
# Then use Git Bash as your terminal for all commands below.
```

Verify the installation:

```bash
git --version
# Expected output: git version 2.x.x
```

---

### 2.2 Tell Git Who You Are — REQUIRED BEFORE ANYTHING ELSE

Every commit you make is stamped with your name and email. Run these once globally on your machine:

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your@email.com"
```

> ⚠️ Use the same email linked to your GitHub account, or your commits won't show up correctly on GitHub.

Set your default branch name to `main` (industry standard):

```bash
git config --global init.defaultBranch main
```

Set your preferred editor for commit messages (optional but useful):

```bash
# Use VS Code
git config --global core.editor "code --wait"

# Use nano (simpler terminal editor)
git config --global core.editor nano
```

Confirm your config looks right:

```bash
git config --global --list
# Shows: user.name, user.email, and other settings
```

---

## 3. PHASE 1 — Starting Out: Clone the Project

> **This is what every team member does on day one.** You are not creating a project — you are downloading an existing one.

### 3.1 Clone the NSITM Repository

```bash
git clone https://github.com/NSITM-ORG/NSITM-Website.git
```

This creates a folder called `NSITM-Website` in your current directory with the full project and all its history.

---

### 3.2 Navigate Into the Project

```bash
cd NSITM-Website
```

> Every Git command from this point forward must be run **inside this folder**.

---

### 3.3 Clone Into a Custom Folder Name

If you want the folder to be named something different:

```bash
git clone https://github.com/NSITM-ORG/NSITM-Website.git my-custom-name
cd my-custom-name
```

---

### 3.4 Confirm the Remote Is Connected

```bash
git remote -v
# Output should show:
# origin  https://github.com/NSITM-ORG/NSITM-Website.git (fetch)
# origin  https://github.com/NSITM-ORG/NSITM-Website.git (push)
```

`origin` is just the name Git gives to the remote URL by default. Think of it as a nickname for the GitHub repo.

---

### 3.5 Check Which Branch You're On After Cloning

```bash
git branch
# Output: * main  (the * means you're currently on this branch)
```

---

## 4. PHASE 2 — Daily Workflow: The Loop You Will Live In

Every single working day follows this rhythm. Internalize it:

```
Pull → Make changes → Stage → Commit → Push
```

### Step-by-step:

#### Step 1 — Pull the latest code before you start working

```bash
git pull origin main
```

Never skip this. If someone else pushed changes overnight, you need them before you start editing.

---

#### Step 2 — Make your changes

Edit files, create new files, delete files — do your work normally.

---

#### Step 3 — Check what changed

```bash
git status
```

This shows you:
- **Red files** = changed but not staged (Git sees the change but hasn't saved it yet)
- **Green files** = staged and ready to commit

---

#### Step 4 — Stage your changes

Staging means telling Git: *"Include these specific changes in the next save point."*

```bash
# Stage a single file
git add filename.js

# Stage a specific folder
git add src/components/

# Stage ALL changed files at once
git add .

# Stage specific file types
git add *.css
```

> **Tip:** `git add .` is the most common, but be careful — it stages everything including files you may not want committed yet.

---

#### Step 5 — Commit your staged changes

```bash
git commit -m "Brief description of what you did"
```

**Good commit message examples:**
```bash
git commit -m "Add navbar component with mobile responsive styles"
git commit -m "Fix broken link on the About page"
git commit -m "Update homepage hero section text"
git commit -m "Remove unused CSS from footer"
```

**Bad commit message examples (avoid these):**
```bash
git commit -m "fix"
git commit -m "changes"
git commit -m "asdfgh"
git commit -m "done"
```

> A good commit message tells your teammates (and future you) *what changed and why*, without needing to read the code.

---

#### Step 6 — Push your commit to GitHub

```bash
git push origin main
```

Or if you're on a feature branch (covered in Phase 5):

```bash
git push origin your-branch-name
```

---

### 4.1 Shortcut: Stage and Commit in One Command

Only works for files Git is already tracking (not brand new files):

```bash
git commit -am "Your commit message"
```

The `-a` flag auto-stages all modified tracked files before committing.

---

## 5. PHASE 3 — Branches: Working Without Breaking Things

> **The golden rule:** Never work directly on `main`. Always create a branch.

A branch is your personal workspace. You do all your work there, and only merge it into `main` when it's ready and reviewed.

---

### 5.1 See All Branches

```bash
# Local branches only
git branch

# Local AND remote branches
git branch -a

# Remote branches only
git branch -r
```

---

### 5.2 Create a New Branch

```bash
git branch feature/navbar
```

But this only creates it — it doesn't switch you to it.

---

### 5.3 Switch to a Branch

```bash
git checkout feature/navbar

# OR the modern way (Git 2.23+)
git switch feature/navbar
```

---

### 5.4 Create AND Switch in One Command (Most Common)

```bash
git checkout -b feature/navbar

# Modern equivalent
git switch -c feature/navbar
```

---

### 5.5 Branch Naming Convention (Follow This)

Use a consistent naming pattern so everyone knows what each branch is for:

```bash
# For new features
feature/homepage-redesign
feature/contact-form
feature/add-gallery-section

# For bug fixes
fix/broken-nav-link
fix/footer-alignment
fix/mobile-menu-bug

# For quick hotfixes on production
hotfix/typo-on-landing-page

# For content updates
content/update-team-bios
content/new-blog-post
```

---

### 5.6 Push a Branch to GitHub (First Time)

When you create a branch locally, GitHub doesn't know about it yet. Push it with:

```bash
git push -u origin feature/navbar
```

The `-u` flag sets up tracking — after this, you can just run `git push` without specifying `origin feature/navbar` every time.

---

### 5.7 Delete a Branch

```bash
# Delete locally (only if already merged)
git branch -d feature/navbar

# Force delete locally (even if not merged — use with caution)
git branch -D feature/navbar

# Delete on GitHub (remote)
git push origin --delete feature/navbar
```

---

### 5.8 Rename a Branch

```bash
# Rename the current branch
git branch -m new-branch-name

# Rename a specific branch
git branch -m old-name new-name
```

---

### 5.9 Merge a Branch Into Main

When your feature is done and tested, merge it:

```bash
# First switch to main
git checkout main

# Pull latest main to make sure you're up to date
git pull origin main

# Now merge your branch
git merge feature/navbar

# Push the updated main to GitHub
git push origin main
```

---

### 5.10 Merge With a Commit Message (No Fast-Forward)

This preserves the branch history — you can see it was a separate branch:

```bash
git merge --no-ff feature/navbar -m "Merge feature/navbar into main"
```

---

## 6. PHASE 4 — Staying Up to Date: Pull & Fetch

### 6.1 Pull (Fetch + Merge in One Step)

```bash
# Pull from main
git pull origin main

# Pull from the current branch's tracked remote
git pull
```

Use this when you want to immediately apply remote changes to your working branch.

---

### 6.2 Fetch (Download Without Applying)

Fetch downloads the latest changes from GitHub but does NOT apply them to your code. It just updates your knowledge of what exists remotely.

```bash
# Fetch everything from origin
git fetch origin

# Fetch a specific branch
git fetch origin main

# Fetch all remotes
git fetch --all
```

After fetching, you can inspect before merging:

```bash
# See what's different between your local main and the remote main
git diff main origin/main

# Now apply it if you're happy
git merge origin/main
```

> **Use `fetch` when:** You want to see what changed remotely before applying it. Use `pull` when you just want to get up to date quickly.

---

### 6.3 Pull With Rebase Instead of Merge

This keeps your history cleaner — your commits go on top of the latest remote commits:

```bash
git pull --rebase origin main
```

---

### 6.4 Update All Branches at Once

```bash
git fetch --all --prune
```

`--prune` removes local references to remote branches that have been deleted on GitHub.

---

## 7. PHASE 5 — Pushing Your Work

### 7.1 Standard Push

```bash
git push origin main

# Or push the current branch
git push origin feature/my-feature
```

---

### 7.2 Push All Branches

```bash
git push --all origin
```

---

### 7.3 Push and Set Upstream Tracking at the Same Time

```bash
git push -u origin feature/my-feature
# After this, you can just run: git push
```

---

### 7.4 Force Push (Use With Extreme Caution)

Only use this if you've rewritten history intentionally (e.g., after a rebase) and you're on **your own branch**, never on `main`:

```bash
git push --force origin feature/my-feature

# Safer version — refuses to force-push if someone else pushed in the meantime
git push --force-with-lease origin feature/my-feature
```

> ⛔ **Never force push to `main`.** It can permanently destroy your teammates' work.

---

### 7.5 Push a Tag

```bash
git push origin v1.0.0

# Push all tags
git push origin --tags
```

---

## 8. PHASE 6 — Handling Merge Conflicts (The Scary Part, Demystified)

A conflict happens when **two people edited the same part of the same file** and Git doesn't know which version to keep. This is normal. It is not a catastrophe.

---

### 8.1 What a Conflict Looks Like

When you pull or merge and a conflict exists, the affected file will contain markers like this:

```
<<<<<<< HEAD
This is the version YOU have locally
=======
This is the version that came from the remote / other branch
>>>>>>> origin/main
```

Git is saying: *"I don't know which of these to keep. You decide."*

---

### 8.2 Step-by-Step: Resolving a Conflict

**Step 1** — Trigger the conflict (e.g., by pulling):

```bash
git pull origin main
# Git says: CONFLICT (content): Merge conflict in index.html
```

**Step 2** — Find all conflicted files:

```bash
git status
# Files listed under "Unmerged paths" are the conflicted ones
```

**Step 3** — Open each conflicted file in your editor. You'll see the conflict markers. Edit the file to look exactly how it should — remove the `<<<<<<<`, `=======`, and `>>>>>>>` lines and keep/combine the correct content.

**Example — Before resolving:**

```html
<<<<<<< HEAD
<h1>Welcome to NSITM</h1>
=======
<h1>Welcome to NSITM Official Website</h1>
>>>>>>> origin/main
```

**Example — After resolving (you decided to keep the longer version):**

```html
<h1>Welcome to NSITM Official Website</h1>
```

**Step 4** — Stage the resolved file:

```bash
git add index.html
```

**Step 5** — Complete the merge with a commit:

```bash
git commit -m "Resolve merge conflict in index.html"
```

**Step 6** — Push:

```bash
git push origin main
```

---

### 8.3 Abort a Merge (If You Get Overwhelmed)

If you want to cancel the merge entirely and go back to how things were:

```bash
git merge --abort
```

For an in-progress rebase:

```bash
git rebase --abort
```

For an in-progress cherry-pick:

```bash
git cherry-pick --abort
```

---

### 8.4 Use a Visual Merge Tool

```bash
# Opens a visual diff tool (VS Code, vimdiff, etc.)
git mergetool

# Specify VS Code as the merge tool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
```

---

### 8.5 Prevent Conflicts Before They Happen

The best conflict is the one that never occurs:

```bash
# Pull often — multiple times a day if the team is active
git pull origin main

# Communicate with teammates about which files you're editing

# Work on separate files and folders when possible

# Keep your feature branches short-lived — merge quickly, don't let them drift
```

---

## 9. PHASE 7 — Undoing Mistakes & Recovery Commands

Everyone makes mistakes. Git makes most of them reversible.

---

### 9.1 Undo the Last Commit (Keep Changes in Files)

You committed too soon? Roll back the commit but keep your file edits:

```bash
git reset --soft HEAD~1
```

Your code is still there — just un-committed.

---

### 9.2 Undo the Last Commit (Remove Changes Too)

You want to completely wipe the last commit and its changes:

```bash
git reset --hard HEAD~1
```

> ⚠️ This **permanently deletes** the changes in that commit. Use with caution.

---

### 9.3 Undo Multiple Commits

```bash
# Undo last 3 commits, keep the code changes
git reset --soft HEAD~3

# Undo last 3 commits, delete the code changes
git reset --hard HEAD~3
```

---

### 9.4 Unstage a File (Remove From Staging Area)

You ran `git add` but changed your mind:

```bash
git restore --staged filename.js

# Or the older way
git reset HEAD filename.js
```

---

### 9.5 Discard Changes in a File (Restore to Last Commit)

You edited a file and want to throw away your edits and go back to the last committed version:

```bash
git restore filename.js

# Or the older way
git checkout -- filename.js
```

> ⚠️ This **permanently discards** your unsaved edits to that file.

---

### 9.6 Revert a Commit (Safe Undo for Shared Branches)

`reset` rewrites history — dangerous on shared branches. `revert` creates a **new commit that undoes** a previous one, keeping history intact:

```bash
# Revert the very last commit
git revert HEAD

# Revert a specific commit by its hash
git revert a3f5b2c
```

Find a commit hash with:

```bash
git log --oneline
```

---

### 9.7 Stash Your Work (Save Without Committing)

You're mid-work but need to switch to another branch urgently, and you're not ready to commit:

```bash
# Stash your current uncommitted changes
git stash

# Stash with a label
git stash push -m "half-done navbar animation"

# See all stashes
git stash list

# Apply your most recent stash (keeps it in stash list)
git stash apply

# Apply the most recent stash and remove it from stash list
git stash pop

# Apply a specific stash (use the number from git stash list)
git stash apply stash@{2}

# Delete a specific stash
git stash drop stash@{1}

# Delete ALL stashes
git stash clear
```

---

### 9.8 Recover a Deleted Branch

If you accidentally deleted a branch, find its last commit hash and recreate it:

```bash
# Find the hash of the lost branch's last commit
git reflog

# Recreate the branch pointing to that commit
git checkout -b recovered-branch a3f5b2c
```

---

### 9.9 Fix the Last Commit Message

You made a typo in your commit message and haven't pushed yet:

```bash
git commit --amend -m "Corrected commit message"
```

If you already pushed, you'll need a force push (only on your own branch):

```bash
git push --force-with-lease origin feature/my-branch
```

---

### 9.10 Add a Forgotten File to the Last Commit

You committed but forgot to include a file:

```bash
git add forgotten-file.js
git commit --amend --no-edit
# --no-edit keeps the same commit message
```

---

## 10. PHASE 8 — Inspection & Diagnosis Commands

### 10.1 See Project History

```bash
# Full history
git log

# Compact one-line history
git log --oneline

# With branch graph visualization
git log --oneline --graph --all

# Show last 5 commits
git log -5

# Show commits by a specific person
git log --author="John"

# Show commits that touched a specific file
git log -- index.html
```

---

### 10.2 See What Changed in a File

```bash
# See unstaged changes (what you've edited but not staged yet)
git diff

# See staged changes (what's ready to commit)
git diff --staged

# Compare two branches
git diff main feature/navbar

# Compare two specific commits
git diff abc1234 def5678

# See changes in a specific file
git diff filename.js
```

---

### 10.3 See Who Changed What Line (Blame)

```bash
git blame filename.js
# Shows each line with the commit hash and author who last changed it
```

---

### 10.4 Search Through Commits

```bash
# Find commits that added or removed a specific string
git log -S "function handleSubmit"

# Search commit messages
git log --grep="navbar"
```

---

### 10.5 Show a Specific Commit's Changes

```bash
git show a3f5b2c
```

---

### 10.6 Check Remote Details

```bash
git remote -v
git remote show origin
```

---

## 11. PHASE 9 — Advanced But Necessary Situations

### 11.1 Cherry-Pick: Take a Single Commit From Another Branch

You want one specific commit from another branch, not the whole branch:

```bash
# Find the hash of the commit you want
git log --oneline feature/other-branch

# Apply that one commit to your current branch
git cherry-pick a3f5b2c
```

---

### 11.2 Rebase: Replay Your Commits on Top of Another Branch

Rebase is like saying: *"Pretend I started my branch from the latest version of main."* It keeps history clean and linear.

```bash
# Switch to your feature branch
git checkout feature/navbar

# Rebase it onto main
git rebase main
```

If conflicts occur during rebase:

```bash
# 1. Resolve the conflict in the file
# 2. Stage it
git add conflicted-file.js

# 3. Continue the rebase
git rebase --continue

# OR abort and go back to before
git rebase --abort
```

---

### 11.3 Interactive Rebase: Rewrite History

Clean up messy commits before merging (squash, reorder, rename):

```bash
# Interactively rebase the last 3 commits
git rebase -i HEAD~3
```

This opens an editor. You'll see your commits listed with actions:
- `pick` — keep the commit as-is
- `squash` or `s` — merge this commit into the one above it
- `reword` or `r` — keep commit but edit the message
- `drop` or `d` — delete this commit

---

### 11.4 Squash Commits Before Merging

Combine several messy "WIP" commits into one clean commit before merging into main:

```bash
git rebase -i HEAD~4
# Change all but the first 'pick' to 'squash'
# Save and close. Then edit the final commit message.
```

---

### 11.5 Tags: Mark a Release Version

```bash
# Create a lightweight tag
git tag v1.0.0

# Create an annotated tag (recommended)
git tag -a v1.0.0 -m "First official release of NSITM website"

# List all tags
git tag

# Tag a specific old commit
git tag -a v0.9.0 a3f5b2c -m "Beta release"

# Push tags to GitHub
git push origin --tags

# Delete a local tag
git tag -d v1.0.0

# Delete a remote tag
git push origin --delete v1.0.0
```

---

### 11.6 Sparse Checkout: Download Only Part of the Repo

If the project is huge and you only need one folder:

```bash
git clone --filter=blob:none --sparse https://github.com/NSITM-ORG/NSITM-Website.git
cd NSITM-Website
git sparse-checkout set src/components
```

---

### 11.7 Shallow Clone: Clone Without Full History

For faster cloning when you don't need the entire project history:

```bash
git clone --depth=1 https://github.com/NSITM-ORG/NSITM-Website.git
```

---

### 11.8 Submodules: Repo Inside a Repo

If the project uses submodules:

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/NSITM-ORG/NSITM-Website.git

# If you already cloned without them
git submodule update --init --recursive
```

---

### 11.9 Bisect: Find Which Commit Introduced a Bug

```bash
git bisect start

# Tell Git the current commit is broken
git bisect bad

# Tell Git the last known good commit
git bisect good v1.0.0

# Git checks out a middle commit. Test your app.
# If it's broken:
git bisect bad

# If it's fine:
git bisect good

# Git keeps narrowing down until it finds the exact commit that introduced the bug.
# When done:
git bisect reset
```

---

### 11.10 .gitignore — Tell Git What to Ignore

Create a `.gitignore` file at the root of your project to prevent certain files from being tracked:

```bash
# Create the file
touch .gitignore
```

Typical contents for a web project:

```
# Dependencies
node_modules/
vendor/

# Environment files (NEVER commit these — they contain secrets)
.env
.env.local
.env.production

# Build output
dist/
build/
*.min.js

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp

# Logs
*.log
npm-debug.log*
```

After adding `.gitignore`:

```bash
git add .gitignore
git commit -m "Add .gitignore"
```

If you accidentally committed a file that should be ignored:

```bash
# Remove it from tracking without deleting the actual file
git rm --cached filename.env
git commit -m "Stop tracking .env file"
```

---

## 12. PHASE 10 — Setting Up a Brand New Project (for the lead)

> This section is for the team lead or whoever owns the GitHub repo and is starting fresh.

### 12.1 Initialize a Local Project and Push to GitHub

```bash
# Step 1 — Create your project folder and enter it
mkdir NSITM-Website
cd NSITM-Website

# Step 2 — Initialize Git
git init

# Step 3 — Create your first file
echo "# NSITM Website" > README.md

# Step 4 — Stage and commit
git add .
git commit -m "Initial commit"

# Step 5 — Rename the default branch to main
git branch -M main

# Step 6 — Connect to the GitHub remote
git remote add origin https://github.com/NSITM-ORG/NSITM-Website.git

# Step 7 — Push and set upstream
git push -u origin main
```

---

### 12.2 Connect an Existing Local Project to GitHub

If the project folder already has files but was never git-tracked:

```bash
cd existing-project-folder
git init
git add .
git commit -m "Initial commit — existing project"
git branch -M main
git remote add origin https://github.com/NSITM-ORG/NSITM-Website.git
git push -u origin main
```

---

### 12.3 Change or Update the Remote URL

```bash
# Check current remote
git remote -v

# Change it
git remote set-url origin https://github.com/NSITM-ORG/NSITM-Website.git

# Verify
git remote -v
```

---

### 12.4 Add a Second Remote (e.g., for deployment)

```bash
git remote add deploy https://github.com/NSITM-ORG/NSITM-Website-Deploy.git

# Push to a specific remote
git push deploy main
```

---

### 12.5 Protect the Main Branch (GitHub Settings)

This is done on GitHub, not via CLI — but it's critical:

1. Go to your repo on GitHub
2. Click **Settings** → **Branches**
3. Under **Branch protection rules**, click **Add rule**
4. Set branch name: `main`
5. Check:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Include administrators
6. Save

This prevents anyone from pushing directly to `main` without a pull request review.

---

## 13. Git Rules for This Team

These are non-negotiable practices that keep the project sane:

```
✅ DO:
  - Always pull before you start working: git pull origin main
  - Always work on a feature branch, never directly on main
  - Write clear, descriptive commit messages
  - Commit often — small, focused commits are better than one massive one
  - Push your branch at the end of every work session (backup + visibility)
  - Communicate with the team before editing shared files
  - Delete your branch after it's been merged

❌ DON'T:
  - Don't commit .env files or any file with passwords/API keys
  - Don't push node_modules/ or vendor/ folders
  - Don't force push to main — ever
  - Don't commit broken or untested code to main
  - Don't use vague commit messages like "fix" or "update"
  - Don't ignore merge conflicts — resolve them, don't push over them
```

---

## 14. Quick Reference Cheatsheet

```bash
# ─────────────── SETUP ───────────────
git config --global user.name "Name"
git config --global user.email "email"
git clone https://github.com/NSITM-ORG/NSITM-Website.git

# ─────────────── DAILY LOOP ───────────────
git pull origin main                    # Get latest changes
git status                              # See what changed
git add .                               # Stage all changes
git add filename.js                     # Stage one file
git commit -m "message"                 # Save a checkpoint
git push origin branch-name             # Send to GitHub

# ─────────────── BRANCHES ───────────────
git branch                              # List local branches
git branch -a                           # List all branches
git checkout -b feature/my-feature      # Create + switch branch
git switch feature/my-feature           # Switch branch
git merge feature/my-feature            # Merge into current branch
git branch -d feature/my-feature        # Delete local branch
git push origin --delete feature/name   # Delete remote branch

# ─────────────── UNDO ───────────────
git restore filename.js                 # Discard file changes
git restore --staged filename.js        # Unstage a file
git commit --amend -m "new message"     # Fix last commit message
git reset --soft HEAD~1                 # Undo last commit, keep changes
git reset --hard HEAD~1                 # Undo last commit, delete changes
git revert HEAD                         # Safe undo (creates new commit)
git stash                               # Save work without committing
git stash pop                           # Bring stashed work back

# ─────────────── INSPECT ───────────────
git log --oneline                       # Compact commit history
git log --oneline --graph --all         # Visual branch history
git diff                                # See unstaged changes
git diff --staged                       # See staged changes
git blame filename.js                   # See who changed each line

# ─────────────── REMOTE ───────────────
git remote -v                           # Check remote URL
git fetch origin                        # Download without applying
git pull --rebase origin main           # Pull with clean history
git push -u origin feature/my-feature   # Push new branch + set tracking
git push --force-with-lease origin branch # Safe force push (own branches only)
```

---

*Last updated for NSITM-Website project. All commands verified against Git 2.x.*
*Remote: `https://github.com/NSITM-ORG/NSITM-Website.git`*