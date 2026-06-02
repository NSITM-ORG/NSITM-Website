# ⚙️ Git Guide — Backend Developer (Server)
### NSITM Website · `server/` — Express + Mongoose + Cloudinary

> **Your repo:** `https://github.com/NSITM-ORG/NSITM-Website.git`
> **Your folder:** Everything you touch lives inside `server/`
> The frontend developer works inside `client/` — a completely separate folder.
> You will rarely touch the same files. But you share the same repo, so you need to work cleanly together.

---

## 🧠 Before Anything — The Mental Model

The repo looks like this:

```
NSITM-Website/
├── client/        ← Frontend dev works here, not you
│   ├── src/
│   └── package.json
└── server/        ← THIS IS YOU
    ├── index.js
    ├── routes/
    ├── models/
    ├── controllers/
    ├── middleware/
    └── package.json
```

You clone the **whole repo**, but you only work inside `server/`. The frontend dev does the same from their end. Git tracks both folders — you both push to the same repo, just different parts of it.

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
# Clone the repo
git clone https://github.com/NSITM-ORG/NSITM-Website.git

# Enter the project
cd NSITM-Website

# Enter YOUR workspace
cd server

# Install your dependencies
npm install
```

Your `node_modules/` folder is created. It's in `.gitignore` — Git ignores it. Never commit it.

You also need a `.env` file for secrets. **This file is never committed to Git.** Create it manually:

```bash
# Create your .env file (never share this, never commit it)
touch .env
```

Then open it and add your environment variables:

```
PORT=5000
MONGO_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Confirm remote is connected:

```bash
cd ..   # back to project root
git remote -v
# origin  https://github.com/NSITM-ORG/NSITM-Website.git (fetch)
# origin  https://github.com/NSITM-ORG/NSITM-Website.git (push)
```

Start your dev server:

```bash
cd server
npm run dev
# nodemon starts — server restarts on every file change
```

---

## 🔁 STEP 2 — Your Daily Workflow (Do This Every Day)

Every time you sit down to work:

```bash
# 1. Go to the project root (not inside server/)
cd NSITM-Website

# 2. Pull latest changes from the team
git pull origin main

# 3. Go into server and start working
cd server
npm run dev
```

After you've made changes:

```bash
# 4. Go back to the project root
cd ..

# 5. Check what changed
git status

# 6. Stage only your files (inside server/)
git add server/

# Or stage a specific file
git add server/routes/upload.js

# 7. Commit with a clear message
git commit -m "Add image upload route with Cloudinary integration"

# 8. Push to GitHub
git push origin your-branch-name
```

---

## 🌿 STEP 3 — Always Work on a Branch, Never on `main`

```bash
# Create your branch and switch to it immediately
git checkout -b feature/upload-api

# Confirm you're on it
git branch
# * feature/upload-api   ← * means you're here
```

**Branch naming — what to use:**

```bash
# New API features or routes
feature/upload-api
feature/contact-email-route
feature/mongoose-models
feature/image-compression

# Bug fixes
fix/cors-header-error
fix/mongo-connection-retry
fix/rate-limiter-config

# Config or infrastructure changes
config/env-structure
config/cloudinary-setup
```

Push your branch to GitHub for the first time:

```bash
git push -u origin feature/upload-api
# -u links your local branch to GitHub
# After this, just type: git push
```

---

## 🤝 STEP 4 — Merging Your Branch Into Main

When your feature is stable and tested:

```bash
# Step 1 — Switch to main
git checkout main

# Step 2 — Pull so main is up to date
git pull origin main

# Step 3 — Merge your branch in
git merge feature/upload-api

# Step 4 — Push to GitHub
git push origin main

# Step 5 — Delete the branch (clean up)
git branch -d feature/upload-api
git push origin --delete feature/upload-api
```

---

## ⚡ STEP 5 — When the Frontend Dev Pushes Something

The frontend dev works in `client/`. Their pushes affect nothing in `server/`. But you still need to pull:

```bash
git pull origin main
```

If it says "Already up to date" — nothing changed for you. If commits come in, they're likely frontend changes. Your `server/` files are untouched.

To confirm nothing in your folder changed:

```bash
git diff HEAD~1 -- server/
# Shows only what changed in server/ between the last two commits
```

---

## 💥 STEP 6 — Handling Merge Conflicts

Conflicts between you and the frontend dev are very unlikely since you're in different folders. But they *can* happen in shared root files: `.gitignore`, `README.md`, or repo-level config files.

**What it looks like:**

```bash
git pull origin main
# CONFLICT (content): Merge conflict in .gitignore
```

Open the conflicted file:

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

- Your version is between `<<<<<<< HEAD` and `=======`
- The remote version is between `=======` and `>>>>>>>`

**Fix it — combine what's correct:**

```
node_modules/
dist/
.env
.env.production
```

