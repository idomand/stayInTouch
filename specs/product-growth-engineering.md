# Product growth engineering — a starter guide

This guide is for a frontend developer with no marketing background. It explains what a product growth engineer does, and the core ideas you need. Every idea has an example from Stay-in-Touch.

The plan to add PostHog to this app is in `specs/posthog.md`.

## 1. What the role is

A **product growth engineer** builds changes whose goal is to move a number: more sign-ups, more people who reach the "aha moment", more people who come back next week. They then measure if the number really moved.

The difference from normal feature work:

| Feature engineer                    | Growth engineer                                                |
| ----------------------------------- | -------------------------------------------------------------- |
| "Build the link feature."           | "Linking should raise week-4 retention. Build it, then check." |
| Done when the feature ships.        | Done when the result is measured and a decision is made.       |
| Big features, planned months ahead. | Many small changes, each one a test.                           |
| Success = it works.                 | Success = the metric moved (or we learned why not).            |

Daily work is a loop:

1. **Look at data.** Where do users drop off?
2. **Form a hypothesis.** "If we do X, metric Y goes up, because Z."
3. **Build the smallest change** that tests it, usually behind a feature flag.
4. **Measure** with an experiment (A/B test).
5. **Decide:** ship it, kill it, or try a new version. Write down what you learned.

The skills are mostly engineering ones you already have: frontend, a bit of backend, clean event tracking, feature flags. The new parts are product thinking, a little statistics, and the habit of asking "how will we know this worked?" before you build.

## 2. The funnel: AARRR ("pirate metrics")

The most common model splits a user's life into five stages. The first letters spell AARRR.

| Stage           | Question                          | In Stay-in-Touch                                              |
| --------------- | --------------------------------- | ------------------------------------------------------------- |
| **Acquisition** | How do people find us?            | Visits to `/welcome`, from search, a friend, an invite email. |
| **Activation**  | Do they get value the first time? | Sign up → add a first contact → mark a first talk.            |
| **Retention**   | Do they come back?                | Users who mark a talk again in week 2, 3, 4…                  |
| **Referral**    | Do they bring others?             | Link requests sent → the friend signs up.                     |
| **Revenue**     | Do they pay?                      | Not relevant now (the app is free).                           |

A **funnel** is a chain of steps, and the **conversion rate** is the % of people who make it from one step to the next. Example:

```
/welcome visit   1000
sign_up            80   (8% of visits)
contact_added      60   (75% of sign-ups)
talk_marked        30   (50% of those)
```

The biggest drop is where to look first. Here, half of the people who add a contact never mark a talk. That is a better place to work on than the welcome page.

**Rule of thumb:** fix retention before acquisition. Bringing more people into a leaky bucket wastes them.

## 3. Key ideas

### North Star metric

One number that best shows the value users get. It keeps the team from chasing vanity numbers (like page views).

Proposal for this app: **weekly active talkers — users who marked at least one talk in the last 7 days.** It goes up only if people both stay and use the core feature.

### Aha moment and activation

The **aha moment** is when a new user first feels the value. For Stay-in-Touch it is probably: "I marked a talk, and I see who I should call next."

**Activation** is the measurable version: "a new user adds a first contact and marks a first talk within 7 days." Growth work often focuses here, because a user who never activates never retains.

### Retention and cohorts

A **cohort** is a group of users who share a start point, e.g. "everyone who signed up in the week of 2 Nov". A **retention chart** shows what % of each cohort is still active in week 1, 2, 3…

The shape matters more than the number. A curve that drops and then goes **flat** means a core group finds lasting value. A curve that falls to zero means the product is not sticky yet.

**Churn** is the opposite of retention: the % who stop using the app.

### Growth loops and referral

A **loop** is when using the product brings new users, who then use it and bring more. It grows on its own, unlike a funnel, which needs new input.

Stay-in-Touch already has one: **the link request**. A user sends a link request → the friend gets an email → signs up → links back → and may invite their own friends.

