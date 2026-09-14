---
description: Create a feature spec file from a short idea
argument-hint: Short feature description
allowed-tools: Read, Write, Glob
---

You are helping to spin up a new feature spec for this application, from a short idea provided in the user input below. Always adhere to
any rules or requirements set out in any CLAUDE.md files when responding.

User input: $ARGUMENTS

## High level behavior

Your job will be to turn the user input above into:

- A human friendly feature title in kebab-case (e.g. new-heist-form)
- A detailed markdown spec file under the \specs/ directory

Then save the spec file to disk and print a short summary of what you did.

## Step 1. Parse the arguments

1. `feature_title`
   - A short, human readable title in Title Case.
   - Example: "Card Component for Dashboard Stats".

2. `feature_slug`:
   - A file safe slug.
   - Rules:
     - Lowercase
     - Kebab-case
     - Only `a-z`, `0-9` and `-`
     - Replace spaces and punctuation with `-`
     - Collapse multiple `-` into one
     - Trim `-` from start and end
     - Maximum length 40 characters
   - Example: `card-component` or `card-component-dashboard`.

If you cannot infer a sensible `feature_title` and `feature_slug`, ask the user to clarify instead of guessing.

## Step 2. Draft the spec content

Create a markdown spec document that Plan mode can use directly and save it in the \_specs folder using the `feature_slug`. Use the exact
structure as defined in the spec template file here: @\specs/template.md. Do not add technical implementation details such as code examples.

## Step 3. Final output to the user

After the file is saved, respond to the user with a short summary in this exact format:

Spec file: specs/<feature_slug>.md
Title: <feature_title>

Do not repeat the full spec in the chat output unless the user explicitly asks to see it. The main goal is to save the spec file and report
where it lives.
