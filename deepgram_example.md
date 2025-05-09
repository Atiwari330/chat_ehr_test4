Directory structure:
└── deepgram-starters-nextjs-live-transcription.git/
    ├── README.md
    ├── CHANGELOG.md
    ├── CODE_OF_CONDUCT.md
    ├── commitlint.config.js
    ├── CONTRIBUTING.md
    ├── declarations.d.ts
    ├── deepgram.toml
    ├── KNOWN_ISSUES.md
    ├── LICENSE
    ├── middleware.ts
    ├── next.config.js
    ├── package.json
    ├── postcss.config.js
    ├── sample.env.local
    ├── SECURITY.md
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── .eslintrc.json
    ├── .releaserc.json
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── api/
    │   │   └── authenticate/
    │   │       └── route.ts
    │   ├── components/
    │   │   ├── App.tsx
    │   │   ├── Visualizer.tsx
    │   │   └── icons/
    │   │       ├── BoltIcon.tsx
    │   │       ├── CaretIcon.tsx
    │   │       ├── CogIcon.tsx
    │   │       ├── DownloadIcon.tsx
    │   │       ├── ExclamationIcon.tsx
    │   │       ├── FacebookIcon.tsx
    │   │       ├── LinkedInIcon.tsx
    │   │       ├── MicrophoneIcon.tsx
    │   │       ├── SendIcon.tsx
    │   │       └── XIcon.tsx
    │   ├── context/
    │   │   ├── DeepgramContextProvider.tsx
    │   │   └── MicrophoneContextProvider.tsx
    │   └── fonts/
    │       ├── ABCFavorit-Bold.otf
    │       ├── ABCFavorit-Bold.woff
    │       └── ABCFavorit-Bold.woff2
    ├── public/
    └── .github/
        ├── dependabot.yml
        ├── ISSUE_TEMPLATE/
        │   ├── bug_report.md
        │   ├── config.yml
        │   └── feature-request.md
        ├── PULL_REQUEST_TEMPLATE/
        │   └── pull_request_template.md
        └── workflows/
            └── release.yml


Files Content:

================================================
FILE: README.md
================================================
# Next.js Live Transcription Starter

