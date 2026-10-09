# Lighthouse Performance Optimization Report

## 1. Original Lighthouse Results

| Metric | Supplied baseline |
| --- | ---: |
| FCP | 24.7 s |
| LCP | 24.7 s |
| TBT | 0 ms |
| CLS | 0.191 |
| Speed Index | 25.0 s |
| TTFB | ~2.7 s |
| Render-blocking savings estimate | ~18,060 ms |
| Maximum critical-path latency | ~44,493 ms |
| Total transfer | ~88 KiB |
| Google Fonts transfer | ~65.7 KiB |
| Reported DOM elements | 883 |

Test conditions supplied: Lighthouse 13.4.1, Chromium 154, Moto G Power emulation, slow 4G, initial navigation.

## 2. Root Causes

- This checkout is a static single-page HTML site. It has no application framework, server components, database, API requests, authentication, middleware, or build scripts. The full page is served from `index.html`; CSS is inline.
- The document linked a render-blocking Google Fonts stylesheet for Cinzel, Plus Jakarta Sans, and Playfair Display. This adds an external CSS request followed by font requests on the critical path. It is the directly verifiable first-party bottleneck matching the supplied report.
- The supplied report does not include the LCP element selector or trace. The hero is text in the source, with no hero image; its H1 is a plausible LCP candidate, but the exact LCP element is unconfirmed.
- The source has no server work that explains a 2.7 s TTFB. A single request to the currently deployed Vercel URL returned a cache HIT with ~423 ms TTFB during this audit; it was not a post-change deployment and is not a comparable performance run.
- The supplied report's 883-element DOM and 210-child SVG/container findings do not match this checkout. A static DOM parse counted 913 elements before and 911 after; the existing inline SVGs are small icons. No large 210-child SVG was found.
- All ten profile images are already WebP and lazy-loaded. Their combined source size is 174,128 bytes; there is no hero image.

## 3. Performance Bottlenecks

The Google Fonts CSS dependency is removed and its visible typefaces are served from local, subsetted WOFF2 files. Inline CSS, HTML content, and the existing image delivery formats remain. TTFB, the supplied LCP timing, main-thread traces, and Lighthouse's render-blocking estimate require a browser run against a deployed revision before they can be confirmed as improved.

## 4. Changes Made

- Replaced the external font stylesheet with four local font subsets and preloads for the two above-the-fold families.
- Moved the page interactions to a deferred same-origin script; kept Vercel Insights and its command queue.
- Batched the scroll-header update in `requestAnimationFrame` and made its event listener passive.
- Replaced the pulse's animated `box-shadow` with a transform/opacity ring; added reduced-motion handling.
- Added intrinsic dimensions and asynchronous decoding to the existing profile images.
- Improved control semantics, keyboard focus, footer heading hierarchy, and the quick-contact navigation landmark.
- Added Vercel response headers and immutable caching for versioned font paths.
- Kept every visible text node, section, card, image, link, and feature.

## 5. Font Optimization

The page now self-hosts variable WOFF2 subsets for Plus Jakarta Sans (weights 300–800), Playfair Display (600–700), and Cinzel (500–900). Plus Jakarta Sans has a separate small subset for the rupee glyph. All font files were subset to visible page characters, including ₹, punctuation, and symbols. The files total 50,360 bytes (about 49.2 KiB), compared with the reported ~65.7 KiB Google Fonts transfer, a potential saving of about 16.5 KiB (25%). This is an asset-size comparison, not a measured Lighthouse transfer result.

The two hero text families are preloaded; Cinzel is not preloaded. Faces use `font-display: swap`. Metric override values were not added because no browser-based font-layout measurement was available; the after CLS must be measured after deployment.

## 6. LCP Optimization

There is no image or background image in the hero. The hero content is present in the initial HTML, and local font preloads remove the external stylesheet dependency for its typography. The exact LCP node cannot be identified from the supplied summary, which omits the LCP element details, and Chromium could not run in this container. Do not treat the hero H1 as a measured LCP element until a Lighthouse trace confirms it.

## 7. TTFB Optimization

No page-side server or data request exists to optimize. The deployed site is static on Vercel; the audit's single live sample was served from a Vercel cache HIT at ~423 ms TTFB, versus the supplied report's ~2.7 s. This difference may reflect test conditions, cache state, or deployment revision. The source changes do not claim to improve origin latency; deployment/CDN diagnostics are needed if the high TTFB persists.

## 8. CSS Optimization

The existing inline stylesheet was retained to avoid splitting the critical styles into another blocking request. No broad CSS deletion or responsive-state cleanup was attempted without a browser. The Google Fonts stylesheet and preconnects were removed. No external CSS remains.

## 9. JavaScript Optimization

The small navigation, FAQ, and scroll behaviors now live in `script.js`, loaded with `defer`; this removes executable inline scripts and inline event attributes without removing functionality. The Vercel Insights bootstrap remains ahead of its existing deferred loader, and its same-origin page-view requests remain allowed by the CSP. No API calls, libraries, or client-side rendering were present. JavaScript execution was checked in jsdom; a real browser performance trace was unavailable.

## 10. Image Optimization

All ten existing WebP profile images remain in place, retain their original alternative text, and remain lazy-loaded. Their actual intrinsic width and height are now declared in HTML, and image decoding is asynchronous. The image wrapper already reserves a fixed display area. No image was converted or removed because the assets are already WebP and relatively small.

