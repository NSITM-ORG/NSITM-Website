# 🖥️ Git Guide — Frontend Developer (Client)
### NSITM Website · `client/` — React + Vite + Tailwind CSS

> **Your repo:** `https://github.com/NSITM-ORG/NSITM-Website.git`
> **Your folder:** Everything you touch lives inside `client/`
> The backend developer works inside `server/` — a completely separate folder.
> You will rarely touch the same files. But you still share the same repo, so you need to know how to work cleanly together.

---

## 🧠 Before Anything — The Mental Model

The repo looks like this:

```
NSITM-Website/
├── client/        ← THIS IS YOU
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── server/        ← Backend dev works here, not you
    ├── index.js
    └── package.json
```

You clone the **whole repo**, but you only work inside `client/`. The backend dev does the same from their end. Git tracks both folders, so you both push to the same repo — just to different parts of it.

---

## ✅ STEP 0 — One-Time Machine Setup

Do this **once** before anything else:

```bash
# 1. Install Git
# Ubuntu/WSL:
sudo apt update && sudo apt install git -y

# macOS:
brew install git

# Windows: download from https://git-scm.com and use Git Bash

# 2. Confirm it installed
git --version

# 3. Tell Git who you are (use same email as your GitHub account)
git config --global user.name "Your Name"
git config --global user.email "you@email.com"

# 4. Set default branch name
git config --global init.defaultBranch main
```

---

## ✅ STEP 1 — Get the Project (Do This Once)

```bash
# Clone the repo — this downloads everything
git clone https://github.com/NSITM-ORG/NSITM-Website.git

# Enter the project
cd NSITM-Website

# Enter YOUR workspace
cd client

# Install your dependencies
npm install
```

> After `npm install`, your `node_modules/` folder appears. That folder is already in `.gitignore` — Git ignores it automatically. Never commit it.

Confirm everything is connected:

```bash
# Run back to root first
cd ..

git remote -v
# Should show:
# origin  https://github.com/NSITM-ORG/NSITM-Website.git (fetch)
# origin  https://github.com/NSITM-ORG/NSITM-Website.git (push)
```

Start your dev server:

```bash
cd client
npm run dev
# Vite starts on http://localhost:5173
```

---

## 🔁 STEP 2 — Your Daily Workflow (Do This Every Day)

Every time you sit down to work, follow this exact sequence:

```bash
# 1. Go to the project root (not inside client/)
cd NSITM-Website

# 2. Pull the latest changes from the team
git pull origin main

# 3. Go into client and start working
cd client
npm run dev
```

After you've made changes:

```bash
# 4. Go back to the project root
cd ..

# 5. Check what you've changed
git status

# 6. Stage your changes (only files inside client/)
git add client/

# Or stage a specific file
git add client/src/components/Navbar.jsx

# 7. Commit with a clear message
git commit -m "Add responsive navbar with mobile toggle"

# 8. Push to GitHub
git push origin your-branch-name
```

---

## 🌿 STEP 3 — Always Work on a Branch, Never on `main`

`main` is the live, shared branch. You never edit it directly.

```bash
# Create your branch and switch to it immediately
git checkout -b feature/homepage-hero

# Confirm you're on it
git branch
# * feature/homepage-hero   ← the * shows your current branch
```

**Branch naming — what to use:**

```bash
# New UI features
feature/homepage-hero
feature/about-page
feature/contact-form
feature/team-section

# Fixing something broken
fix/navbar-mobile-collapse
fix/footer-link-broken
fix/hero-image-not-loading

# Updating content (text, images)
content/update-team-photos
content/edit-mission-statement
```

Push your branch to GitHub for the first time:

```bash
git push -u origin feature/homepage-hero
# The -u links your local branch to the remote one
# After this, just type: git push
```

---

## 🤝 STEP 4 — Merging Your Branch Into Main

When your feature is done and ready:

```bash
# Step 1 — Go to main
git checkout main

# Step 2 — Pull so main is up to date
git pull origin main

# Step 3 — Merge your branch in
git merge feature/homepage-hero

# Step 4 — Push main to GitHub
git push origin main

# Step 5 — Clean up the branch (optional but good practice)
git branch -d feature/homepage-hero
git push origin --delete feature/homepage-hero
```

---

## ⚡ STEP 5 — When the Backend Dev Pushes Something

The backend dev works in `server/`. When they push changes, those changes come down when you pull. **This should never affect your files in `client/`**, but you still need to pull regularly.

```bash
git pull origin main
```

If Git says "Already up to date" — great. If it pulls in new commits, those are likely server-side changes. Don't panic. Your `client/` files are untouched.

To confirm nothing in your folder changed:

```bash
git diff HEAD~1 -- client/
# Shows only what changed inside client/ between the last two commits
```

