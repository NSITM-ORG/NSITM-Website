# NSITM Website

_The official website of Nextserve School of Information Technology and Management, providing programme information, cohort enrollment, and institutional administration._

---

## Table of Contents

- [[#Overview|Overview]]
- [[#Features|Features]]
- [[#Tech Stack|Tech Stack]]
- [[#Getting Started|Getting Started]]
- [[#Project Structure|Project Structure]]
- [[#Contributing|Contributing]]
- [[#Versioning|Versioning]]
- [[#Team|Team]]
- [[#License|License]]

---

## Overview

Nextserve School of Information Technology and Management is a Nigerian technology and management training institution with over thirteen years of operation. The existing website at nsitm.org.ng does not reflect the institution's current programme catalogue, pricing, or cohort delivery model. This project rebuilds the website from the ground up as a Live Project executed by Nextserve students, replacing the old site with a mobile-first platform that serves prospective students, enrolled cohort members, and the institution's administrative team.

The website must be live and operational before the June 2026 cohort enrollment campaign launches.

---

## Features

- Public programme listings covering all 26 programmes across Tech, Management, and Short-Term categories
- Cohort schedule and intake dates for active programmes
- Online enrollment form with deposit payment instructions and receipt upload
- Automated payment confirmation email to enrolled students
- Admin dashboard for managing enrollment records and payment status
- Partial enrollment capture for students who begin but do not complete the enrollment form
- Super Admin controls for user management and data export
- Mobile-first design optimised for Nigerian mobile connections

---

## Tech Stack

|Layer|Technology|
|---|---|
|Frontend|HTML, Tailwind CSS|
|JavaScript (planned)|Vanilla JS / To be confirmed with Tech Lead|
|Backend|Node.js, Express|
|Database|MongoDB|
|File Storage|Cloudinary|
|Transactional Email|Resend|
|Enrollment Form (fallback)|Tally|
|Hosting — Frontend|Vercel|
|Hosting — Backend|Railway|

> Note: Backend and database development has not yet begun as of v0.1. The current build covers static frontend pages only. This table reflects the full planned stack per the PRD.

---

## Getting Started

### Prerequisites

- A modern web browser for viewing static pages during the current frontend-only phase
- Node.js 18+ (required when backend development begins)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/NSITM-ORG/NSITM-Website.git
cd NSITM-Website

# 2. Switch to the development branch
git checkout develop

# 3. Open the project
# For the current static frontend phase, open index.html directly in your browser
# or use a local server extension such as Live Server in VS Code
```

> Backend setup instructions will be added when Node.js and Express development begins. This section will be updated at that point.

### Environment Variables

No environment variables are required for the current static frontend phase. The following will be required when backend development begins.

|Variable|Description|Required|
|---|---|---|
|`MONGODB_URI`|MongoDB connection string|Yes|
|`CLOUDINARY_URL`|Cloudinary connection string for receipt file storage|Yes|
|`RESEND_API_KEY`|API key for transactional email via Resend|Yes|
|`JWT_SECRET`|Secret key for admin session tokens|Yes|
|`ADMIN_EMAIL`|Default admin account email for first setup|Yes|

---

## Project Structure

```
NSITM-Website/
├── assets/                  # Images, icons, and brand assets
│   ├── images/
│   └── icons/
├── css/                     # Tailwind output and any custom styles
├── pages/                   # Individual HTML pages
│   ├── programmes/          # Individual programme detail pages
│   ├── enroll/              # Enrollment flow pages
│   └── admin/               # Admin dashboard pages (in progress)
├── backend/                 # Node.js/Express API (not yet started)
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── index.js
├── docs/                    # Project documentation including PRD
├── .github/                 # GitHub issue templates
│   └── ISSUE_TEMPLATE/
├── .env.example             # Example environment variables
└── README.md
```

> The project structure above reflects the intended layout. Folders not yet created will be added as development progresses. Do not create folders that have no content yet.

---

## Contributing

All contributions must follow the process below. This is a Live Project and uncoordinated changes create conflicts that cost the whole team time.

**Quick rules:**

- Every piece of work must have a corresponding GitHub Issue before development starts. No issue, no branch, no code.
- Branch naming: `feature/short-description`, `fix/short-description`, `chore/short-description`
- All work is done on the `develop` branch or a branch created from it. Never work directly on `main`.
- Do not push directly to `main` or `develop`. Open a pull request and request a review.
- All pull requests require approval from the Tech Lead before merging.
- Commit messages must be clear and specific. "Update files" is not an acceptable commit message.

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/).

- **MAJOR** — breaking changes or full redesigns
- **MINOR** — new pages or features added, backwards compatible
- **PATCH** — bug fixes, copy corrections, style adjustments

**Current version:** v0.1.0 — Static frontend in progress. Homepage and enrollment pages in development.

---

## Team

| Role                              | Name                   | GitHub              |
| --------------------------------- | ---------------------- | ------------------- |
| Product Owner / Project Oversight | Muolokwu Ekene Dominic | @MADEPADIO          |
| Tech Lead                         | George Tony            | @placeholder-george |
| Frontend Developer                | —                      | @LUNNA-23           |

---

## License

This project is proprietary software owned by Nextserve School of Information Technology and Management. All rights reserved. The codebase is built by Nextserve students as a Live Project under the institution's Live Project Model. Students receive a Nextserve Project Certificate documenting their contribution but hold no ownership rights to the codebase. Unauthorised copying, distribution, or use of this codebase outside of the institution's authorised team is strictly prohibited.

---

_README — NSITM Website_ _Last updated: 10th May 2026_