## 11. DOM Optimization

The static parse counted 913 elements in the original checkout and 911 after the changes. The two-element decrease comes from replacing external font links and inline script markup with the current local setup; repeated page content was not removed or structurally compressed. This does not match the report's 883-element figure, so the tested report and current checkout may differ.

## 12. CLS Fixes

Local WOFF2 faces remove the external font stylesheet dependency, and preloading the two hero families shortens their discovery path. Profile image dimensions are explicit. The largest reported shift was attributed to Playfair Display; `font-display: swap` remains, so some fallback-to-webfont reflow is still possible. No post-change CLS measurement is available, and the target of ≤0.1 is not yet verified.

## 13. Animation Optimization

The hero pulse no longer animates `box-shadow`; its dot uses transform and its expanding ring uses transform and opacity. Other hover shadows are retained because they are part of the visual interaction. A `prefers-reduced-motion` rule respects user motion preferences.

## 14. Accessibility Fixes

The footer headings now use H2 rather than jumping to H4, the sticky contact actions have a named navigation landmark, profile contact links have contextual accessible names, FAQ state is exposed with `aria-expanded`/`aria-controls`, and `:focus-visible` is defined. The bright CTA backgrounds were darkened while retaining their color roles; the revised white-text combinations calculate between 5.35:1 and 8.63:1. Targeted axe checks for landmarks, heading order, image alternatives, link/button names, and ARIA returned zero violations. jsdom cannot evaluate the full color-contrast audit; a browser Lighthouse accessibility run is still needed.

## 15. Security Header Changes

`vercel.json` configures CSP, COOP, X-Frame-Options, `nosniff`, Referrer-Policy, Permissions-Policy, and immutable caching for `/fonts/` assets. The CSP allows same-origin scripts, connections, fonts, and images, the data-URI favicon, inline styles required by the current page, and the exact SHA-256 hash of the JSON-LD block. It blocks inline script attributes, objects, and framing, and enforces Trusted Types. The currently deployed response did not show CSP or COOP; these settings are not live until this revision is deployed. Verify Vercel Insights and CSP behavior in production after deployment.

## 16. SEO Preservation Check

The title, description, keywords, canonical, robots directive, Open Graph/Twitter tags, JSON-LD, crawlable links, and image alternative text were preserved. The JSON-LD still parses and its CSP hash was checked against the exact script contents. Footer heading levels changed without changing their text.

## 17. Content Preservation Check

Visible body text was compared with `HEAD:index.html` after normalizing whitespace; the strings are identical. Source counts are unchanged: 27 headings, 23 paragraphs, 7 sections, 11 article elements, 10 images, 277 links, 2 buttons, and 0 forms. All ten profile cards and the existing rate and feature cards remain. There was no search/filter or account functionality in this project. Menu, FAQ, scroll behavior, image paths, and the analytics queue were exercised in a DOM test.

## 18. Before/After Lighthouse Results

| Metric | Before | After | Improvement |
| --- | ---: | ---: | --- |
| FCP | 24.7 s | Not measured | Pending browser run |
| LCP | 24.7 s | Not measured | Pending browser trace |
| TBT | 0 ms | Not measured | Pending browser run |
| CLS | 0.191 | Not measured | Pending browser run |
| Speed Index | 25.0 s | Not measured | Pending browser run |
| TTFB | ~2.7 s | Not measured for changed deployment | Pending deployment |
| Render-blocking savings | ~18,060 ms | Not measured | Pending browser run |
| Critical-path latency | ~44,493 ms | Not measured | Pending browser run |
| Font files | ~65.7 KiB reported | 49.2 KiB local assets | ~16.5 KiB lower asset size |
| DOM elements | 883 reported | 911 static parse | Not comparable; source baseline was 913 |

A production build command is not available because this is a static site with no `package.json`; the files were served directly with Python's static server and returned HTTP 200. Lighthouse 13.4.1 was attempted with the requested mobile/slow-network settings, but Chromium failed to start because the container lacks system libraries (`libatk`, `libcups`, `libgbm`, X11 libraries, and others). Installing them requires elevated permissions. No comparable after-Lighthouse score is claimed.

## 19. Remaining Issues

- Deploy the revision before evaluating Vercel headers, font caching, and production TTFB.
- Run Lighthouse 13.4.1 on the deployed revision with Chromium 154, Moto G Power emulation, and slow 4G, then record the actual FCP, LCP element, CLS, TBT, Speed Index, request chain, transfer, and main-thread results.
- If the 2.7 s TTFB persists after deployment, inspect Vercel region/cache/origin response timing; this repository has no dynamic server path.
- Verify the live CSP does not block Vercel Insights, and run browser-based responsive and contrast checks.
- The supplied 883-element and large-SVG findings do not match the current source; confirm the report URL/revision before pursuing those items.

## 20. Final Recommendation

The external font CSS dependency is removed, local font assets are smaller than the reported font transfer, and content/functionality checks pass without deleting visible content. Treat the result as source-verified optimization, not a proven Core Web Vitals improvement. Deploy, verify the security policy and analytics, then repeat the specified Lighthouse test before accepting the FCP/LCP/CLS targets.
