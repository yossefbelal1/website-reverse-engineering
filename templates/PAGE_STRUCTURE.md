# Page Structure & Semantic DOM Blueprint

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level A (Directly Observed Semantic DOM Structure)

---

## 1. Full Semantic Landmark Blueprint

```
Document
└── <body>
    ├── <header role="banner" class="sticky top-0 z-50">
    │   └── <div class="container mx-auto flex items-center justify-between">
    │       ├── <div class="brand-logo">
    │       ├── <nav role="navigation" aria-label="Main" class="hidden lg:flex">
    │       │   ├── <a href="#features">
    │       │   ├── <div class="dropdown-wrapper">
    │       │   └── <a href="#pricing">
    │       ├── <div class="header-actions flex items-center gap-4">
    │       │   ├── <button class="btn-ghost"> (Sign in)
    │       │   └── <button class="btn-primary"> (Get Started)
    │       └── <button class="menu-toggle lg:hidden" aria-label="Open Menu">
    ├── <main role="main">
    │   ├── <section id="hero" class="relative overflow-hidden pt-24 pb-16">
    │   │   └── <div class="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
    │   │       ├── <div class="hero-copy flex flex-col justify-center">
    │   │       │   ├── <div class="badge-pill inline-flex items-center">
    │   │       │   ├── <h1 class="hero-title text-display">
    │   │       │   ├── <p class="hero-description text-body-lg">
    │   │       │   └── <div class="hero-cta-group flex gap-4">
    │   │       └── <div class="hero-graphic relative flex items-center justify-center">
    │   │           └── <div class="mockup-frame rounded-2xl shadow-2xl">
    │   ├── <section id="logos" class="border-y border-slate-800 py-12">
    │   ├── <section id="features" class="py-24">
    │   │   └── <div class="container mx-auto">
    │   │       ├── <div class="section-heading text-center max-w-2xl mx-auto mb-16">
    │   │       └── <div class="feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    │   ├── <section id="deep-dive" class="py-24 space-y-24">
    │   ├── <section id="testimonials" class="py-24 bg-slate-950">
    │   ├── <section id="pricing" class="py-24">
    │   ├── <section id="faq" class="py-24 max-w-3xl mx-auto">
    │   └── <section id="cta-banner" class="py-20">
    ├── <footer role="contentinfo" class="border-t border-slate-800 pt-16 pb-12">
    │   └── <div class="container mx-auto">
    │       ├── <div class="footer-columns grid grid-cols-2 md:grid-cols-4 gap-8">
    │       └── <div class="footer-legal flex justify-between border-t border-slate-800 pt-8 mt-12">
    └── <div id="portal-root"> (Modals, Toasts, Drawers)
```

---

## 2. Structural Layout Specifications

| Section | Semantic Element | Container Class / Max Width | Layout Mechanics | Background Style |
| :--- | :--- | :--- | :--- | :--- |
| **Top Navigation** | `<header>` | `max-w-7xl mx-auto px-6` | `flex items-center justify-between` | Glassmorphic blur over dark canvas |
| **Hero Section** | `<section>` | `max-w-7xl mx-auto px-6` | `grid grid-cols-1 lg:grid-cols-2 gap-12` | Radial brand glow behind headline |
| **Logos Cloud** | `<section>` | `max-w-6xl mx-auto px-6` | `flex flex-wrap justify-center gap-8` | Subtle border top/bottom |
| **Feature Grid** | `<section>` | `max-w-7xl mx-auto px-6` | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8` | Flat surface color with border divider |
| **Pricing Table** | `<section>` | `max-w-6xl mx-auto px-6` | `grid grid-cols-1 lg:grid-cols-3 gap-8` | Elevated card for featured tier |
| **Footer** | `<footer>` | `max-w-7xl mx-auto px-6` | `grid grid-cols-2 md:grid-cols-5 gap-8` | Sunken dark background |