[![Discord](https://dcbadge.vercel.app/api/server/xWRaCDBtW4?style=flat)](https://discord.gg/xWRaCDBtW4)

The purpose of this demo is to showcase how you can build a NextJS speech to text app using [Deepgram](https://deepgram.com/).

## Live Demo
You can see the demo in action on Vercel: https://nextjs-live-transcription.vercel.app/

## Demo features

Capture streaming audio using [Deepgram Streaming Speech to Text](https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio).

## What is Deepgram?

[Deepgram’s](https://deepgram.com/) voice AI platform provides APIs for speech-to-text, text-to-speech, and full speech-to-speech voice agents. Over 200,000+ developers use Deepgram to build voice AI products and features.

## Sign-up to Deepgram

Want to start building using this project? [Sign-up now for Deepgram and create an API key](https://console.deepgram.com/signup?jump=keys).

## Quickstart

### Manual

Follow these steps to get started with this starter application.

#### Clone the repository

Go to GitHub and [clone the repository](https://github.com/deepgram-starters/nextjs-live-transcription).

#### Install dependencies

Install the project dependencies.

```bash
npm install
```

#### Edit the config file

Copy the code from `sample.env.local` and create a new file called `.env.local`.

```bash
DEEPGRAM_API_KEY=YOUR-DG-API-KEY
```

For `DEEPGRAM_API_KEY` paste in the key you generated in the [Deepgram console](https://console.deepgram.com/).

#### Run the application

Once running, you can [access the application in your browser](http://localhost:3000).

```bash
npm run dev
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Security Policy](./SECURITY.md) details the procedure for contacting Deepgram.


## Getting Help

We love to hear from you so if you have questions, comments or find a bug in the project, let us know! You can either:

- [Open an issue in this repository](https://github.com/deepgram-starters/nextjs-live-transcription/issues)
- [Join the Deepgram Github Discussions Community](https://github.com/orgs/deepgram/discussions)
- [Join the Deepgram Discord Community](https://discord.gg/xWRaCDBtW4)

## Author

[Deepgram](https://deepgram.com)

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.



================================================
FILE: CHANGELOG.md
================================================
Change Log

## [1.0.2](https://github.com/deepgram-starters/nextjs-live-transcription/compare/1.0.1...1.0.2) (2024-07-11)


### Bug Fixes

* iOS Safari crash fix ([ef87b92](https://github.com/deepgram-starters/nextjs-live-transcription/commit/ef87b9211ed91c46e560c4f4e50ca8cd8687af13))

## [1.0.1](https://github.com/deepgram-starters/nextjs-live-transcription/compare/1.0.0...1.0.1) (2024-05-04)


### Bug Fixes

* cannot set caption to undefined as it was strict string ([8c76d48](https://github.com/deepgram-starters/nextjs-live-transcription/commit/8c76d48c819bab0faa7219a7d76a064b2e7000d6))

# 1.0.0 (2024-05-04)


### Bug Fixes

* change the label on the playground box ([9e37111](https://github.com/deepgram-starters/nextjs-live-transcription/commit/9e37111b3a0fb7a2e1c3ff8db26aa4b7631ade8f))
* enable smart_format ([4ed2519](https://github.com/deepgram-starters/nextjs-live-transcription/commit/4ed25197eb7a0b9b1c47950df75821339a2ef242))
* fix dependency issue ([bfe2be6](https://github.com/deepgram-starters/nextjs-live-transcription/commit/bfe2be6d775f9a7142800d1cc191166af0ac1d8a))
* fix incorrect url ([e7e7536](https://github.com/deepgram-starters/nextjs-live-transcription/commit/e7e753637fa89cd1865705e6b497671433b1cbf0))
* loading alignment was off-center ([fcccf07](https://github.com/deepgram-starters/nextjs-live-transcription/commit/fcccf074746dc1afcf72b9de25da714fe312d251))
* remove unused code - whoops ([1f9cdc7](https://github.com/deepgram-starters/nextjs-live-transcription/commit/1f9cdc7bc1f87d9d0bb58774dbf27e52cb8508ba))


### Features

* apply some feedback ([230d265](https://github.com/deepgram-starters/nextjs-live-transcription/commit/230d2651324d4a7a8ca93487e2ea23dc3f65bc0f))
* initial commit working next.js demo ([a3faf0f](https://github.com/deepgram-starters/nextjs-live-transcription/commit/a3faf0ffa03773ed668890aba5c6c75414a6f2b8))
* update title and description ([cc510ea](https://github.com/deepgram-starters/nextjs-live-transcription/commit/cc510ea42591b8a818c103176740e03924767703))



================================================
FILE: CODE_OF_CONDUCT.md
================================================
# Code of Conduct

The Deepgram developer community is filled with amazing, clever and creative people, and we're excited for you to join us. Our goal is to create safe and inclusive spaces, have meaningful conversations, and explore ways to make sure that every voice is heard and understood.

#### Being a Good Community Member

Because we prioritize creating a safe space for our members, we believe in actively working on how we, as individuals, can ensure a positive community environment through our own actions and mindsets.

Every supportive community starts with each member. We feel it’s important to be open to others, respectful, and supportive. As part of the Deepgram community, please begin by thinking carefully about and agreeing with the following statements:

- I will be welcoming to everyone at the table;
- I will be patient and open to learning from everyone around me;
- I will treat everyone with respect, because they deserve it;
- I will be mindful of the needs and boundaries of others;

We strive to create a space where we learn and grow together. Here are some other key things you can do to make the community great:

### BE HUMBLE

People come from all different places, and it’s best not to make assumptions about what they think or feel. Approach others with curiosity and openness. We **all** have a lot to learn from each other.

### BE HELPFUL

If someone asks for help, consider jumping in. You don’t have to be an expert to talk through a problem, suggest a resource, or help find a solution. We all have something to contribute.

### ENCOURAGE OTHERS

There’s no one path to have a career in technology or to this community. Let’s engage others in ways that create opportunities for learning and fun for all of us.

## Our Pledge

Everyone who participates in our community must agree to abide by our Code of Conduct. By agreeing, you help create a welcoming, respectful, and friendly community based on respect and trust. We are committed to creating a harassment-free community.

These rules will be strictly enforced in any and all of our official spaces, including direct messages, social media, and physical and virtual events. Everyone who participates in these spaces is required to agree to this community code. We also ask and expect community members to observe these rules anywhere the community is meeting (for example, online chats on unofficial platforms or event after-parties).

## Our Standards

### BE RESPECTFUL

Exercise consideration and respect in your speech and actions. Be willing to accept and give feedback gracefully.

Don’t make offensive comments related to gender, gender identity and expression, sexual orientation, disability, mental illness, neuro(a)typicality, physical appearance, body size, race, ethnicity, immigration status, religion, experience level, socioeconomic status, nationality, or other identity markers.

Additionally, don’t insult or demean others. This includes making unwelcome comments about a person’s lifestyle choices and practices, including things related to diet, health, parenting, drugs, or employment. It’s not okay to insult or demean others if it’s "just a joke."

### BE WELCOMING AND OPEN

Encourage others, be supportive and willing to listen, and be willing to learn from others’ perspectives and experiences. Lead with empathy and kindness.

Don’t engage in gatekeeping behaviors, like questioning the intelligence or knowledge of others as a way to prove their credentials. And don’t exclude people for prejudicial reasons.

### RESPECT PRIVACY

Do not publish private communications without consent. Additionally, never disclose private aspects of a person’s personal identity without consent, except as necessary to protect them from intentional abuse.

### RESPECT PERSONAL BOUNDARIES

Do not introduce gratuitous or off-topic sexual images, languages, or behavior in spaces where they are not appropriate. Never make physical contact or simulated physical contact without consent or after a request to stop. Additionally, do not continue to message others about anything if they ask you to stop or leave them alone.

#### BE A GOOD NEIGHBOR

Contribute to the community in a positive and thoughtful way. Consider what’s best for the overall community. Do not make threats of violence, intimidate others, incite violence or intimidation against others, incite self-harm, stalk, follow, or otherwise harass others. Be mindful of your surroundings and of your fellow participants.

Alert community leaders if you notice a dangerous situation, someone in distress, or violations of this Code of Conduct, even if they seem inconsequential.

# Additional rules for online spaces

For Deepgram’s official online spaces, like our YouTube & Twitch chats, we have some additional rules. Any of the following behaviors can result in a ban without warning.

### DON'T SPAM

Don't spam. We'll ban you.

### KEEP IT LEGAL

If it’s illegal, it’s not allowed on our websites or in our online spaces. Please don’t share links to pirated material or other nefarious things.

### NO TROLLING

Please be earnest. Don’t use excessive sarcasm to annoy or undermine other people. And don’t bait them with bad faith comments or abuse.

### PORNOGRAPHY AND OTHER NSFW STUFF

Please don’t post it or link to it. It doesn’t belong in our online spaces.

### FOUL AND GRAPHIC LANGUAGE

Please do not use excessive curse words. Additionally, do not use graphic sexual or violent language — again, think of our spaces as places for people of all ages.

# Enforcement & Reporting

If you are being harassed by a member of the Deepgram developer community, if you observe someone else being harassed, or you experience actions or behaviors that are contrary to our Code of Conduct, please report the behavior by contacting our team at [devrel@deepgram.com](mailto:devrel@deepgram.com).

## Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining the consequences for any action they deem in violation of this Code of Conduct:

### 1. Correction

**_Community Impact:_** Use of inappropriate language or other behavior deemed unprofessional or unwelcome in the community.

**_Consequence:_** A private, written warning from community leaders, providing clarity around the nature of the violation and an explanation of why the behavior was inappropriate. A public apology may be requested.

### 2. Warning

**_Community Impact:_** A violation through a single incident or series of actions.

**_Consequence:_** A warning with consequences for continued behavior. No interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, for a specified period of time. This includes avoiding interactions in community spaces as well as external channels like social media. Violating these terms may lead to a temporary or permanent ban.

### 3. Temporary Ban

**_Community Impact:_** A serious violation of community standards, including sustained inappropriate behavior.

**_Consequence:_** A temporary ban from any sort of interaction or public communication with the community for a specified period of time. No public or private interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, is allowed during this period. Violating these terms may lead to a permanent ban.

### 4. Permanent Ban

**_Community Impact:_** Demonstrating a pattern of violation of community standards, including sustained inappropriate behavior, harassment of an individual, or aggression toward or disparagement of classes of individuals.

**_Consequence:_** A permanent ban from any sort of public interaction within the community.

# Attribution

This Code of Conduct is adapted from:

- Contributor Covenant, version 2.0, available at https://www.contributor-covenant.org/version/2/0/code_of_conduct
- https://eventhandler.community/conduct/, which itself is inspired by Quest, who in turn provides credit to Scripto, the #botALLY Code of Conduct, the LGBTQ in Tech code of Conduct, and the XOXO Code of Conduct.

Community Impact Guidelines, which were copied from InnerSource Commons, were inspired by Mozilla’s code of conduct enforcement ladder.

For answers to common questions about this code of conduct, see the FAQ at https://www.contributor-covenant.org/faq. Translations are available at https://www.contributor-covenant.org/translations.



================================================
FILE: commitlint.config.js
================================================
module.exports = { extends: ["@commitlint/config-conventional"] };



================================================
FILE: CONTRIBUTING.md
================================================
# Contributing Guidelines

Want to contribute to this project? We ❤️ it!

Here are a few types of contributions that we would be interested in hearing about.

- Bug fixes
  - If you find a bug, please first report it using Github Issues.
  - Issues that have already been identified as a bug will be labeled `🐛 bug`.
    - If you'd like to submit a fix for a bug, send a Pull Request from your own fork and mention the Issue number.
      - Include a test that isolates the bug and verifies that it was fixed.
- New Features
  - If you'd like to accomplish something in the extension that it doesn't already do, describe the problem in a new Github Issue.
    - Issues that have been identified as a feature request will be labeled `✨ enhancement`.
    - If you'd like to implement the new feature, please wait for feedback from the project maintainers before spending
      too much time writing the code. In some cases, `✨ enhancement`s may not align well with the project objectives at
      the time.
- Tests, Documentation, Miscellaneous
  - If you think the test coverage could be improved, the documentation could be clearer, you've got an alternative
    implementation of something that may have more advantages, or any other change we would still be glad hear about
    it.
    - If its a trivial change, go ahead and send a Pull Request with the changes you have in mind
    - If not, open a Github Issue to discuss the idea first.
- Snippets
  - To add snippets:
    - Add a directory in the `snippets` folder with the name of the language.
    - Add one or more files in the language directory with snippets.
    - Update the `package.json` to include the snippets you added.

We also welcome anyone to work on any existing issues with the `👋🏽 good first issue` tag.

## Requirements

For a contribution to be accepted:

- The test suite must be complete and pass
- Code must follow existing styling conventions
- Commit messages must be descriptive. Related issues should be mentioned by number.

If the contribution doesn't meet these criteria, a maintainer will discuss it with you on the Issue. You can still
continue to add more commits to the branch you have sent the Pull Request from.

## How To

1. Fork this repository on GitHub.
1. Clone/fetch your fork to your local development machine.
1. Create a new branch (e.g. `issue-12`, `feat.add_foo`, etc) and check it out.
1. Make your changes and commit them. (Did the tests pass? No linting errors?)
1. Push your new branch to your fork. (e.g. `git push myname issue-12`)
1. Open a Pull Request from your new branch to the original fork's `main` branch.



================================================
FILE: declarations.d.ts
================================================
interface Window {
  webkitAudioContext: typeof AudioContext;
}



================================================
FILE: deepgram.toml
================================================
[meta]
title = "Next.js Live Transcription Starter"
description = "Get started using Deepgram's Live Transcription with this Next.js demo app"
author = "Deepgram DX Team <devrel@deepgram.com> (https://developers.deepgram.com)"
useCase = "Live"
language = "JavaScript"
framework = "Next"

[build]
command = "npm install"

[config]
sample = "sample.env.local"
output = ".env.local"

[post-build]
message = "Run `npm run dev` to get up and running locally."



================================================
FILE: KNOWN_ISSUES.md
================================================
# Known Issues

This is a list of known issues. For the latest list of all issues see the [Github Issues page](https://github.com/deepgram-startrs/nextjs-live-transcription/issues).



================================================
FILE: LICENSE
================================================
MIT License

Copyright (c) 2023 Deepgram

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



================================================
FILE: middleware.ts
================================================
import { NextResponse, type NextRequest } from "next/server";

const corsOptions: {
  allowedMethods: string[];
  allowedOrigins: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge?: number;
  credentials: boolean;
} = {
  allowedMethods: (process.env?.ALLOWED_METHODS || "").split(","),
  allowedOrigins: (process.env?.ALLOWED_ORIGIN || "").split(","),
  allowedHeaders: (process.env?.ALLOWED_HEADERS || "").split(","),
  exposedHeaders: (process.env?.EXPOSED_HEADERS || "").split(","),
  maxAge:
    (process.env?.PREFLIGHT_MAX_AGE &&
      parseInt(process.env?.PREFLIGHT_MAX_AGE)) ||
    undefined, // 60 * 60 * 24 * 30, // 30 days
  credentials: process.env?.CREDENTIALS == "true",
};

/**
 * Middleware function that handles CORS configuration for API routes.
 *
 * This middleware function is responsible for setting the appropriate CORS headers
 * on the response, based on the configured CORS options. It checks the origin of
 * the request and sets the `Access-Control-Allow-Origin` header accordingly. It
 * also sets the other CORS-related headers, such as `Access-Control-Allow-Credentials`,
 * `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, and
 * `Access-Control-Expose-Headers`.
 *
 * The middleware function is configured to be applied to all API routes, as defined
 * by the `config` object at the end of the file.
 */
export function middleware(request: NextRequest) {
  // Response
  const response = NextResponse.next();

  // Allowed origins check
  const origin = request.headers.get("origin") ?? "";
  if (
    corsOptions.allowedOrigins.includes("*") ||
    corsOptions.allowedOrigins.includes(origin)
  ) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  // Set default CORS headers
  response.headers.set(
    "Access-Control-Allow-Credentials",
    corsOptions.credentials.toString()
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    corsOptions.allowedMethods.join(",")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    corsOptions.allowedHeaders.join(",")
  );
  response.headers.set(
    "Access-Control-Expose-Headers",
    corsOptions.exposedHeaders.join(",")
  );
  response.headers.set(
    "Access-Control-Max-Age",
    corsOptions.maxAge?.toString() ?? ""
  );

  // Return
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/authenticate",
};



================================================
FILE: next.config.js
================================================
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
};

module.exports = nextConfig;



================================================
FILE: package.json
================================================
{
  "name": "nextjs-live-transcription",
  "version": "1.0.2",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@deepgram/sdk": "^3.3.0",
    "classnames": "^2.5.1",
    "next": "^14.1.3",
    "react": "^18",
    "react-device-detect": "^2.2.3",
    "react-dom": "^18",
    "react-github-btn": "^1.4.0",
    "react-syntax-highlighter": "^15.5.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.1.0",
    "@commitlint/config-conventional": "^19.1.0",
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/git": "^10.0.1",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.1",
    "husky": "^9.0.11",
    "postcss": "^8",
    "pretty-quick": "^4.0.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  },
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}



================================================
FILE: postcss.config.js
================================================
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}



================================================
FILE: sample.env.local
================================================
DEEPGRAM_API_KEY=



================================================
FILE: SECURITY.md
================================================
# Security Policy

Deepgram's security policy can be found on our main website.

[Deepgram Security Policy](https://developers.deepgram.com/documentation/security/security-policy/)



================================================
FILE: tailwind.config.ts
================================================
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        // Bounces 5 times 1s equals 5 seconds
        "ping-short": "ping 1s ease-in-out 5",
      },
      screens: {
        betterhover: { raw: "(hover: hover)" },
      },
      transitionProperty: {
        height: "height",
        width: "width",
      },
      dropShadow: {
        glowBlue: [
          "0px 0px 2px #000",
          "0px 0px 4px #000",
          "0px 0px 30px #0141ff",
          "0px 0px 100px #0141ff80",
        ],
        glowRed: [
          "0px 0px 2px #f00",
          "0px 0px 4px #000",
          "0px 0px 15px #ff000040",
          "0px 0px 30px #f00",
          "0px 0px 100px #ff000080",
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        favorit: ["var(--font-favorit)"],
        inter: ["Inter", "Arial", "sans serif"],
      },
    },
  },
};
export default config;



================================================
FILE: tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "es2015",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}



================================================
FILE: .eslintrc.json
================================================
{
  "extends": "next/core-web-vitals"
}



================================================
FILE: .releaserc.json
================================================
{
  "branches": [
    { "name": "main" },
    { "name": "next", "channel": "next", "prerelease": true },
    { "name": "rc", "channel": "rc", "prerelease": true },
    { "name": "beta", "channel": "beta", "prerelease": true },
    { "name": "alpha", "channel": "alpha", "prerelease": true }
  ],
  "tagFormat": "${version}",
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        "npmPublish": false
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md",
        "changelogTitle": "Change Log"
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "CHANGELOG.md"]
      }
    ],
    "@semantic-release/github"
  ]
}



