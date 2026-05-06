# Manager Panel

Dedicated manager portal for viewing user information with restricted access. Managers can only see:

- User ID, Username, Email, Role
- Unique Code, Legacy Code, Manager Code

## Setup

```bash
cd manager-panel
npm install
npm run dev
```

Runs on `http://localhost:5175`

## Login

- Email: Any registered user's email
- Password: User's password
- Manager Code: The user's auto-generated manager code (displayed in Dashboard)

## Features

- Manager login with unique manager code
- Read-only user information view
- Auto-generated manager codes for every registered user
