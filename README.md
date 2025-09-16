# TalentFlow HR App

A modern HR management app built with React, Vite, and Tailwind CSS.

## Login Credentials

No sign-up or registration is required. Use one of the following test accounts to log in:

| Name           | Username (ID) | Password  | Role         |
|----------------|--------------|-----------|--------------|
| Main Account   | main         | (none)    | Read Only    |
| Kraya          | kraya        | password  | Lead HR      |
| Amit           | amit         | password  | HR Specialist|
| Ryan           | ryan         | password  | Recruiter    |
| Sara           | sara         | password  | Recruiter    |

- **Main Account**: No password required, read-only access.
- **Other accounts**: Use password `password`.

## Usage

1. Clone the repository and install dependencies:
   ```sh
   git clone https://github.com/Sweta1G/Mini-Hiring-Program
   cd mini-hiring-program
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open the app in your browser and log in using one of the above accounts.

## Features
- Candidate management (view, search by name/email, drag-and-drop pipeline)
- Job and assessment management
- Create, edit, and delete newly created assessments (original three assessments cannot be deleted)
- Role-based permissions (readonly/admin/HR)
- Modern UI with light/dark mode

## Notifications

- The app provides real-time notifications for key actions (e.g., moving candidates, creating/deleting assessments, etc.).
- Notifications appear in the top-right bell icon in the header. You can mark all as read, remove individual notifications, or clear all.

## Theme Toggle

- The app supports both light and dark themes.
- You can toggle between light and dark mode using the theme toggle button (moon/sun icon) in the header.
- Your theme preference is remembered across sessions.

## Notes
- No sign-up or registration is available. Use the provided credentials.
- For assessment submission, follow the instructions in your test prompt.
- Candidate profile timeline shows the name of the HR who performed each activity, so you can track who did what operations.

---

For any issues, please open an issue in this repository.