The **K-factor** measures it: `invites sent per user × % of invites that sign up`. K = 0.5 means every 2 users bring 1 new one. K > 1 means viral growth (rare).

To measure the loop you need to know which sign-ups came from an invite. That is what a **UTM parameter** does: `?utm_source=invite_email` on the link in the email. Analytics tools read it and show the source.

### Leading vs lagging metrics

Retention is a **lagging** metric: you wait weeks to see it. Growth teams look for a **leading** metric that predicts it and moves fast. Example: "users who add 3+ contacts in day 1 retain twice as well" (a made-up number — you would find the real one in the data). Then "contacts added on day 1" becomes the thing to push.

## 4. Measuring: events and analytics

### Page views vs events

- A **page view** says "someone opened /settings". Vercel Analytics gives you this today.
- An **event** says "someone did something": `contact_added`, `talk_marked`. Events are what funnels and experiments are built on.

### Naming events

Use one pattern and never break it. The common one is `object_action`, past tense, snake_case: `contact_added`, `link_request_sent`, `sign_up`. A messy taxonomy (`AddContact`, `contact-created`, `newContact`) makes the data useless after a few months.

**Properties** add detail to an event: `talk_marked { shared: true }`. Keep them few and typed. **Never put personal data in them** — no names, emails, note text.

### Identity

Every event belongs to a **distinct id**.

- Before sign-in, the tool makes up a random anonymous id.
- After sign-in, you call `identify(uid)`. The tool links the anonymous history to the user. Now the funnel "visited /welcome → signed up → added a contact" works across the sign-in.
- On logout you call `reset()`, so the next person on the same device is not mixed in.

### Client vs server events

- **Client events** (in the browser) see clicks and page views. Ad blockers drop some of them.
- **Server events** (in a Server Action) fire only on a real success, and nothing can block them. Use them for important actions like `contact_added`.

### Analysis types you will use

- **Trends:** how many `talk_marked` per day.
- **Funnels:** conversion step by step (section 2).
- **Retention:** cohort charts (section 3).
- **Paths:** what people do after a given page.

### Qualitative tools

Numbers say _where_ users drop off. They do not say _why_. For that:

- **Session replay:** a video-like replay of a real session. You see the confusion.
- **Surveys:** a one-question pop-up ("What almost stopped you from signing up?").
- **Talking to users.** Still the best tool.

## 5. Experiments (A/B testing)

### Feature flag vs experiment

- A **feature flag** is a switch in code: `if (flag) showNewThing()`. It is set remotely, per user, with no deploy. Used for safe rollouts ("turn on for 10%") and quick kill switches.
- An **experiment** is a feature flag with variants and a goal. Users are split at random into **control** (the current version) and **test** (the new one). The tool compares a metric between the groups.

Random split is the key. It is the only way to know the change _caused_ the difference, and not the season, a blog post, or a bug elsewhere.

### Hypothesis template

Write it before you build:

> **Because** we saw [data], **we believe** [change] **will** [move metric] **for** [users].
> We will know it worked when [primary metric] changes by [amount].

Example for this app:

> Because many `/welcome` visitors leave without clicking anything, we believe making "Try the demo" the main button will raise sign-ups for new visitors. We will know it worked when `sign_up` per welcome visitor goes up.

### Metrics in an experiment

- **Primary metric:** the one number that decides. Pick it before the test starts. Only one.
- **Secondary metrics:** help explain the result (`demo_started`).
- **Guardrail metrics:** must not get worse (e.g. activation, errors, page load time). A change that raises sign-ups but halves activation is a loss.

### Statistics — the minimum you need

