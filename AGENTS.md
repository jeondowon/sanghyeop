# Project Guidance

This project is an illustration and design portfolio website for designer Sanghyeop Lee. Follow these guidelines when working in this repository.

## Project Goals and References

- Use `README.md` as the source of truth for the portfolio's purpose, content, and information structure.
- Use `presentation.pdf` for biography and project content, and the original artwork folder for imagery. Preserve originals, consult `docs/image-mapping.md` when changing assignments, and place works absent from the PDF in the final Other Works section. Preserve explicit AI-generated image labels.
- The active site uses a root `index.html` linking to independent versions under `stages/`. Shared display images live in `assets/artworks/`.
- Stage 01 (`stages/01-html/index.html`) shows only images: no visible text, links, captions, CSS, inline styles, custom font loading, JavaScript, or framework. Stage 02 (`stages/02-html-text/index.html`) adds the designer biography and project text while retaining browser defaults. Preserve earlier stages when adding later versions.
- Stage 03 (`03-style`) adds basic CSS; Stage 04 (`04-layout`) adds the desktop sidebar layout; Stage 05 (`05-navigation`) adds project selection; Stage 06 (`06-gallery`) adds image browsing; Stage 07 (`07-final`) adds responsive layout and interaction refinements.
- Each stage owns its HTML, CSS, and JavaScript. Share only artwork and font assets. Keep the site usable as static files with relative URLs and no build step.
- The unused React prototype in `web/`, including its separate Git history, was removed with user approval. Work only on the active static site.
- The visual reference is [Eimalive — Drawings Exhibition](https://eimalive.com/#drawings-exhibition). Take inspiration from its exhibition-like presentation and way of showcasing artwork, while adapting the approach to Sanghyeop's portfolio rather than copying its content or branding.
- Inspect the existing code and assets before making changes. Follow the project's current technology choices, structure, and coding style.

## Communication

- Communicate with the user in Korean and use polite language.
- If an important requirement is ambiguous or has meaningful alternatives, explain the assumption and its impact, then ask only what is needed. Proceed directly when the request is clear and bounded.
- Before implementation, briefly share your understanding and the necessary work. Afterward, summarize the changes and how they were checked.

## Implementation Principles

- Use the minimum code and structure needed to deliver the requested result. Do not add unrequested features, speculative abstractions, or configuration.
- Keep changes focused on the request and respect the existing style and structure. Avoid unrelated cleanup or refactoring.
- Remove code made unused by your own changes. Do not remove pre-existing unused code without being asked; mention it instead.
- In later styled stages, use the Pretendard typeface for all text. Weight and size may vary. Stage 01 deliberately uses the browser default font.
- In later styled stages, use a white background and black text. Gray text may be used for secondary information or hierarchy. Do not add CSS to Stage 01 to enforce this palette.
- Design layouts and interactions so the portfolio work is easy to view, with a coherent relationship between the exhibition-style reference and the actual content of this project.

## Commits and Pull Requests

- Present the concrete changes for user review before committing. Do not commit, push, or deploy without explicit approval for that action. Connecting a Git remote does not authorize a push or deployment.
- The root repository connects to `https://github.com/jeondowon/sanghyeop.git`. Keep each stage independently accessible from the index.

- Do not include Claude or Codex as a contributor or co-author in commits, pushes, or pull requests.

## Verification

- Use existing verification methods appropriate to the changed behavior or screen. Do not create or run a new testing setup unless requested.
- The active stages need no package manager or build step. Follow the preview command in `README.md` and check local links, asset coverage, and each stage’s intended capabilities when verifying changes. Stages 01–02 must have no styling; Stages 01–04 must have no JavaScript.
