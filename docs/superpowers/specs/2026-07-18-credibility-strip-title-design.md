# Credibility Strip Title Design

## Purpose

Make the credibility-strip heading read unmistakably as a section title while preserving the existing Living Ingredients identity and compact proof-point content.

## Visual hierarchy

- Move the heading above the proof-point list within the existing page container.
- Render it in the existing Newsreader display face at approximately 2rem with a compact editorial line-height.
- Give the heading enough space below it to separate it from the proof points without creating a large standalone section.
- Keep the white background, mist-blue divider, orange organic markers, existing copy, and existing reveal motion.

## Responsive behavior

- Desktop: title on its own row; four proof points form a second horizontal, wrapping row.
- Mobile: title remains prominent; proof points stack vertically beneath it.
- The English and Vietnamese titles use the same structural and typographic treatment.

## Accessibility and interfaces

- Retain the semantic `h2`, `aria-labelledby`, list markup, and current component props.
- Do not change localized copy or introduce additional decoration.

## Verification

- Update the existing homepage design contract to require the title-first layout and display typography.
- Run the focused contract test, full Bun suite, Astro check, and production build.
- Inspect the English and Vietnamese homepages at desktop and mobile widths for hierarchy, wrapping, overflow, and console health.