Remove all three conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). Then:

```bash
git add .gitignore
git commit -m "Resolve conflict in .gitignore"
git push origin main
```

**Want to cancel the whole merge and go back?**

```bash
git merge --abort
```

---

## 🚨 STEP 7 — Mistakes & How to Fix Them

### "I staged the wrong file"

```bash
# Unstage it — your edits are NOT lost
git restore --staged server/routes/upload.js
```

---

### "I committed but haven't pushed — I want to undo it"

```bash
# Undo the commit, keep your code changes
git reset --soft HEAD~1

# Undo the commit AND the code changes (dangerous)
git reset --hard HEAD~1
```

---

### "I want to throw away all edits to a file"

```bash
git restore server/index.js
```

> ⚠️ This permanently discards your changes to that file.

---

### "I committed a message with a typo and haven't pushed"

```bash
git commit --amend -m "Correct message"
```

---

### "I forgot to add a file to my last commit"

```bash
git add server/middleware/rateLimiter.js
git commit --amend --no-edit
```

---

### "I accidentally committed my `.env` file"

Stop. This is urgent. Fix it immediately:

```bash
# Remove it from tracking (file stays on your computer)
git rm --cached server/.env

# Commit the removal
git commit -m "Remove .env from tracking"

# Push
git push origin main
```

Then go to GitHub → your repo → Security → check if secrets are exposed. If they are, rotate your API keys and MongoDB credentials immediately.

Add `.env` to your `.gitignore` so this can never happen again:

```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
```

---

### "I need to pause and switch branches but I'm not ready to commit"

```bash
# Save your unfinished work without committing
git stash

# Switch branches, do what you need
git checkout main

# Come back and restore your work
git checkout feature/upload-api
git stash pop
```

---

### "I want to undo a commit that's already on GitHub"

Don't use `reset` — it rewrites history and breaks things for the rest of the team. Use `revert`:

```bash
# Creates a NEW commit that undoes the bad one — safe for shared branches
git revert HEAD
git push origin main
```

---

## 🔍 STEP 8 — Checking What's Going On

```bash
# See what files you've changed
git status

# See a compact commit history
git log --oneline

# See a visual graph of all branches
git log --oneline --graph --all

# See unstaged changes in your files
git diff

# See staged changes (ready to commit)
git diff --staged

# See only commits that touched server/ folder
git log --oneline -- server/

# See who changed a specific line in a file
git blame server/index.js
```

---

## 📁 Your `.gitignore` — Files You Should Never Commit

Make sure `.gitignore` at the root (or inside `server/`) contains:

```
# Dependencies
node_modules/

# Environment variables — CRITICAL, never commit
.env
.env.local
.env.production

# Logs
*.log
npm-debug.log*

# OS junk
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
```

---

## 🔐 Extra: Keeping Secrets Safe

Your server uses sensitive credentials: MongoDB URI, Cloudinary keys, API secrets. None of these should **ever** touch Git.

Rules:
- Always store secrets in `.env`
- Always have `.env` in `.gitignore` before your first commit
- Never hardcode keys in route files or `index.js`
- If a key ever leaks to GitHub — rotate it immediately, don't just delete the file

```bash
# Confirm .env is being ignored (should return nothing if correctly ignored)
git check-ignore -v server/.env
# Output: .gitignore:1:.env    server/.env  ← this is correct
```

---

## 📋 Quick Reference

```bash
# ── SETUP (once) ──────────────────────────────────
git clone https://github.com/NSITM-ORG/NSITM-Website.git
cd NSITM-Website && cd server && npm install

# ── EVERY DAY (before working) ────────────────────
cd NSITM-Website
git pull origin main

# ── YOUR WORK LOOP ────────────────────────────────
git checkout -b feature/my-api-feature     # create branch
# ... make changes inside server/ ...
git status                                  # what changed?
git add server/                             # stage your folder
git commit -m "describe what you built"     # save a checkpoint
git push origin feature/my-api-feature     # send to GitHub

# ── WHEN DONE WITH A FEATURE ──────────────────────
git checkout main
git pull origin main
git merge feature/my-api-feature
git push origin main
git branch -d feature/my-api-feature

# ── UNDO SHORTCUTS ────────────────────────────────
git restore --staged <file>                 # unstage
git restore <file>                          # discard edits
git reset --soft HEAD~1                     # undo last commit (keep code)
git stash / git stash pop                   # pause/resume work
git merge --abort                           # cancel a merge
git revert HEAD                             # safe undo for pushed commits

# ── SECRETS ───────────────────────────────────────
git rm --cached server/.env                 # emergency: remove .env from git
git check-ignore -v server/.env             # confirm .env is ignored
```

---

> 💡 **Golden rule:** Pull before you work. Branch before you build. Commit small and often. Never commit `.env` or `node_modules/`. If a secret leaks — rotate it immediately.