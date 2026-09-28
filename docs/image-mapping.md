# Portfolio Image Mapping

Source: `presentation.pdf` (8 pages) and the 48 files in `작품이미지/`. All pages and source images were visually compared.

## Assignment

| Website section | PDF pages | Source files |
| --- | --- | --- |
| VILLAIN UNIVERSE | 2–4 | `제목_없는_아트워크 (1).png`<br>`제목_없는_아트워크.png`<br>`540.png`<br>`character_blink_reference_style.gif`<br>`ChatGPT Image 2026년 9월 9일 오후 04_50_15.png`<br>`ChatGPT Image 2026년 9월 9일 오후 04_56_13.png`<br>`ChatGPT Image 2026년 9월 15일 오전 09_40_09.png`<br>`ChatGPT Image 2026년 9월 9일 오후 04_50_47.png` |
| FRIEREN | 5 | `IMG_2986.jpeg` |
| PAIN | 5 | `A89410B0-FE10-45C3-8475-0DA8AAD31792.jpeg` |
| AKAZA | 6 | `3232.png` |
| ORIGINAL CHARACTER | 6 | `제목_없는_아트워크2.png` |
| CHWIRAM BLUE | 7 | `무당.jpg` |
| FANTASY WARRIOR | 7 | `IMG_0316.jpeg`<br>`IMG_0315.jpg`<br>`IMG_1584.png`<br>`IMG_0274.png` |
| DEMON OF THE BATTLEFIELD | 8 | `불꽃여자.png` |
| IMAGE EXPERIMENTATION | 8 | `포토샵 연습.jpg` |
| OTHER WORKS | Not in PDF | `IMG_0432.png`<br>`IMG_0179.png`<br>`19DA86F8-A35B-4D2B-82AC-260D59301519.jpeg`<br>`11.jpeg`<br>`적색.jpg`<br>`도록용 1.jpg`<br>`도록용 2.jpg`<br>`표지앞면.jpg`<br>`85114.jpg`<br>`무제-112.jpg`<br>`무제-113.jpg`<br>`무제-114.jpg`<br>`무제-115.jpg`<br>`무제-117.jpg`<br>`무제-118.jpg`<br>`무제-119.jpg`<br>`무제-120.jpg`<br>`무제-121.jpg`<br>`무제-154.jpg`<br>`무제-155.jpg`<br>`무제-180.jpg`<br>`ChatGPT Image 2026년 9월 10일 오후 06_18_25.png`<br>`ChatGPT Image 2026년 9월 10일 오후 06_25_44.png` |

## Repeated Artwork

The same artwork appears in multiple source files. The website displays the larger version once. Original files are preserved.

| Smaller or alternate source | Displayed source |
| --- | --- |
| `33.jpg` | `ChatGPT Image 2026년 9월 9일 오후 04_50_47.png` |
| `44.jpg` | `제목_없는_아트워크.png` |
| `55.jpg` | `제목_없는_아트워크 (1).png` |
| `66.jpg` | `ChatGPT Image 2026년 9월 9일 오후 04_56_13.png` |
| `77.jpg` | `ChatGPT Image 2026년 9월 9일 오후 04_50_15.png` |
| `무제-1.jpg` | `표지앞면.jpg` |

## Content Notes

- Page 1 supplies the designer biography, contact address, education, roles, certifications, software skills, and portrait. The portrait is extracted from the PDF; all artwork uses the supplied image folder.
- Pages 2–4 form one VILLAIN UNIVERSE project. Stage 01 shows its images without visible labels. Stage 02 labels AI-generated imagery explicitly. The GIF matches the image on page 2; Stage 01 shows a still, while Stage 02 links to the animation.
- The four FANTASY WARRIOR sketches match page 7 individually.
- Unlisted images appear in the final OTHER WORKS section. Names such as ADSCENT, COURAGE, and SCARLET RED are visible in the artwork; no dates or client credits have been invented.
- In Stages 01–09, OTHER WORKS includes two AI expression sheets that are not shown in the PDF. Stage 10 moves them into VILLAIN UNIVERSE at the user’s request, retaining explicit AI labels.
- 48 source files resolve to 42 displayed artworks (19 matching the PDF and 23 additional works), plus the portrait.
- `asset-inventory.json` records each original file and its selected display ID.

## Reference Structure

