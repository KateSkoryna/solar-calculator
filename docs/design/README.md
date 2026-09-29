# Daylight design files

HTML design for the Solar Calculator redesign. The written spec is [`../design-guidelines.md`](../design-guidelines.md); these files are the visual reference that goes with it.

| Folder | What it is | How to open |
|---|---|---|
| `preview/` | Static HTML snapshot of every screen, plus a gallery (`preview/index.html`). | Open `preview/index.html` in a browser. Needs internet for the Google Fonts. |
| `canvas/` | Source files exported from the Design canvas (`*.dc.html` + `canvas.json` layout). | Only render inside the canvas editor; read them as markup reference. |

## Screens

| Screen | Desktop (1440) | Tablet (834) | Mobile (390) |
|---|---|---|---|
| Home | `Main` | `HomeTablet` | `HomeMobile` |
| Calculator | `Calculator` | `CalculatorTablet` | `Mobile` |
| Results | `Results` | `ResultsTablet` | `ResultsMobile` |
| Log in / Create account | `Login` | `LoginTablet` | `LoginMobile` |
| Fleet dashboard | `Dashboard`, `DashboardDark` | `DashboardTablet` | `DashboardMobile` |
| Team & activity | `Audit`, `AuditDark` | `TeamTablet` | `TeamMobile` |

## Things to know

- **These are designs, not app code.** They use inline styles and fixed artboard sizes. Build the real UI with Tailwind and tokens as described in the guidelines and `CLAUDE.md`; do not copy the markup.
- **Previews are static.** Interactive states (calculator steps, login tabs, activity filters, the mobile Activity/Team switch) show their default state. The clickable versions live on the canvas.
- **All names and numbers are sample data** (Nordwind Logistics, €4,200, 6.1 t, …).
- **Source of truth:** the canvas at https://claude.ai/artifact/AJtdxiE7r7L2W5zWzfZ1C4 (private; the owner must share it). If the canvas changes, re-export `canvas/` and regenerate `preview/`.
