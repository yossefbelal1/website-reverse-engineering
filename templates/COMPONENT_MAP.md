# Component Map & Structural Hierarchy

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level A (DOM Architecture) & Level D (Component Boundary Factoring)

---

## 1. Top-Level Page Hierarchy

```
Page (Root Landing)
├── AnnouncementBar (optional banner)
├── Header / NavigationBar
│   ├── BrandLogo
│   ├── DesktopNavMenu
│   │   └── NavDropdown (Products, Resources)
│   ├── SearchTrigger
│   ├── AuthActions (Login, Signup CTA)
│   └── MobileMenuToggle (Hamburger button)
├── MainContent
│   ├── HeroSection
│   │   ├── BadgeNotice
│   │   ├── HeroHeading (Display title with accent gradient)
│   │   ├── HeroDescription
│   │   ├── HeroActions (Primary CTA + Secondary Watch Demo)
│   │   └── HeroMedia (Dashboard Mockup / Video / Graphic)
│   ├── SocialProofSection (Logo cloud / Trusted by)
│   │   └── BrandLogoItem[]
│   ├── FeatureGridSection
│   │   ├── SectionHeader
│   │   └── FeatureCard[]
│   │       ├── CardIcon
│   │       ├── CardTitle
│   │       ├── CardDescription
│   │       └── CardActionLink
│   ├── DeepDiveFeatureSection (Alternating 2-column layout)
│   │   ├── TextColumn
│   │   └── InteractiveIllustrationColumn
│   ├── TestimonialCarouselSection
│   │   ├── TestimonialCard
│   │   └── CarouselControls (Dots / Prev / Next)
│   ├── PricingSection
│   │   ├── BillingToggle (Monthly / Annual)
│   │   └── PricingCard[] (Tier cards: Free, Pro, Enterprise)
│   ├── FAQAccordionSection
│   │   └── AccordionItem[] (Expandable Q&A rows)
│   └── CTASection (Final banner before footer)
├── Footer
│   ├── FooterBrandColumn
│   ├── FooterNavGroup[] (Product, Company, Legal, Social)
│   └── BottomCopyrightBar
└── OverlayLayer (Portal targets)
    ├── MobileNavigationDrawer
    ├── SearchModalDialog
    └── VideoModalPlayer
```

---

## 2. Component Inventory & Props Breakdown

### A. Atomic Primitives
| Component Name | Observed Variants | Key Props / Attributes | Subcomponents / Icons | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- |
| `Button` | `primary`, `secondary`, `outline`, `ghost` | `size (sm, md, lg)`, `disabled`, `isLoading` | `IconLeft`, `IconRight`, `Spinner` | Level B |
| `Badge` | `neutral`, `brand`, `success` | `variant`, `size (sm, md)` | `Icon` | Level B |
| `Input` | `text`, `email`, `search` | `placeholder`, `error`, `icon` | `SearchIcon`, `ClearButton` | Level B |
| `Avatar` | `circle`, `rounded` | `src`, `alt`, `size (32px, 40px)` | Fallback initials | Level B |

### B. Composite Components
| Component Name | Internal Elements | State Requirements | Responsive Behavior | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- |
| `NavigationBar` | Logo, NavLinks, CTA, Hamburger | `isScrolled (boolean)`, `isMenuOpen` | Links collapse into slide-out drawer on `<1024px` | Level C |
| `FeatureCard` | Icon container, Heading, Paragraph, Link | `isHovered (boolean)` | Stacks vertically, subtle Y-lift on hover | Level C |
| `PricingCard` | Tier badge, Price, Billing interval, Feature list, CTA | `isFeatured (boolean)`, `billingCycle` | 3-column desktop $\rightarrow$ 1-column mobile stack | Level C |
| `AccordionItem` | Trigger button, Chevron icon, Expandable panel | `isOpen (boolean)` | Height animation `0` to `auto` via grid/scale | Level C |
| `MobileNavDrawer` | Backdrop, Header, Nav links, Action buttons | `isOpen`, `onClose` | Slides in from right/top, traps focus | Level C |
