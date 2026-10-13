# CSE Professional Reviewer App — Plan & Spec

Oct 13, 2026 · @Shashimii

## Overview

A web app that takes someone who knows nothing about the Civil Service Exam (Professional level) and teaches them to pass it: every topic is taught before it is tested, and every question shows how to solve it step by step.

**Who it is for.** Filipino adults reviewing for the CSE-PPT Professional level, many self-studying on a phone, some years out of school. Assume zero prior knowledge: no remembered algebra, no grammar terms, never read the Constitution.

**Core principle: teach, don't just test.** Most reviewers are question banks with an answer key. This app explains the method behind each question type first, then lets the learner practise it with hints, then tests them.

**Version 1 includes:**

- Learn and practise by subject (Verbal, Numerical, Analytical, General Information)
- A timed full-length mock exam
- Progress tracking with weak-area detection

**Success looks like:**

- A learner who starts at zero can finish the curriculum and score 80% or higher on mock exams consistently
- Every question in the bank has a worked, step-by-step solution
- The learner always knows what to study next

## Exam facts the app is built around

The app mirrors the CSE-PPT Professional level as CSC ran it in August 2026: 150 scored items in 3 hours 10 minutes, passing at a general rating of 80.00. These come from the [CSC August 2026 examination announcement](https://csc.gov.ph/examination-advisories/examination-announcement-no-03-s-2026-conduct-of-career-service-examination-pen-and-paper-test-cse-ppt-for-professional-and-subprofessional-levels-09-august-2026) as summarised by [OpenExamPrep](https://open-exam-prep.com/blog/philippine-civil-service-professional-exam-guide-2026).

| Detail | Professional level | What the app does with it |
| --- | --- | --- |
| Scored items | 150 (plus 20 unscored personal-data items) | Full mock = 150 items |
| Time limit | 190 minutes | Mock timer = 190 min; pacing target about 76 s per item |
| Passing standard | General rating of at least 80.00 | Readiness goal = 80% or higher, shown as a target, not a guarantee |
| Calculator | Not allowed | No calculator in the app; by-hand methods taught |
| Subject weights | Not published by CSC | App uses its own blend, labelled as such |

**Official scope (all in English except where noted):**

| Area | Topics |
| --- | --- |
| Verbal Ability (English and Filipino) | Word meaning, sentence completion, error recognition, sentence structure, paragraph organization, reading comprehension |
| Numerical Ability | Basic operations, number sequence, word problems |
| Analytical Ability | Word analogy, symbolic logic or abstract reasoning, assumptions and conclusions, data interpretation |
| General Information | Philippine Constitution, RA 6713, peace and human rights, environment management and protection |

The scope and format can change per exam cycle, so these values live in a config file the app reads, not in code.

## Learning approach

Every topic runs the same five-step loop, and the learner cannot be tested on a topic until they have been taught it.

1. **Lesson.** A short explanation in plain words, assuming nothing. Terms are defined the first time they appear ("a *ratio* compares two amounts"). Under 5 minutes of reading, with Taglish tooltips for hard terms.
2. **Worked example.** One question solved fully, one step per screen tap. Each step says *what* is done and *why*.
3. **Guided practice.** Similar questions with up to three hints that reveal the method gradually: a nudge, then the first step, then the full method.
4. **Independent practice.** No hints. After answering, the full step-by-step solution is shown whether right or wrong, plus why each wrong choice is wrong.
5. **Mastery check.** 5 to 10 mixed questions on the topic. Pass at 80% to unlock "mastered". Fail and the app routes back to the exact step type that was missed.

&#91;embedded content: teaching loop · 5 steps, pass or loop back\]

A learner who misses the mastery check returns to the exact step type they got wrong, not to the start of the topic.

**Rules for every solution:**

- Numbered steps, one action per step, no skipped arithmetic
- A "why" line under any step a beginner might not follow
- A named **method** the learner can reuse (e.g. "Find the rule: check differences, then ratios")
- A **trap** note when a wrong option is designed to catch a common mistake
- Links back to the lesson and to any prerequisite topic

**Foundations track.** Before any CSE topic, an optional diagnostic checks basics: fractions, percent, reading a table, parts of speech, subject and verb. Gaps unlock short refresher lessons, so a true beginner is never dropped into a topic they can't follow.

## Curriculum map

The curriculum has 4 subjects, about 30 topics, ordered so each topic only needs what came before it. Topic splits below are the app's teaching units, not CSC categories.

| Subject | Topics in teaching order | Needs first |
| --- | --- | --- |
| Foundations (optional) | Fractions and decimals · Percent · Reading tables · Parts of speech · Subject–verb basics | Nothing |
| Numerical Ability | Basic operations and order of operations · Fractions, decimals, percent · Ratio and proportion · Number series · Averages · Word problems: age, work, distance–rate–time, mixture, profit and discount | Foundations: fractions, percent |
| Verbal Ability (English) | Vocabulary and context clues · Sentence completion · Grammar and error recognition · Sentence structure · Paragraph organization · Reading comprehension | Foundations: parts of speech |
| Verbal Ability (Filipino) | Talasalitaan · Pagbuo ng pangungusap · Wastong gamit at pagkilala ng mali · Pagsasaayos ng talata · Pag-unawa sa binasa | English counterpart (same method, taught in Filipino) |
| Analytical Ability | Word analogy · Letter and figure series (abstract reasoning) · Symbolic logic · Assumptions and conclusions · Data interpretation | Number series, ratio, reading tables |
| General Information | 1987 Constitution (by Article) · RA 6713 Code of Conduct · Peace and human rights concepts · Environment management and protection | Nothing |

**Why this order:** Numerical comes before Analytical because number series and data interpretation reuse its methods. Filipino verbal follows English so the learner meets each method once, then applies it in a second language.

## Feature spec

Version 1 ships three features; all three share the same question bank and solution format.

### 1. Learn and practise by subject

- Subject → topic list with a mastery state per topic: *Not started*, *Learning*, *Practising*, *Mastered*
- Each topic runs the five-step loop from Learning approach
- **Quick practice:** 10 random questions from mastered topics, for daily review
- **Explain it again:** on any solution step, a button gives a simpler second explanation
- Wrong answers go into a **Mistakes deck** that resurfaces them after 1, 3 and 7 days (spaced repetition)
- Filipino verbal content is fully in Filipino; explanations can toggle to English

### 2. Timed mock exam

- **Full mock:** 150 items, 190-minute timer, mixed subjects, no hints, no feedback until the end
- **Half mock:** 75 items, 95 minutes, for learners short on time
- Exam-like controls: flag for review, jump to any item, item grid showing answered, flagged and blank
- Pace warning if the learner falls more than 10 minutes behind the 76-seconds-per-item average
- Auto-submit at time-out; leaving the app pauses nothing (as on exam day)
- **Results screen:** score, pass or fail against 80%, score per subject, time per subject, slowest items
- **Review mode:** every item with the learner's answer, correct answer and full step-by-step solution
- Unlocks after the learner has mastered at least one topic in each subject (overridable)

### 3. Progress tracking

- **Readiness meter:** estimated score from the last 3 mocks plus topic mastery, shown against the 80% line
- **Weak areas:** the 3 topics with the lowest accuracy, each with a "Fix this" button that opens its lesson
- Per-topic accuracy and average time per item
- Mock exam history as a score-over-time chart
- Study streak and minutes studied per day
- **Next best step:** one recommended action on the home screen, chosen from weak areas and unfinished topics

## Screens and user flows

Nine screens cover version 1, designed phone-first since most learners will study on mobile.

| Screen | Purpose | Key elements |
| --- | --- | --- |
| Welcome and onboarding | Set goal and starting point | Target exam date, daily minutes, optional Foundations diagnostic |
| Home | Show what to do next | Next best step card, readiness meter, streak, continue button |
| Subjects | Browse the curriculum | 4 subject cards with progress rings |
| Topic | One topic's loop | Five steps as a vertical path, mastery state |
| Lesson | Teach | Short text sections, diagrams, glossary tooltips |
| Question | Practise | Question, choices, hint button, solution panel after answering |
| Mock exam | Simulate exam day | Timer, item grid, flag, submit |
| Results and review | Learn from a mock | Score vs 80%, per-subject bars, item-by-item solutions |
| Progress | Track improvement | Mock history chart, weak areas, per-topic accuracy |

**First-run flow:**

1. Learner opens the app and sets a target exam date and daily study time
2. Takes the 15-question Foundations diagnostic (or skips it)
3. Home shows the first step: a refresher or the first Numerical topic
4. Learner completes lesson → worked example → guided practice
5. Home updates the next step; after one topic per subject, the mock exam unlocks

**Daily return flow:** Home → Mistakes deck due today → continue current topic → quick practice.

## Data model

Content (subjects, topics, lessons, questions) is static JSON shipped with the app; learner data (attempts, mastery, mocks) is stored per user.

| Entity | Key fields | Notes |
| --- | --- | --- |
| Subject | id, name, language | Numerical, Verbal-EN, Verbal-FIL, Analytical, GenInfo, Foundations |
| Topic | id, subjectId, order, prerequisites\[\], methodName | Prerequisites drive locking and remediation |
| Lesson | id, topicId, sections\[\], glossaryTerms\[\] | Sections are markdown + optional diagram |
| Question | id, topicId, difficulty (1–3), stem, choices\[\], answer, hints\[3\], solution, trapNotes{}, sourceRef?, status, authorId, reviewerId, version | `sourceRef` required for General Information |
| Solution | steps\[\] of {action, why?}, methodName | One action per step |
| Attempt | userId, questionId, choice, correct, seconds, hintsUsed, mode, timestamp | mode = guided, practice, mastery, mock |
| TopicProgress | userId, topicId, state, accuracy, avgSeconds | Recomputed after each attempt |
| MockExam | userId, itemIds\[\], answers{}, flags\[\], startedAt, submittedAt, score, perSubject{} | Item order frozen at start |
| ReviewItem | userId, questionId, dueAt, interval | Powers the Mistakes deck |

**Example question record** (original item, Numerical → Number series):

```json
{
  "id": "num-series-0007",
  "topicId": "num-number-series",
  "difficulty": 1,
  "stem": "What comes next? 2, 6, 18, 54, ___",
  "choices": ["108", "162", "72", "216"],
  "answer": "162",
  "hints": [
    "The numbers grow fast. Is something being added, or multiplied?",
    "Divide each number by the one before it.",
    "6 ÷ 2 = 3, 18 ÷ 6 = 3. What do you do to 54?"
  ],
  "solution": {
    "methodName": "Find the rule: check differences, then ratios",
    "steps": [
      { "action": "Check differences: 6−2=4, 18−6=12, 54−18=36. Not the same, so it is not adding a fixed number." },
      { "action": "Check ratios: 6÷2=3, 18÷6=3, 54÷18=3. Same every time.", "why": "A ratio tells you what each number is multiplied by to get the next." },
      { "action": "The rule is ×3. So 54 × 3 = 162." }
    ]
  },
  "trapNotes": {
    "108": "This is 54 × 2. The rule is ×3, not ×2.",
    "72": "This adds 18, the last number. The rule multiplies, it doesn't add."
  }
}
```

## Design: applying Vantage

The app uses the Vantage design system (Lumen components) for all tokens and components; this spec only lists what the app needs from it and where it may need new pieces.

**Taken from Vantage as-is:** colour, type and spacing tokens, light and dark themes, buttons, cards, inputs, tabs, progress bars, dialogs, navigation.

**Likely new components (to add to Vantage, not built one-off):**

| Component | Used on | Behaviour |
| --- | --- | --- |
| Answer choice | Question, Mock exam | Four states: default, selected, correct, wrong |
| Solution stepper | Question, Review | Reveals one step at a time, with a "why" expander |
| Hint ladder | Question | Three hints, each unlocking the next |
| Exam timer | Mock exam | Countdown with a calm state and a behind-pace state |
| Item grid | Mock exam | Numbered cells: blank, answered, flagged |
| Mastery ring | Subjects, Topic | Progress ring with four mastery states |
| Readiness meter | Home, Progress | Score bar with a fixed 80% pass line |

**Learning-specific guidelines:**

- Correct and wrong must never rely on colour alone; pair with an icon and a word
- Reading text at least 16 px with comfortable line height; passages are long
- Mock exam screen strips decoration to reduce distraction
- Tap targets at least 44 px; most use is one-handed on a phone

## Tech stack and architecture

Recommended: an offline-first web app (PWA) with content bundled as JSON and progress stored on the device, adding cloud sync in a later phase.

| Layer | Choice | Why |
| --- | --- | --- |
| App | React + TypeScript + Vite | Matches a web component system like Vantage; one codebase for phone and desktop |
| Install and offline | PWA (service worker) | Works on patchy mobile data; installable from the browser, no app store needed |
| Content | JSON files in the repo, validated by a schema at build time | Questions are versioned in Git; a bad record fails the build |
| Learner data | IndexedDB on the device (v1) | No accounts or server needed to launch |
| Sync and accounts (phase 3) | Supabase (auth + Postgres) or similar | Progress across devices; leaderboards later |
| Charts | Lightweight chart library | Mock history and per-subject bars |
| Hosting | Static host (e.g. Vercel, Netlify, GitHub Pages) | Free tier is enough for v1 |

**Mastery and readiness logic** runs on the device: topic accuracy from the last 20 attempts, readiness as a weighted mix of recent mock scores and topic mastery. Formulas live in one module so they can be tuned.

**Content authoring:** v1 writes JSON by hand with a schema; a simple admin editor comes later if the bank grows past a few hundred items.

## Content sourcing and accuracy rules

Every question in the app is original, and every fact in General Information traces to a primary text.

- **No real exam items.** CSC does not publish review material or accredit reviewers. The bank is written from the official scope, never from "leaked" or recalled CSC questions.
- **No invented subject weights.** CSC does not publish items per subject, so the app never claims an official breakdown. Mock exam mixes are labelled as the app's own practice blend.
- **Primary sources for General Information.** Constitution and RA 6713 lessons quote and link the actual text ([Official Gazette](https://www.officialgazette.gov.ph/1989/02/20/republic-act-no-6713/)). Each fact-based question stores its source citation.
- **Two-person review.** Every question needs an author and a reviewer before it goes live. Content is versioned so corrections are tracked.
- **Learner reporting.** A "Report a problem" button on every question flags it for review.
- **Exam-rule reminders in the UI.** Calculators are not allowed on exam day, so Numerical lessons teach by-hand methods and the app's mock exam has no calculator.

## Roadmap and milestones

Build the teaching loop end to end on one subject first, then fill content, then add the mock exam; each phase has a gate before the next starts.

1. **Phase 0: Foundations.** Vantage components added (answer choice, solution stepper, hint ladder), content schema, app shell, routing.
   - Gate: one question renders with hints and a stepped solution
2. **Phase 1: One subject, full loop.** Numerical Ability complete: all topics, lessons, about 150 questions with solutions. Topic progress and Mistakes deck working.
   - Gate: 3 to 5 beginner testers finish two topics and can explain the method back
3. **Phase 2: All subjects.** Verbal (English and Filipino), Analytical, General Information, Foundations diagnostic. Target 600+ reviewed questions.
   - Gate: every General Information item has a source; every item has a reviewer
4. **Phase 3: Mock exam and progress.** Full and half mocks, results and review, readiness meter, weak areas, next best step.
   - Gate: 150 unique items available per full mock without repeats across 3 mocks (450+ in the mock pool)
5. **Phase 4: Launch and sync.** PWA install, accounts and cloud sync, feedback reporting, analytics on where learners drop off.

**Content is the long pole.** Writing 600 to 1,000 questions with full step-by-step solutions will take longer than the code, so authoring starts in Phase 0 alongside the code.

## Open questions

- [ ] App name and whether it lives under Shashimii branding
- [ ] Free, freemium, or paid? Affects whether accounts are needed in v1
- [ ] Who writes and reviews content: you alone, or recruited reviewers (e.g. recent passers, teachers)?
- [ ] Should explanations default to English, Filipino, or Taglish?
- [ ] Use AI to draft questions for human review, or write all by hand?
- [ ] Which Vantage tokens and components exist today? Needed before Phase 0
- [ ] Add Subprofessional later? The data model already supports it via a level field on topics

## Sources

- [CSC Examination Announcement No. 03, s. 2026](https://csc.gov.ph/examination-advisories/examination-announcement-no-03-s-2026-conduct-of-career-service-examination-pen-and-paper-test-cse-ppt-for-professional-and-subprofessional-levels-09-august-2026)
- [OpenExamPrep: CSE Professional 2026 coverage and format](https://open-exam-prep.com/blog/philippine-civil-service-professional-exam-guide-2026)
- [Republic Act No. 6713, Official Gazette](https://www.officialgazette.gov.ph/1989/02/20/republic-act-no-6713/)
