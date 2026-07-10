# AI Search Agent — Homepage Plan

## Design Inspiration

| Site | Key Takeaways |
|------|---------------|
| **clarasight.com** | Clean B2B SaaS layout, gradient hero, feature grid with icons, stats counters, testimonial cards, FAQ accordion, security badges, sticky nav |
| **cypher.build** | Bold typography, numbered sections (01/02/03), problem→solution framing, dark theme, results-driven cards, comparison tables |
| **pieces.framer.website** | Animated hero, developer-focused, stats (1M+/17M+/5M+), plugin integrations grid, testimonial carousel, product-first design |

## Design Direction

**Vibe:** Modern, intelligent, trustworthy — blending the clean B2B polish of Clarasight with the bold typography of Cypher and the developer credibility of Pieces.

**Color Palette:** Leveraging existing shadcn theme (neutral base, blue accent). Dark mode supported via `next-themes`.

**Typography:** Bricolage Grotesque (headings), Nunito (body), Geist Mono (code) — already configured.

## Section Architecture (one component per file)

```
components/home/
├── Navbar.tsx              # Sticky nav: logo + links + theme toggle + CTA
├── Hero.tsx                # Big headline, subtext, search bar preview / CTAs
├── Features.tsx            # Grid of capability cards with icons
├── HowItWorks.tsx          # Numbered step cards (01, 02, 03)
├── Stats.tsx               # Key metrics row
├── Integrations.tsx        # Connector/platform logos/support list
├── Testimonials.tsx        # Quote carousel or card grid
├── FAQ.tsx                 # Accordion questions
├── CtaSection.tsx          # Final call-to-action banner
└── Footer.tsx              # Links, social, copyright
```

## Build Order

1. `Navbar.tsx` — sticky transparent→solid on scroll, logo, nav links, theme toggle, "Get Started" CTA
2. `Hero.tsx` — large headline + animated gradient/subtle bg, supporting text, dual CTAs, optional search bar preview
3. `Features.tsx` — 3×2 or 4-column grid, icon + title + description, hover lift effect
4. `HowItWorks.tsx` — 3 numbered steps with connector line, icon, heading, description
5. `Stats.tsx` — horizontal row of animated counters (queries answered, sources indexed, etc.)
6. `Integrations.tsx` — logo grid or pill badges showing supported connectors
7. `Testimonials.tsx` — card grid or simple carousel with avatar, quote, name, title
8. `FAQ.tsx` — accordion items using shadcn patterns
9. `CtaSection.tsx` — gradient banner with heading + button, subtle animation
10. `Footer.tsx` — multi-column: product links, resources, company, social, copyright
11. `page.tsx` — compose all sections in order
