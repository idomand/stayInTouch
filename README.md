# Stay-in-Touch

Live app: **https://stay-in-touch.vercel.app/**

![](https://img.shields.io/badge/Framework-Next.js%2016-informational?style=flat&logo=next.js&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Library-React%2019-informational?style=flat&logo=react&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Language-TypeScript-informational?style=flat&logo=typescript&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Backend-Firebase-informational?style=flat&logo=firebase&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Styling-styled--components-informational?style=flat&logo=styledcomponents&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/PWA-installable%20%26%20offline-informational?style=flat&logo=pwa&logoColor=white&color=2bbc8a)

## Description

Stay in touch with the friends and family you care about.

As working adults, it's easy to wake up one day and realize you haven't spoken
to a good friend in months. **Stay-in-Touch** lets you add the people you want to
keep up with and set how often you'd like to reach out — then it keeps your
contact list sorted by who you're most overdue to talk to, so you always know
who's next.

The project is a **PWA (Progressive Web App)**: it can be installed and used
offline on Android, PC, or Mac.

![](public/Stay_In_Touch.PNG)

## Features

- 🔐 **Google sign-in** — one-click authentication via Firebase Auth.
- 👥 **Contacts with cadence** — add a contact, choose how often you want to
  talk to them, and the list automatically sorts by who you're most overdue
  to reach out to.
- 📝 **Per-contact notes** — jot down and edit notes for each person; a
  "Talked on: …" note is added automatically when you reset a contact's timer.
- 📅 **Google Calendar reminders** — create a pre-filled calendar event to
  remind yourself to call a contact, optionally inviting their email.
- 📲 **Installable & offline** — full PWA support via `next-pwa`.
- 🧪 **Demo data** — load a few sample contacts from the About page to try the
  app instantly.

## Tech Stack

| Area      | Technology                                                                          |
| --------- | ----------------------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org/) (Pages Router)                                    |
| UI        | [React 19](https://react.dev/)                                                      |
| Language  | [TypeScript](https://www.typescriptlang.org/)                                       |
| Backend   | [Firebase](https://firebase.google.com/) — Auth + Firestore                         |
| Styling   | [styled-components](https://styled-components.com/) (CSS-in-JS design system)       |
| PWA       | [next-pwa](https://github.com/shadowwalker/next-pwa)                                |
| Dates     | [date-fns](https://date-fns.org/), [react-datepicker](https://reactdatepicker.com/) |

## Project Structure

```
Components/    Reusable UI + feature components (styled-components inlined)
lib/           Firebase setup, auth context, Firestore & Calendar helpers
pages/         Next.js routes (/, /login, /about)
styles/        Theme, typography, and global styles
types/         Shared TypeScript types
utils/hooks/   Custom hooks (e.g. Firestore snapshot subscription)
public/        Static assets, icons, and PWA manifest
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