---

## 💥 STEP 6 — Handling Merge Conflicts

A conflict happens when **you and someone else edited the same line in the same file**. With two developers working in different folders (`client/` vs `server/`), this is rare — but it can happen in shared root files like `.gitignore` or `README.md`.

**What it looks like:**

```bash
git pull origin main
# CONFLICT (content): Merge conflict in .gitignore
```

Open the conflicted file. Git marks it like this:

```
<<<<<<< HEAD
node_modules/
.env
=======
node_modules/
dist/
.env.production
>>>>>>> origin/main
```

- Everything between `<<<<<<< HEAD` and `=======` is YOUR version
- Everything between `=======` and `>>>>>>>` is what came from GitHub

**Fix it:** Edit the file to keep what's correct — usually a combination of both:

```
node_modules/
dist/
.env
.env.production
```

Delete all the `<<<<<<<`, `=======`, `>>>>>>>` markers. Then:

```bash
git add .gitignore
git commit -m "Resolve conflict in .gitignore"
git push origin main
```

**Want to cancel the merge entirely?**

```bash
git merge --abort
```

---

## 🚨 STEP 7 — Mistakes & How to Fix Them

### "I staged the wrong file"

```bash
# Unstage it without losing your edits
git restore --staged client/src/App.jsx
```

---

### "I committed but haven't pushed yet — I want to undo it"

```bash
# Undo the commit, keep your code changes
git reset --soft HEAD~1

# Undo the commit AND throw away the code changes (careful!)
git reset --hard HEAD~1
```

---

### "I want to throw away edits to a file and go back to last commit"

```bash
git restore client/src/components/Navbar.jsx
```

> ⚠️ This is permanent. Your edits will be gone.

---

### "I committed a message with a typo and haven't pushed yet"

```bash
git commit --amend -m "Correct message here"
```

---

### "I forgot to include a file in my last commit"

```bash
git add client/src/assets/logo.png
git commit --amend --no-edit
```

---

### "I need to pause my work and switch branches but I'm not ready to commit"

```bash
# Save your work-in-progress without committing
git stash

# Switch branches, do what you need to do, then come back
git checkout main
# ... do something ...
git checkout feature/homepage-hero

# Restore your saved work
git stash pop
```

---

### "I want to undo a commit that's already on GitHub (shared)"

Don't use `reset` — it rewrites history and breaks things for others. Use `revert` instead:

```bash
# This creates a new commit that undoes the bad one
git revert HEAD
git push origin main
```

---

## 🔍 STEP 8 — Checking What's Going On

```bash
# See what files have changed
git status

# See a compact history of commits
git log --oneline

# See a visual graph of all branches
git log --oneline --graph --all

# See exactly what you changed (not yet staged)
git diff

# See what's staged and ready to commit
git diff --staged

# See what changed in client/ specifically in recent commits
git log --oneline -- client/
```

---

## 📁 Your `.gitignore` — Files You Should Never Commit

Make sure the root `.gitignore` or `client/.gitignore` contains these:

```
# Dependencies — never commit this
node_modules/

# Vite build output
dist/

# Environment variables — NEVER commit .env files
.env
.env.local
.env.development
.env.production

# OS junk
.DS_Store
Thumbs.db

# Editor configs (optional but recommended to ignore)
.vscode/
.idea/
```

If you accidentally committed something that should be ignored:

```bash
# Remove it from git tracking (file stays on your computer)
git rm --cached client/node_modules/some-file
git commit -m "Stop tracking file that should be ignored"
```

---

## 📋 Quick Reference

```bash
# ── SETUP (once) ──────────────────────────────────
git clone https://github.com/NSITM-ORG/NSITM-Website.git
cd NSITM-Website && cd client && npm install

# ── EVERY DAY (before working) ────────────────────
cd NSITM-Website
git pull origin main

# ── YOUR WORK LOOP ────────────────────────────────
git checkout -b feature/my-feature         # create branch
# ... make changes inside client/ ...
git status                                  # what changed?
git add client/                             # stage your folder
git commit -m "describe what you did"       # save a checkpoint
git push origin feature/my-feature         # send to GitHub

# ── WHEN DONE WITH A FEATURE ──────────────────────
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main
git branch -d feature/my-feature

# ── UNDO SHORTCUTS ────────────────────────────────
git restore --staged <file>                 # unstage
git restore <file>                          # discard edits
git reset --soft HEAD~1                     # undo last commit (keep code)
git stash / git stash pop                   # pause/resume work
git merge --abort                           # cancel a merge
```

---

> 💡 **Golden rule:** Pull before you work. Branch before you build. Commit small and often. Never commit `node_modules/` or `.env` files.