================================================
FILE: app/globals.css
================================================
@tailwind base;
@tailwind components;
@tailwind utilities;

/**
 * General stuff
 */
:root {
  background: #0b0b0c;
  font-size: 16px;
  color-scheme: dark;
}

@media only screen and (min-width: 2000px) {
  :root {
    font-size: 22px;
  }
}

body {
  color: rgba(255, 255, 255, 0.87);
  background: #0b0b0c url("/bg.svg") no-repeat top center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}

* {
  /* outline: 1px solid red; */
}

@layer utilities {

  .gradient-shadow {
    box-shadow:
      -1rem 0px 2rem 0px #13ef9335,
      1rem 0px 2rem 0px #149afb35;
  }
}

/* Additional vertical padding used by kbd tag. */
.py-05 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}



================================================
FILE: app/layout.tsx
================================================
import { Inter } from "next/font/google";
import classNames from "classnames";
import localFont from "next/font/local";

import { DeepgramContextProvider } from "./context/DeepgramContextProvider";
import { MicrophoneContextProvider } from "./context/MicrophoneContextProvider";

import "./globals.css";

import type { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });
const favorit = localFont({
  src: "./fonts/ABCFavorit-Bold.woff2",
  variable: "--font-favorit",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  width: "device-width",
  // maximumScale: 1, hitting accessability
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aura-tts-demo.deepgram.com"),
  title: "Deepgram AI Agent",
  description: `Deepgram's AI Agent Demo shows just how fast Speech-to-Text and Text-to-Speech can be.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-dvh">
      <body
        className={`h-full dark ${classNames(
          favorit.variable,
          inter.className
        )}`}
      >
        <MicrophoneContextProvider>
          <DeepgramContextProvider>{children}</DeepgramContextProvider>
        </MicrophoneContextProvider>
      </body>
    </html>
  );
}



================================================
FILE: app/page.tsx
================================================
"use client";

import Image from "next/image";
import App from "./components/App";
import { XIcon } from "./components/icons/XIcon";
import { LinkedInIcon } from "./components/icons/LinkedInIcon";
import { FacebookIcon } from "./components/icons/FacebookIcon";
import GitHubButton from "react-github-btn";

const Home = () => {
  return (
    <>
      <div className="h-full overflow-hidden">
        {/* height 4rem */}
        <div className="bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px] h-[4rem] flex items-center">
          <header className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <a className="flex items-center" href="/">
                <Image
                  className="w-auto h-8 max-w-[12.5rem] sm:max-w-none"
                  src="/deepgram.svg"
                  alt="Deepgram Logo"
                  width={0}
                  height={0}
                  priority
                />
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="mt-1">
                <GitHubButton
                  href="https://github.com/deepgram-starters/nextjs-live-transcription"
                  data-color-scheme="no-preference: light; light: light; dark: light;"
                  data-size="large"
                  data-show-count="true"
                  aria-label="Star deepgram-starters/nextjs-live-transcription on GitHub"
                >
                  Star
                </GitHubButton>
              </span>

              <span className="gradient-shadow bg-gradient-to-r to-[#13EF93]/50 from-[#149AFB]/80 rounded">
                <a
                  href="https://console.deepgram.com/signup?jump=keys"
                  target="_blank"
                  className="hidden text-xs md:inline-block bg-black text-white rounded m-px px-8 py-2 font-semibold"
                >
                  Get an API Key
                </a>
              </span>
            </div>
          </header>
        </div>

        {/* height 100% minus 8rem */}
        <main className="mx-auto px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem]">
          <App />
        </main>

        {/* height 4rem */}
        <div className="bg-black/80 h-[4rem] flex items-center absolute w-full">
          <footer className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-center gap-4 md:text-xl font-inter text-[#8a8a8e]">
            <span className="text-base text-[#4e4e52]">share it</span>
            <a
              href="#"
              onClick={(e) => {
                window.open(
                  "https://twitter.com/intent/tweet?text=%F0%9F%94%A5%F0%9F%8E%89%20Check%20out%20this%20awesome%20%23AI%20demo%20by%20%40Deepgram%20and%20%40lukeocodes%0A%0A%20https%3A//aura-tts-demo.deepgram.com",
                  "",
                  "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
                );

                return e.preventDefault();
              }}
              aria-label="share on twitter"
              target="_blank"
            >
              <XIcon className="mb-1" />
            </a>
            <a
              href="#"
              onClick={(e) => {
                window.open(
                  "https://www.linkedin.com/shareArticle?mini=true&url=https%3A//aura-tts-demo.deepgram.com&title=Excellent review on my website reviews",
                  "",
                  "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
                );

                return e.preventDefault();
              }}
              aria-label="share on Linkedin"
            >
              <LinkedInIcon className="mb-1" />
            </a>
            <a
              href="#"
              onClick={(e) => {
                window.open(
                  "https://www.facebook.com/sharer/sharer.php?u=https%3A//aura-tts-demo.deepgram.com",
                  "",
                  "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
                );

                return e.preventDefault();
              }}
              target="_blank"
              aria-label="share on Facebook"
            >
              <FacebookIcon className="mb-1" />
            </a>
            <div className="border-l border-[#4e4e52] w-px h-7">&nbsp;</div>
            <a
              className="text-base font-semibold"
              href="https://deepgram.com/contact-us"
              target="_blank"
            >
              contact us
            </a>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Home;



================================================
FILE: app/api/authenticate/route.ts
================================================
import { DeepgramError, createClient } from "@deepgram/sdk";
import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  // exit early so we don't request 70000000 keys while in devmode
  if (process.env.DEEPGRAM_ENV === "development") {
    return NextResponse.json({
      key: process.env.DEEPGRAM_API_KEY ?? "",
    });
  }

  // gotta use the request object to invalidate the cache every request :vomit:
  const url = request.url;
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

  let { result: projectsResult, error: projectsError } =
    await deepgram.manage.getProjects();

  if (projectsError) {
    return NextResponse.json(projectsError);
  }

  const project = projectsResult?.projects[0];

  if (!project) {
    return NextResponse.json(
      new DeepgramError(
        "Cannot find a Deepgram project. Please create a project first."
      )
    );
  }

  let { result: newKeyResult, error: newKeyError } =
    await deepgram.manage.createProjectKey(project.project_id, {
      comment: "Temporary API key",
      scopes: ["usage:write"],
      tags: ["next.js"],
      time_to_live_in_seconds: 60,
    });

  if (newKeyError) {
    return NextResponse.json(newKeyError);
  }

  const response = NextResponse.json({ ...newKeyResult, url });
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set(
    "Cache-Control",
    "s-maxage=0, no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Expires", "0");

  return response;
}



================================================
FILE: app/components/App.tsx
================================================
"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import Visualizer from "./Visualizer";

const App: () => JSX.Element = () => {
  const [caption, setCaption] = useState<string | undefined>(
    "Powered by Deepgram"
  );
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();

  useEffect(() => {
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e: BlobEvent) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close. 
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      console.log("thisCaption", thisCaption);
      if (thisCaption !== "") {
        console.log('thisCaption !== ""', thisCaption);
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      // prettier-ignore
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);

  return (
    <>
      <div className="flex h-full antialiased">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <div className="flex flex-col flex-auto h-full">
            {/* height 100% minus 8rem */}
            <div className="relative w-full h-full">
              {microphone && <Visualizer microphone={microphone} />}
              <div className="absolute bottom-[8rem]  inset-x-0 max-w-4xl mx-auto text-center">
                {caption && <span className="bg-black/70 p-8">{caption}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;



================================================
FILE: app/components/Visualizer.tsx
================================================
import React, { useEffect, useRef } from "react";

const interpolateColor = (
  startColor: number[],
  endColor: number[],
  factor: number
): number[] => {
  const result = [];
  for (let i = 0; i < startColor.length; i++) {
    result[i] = Math.round(
      startColor[i] + factor * (endColor[i] - startColor[i])
    );
  }
  return result;
};

const Visualizer = ({ microphone }: { microphone: MediaRecorder }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  useEffect(() => {
    const source = audioContext.createMediaStreamSource(microphone.stream);
    source.connect(analyser);

    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = (): void => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    if (!context) return;

    context.clearRect(0, 0, width, height);

    const barWidth = 10;
    let x = 0;
    const startColor = [19, 239, 147];
    const endColor = [20, 154, 251];

    for (const value of dataArray) {
      const barHeight = (value / 255) * height * 2;

      const interpolationFactor = value / 255;

      const color = interpolateColor(startColor, endColor, interpolationFactor);

      context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.1)`;
      context.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth;
    }
  };

  return <canvas ref={canvasRef} width={window.innerWidth}></canvas>;
};

