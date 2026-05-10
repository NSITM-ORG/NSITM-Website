# Contributing to the NSITM Website

Thank you for contributing to the Nextserve School of Information Technology and Management website project. Please read this document fully before opening any issues or pull requests. This is a Live Project — uncoordinated changes create conflicts that cost the whole team time.

---

## Table of Contents

- [How We Work](#how-we-work)
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Commit Message Format](#commit-message-format)
- [Opening Issues](#opening-issues)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Code Review Standards](#code-review-standards)
- [Definition of Done](#definition-of-done)
- [Getting Help](#getting-help)

---

## How We Work

All work on this project is tracked as GitHub Issues. No development begins without a corresponding issue. All code changes go through a pull request — nothing is pushed directly to `main` or `develop`.

**Our tools:**

- **GitHub Issues** — task tracking and bug reporting
- **GitHub Projects** — sprint board
- **WhatsApp** — team communication for this phase
- **Notion** — project documentation and sprint planning

---

## Getting Started

1. Read the [README.md](https://claude.ai/chat/README.md) and follow the installation steps to get the project running locally.
2. Ask the Project Lead to be added to the GitHub repository with the appropriate role.
3. Review the open issues to understand what is currently in progress.
4. Do not begin work on any issue until it has been assigned to you by the Project Lead or Tech Lead.

---

## Branching Strategy

### Branch Structure

|Branch|Purpose|Who Can Push|
|---|---|---|
|`main`|Production-ready code only. Always deployable.|No one directly — merged from `develop` via PR only|
|`develop`|Integration branch. All features merge here first.|No one directly — merged from feature branches via PR only|
|`feature/[description]`|New feature or page development|Assigned developer|
|`fix/[description]`|Bug fix|Assigned developer|
|`chore/[description]`|Refactoring, config changes, dependency updates|Assigned developer|
|`hotfix/[description]`|Urgent fix applied directly to `main`|Tech Lead only|

### Branch Naming Rules

- Lowercase and hyphens only — no spaces, no underscores
- Short and descriptive
- Include the issue number where possible

**Examples:**

```
feature/homepage-layout          ✓
feature/12-homepage-layout       ✓  (includes issue number — preferred)
fix/enrollment-form-validation   ✓
fix/34-enrollment-form           ✓
chore/update-tailwind            ✓
Feature/HomepageLayout           ✗  (wrong case)
my-changes                       ✗  (no context)
```

### Creating a Branch

```bash
# Always branch from develop, not main
git checkout develop
git pull origin develop
git checkout -b feature/[issue-number]-[short-description]
```

---

## Commit Message Format

### Format

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]

[optional footer — issue reference]
```

### Types

|Type|When to Use|
|---|---|
|`feat`|A new page or feature|
|`fix`|A bug fix|
|`docs`|Documentation changes only|
|`style`|Formatting or visual adjustments — no logic change|
|`refactor`|Code restructuring — no feature change, no bug fix|
|`chore`|Build process, config changes, dependency updates|

### Rules

- Subject line: 72 characters maximum
- Use the imperative mood — "Add homepage layout" not "Added homepage layout"
- Do not end the subject line with a period
- Reference the issue number in the footer

### Examples

```
feat(homepage): add hero section with programme CTA buttons

Closes #5

---

fix(enrollment): correct fee display for instalment option

Full payment and instalment amounts were rendering the same
value. Fixed conditional logic in the payment type section.

Closes #18

---

chore: update Tailwind config to include custom brand colours
```

---

## Opening Issues

**Before opening an issue:**

- Search existing issues to check if it already exists
- If it exists and is open, add a comment rather than opening a duplicate

**Issue rules:**

- Every issue must have a clear title and description
- Every issue must include acceptance criteria — what does "done" look like for this task?
- Every issue must be assigned before development begins
- Issues without sufficient detail will be sent back to the reporter for clarification

---

## Pull Request Process

### Before Opening a PR

- [ ] Your branch is up to date with `develop`
- [ ] All acceptance criteria in the linked issue are met
- [ ] You have tested your changes locally across both desktop and mobile viewports
- [ ] No existing pages are broken by your changes

### Opening the PR

1. Push your branch to the remote repository
2. Open a pull request against `develop` — not `main`
3. Write a clear description of what you changed and why
4. Include screenshots if the change affects the UI
5. Link the related issue using `Closes #[issue-number]` in the PR description
6. Assign the Tech Lead as reviewer

### Merging Rules

- At least one approval from the Tech Lead is required before merging
- The Project Lead must approve any PR that changes the enrollment flow, payment details, admin dashboard, or any page visible to prospective students
- Do not merge your own PR without a review
- Delete the branch after merging

---

## Code Style

- Use consistent indentation — 2 spaces for HTML and CSS
- Keep class names meaningful and follow Tailwind conventions
- Do not leave commented-out code in merged files
- Avoid unused variables and dead code
- Keep functions small and focused — one responsibility per function
- Comment only when the logic is genuinely non-obvious

---

## Code Review Standards

### For Reviewers

- Review within 24 hours of being assigned
- Be specific — point to the exact line and explain the concern
- Distinguish between blocking issues and suggestions
- Check mobile rendering — every page must work on a phone

### For Authors

- Respond to all review comments before requesting a re-review
- If you disagree with feedback, explain why in a comment — do not silently ignore it
- Do not make unrelated changes in a PR that is under review

### What Reviewers Check

- [ ] Does the code match what the linked issue describes?
- [ ] Are all acceptance criteria met?
- [ ] Does the page render correctly on mobile?
- [ ] Is the Tailwind usage consistent with the rest of the project?
- [ ] Are there any broken links or missing assets?
- [ ] Is the code readable without unnecessary complexity?

---

## Definition of Done

An issue is only considered Done when all of the following are true:

- [ ] All acceptance criteria in the issue are met and verified
- [ ] Code has been reviewed and approved by the Tech Lead
- [ ] The feature works correctly on both desktop and mobile
- [ ] No existing pages are broken
- [ ] The PR has been merged and the branch deleted
- [ ] The issue has been closed and linked to the merged PR

---

## Getting Help

- **Stuck on a technical problem?** Message the Tech Lead on WhatsApp — do not sit blocked for more than 2 hours without asking for help
- **Unclear on a requirement?** Comment directly on the GitHub Issue and tag the Project Lead
- **Found a security issue?** Do not open a public issue — contact the Project Lead directly and immediately
- **Process question?** Contact the Project Lead via WhatsApp

---

_CONTRIBUTING.md — NSITM Website_ _Maintained by the Project Lead and Tech Lead_ _Last updated: 10th May 2026_