- **Statistical significance:** how sure we are that the difference is real and not luck. Tools usually show it as a probability ("95% chance test beats control"). Wait for a high value before you decide.
- **Sample size:** small differences need many users to detect. Rough feel: to detect a change from 8% to 10% conversion, you need around 3,000 users **per variant**.
- **MDE (minimum detectable effect):** the smallest change your traffic can detect in a reasonable time. Low traffic → only big effects are detectable.
- **Do not peek and stop early.** If you check every day and stop the first time it looks good, you will "find" winners that are just noise. Decide the duration up front (at least 1–2 full weeks, to cover weekdays and weekends) and stick to it.
- **One change per test.** If you change the button text and the colour and the layout, you will not know which one mattered.

### Flicker

If the variant is chosen in the browser after the page loads, users can see the control for a moment and then the test version jump in. It looks broken and it can bias the result. Fixes: decide the variant on the server, or "bootstrap" the flags into the page. For our first test we accept the flicker and fix it later.

## 6. Honest limits for this app

- **Traffic is low.** With a few hundred visitors a month, most A/B tests will **never** reach significance. The first experiment is to learn the mechanics (flags, variants, exposure, results), not to get a reliable answer.
- **Consent lowers the sample.** Only users who accept analytics are counted. Often 30–60% decline.
- **With low traffic, other methods work better:** watch session replays, talk to 5 users, look at funnels, and ship clear improvements without a test. Test only what is truly uncertain.

## 7. Privacy as a constraint

Growth work in the EU is shaped by law. This app has German users, so:

- **GDPR** covers any data about a person, including a pseudonymous id like a Firebase uid.
- **TDDDG** (German law, based on the EU ePrivacy rules): storing anything on the user's device (cookie, localStorage) that is not strictly needed for the app to work **needs consent first**. Analytics is not strictly needed.
- So: no analytics cookie until the user clicks **Accept**. "Decline" must be as easy as "Accept", and the user must be able to change their mind later (we put this on `/settings`).
- Use an EU data region (PostHog EU Cloud) and list the provider on `/privacy`.
- **Never send personal data in events.** No names, emails, contact names, notes.

This is not legal advice. For a real business, check with a lawyer.

## 8. Glossary

| Term              | Meaning                                                              |
| ----------------- | -------------------------------------------------------------------- |
| A/B test          | Experiment with a random split into control and test.                |
| Activation        | A new user reaches first value.                                      |
| Churn             | % of users who stop using the product.                               |
| Cohort            | Group of users with a shared start (e.g. sign-up week).              |
| Control / variant | Current version / new version in an experiment.                      |
| Conversion rate   | % of people who move from one step to the next.                      |
| CTA               | Call to action — the button you want people to click.                |
| DAU / WAU / MAU   | Daily / weekly / monthly active users.                               |
| Distinct id       | The id an analytics tool links events to.                            |
| Exposure          | The moment a user is shown a variant. Only exposed users count.      |
| Feature flag      | Remote switch that turns code on or off per user.                    |
| Funnel            | Chain of steps, with drop-off at each one.                           |
| Guardrail metric  | A metric that must not get worse in a test.                          |
| K-factor          | Invites per user × invite conversion. Measures viral growth.         |
| MDE               | Minimum detectable effect — smallest change a test can reliably see. |
| North Star metric | One number that best shows user value.                               |
| Retention         | % of a cohort still active after N days or weeks.                    |
| Significance      | How sure we are a difference is not luck.                            |
| UTM parameters    | `?utm_source=…` tags on a link that show where a visit came from.    |
| Vanity metric     | A number that looks good but drives no decision (total page views).  |

## 9. Reading list

- **"Hacking Growth"** — Sean Ellis, Morgan Brown. The classic book on growth teams and the experiment loop.
- **Reforge blog** (reforge.com/blog) — growth loops, retention, activation.
- **Lenny's Newsletter** (lennysnewsletter.com) — practical product and growth posts; many free.
- **PostHog blog and docs** (posthog.com/blog, posthog.com/docs/experiments) — written for engineers; good on A/B test statistics and event design.
- **"Trustworthy Online Controlled Experiments"** — Kohavi, Tang, Xu. The deep reference on A/B testing, for later.