export default Visualizer;



================================================
FILE: app/components/icons/BoltIcon.tsx
================================================
export const BoltIcon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
      fill="currentColor"
      className={`inline-block mb-0.5 ${className}`}
    >
      <path d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288H175.5L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7H272.5L349.4 44.6z" />{" "}
    </svg>
  );
};



================================================
FILE: app/components/icons/CaretIcon.tsx
================================================
export const CaretIcon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`inline-block ${className}`}
    >
      <path d="M6 14C5.71875 14 5.46875 13.9063 5.28125 13.7188C4.875 13.3438 4.875 12.6875 5.28125 12.3125L9.5625 8L5.28125 3.71875C4.875 3.34375 4.875 2.6875 5.28125 2.3125C5.65625 1.90625 6.3125 1.90625 6.6875 2.3125L11.6875 7.3125C12.0938 7.6875 12.0938 8.34375 11.6875 8.71875L6.6875 13.7188C6.5 13.9063 6.25 14 6 14Z" />
    </svg>
  );
};



================================================
FILE: app/components/icons/CogIcon.tsx
================================================
export const CogIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`inline-block ${className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);



================================================
FILE: app/components/icons/DownloadIcon.tsx
================================================
export const DownloadIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`inline-block ${className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);



================================================
FILE: app/components/icons/ExclamationIcon.tsx
================================================
export const ExclamationIcon = () => {
  return <>⚠️</>;
};



