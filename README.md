# Stay-in-Touch

Live app: **https://stay-in-touch.vercel.app/**

![](https://img.shields.io/badge/Framework-Next.js%2016-informational?style=flat&logo=next.js&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Library-React%2019-informational?style=flat&logo=react&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Language-TypeScript-informational?style=flat&logo=typescript&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Auth-Firebase-informational?style=flat&logo=firebase&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Database-Neon%20Postgres-informational?style=flat&logo=postgresql&logoColor=white&color=2bbc8a)
![](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-informational?style=flat&logo=tailwindcss&logoColor=white&color=2bbc8a)

## Description

Stay in touch with the friends and family you care about.

As working adults, it's easy to wake up one day and realize you haven't spoken
to a good friend in months. **Stay-in-Touch** lets you add the people you want to
keep up with and set how often you'd like to reach out — then it keeps your
contact list sorted by who you're most overdue to talk to, so you always know
who's next.

Today it is a regular web app: it cannot be installed and does not work offline.
Making it an installable **PWA (Progressive Web App)** is planned.

![](public/Stay_In_Touch.PNG)

## Features

- 🔐 **Sign-in** — Google, or email and password with a verified email, via
  Firebase Auth.
- 👥 **Contacts with cadence** — add a contact, choose how often you want to
  talk to them, and the list automatically sorts by who you're most overdue
  to reach out to.
- 📝 **Per-contact notes** — jot down and edit notes for each person.
- 🗓️ **Talk history** — each time you mark that you talked, it is saved, and the
  timer restarts from that date.
- 📅 **Google Calendar reminders** — create a pre-filled calendar event to
  remind yourself to call a contact, optionally inviting their email.
- 🔗 **Linked friends** — link a contact with a friend who also uses the app.
  When either of you marks a talk, both timers restart. Only the talk is
  shared; notes and settings stay private.

## Tech Stack

| Area      | Technology                                                                          |
| --------- | ----------------------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router)                                       |
| UI        | [React 19](https://react.dev/)                                                      |
| Language  | [TypeScript](https://www.typescriptlang.org/)                                       |
| Auth      | [Firebase Auth](https://firebase.google.com/) — client SDK + Admin session cookies  |
| Database  | [Neon Postgres](https://neon.tech/) via [Drizzle ORM](https://orm.drizzle.team/)    |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com/)                                          |
| Dates     | [date-fns](https://date-fns.org/), [react-datepicker](https://reactdatepicker.com/) |

## Project Structure

```
Components/    Reusable UI + feature components (Tailwind utility classes)
lib/           Firebase setup, auth context, Calendar helpers
lib/auth/      Server identity (Firebase session cookies)
lib/db/        Drizzle client, schema, migrations and queries (server only)
lib/actions/   Server Actions for contact, note and link writes
app/           Next.js App Router routes (/, /settings, /login, /about, /privacy, /api/auth/session)
styles/        Global styles (Tailwind theme tokens and animations)
types/         Global type declarations
public/        Static assets, icons, and a web app manifest (PWA support is planned)
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
