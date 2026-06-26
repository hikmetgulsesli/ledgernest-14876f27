---
name: LedgerNest Workspace
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-sm:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style

The design system is built for the high-efficiency freelancer. It adopts a **Corporate / Modern** aesthetic that prioritizes utility over decoration, favoring a "Dense but Calm" approach. The interface functions as a professional tool rather than a marketing landing page, emphasizing deterministic layouts and functional clarity.

The brand personality is trustworthy and precise. It creates a focused environment where data density is managed through generous white space between functional groups, sharp iconography, and a disciplined color application. The emotional response should be one of "controlled productivity"—the user feels in command of complex financial data without being overwhelmed by visual noise.

## Colors

This design system utilizes a structured palette designed for financial accuracy and long-duration focus.

- **Primary (#2563eb):** Reserved for primary actions, active navigation states, and critical interactive elements.
- **Surface & Background:** A dual-tone approach using `#f8fafc` for the application canvas and `#ffffff` for interactive containers and cards to create clear separation.
- **Semantic Accents:** Emerald green (`#10b981`) is used strictly for success and "Paid" statuses. Amber (`#f59e0b`) indicates pending or draft states. Rose/Red is used sparingly for overdue or error states.
- **Typography:** Charcoal (`#1e293b`) provides high-contrast readability for data points, while slate grays are used for secondary labels and metadata.

## Typography

The typography system relies on **Inter** for its exceptional legibility at small sizes and its neutral, systematic character. 

To maintain high density without sacrificing clarity:
- **Tight Line Heights:** Values are optimized for data-heavy tables and forms.
- **Weighted Hierarchy:** Font weight is used more frequently than size increases to differentiate information levels.
- **Tabular Numerals:** Always use font-feature-settings: "tnum" for financial figures in tables to ensure vertical alignment of decimal points.
- **Small Caps for Labels:** `label-sm` is used for category headers and non-interactive metadata to provide visual variety without increasing font size.

## Layout & Spacing

This design system uses a **Fixed Grid** layout for the main content area to maintain a consistent reading line, while the sidebar remains fixed at 240px.

- **8pt Grid System:** All spacing between elements must be a multiple of 4px, with 8px and 16px being the standard increments for component internals.
- **High-Density Spacing:** Component padding is intentionally compact (e.g., 8px vertical padding in tables) to maximize information on the screen.
- **Breakpoints:**
  - **Mobile (<768px):** Single column, 16px side margins, collapsible sidebar.
  - **Tablet (768px - 1024px):** 12-column fluid grid, 16px gutters.
  - **Desktop (>1024px):** 12-column fixed grid with a 1440px max-width, 24px gutters.

## Elevation & Depth

The system uses **Low-contrast outlines** and subtle tonal layers to create depth, avoiding heavy shadows that create visual clutter in dense views.

- **Surface Layer:** `#f8fafc` (Background).
- **Container Layer:** `#ffffff` with a 1px border of `#e2e8f0`.
- **Interaction Elevation:** On hover, cards or buttons may gain a very soft, ambient shadow (0px 2px 4px rgba(0,0,0,0.05)) to indicate interactivity.
- **Separation:** Use thin 1px horizontal rules in `#f1f5f9` to separate table rows and list items, rather than spacing, to maintain high density.

## Shapes

The shape language is **Soft** but disciplined. 

- **Components (Buttons, Inputs):** 0.25rem (4px) corner radius. This provides a modern feel while retaining the structural rigidity associated with professional financial software.
- **Containers (Cards, Modals):** 0.5rem (8px) corner radius for larger surfaces.
- **Badges/Status:** 100px (Pill) for status indicators to distinguish them clearly from interactive buttons.

## Components

### Data Tables
- **Styling:** Borderless cells with a 1px bottom border on rows. 
- **Interaction:** Row background changes to `#f1f5f9` on hover. 
- **Density:** 8px vertical cell padding for "Compact" mode, 12px for "Standard" mode.

### Buttons
- **Primary:** Solid `#2563eb` with white text.
- **Secondary:** Outline variant with `#e2e8f0` border and `#1e293b` text.
- **Sizes:** Small (28px height) for table actions; Medium (36px height) for standard forms.

### Input Fields
- **Styling:** 1px border (`#cbd5e1`), white background. On focus: 1px border (`#2563eb`) with a 2px soft blue focus ring.
- **Labels:** Always positioned above the field using `label-md` in slate-500.

### Status Badges
- **Paid:** Light emerald background with deep emerald text.
- **Draft:** Light amber background with deep amber text.
- **Overdue:** Light rose background with deep rose text.
- **Shape:** Full pill-shaped (`rounded-xl`).

### Summary Metric Cards
- **Structure:** `label-sm` for the metric title at the top, `headline-lg` for the primary value, and a small footer for "percentage change" or "trend" indicators.
- **Visuals:** Flat white background with a subtle border; no shadow unless hovered.