================================================
FILE: app/components/icons/FacebookIcon.tsx
================================================
export const FacebookIcon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`inline-block w-[1em] h-[1em] ${className}`}
    >
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
};



================================================
FILE: app/components/icons/LinkedInIcon.tsx
================================================
export const LinkedInIcon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`inline-block w-[1em] h-[1em] ${className}`}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
};



================================================
FILE: app/components/icons/MicrophoneIcon.tsx
================================================
export const MicrophoneIcon = ({
  micOpen,
  className,
  ...rest
}: {
  micOpen: boolean;
  className?: string;
}) => {
  if (micOpen) {
    return (
      <svg
        viewBox="0 0 19 27"
        xmlns="http://www.w3.org/2000/svg"
        className={`fill-red-500 ${className}`}
        {...rest}
      >
        <path d="M9.5 18.125C6.75781 18.125 4.625 15.9414 4.625 13.25V5.125C4.625 2.43359 6.75781 0.25 9.5 0.25C12.1914 0.25 14.375 2.43359 14.375 5.125V13.25C14.375 15.9922 12.1914 18.125 9.5 18.125ZM17.2188 10C17.8789 10 18.4375 10.5586 18.4375 11.2188V13.25C18.4375 17.7695 15.0352 21.5273 10.7188 22.1367V23.8125H12.75C13.6641 23.8125 14.375 24.625 14.3242 25.5391C14.3242 25.9453 13.9688 26.25 13.5625 26.25H5.4375C4.98047 26.25 4.625 25.9453 4.625 25.5391C4.57422 24.625 5.28516 23.8125 6.25 23.8125H8.28125V22.0352C3.76172 21.4258 0.5625 17.3633 0.5625 12.8438V11.2188C0.5625 10.5586 1.07031 10 1.78125 10C2.44141 10 3 10.5586 3 11.2188V12.9961C3 16.3984 5.69141 19.5469 9.04297 19.75C12.8516 20.0039 16 17.0078 16 13.25V11.2188C16 10.5586 16.5078 10 17.2188 10Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 33 27"
      xmlns="http://www.w3.org/2000/svg"
      className={`fill-current ${className}`}
      {...rest}
    >
      <path d="M19.6992 23.8125C20.6133 23.8125 21.3242 24.5742 21.2227 25.4883C21.2227 25.8945 20.918 26.25 20.4609 26.25H12.3867C11.9805 26.25 11.5742 25.8945 11.5742 25.4375C11.5742 24.5742 12.2344 23.8125 13.1484 23.8125H15.1797V22.0859C10.7617 21.4766 7.51172 17.4141 7.51172 12.8945V10.9141L9.94922 12.8438V12.9961C9.94922 16.3984 12.6914 19.5469 16.043 19.75C16.9062 19.8008 17.668 19.6992 18.4297 19.4453L20.6133 21.1719C19.6992 21.6289 18.7344 21.9844 17.7188 22.1367V23.8125H19.6992ZM32.2422 24.1172C32.8008 24.5234 32.9023 25.2852 32.3945 25.7422C31.9883 26.3008 31.2266 26.4023 30.7188 25.9453L0.707031 2.43359C0.148438 2.02734 0.046875 1.26562 0.503906 0.757812C0.707031 0.453125 1.0625 0.25 1.46875 0.25C1.72266 0.25 1.97656 0.351562 2.17969 0.554688L11.625 7.91797V5.125C11.625 2.38281 13.9102 0.199219 16.6523 0.300781C19.3438 0.351562 21.375 2.6875 21.375 5.32812V13.25C21.375 13.9102 21.2227 14.5703 20.9688 15.1797L22.2891 16.1953C22.7461 15.2812 23 14.3164 23 13.25V11.2188C23 10.5586 23.5586 10 24.2188 10C24.8789 10 25.4375 10.5586 25.4375 11.2188V13.25C25.4375 14.9258 24.9297 16.4492 24.168 17.7695L32.2422 24.1172Z" />
    </svg>
  );
};



================================================
FILE: app/components/icons/SendIcon.tsx
================================================
export const SendIcon = ({ className, ...rest }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`fill-current ${className}`}
    >
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
  );
};



