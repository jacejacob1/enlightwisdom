# Enlight Wisdom — website

Single-page site for Enlight Wisdom: robotics & AI automation + education division.
Built with Next.js 16 (App Router), Tailwind CSS 4, Motion (Framer Motion), Three.js and Lenis.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Production check:

```bash
npm run build && npm run start
```

## Deploy to Vercel

Push this folder to a GitHub repo and import it in Vercel (framework preset: Next.js), or run `npx vercel` from this folder.
No environment variables are needed.

## Where things live

| What | File |
| --- | --- |
| All website copy (from the content doc) | `src/lib/content.ts` |
| Colours, type, themes (paper / ink / orange) | `src/app/globals.css` |
| Fonts + SEO metadata | `src/app/layout.tsx` |
| Hero robot "Spark" (Three.js) | `src/components/hero/robot.ts` |
| Sections | `src/components/sections/*` |
| Product demos (Shiken, SIARC/FIACC, ErgoTrack, Carisk) | `src/components/demos/*` |

In headlines, words wrapped in `*asterisks*` in `content.ts` are set in the italic serif.

## To fill in before launch

- **Social links**: add the LinkedIn, YouTube, Instagram and Facebook URLs in `site.social` in `src/lib/content.ts`. Empty ones stay hidden.
- **Enquiry form**: there is no backend yet. On submit, the visitor sends the pre-written message by WhatsApp (+91 73959 14690) or email (connect@enlightwisdom.com). To store enquiries, add a Supabase table or an email API route later.
- **Partner logos**: partners show as name cards with initials. Drop real logos into `public/` and add them to `partners.items` if you'd like logos.
- **Domain**: `metadataBase` in `layout.tsx` is set to `https://enlightwisdom.com`. Change it if the site lives elsewhere.

## Interactive pieces, by section

- Hero: Spark follows the cursor, waves and talks when clicked, can be dragged to spin, and changes gear on the CTA hovers (cap for teaching, gears for automation). The mode switch does the same on touch screens.
- Two divisions: drag the centre handle (or use the arrow keys) to open either division.
- About: the "At a glance" card tilts with the cursor.
- Services: pick a service to see it animated. The process track fills as you scroll.
- Products: four live simulations.
- Education: schools/colleges toggle plus a course picker that pre-fills the enquiry.
- Partners: filter, drag/swipe, arrows.
- Why us: each stat lights up a 100-dot field.
- Team: lift the robot visor to meet the person.
- Contact: validated form with a little robot that watches (and covers its eyes for your phone number).

Components adapted from Magic UI (the open source behind many 21st.dev components): number ticker, card spotlight.
