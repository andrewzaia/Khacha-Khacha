# Khacha Khacha

Beginner Sureth (Assyrian Neo-Aramaic), little by little. A separate companion to Malo po malo.

## What is included

- Five lessons: Syriac alphabet, numbers, pronouns, present “to be” forms and everyday conversation.
- 97 revealable reference cards with Eastern Syriac, Roman spelling and pronunciation cues.
- 1,988 quiz questions and 1,365 typing exercises across all five lessons.
- Letter order and spelling, number sequences, speaker/listener scenarios, pronoun pairs, sentence changes and short conversation exchanges.
- Five-question quizzes, eight-question typing rounds and an eight-question daily mix.
- Question decks rotate before repeating within a visit.
- A password-gated 100-question mixed test: 20 questions per lesson and 60 seconds per question.
- Expired questions are marked missed; deadlines remain accurate after a background tab or device sleep.
- Immediate scores, lesson breakdowns, a full review and a downloadable PDF with readable Syriac.
- Mobile layouts, keyboard controls, a locally bundled Syriac font and no external runtime dependencies.

## Publish on GitHub Pages

1. Create a repository, for example `khacha-khacha`.
2. Extract `Khacha_Khacha_Website.zip` on your computer.
3. Upload **all extracted files to the repository root**, including `index.html`, both folders/files if any, and `.nojekyll`. Do not upload just the ZIP or nest the site inside an extra folder.
4. In **Settings → Pages**, select **Deploy from a branch**, then **main** and **/(root)**, and save.
5. Open the URL GitHub displays once the deployment finishes.

Relative asset paths support both a root site and a project URL such as `https://YOUR-USERNAME.github.io/khacha-khacha/`. No Node installation, database, API key or build step is needed. You can also upload the same files to an ordinary static web host.

For a local check, open `index.html` in a browser. If your browser blocks the local font, serve the folder with `python -m http.server 8000`, then open `http://localhost:8000`.

## Testing access word

The starter password is **`shlama`**. To change it, edit `TEST_WORD` near the top of `test.js`.

This is a convenience gate implemented in the browser, not secure authentication. The access word can be inspected in the source. Do not use it to protect confidential material or official examination results. The private Sites deployment is protected separately by owner-only access.

A test can run for up to 100 minutes. Refreshing or closing the page resets the current test. Results are kept in the page until another test begins; download the PDF before leaving if you want to keep them.

## Language notes

This is common Eastern Sureth, with a consistent beginner teaching set. It is not Classical Syriac or Turoyo. Family and village pronunciations vary; some alternatives are accepted in typing practice. Roman spellings are pronunciation aids, not a reversible transliteration of the Syriac script. Written silent letters are retained, and gender-specific endings are labelled explicitly.

Numbers use standalone counting forms. Noun-counting agreement is outside this beginner set. The compounds use tens + `u` (and) + units. Reference cards cover 1–20, the tens, 100, 1,000 and 10,000; quizzes include every number from 1–100.

The expanded bank reuses the vocabulary and forms taught in the reference cards. Each question includes an explanation or typing hint. Pronoun-pair typing uses a slash; two-phrase conversation typing uses a semicolon. Questions distinguish the person speaking from the person being addressed.

| Lesson | Quiz questions | Typing exercises |
| --- | ---: | ---: |
| Alphabet | 301 | 235 |
| Numbers | 848 | 572 |
| Pronouns | 199 | 142 |
| To be | 351 | 270 |
| Everyday conversation | 289 | 146 |

Pronunciation cues are approximate English guides. No recorded or synthesised audio is included. Before treating this as a formal teaching course, have a fluent speaker or teacher review the regional phrasing. All language content and question generation are in `data.js` so they can be adapted together.

Reference checks are linked in the website footer, including Sami Hormis’s *Ma’alta*, the Assyrian Circles Eastern beginners’ guide, Eastern Assyrian phrases, present copula forms and the Sureth dictionary. No source textbook PDFs are redistributed.

## PDF review

The PDF export uses the browser’s text shaping to keep Syriac joined and ordered correctly. It produces A4 review pages with a Unicode text layer, all 100 questions, submitted answers, correct answers and explanations. The Syriac font is local, so there is no CDN dependency. The PDF can take a few seconds on a phone.

## Files

- `index.html` — site entry point
- `styles.css` — responsive layouts and typography
- `data.js` — lessons, approved spellings, question banks and question rotation
- `app.js` — reference cards, quizzes and typing practice
- `test.js` — test password, deadlines, scoring and results
- `pdf-export.js` — client-side PDF export
- `syriac.ttf` — Noto Sans Syriac Eastern
- `FONT-LICENSE.txt` — SIL Open Font License for the bundled font
- `.nojekyll` — bypass Jekyll processing on GitHub Pages

The website has no analytics, database or server-side accounts. Publishing the files on GitHub Pages makes them accessible according to your GitHub Pages configuration. The `noindex` metadata only discourages search indexing; it is not access control.