================================================
FILE: app/components/icons/XIcon.tsx
================================================
export const XIcon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`inline-block w-[1em] h-[1em] ${className}`}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
};



================================================
FILE: app/context/DeepgramContextProvider.tsx
================================================
"use client";

import {
  createClient,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvents,
  type LiveSchema,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FunctionComponent,
} from "react";

interface DeepgramContextType {
  connection: LiveClient | null;
  connectToDeepgram: (options: LiveSchema, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: LiveConnectionState;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(
  undefined
);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string> => {
  const response = await fetch("/api/authenticate", { cache: "no-store" });
  const result = await response.json();
  return result.key;
};

const DeepgramContextProvider: FunctionComponent<
  DeepgramContextProviderProps
> = ({ children }) => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<LiveConnectionState>(
    LiveConnectionState.CLOSED
  );

  /**
   * Connects to the Deepgram speech recognition service and sets up a live transcription session.
   *
   * @param options - The configuration options for the live transcription session.
   * @param endpoint - The optional endpoint URL for the Deepgram service.
   * @returns A Promise that resolves when the connection is established.
   */
  const connectToDeepgram = async (options: LiveSchema, endpoint?: string) => {
    const key = await getApiKey();
    const deepgram = createClient(key);

    const conn = deepgram.listen.live(options, endpoint);

    conn.addListener(LiveTranscriptionEvents.Open, () => {
      setConnectionState(LiveConnectionState.OPEN);
    });

    conn.addListener(LiveTranscriptionEvents.Close, () => {
      setConnectionState(LiveConnectionState.CLOSED);
    });

    setConnection(conn);
  };

  const disconnectFromDeepgram = async () => {
    if (connection) {
      connection.finish();
      setConnection(null);
    }
  };

  return (
    <DeepgramContext.Provider
      value={{
        connection,
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error(
      "useDeepgram must be used within a DeepgramContextProvider"
    );
  }
  return context;
}

export {
  DeepgramContextProvider,
  useDeepgram,
  LiveConnectionState,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
};



================================================
FILE: app/context/MicrophoneContextProvider.tsx
================================================
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";

interface MicrophoneContextType {
  microphone: MediaRecorder | null;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  setupMicrophone: () => void;
  microphoneState: MicrophoneState | null;
}

export enum MicrophoneEvents {
  DataAvailable = "dataavailable",
  Error = "error",
  Pause = "pause",
  Resume = "resume",
  Start = "start",
  Stop = "stop",
}

export enum MicrophoneState {
  NotSetup = -1,
  SettingUp = 0,
  Ready = 1,
  Opening = 2,
  Open = 3,
  Error = 4,
  Pausing = 5,
  Paused = 6,
}

const MicrophoneContext = createContext<MicrophoneContextType | undefined>(
  undefined
);

interface MicrophoneContextProviderProps {
  children: ReactNode;
}

const MicrophoneContextProvider: React.FC<MicrophoneContextProviderProps> = ({
  children,
}) => {
  const [microphoneState, setMicrophoneState] = useState<MicrophoneState>(
    MicrophoneState.NotSetup
  );
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);

  const setupMicrophone = async () => {
    setMicrophoneState(MicrophoneState.SettingUp);

    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      const microphone = new MediaRecorder(userMedia);

      setMicrophoneState(MicrophoneState.Ready);
      setMicrophone(microphone);
    } catch (err: any) {
      console.error(err);

      throw err;
    }
  };

  const stopMicrophone = useCallback(() => {
    setMicrophoneState(MicrophoneState.Pausing);

    if (microphone?.state === "recording") {
      microphone.pause();
      setMicrophoneState(MicrophoneState.Paused);
    }
  }, [microphone]);

  const startMicrophone = useCallback(() => {
    setMicrophoneState(MicrophoneState.Opening);

    if (microphone?.state === "paused") {
      microphone.resume();
    } else {
      microphone?.start(250);
    }

    setMicrophoneState(MicrophoneState.Open);
  }, [microphone]);

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        startMicrophone,
        stopMicrophone,
        setupMicrophone,
        microphoneState,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

function useMicrophone(): MicrophoneContextType {
  const context = useContext(MicrophoneContext);

  if (context === undefined) {
    throw new Error(
      "useMicrophone must be used within a MicrophoneContextProvider"
    );
  }

  return context;
}

export { MicrophoneContextProvider, useMicrophone };



================================================
FILE: app/fonts/ABCFavorit-Bold.otf
================================================
[Non-text file]


================================================
FILE: app/fonts/ABCFavorit-Bold.woff
================================================
[Non-text file]


================================================
FILE: app/fonts/ABCFavorit-Bold.woff2
================================================
[Non-text file]



================================================
FILE: .github/dependabot.yml
================================================
# To get started with Dependabot version updates, you'll need to specify which
# package ecosystems to update and where the package manifests are located.
# Please see the documentation for more information:
# https://docs.github.com/github/administering-a-repository/configuration-options-for-dependency-updates
# https://containers.dev/guide/dependabot

version: 2
updates:
 - package-ecosystem: "devcontainers"
   directory: "/"
   schedule:
     interval: weekly



================================================
FILE: .github/ISSUE_TEMPLATE/bug_report.md
================================================
---
name: Bug report
about: Something is occurring that I think is wrong
title: ''
labels: "\U0001F41B bug"
assignees: ''

---

## What is the current behavior?

> What's happening that seems wrong?

## Steps to reproduce

> To make it faster to diagnose the root problem. Tell us how can we reproduce the bug.

## Expected behavior

> What would you expect to happen when following the steps above?

## Please tell us about your environment

> We want to make sure the problem isn't specific to your operating system or programming language.
  
- **Operating System/Version:** Windows 10
- **Language:** [all | TypeScript | Python | PHP | etc]
- **Browser:** Chrome

## Other information

> Anything else we should know? (e.g. detailed explanation, stack-traces, related issues, suggestions how to fix, links for us to have context, eg. stack overflow, codepen, etc)



================================================
FILE: .github/ISSUE_TEMPLATE/config.yml
================================================
blank_issues_enabled: false
contact_links:
  - name: Deepgram Developer Community
    url: https://github.com/orgs/deepgram/discussions
  - name: Deepgram on Twitter
    url: https://twitter.com/DeepgramAI



================================================
FILE: .github/ISSUE_TEMPLATE/feature-request.md
================================================
---
name: Feature Request
about: I think X would be a cool addition or change.
title: ''
labels: "✨ enhancement"
assignees: ''

---

## Proposed changes

> Provide a detailed description of the change or addition you are proposing

## Context

> Why is this change important to you? How would you use it? How can it benefit other users?

## Possible Implementation

> Not obligatory, but suggest an idea for implementing addition or change

## Other information

> Anything else we should know? (e.g. detailed explanation, related issues, links for us to have context, eg. stack overflow, codepen, etc)



================================================
FILE: .github/PULL_REQUEST_TEMPLATE/pull_request_template.md
================================================
## Proposed changes

Describe the big picture of your changes here to communicate to the maintainers why we should accept this pull request. If it fixes a bug or resolves a feature request, be sure to link to that issue.

## Types of changes

What types of changes does your code introduce to the Vonage for Visual Studio Code extension?
_Put an `x` in the boxes that apply_

- [ ] Bugfix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update or tests (if none of the other choices apply)

## Checklist

_Put an `x` in the boxes that apply. You can also fill these out after creating the PR. If you're unsure about any of them, don't hesitate to ask. We're here to help! This is simply a reminder of what we are going to look for before merging your code._

- [ ] I have read the [CONTRIBUTING](../../CONTRIBUTING.md) doc
- [ ] Lint and unit tests pass locally with my changes
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] I have added necessary documentation (if appropriate)
- [ ] Any dependent changes have been merged and published in downstream modules

## Further comments

If this is a relatively large or complex change, kick off the discussion by explaining why you chose the solution you did and what alternatives you considered, etc...



================================================
FILE: .github/workflows/release.yml
================================================
name: Release

on:
  push:
    branches:
      - main
      - "next/**"
      - "rc/**"
      - "beta/**"
      - "alpha/**"
  workflow_dispatch:

jobs:
  release:
    name: Release / Node ${{ matrix.node }}
    strategy:
      matrix:
        node: ["20"]

    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v2

      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node }}

      - run: |
          npm ci

      - name: Create a release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GH_PUSH_TOKEN }}