The reference site uses a persistent left introduction/project index and a right project area with descriptions and image slideshows. Stage 01 presents the images alone. Stage 02 adds text and section anchors in plain HTML. Stages 03–07 progressively add typography, the two-column layout, project navigation, galleries, and mobile refinements. Stages 01–07 use the original image assignments. Stages 08–10 follow the revision record below. Reference imagery and text are not copied.

## Stage 08 revision — 2026-09-28

Source: `수정사항.pdf`, all 5 pages, and the user's confirmation to merge **all four** existing FANTASY WARRIOR sketches, including the work-in-progress screen capture. The revision lives in `stages/08-style-revision/` (스타일 수정). Stage 07 retains the original draft (완성본(초안)); earlier stages and all source/display assets are preserved.

| Section | Display IDs | Revision |
| --- | --- | --- |
| VILLAIN UNIVERSE | 44, 45, 06 | Each artwork has its own gallery: full composition plus three detail views. |
| VILLAIN UNIVERSE — AI Image Generation | 25, 15, 17, 14, 16 | Group the motion study and AI imagery separately, with explicit AI labels. |
| FRIEREN / PAIN / AKAZA / ORIGINAL CHARACTER | 24 / 11 / 03 / 46 | Retain each project, with three detail views per artwork. |
| CHWIRAM BLUE / DEMON OF THE BATTLEFIELD / IMAGE EXPERIMENTATION | 28 / 42 / 47 | Retain each project, with three detail views per artwork. |
| OTHER WORKS — sketches | 21, 20, 23, 19 | Move all four sketches here; remove the standalone FANTASY WARRIOR menu entry. Keep its old hash usable. |
| OTHER WORKS — graphic poster | 43 | Retain SCARLET RED, with three detail views. |
| OTHER WORKS — AI Expression Study | 12, 13 | Retain together, with explicit AI labels. |

Excluded from Stages 08–10 only:

- IDs 22 and 18: armored angel and unfinished Miku.
- IDs 01 and 02: excluded from Stages 08–09 per revision page 3, then restored to OTHER WORKS in Stage 10 at the user’s request.
- IDs 26 and 27: ADSCENT brand design.
- IDs 48, 10, and 30–41: COURAGE digital editorial design.

The final selection contains 22 distinct artworks: 15 original artworks and 7 AI/motion images, plus the portrait. The 15 original artworks each have three detail views (45 in total). Detail coordinates are stored in each figure's `data-detail-views` in Stage 08 HTML as normalized `[x, y, width, height]` rectangles, and rendered with SVG viewports using the existing WebP assets. No pixels are regenerated, no originals are cropped or overwritten, and detail views are not counted as additional artworks.

## Stage 09 layout and interaction revision

`stages/09-layout-interaction/` retains Stage 08’s 22 artworks and the same 45 detail rectangles. It moves the complete About profile to the left beside the project list, enlarges the portrait, places normal gallery arrows beside the artwork, adds directional slide transitions, and closes the lightbox when its image is clicked again. Lightbox arrows remain below the image. Stage 08 preserves the original PDF revision before these follow-up changes.

## Stage 10 continuous scrolling

`stages/10-full-scroll/` keeps Stage 09’s 22 artworks and restores IDs 01 and 02, totaling 24 artworks and 51 detail rectangles. All projects appear in one continuous page, with smooth anchor navigation from the project list. Contact moves to the end of About, image transitions last one second, and the process-index link moves to the top-right of the portfolio. Stage 09 preserves the preceding committed layout and interaction version.

Stage 10 artwork regrouping: at the user’s request, AI expression sheets **12 and 13** move from OTHER WORKS to the end of VILLAIN UNIVERSE’s **AI Image Generation** gallery. That gallery now contains IDs **25, 15, 17, 14, 16, 12, 13** (7 images). OTHER WORKS now contains IDs **02, 43, 01, 21, 20, 23, 19** (7 artworks), including the restored character line drawing and color illustration requested by the user. ID **01**, titled **Character Line Art**, sits immediately before the four sketches; ID **02** is titled **Character Illustration — 02**. These English titles are used consistently in headings, gallery labels, and lightbox artwork metadata. Both restored works have three detail views, retaining the original artwork files. The portfolio now contains 24 distinct artworks (17 original artworks and 7 AI/motion images); Stages 01–09 and original assets are unchanged.
