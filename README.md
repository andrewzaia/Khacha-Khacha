# Khacha Khacha · ܚܲܟ̰ܵܐ ܚܲܟ̰ܵܐ

**Learn Assyrian, little by little.** Khacha Khacha is a beginner-friendly website for exploring **Eastern Sureth (Assyrian Neo-Aramaic)** through short lessons, useful phrases and interactive practice.

### 👉 [Start learning Assyrian](https://andrewzaia.github.io/Khacha-Khacha/)

**[Open the learning website →](https://andrewzaia.github.io/Khacha-Khacha/)**

No downloads, installation or account required. Open the site in your browser and practise on your phone, tablet or computer.

## What you'll learn

The site uses the same compact three-level selector as Malo po Malo: **Level 1 (Beginner)** is available now. **Level 2 (Intermediate)** and **Level 3 (Advanced)** are clearly labelled **Coming soon**; lessons and tests for those levels have not been published yet.

Build a foundation across five currently available beginner lessons:

| Lesson | What you'll practise |
| --- | --- |
| **Alphabet** | Eastern Syriac letters, recognition and spelling |
| **Numbers** | Counting, number words and sequences |
| **Pronouns** | Talking about yourself and other people |
| **“To be”** | Simple statements and questions |
| **Everyday conversation** | Greetings, introductions and useful exchanges |

Lessons introduce words and phrases in both **Syriac script** and **Roman spelling**, with beginner-friendly pronunciation cues.

## Learn your way

- **Reference cards:** Discover letters, words and everyday expressions, then reveal answers and explanations.
- **Quick quizzes:** Check your understanding in short, five-question rounds.
- **Type & practise:** Build confidence by recalling and typing words and phrases.
- **Roman and Syriac views:** Change how the language is displayed as you become more comfortable with the script.
- **Daily mix:** Try a short selection of questions across what you've studied.
- **Instant feedback:** See where you went right and what to revisit.

### Want a bigger challenge?

The **Level 1 Testing** section includes a 100-question assessment covering all five beginner lessons, with up to **60 seconds per question**. With a test access word, you can take the challenge, review your responses and download a **PDF** of your results.

## How to get started

1. **[Visit Khacha Khacha](https://andrewzaia.github.io/Khacha-Khacha/).**
2. Select **Level 1 (Beginner)**, then choose a lesson, starting with the **Alphabet** if you're completely new.
3. Work through the **Reference cards** and reveal their answers.
4. Try a **Quick quiz** or **Type & practise** to reinforce what you've learnt.
5. Return often — even a few minutes of regular practice can help.

**Little steps count. Khacha Khacha.**

## A note on language and pronunciation

Sureth is spoken in different communities, families and regions, and you may encounter variations in vocabulary or pronunciation. This course focuses on a consistent **Eastern Sureth beginner variety**, rather than Classical Syriac or Turoyo.

Roman spellings and English “sounds like” hints are learning aids, not exact phonetic transcriptions. The website does **not** include recorded pronunciation audio. Some alternative forms are accepted in practice, but fluent speakers and teachers remain valuable resources.

## Good to know

- The learning activities run directly in your browser, without an account.
- Timed tests reset if you reload or close the page; download your PDF report before leaving.
- Answers are checked against the beginner material taught on the site. They are not a formal evaluation of fluency.
- The website is intended as a helpful starting point, not a replacement for learning with fluent speakers.

## Also learning Serbian?

Explore **[Malo po malo — Learn Serbian](https://andrewzaia.github.io/Malo-Po-Malo/)**, the companion website with Beginner, Intermediate and Advanced courses, Latin and Cyrillic practice, and guided conversations.

## About the project

Khacha Khacha is a browser-based learning project hosted on GitHub Pages, designed to help newcomers practise Assyrian language skills through manageable daily steps.

Found an issue or have an idea for improvement? [Share feedback on GitHub](https://github.com/andrewzaia/Khacha-Khacha/issues).

<details>
<summary><strong>For developers and contributors</strong></summary>

The website uses static HTML, CSS and JavaScript, with a locally bundled Syriac font. No application server, database, build step or API keys are required.

To run locally, clone or download the repository and open `index.html`. If local browser security prevents the font from loading, serve the folder with `python -m http.server 8000` and visit `http://localhost:8000`.

Existing beginner content and practice questions are defined in `data.js`. The new `course-levels.js` file holds level metadata. Future level modules can add level-specific lessons and question banks before `app.js` starts, automatically enabling their corresponding level selector. No unfinished lesson banks are bundled with the coming-soon levels. The timed-test access word is configured client-side and is not secure authentication.

The bundled font is distributed with its licence in `FONT-LICENSE.txt`.

</details>
