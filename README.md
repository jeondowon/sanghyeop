# Sanghyeop Lee — Portfolio

A portfolio website for designer Sanghyeop Lee, developed in separate, reviewable stages. Each stage will remain available at its own link when the site is eventually deployed together.

## Current Stage

- `index.html`: links to the available development stages.
- `stages/01-html/index.html`: the first portfolio version, written in plain semantic HTML.
- Stage 01 includes the designer biography, project descriptions, all 42 selected artworks, and contact information.
- It uses browser defaults with no CSS, inline styles, custom fonts, JavaScript, framework, or build step. Image links open larger display copies; the animation has its own link.

Later stages will add the intended design: a white background, Pretendard, black primary text, and gray secondary text. The visual reference is [Eimalive — Drawings Exhibition](https://eimalive.com/#drawings-exhibition).

## Local Preview

Run from the project root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

- Stage index: <http://127.0.0.1:8000/>
- Plain HTML portfolio: <http://127.0.0.1:8000/stages/01-html/>

Use `127.0.0.1` explicitly: `localhost` may resolve to IPv6 and reach another server using the same port.

Both pages also work by opening their `index.html` files directly. All asset links are relative so the same structure can be hosted under a repository subpath.

## Content and Assets

The local `presentation.pdf` supplies the biography, project descriptions, titles, and image assignments. All 48 original files in `작품이미지/` were compared with its eight pages. Six alternate-resolution copies are represented by the larger version, producing 42 displayed artworks:

- 19 artworks in the nine projects described in the PDF.
- 23 additional artworks in the final Other Works section.

AI-generated images keep explicit labels. The profile portrait comes from PDF page 1.

See [the image mapping](docs/image-mapping.md) and [the source inventory](docs/asset-inventory.json) for the assignments. Display assets live in `assets/artworks/`. The original PDF and artwork folder remain local and are excluded from Git; all images needed to display the site are included in the display assets.

The optional `scripts/prepare-assets.py` utility creates WebP display copies from the local originals using Python and Pillow. It is not needed to run the site. The existing portrait is preserved; regenerating it additionally requires extracting page 1 to `tmp/pdfs/portrait-000.jpg`.

## Stage Workflow

1. Keep each stage in a separate folder under `stages/`.
2. Preserve completed stages as examples of the development process.
3. Add a link to each completed stage in the root `index.html`.
4. Present changes for user review before committing.
5. Commit, push, or deploy only after explicit user approval for that action.

The GitHub remote is `https://github.com/jeondowon/sanghyeop.git`. The root repository has no commits yet. The intended first commit contains the unstyled HTML stage and its supporting assets and documentation.

An earlier styled prototype and its separate local Git history remain in `web/`. That directory is excluded from this repository and is not part of the first commit or the stage index.

See [AGENTS.md](AGENTS.md) for collaboration guidelines.
