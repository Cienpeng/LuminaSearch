import type { Feature, AppConfig, EngineAdapter } from '../../shared/types'

const STYLE_ID = 'searchbeauti-dark-mode'

const darkCSS = `
:root {
  --sb-bg: #1b1b1f;
  --sb-bg-card: #242428;
  --sb-bg-elevated: #2d2d32;
  --sb-text: #e3e3e8;
  --sb-text-secondary: #b5b5bd;
  --sb-text-muted: #8a8a96;
  --sb-link: #a8c7fa;
  --sb-link-visited: #c9a5f7;
  --sb-border: #3a3a40;
  --sb-accent: #85b4ff;
}

html[data-searchbeauti-dark] {
  color-scheme: dark;
}

/* === Body & Main Background === */
html[data-searchbeauti-dark] body,
html[data-searchbeauti-dark] #b_content,
html[data-searchbeauti-dark] #b_scopebar {
  background: var(--sb-bg) !important;
}

/* === Top header bar === */
html[data-searchbeauti-dark] #b_header,
html[data-searchbeauti-dark] .b_scopebar {
  background: var(--sb-bg-card) !important;
  border-color: var(--sb-border) !important;
}

/* === Search Input === */
html[data-searchbeauti-dark] #sb_form_q {
  background: var(--sb-bg-card) !important;
  color: var(--sb-text) !important;
  border-color: var(--sb-border) !important;
}

/* === Results area — force light text everywhere === */
html[data-searchbeauti-dark] #b_results {
  background: var(--sb-bg) !important;
  color: var(--sb-text) !important;
}

/* Force all text-level elements inside results to inherit light color */
html[data-searchbeauti-dark] #b_results p,
html[data-searchbeauti-dark] #b_results span,
html[data-searchbeauti-dark] #b_results div,
html[data-searchbeauti-dark] #b_results li,
html[data-searchbeauti-dark] #b_results td,
html[data-searchbeauti-dark] #b_results th,
html[data-searchbeauti-dark] #b_results cite,
html[data-searchbeauti-dark] #b_results em,
html[data-searchbeauti-dark] #b_results strong,
html[data-searchbeauti-dark] #b_results h1,
html[data-searchbeauti-dark] #b_results h2,
html[data-searchbeauti-dark] #b_results h3,
html[data-searchbeauti-dark] #b_results h4,
html[data-searchbeauti-dark] #b_results label {
  color: inherit;
}

/* === Existing result cards get card background === */
html[data-searchbeauti-dark] #b_results > li.b_algo,
html[data-searchbeauti-dark] #b_results > li.b_ans,
html[data-searchbeauti-dark] #b_results > li.b_ad {
  background: var(--sb-bg) !important;
}

/* === Secondary text (description snippets) === */
html[data-searchbeauti-dark] #b_results .b_caption,
html[data-searchbeauti-dark] #b_results .b_caption p,
html[data-searchbeauti-dark] #b_results .b_caption span,
html[data-searchbeauti-dark] #b_results .b_snippet p,
html[data-searchbeauti-dark] #b_results .b_snippet div,
html[data-searchbeauti-dark] #b_results .b_paractl,
html[data-searchbeauti-dark] #b_results .b_lineclamp,
html[data-searchbeauti-dark] #b_results .b_algoSlug,
html[data-searchbeauti-dark] #b_results .b_factrow,
html[data-searchbeauti-dark] #b_results .b_factrow span {
  color: var(--sb-text-secondary) !important;
}

/* === Attribution / URL === */
html[data-searchbeauti-dark] #b_results .b_attribution,
html[data-searchbeauti-dark] #b_results .b_attribution cite,
html[data-searchbeauti-dark] #b_results .b_attribution span {
  color: var(--sb-text-muted) !important;
}

/* === Links === */
html[data-searchbeauti-dark] #b_results h2 a,
html[data-searchbeauti-dark] #b_results .b_title a,
html[data-searchbeauti-dark] #b_results .b_algo h2 a {
  color: var(--sb-link) !important;
}
html[data-searchbeauti-dark] #b_results h2 a:visited,
html[data-searchbeauti-dark] #b_results a:visited {
  color: var(--sb-link-visited) !important;
}
/* Links that are not inside h2 — secondary links */
html[data-searchbeauti-dark] #b_results a[href]:not(h2 a):not(.b_title a) {
  color: var(--sb-link) !important;
}

/* === Sidebar (knowledge panel) === */
html[data-searchbeauti-dark] #b_context {
  background: var(--sb-bg-card) !important;
  border-color: var(--sb-border) !important;
  color: var(--sb-text) !important;
}
html[data-searchbeauti-dark] #b_context p,
html[data-searchbeauti-dark] #b_context span,
html[data-searchbeauti-dark] #b_context div {
  color: inherit;
}
html[data-searchbeauti-dark] #b_context .b_entitySubTitle,
html[data-searchbeauti-dark] #b_context .b_secondaryText,
html[data-searchbeauti-dark] #b_context .b_entitySubtext,
html[data-searchbeauti-dark] #b_context .b_factrow {
  color: var(--sb-text-secondary) !important;
}
html[data-searchbeauti-dark] #b_context a {
  color: var(--sb-link) !important;
}

/* === Answer boxes === */
html[data-searchbeauti-dark] #b_results .b_ans {
  background: var(--sb-bg-card) !important;
  border-color: var(--sb-border) !important;
  color: var(--sb-text) !important;
}

/* === "People also ask" & dropdowns === */
html[data-searchbeauti-dark] #b_tween,
html[data-searchbeauti-dark] .b_tween,
html[data-searchbeauti-dark] .b_dropdown {
  background: var(--sb-bg-card) !important;
  border-color: var(--sb-border) !important;
  color: var(--sb-text) !important;
}

/* === Related searches === */
html[data-searchbeauti-dark] .b_rs,
html[data-searchbeauti-dark] #b_relatedSearches,
html[data-searchbeauti-dark] .b_expansion {
  background: var(--sb-bg) !important;
}
html[data-searchbeauti-dark] .b_rs a,
html[data-searchbeauti-dark] .b_expansion a {
  color: var(--sb-link) !important;
}

/* === Pagination === */
html[data-searchbeauti-dark] .b_pag,
html[data-searchbeauti-dark] #b_pag {
  background: transparent !important;
}
html[data-searchbeauti-dark] .b_pag a,
html[data-searchbeauti-dark] .sb_pagN,
html[data-searchbeauti-dark] .b_widePag a {
  color: var(--sb-link) !important;
}

/* === Footer === */
html[data-searchbeauti-dark] #b_footer {
  background: var(--sb-bg) !important;
}
html[data-searchbeauti-dark] #b_footer,
html[data-searchbeauti-dark] #b_footer p,
html[data-searchbeauti-dark] #b_footer span,
html[data-searchbeauti-dark] #b_footer a {
  color: var(--sb-text-muted) !important;
}

/* === Form elements === */
html[data-searchbeauti-dark] input:not(#sb_form_q),
html[data-searchbeauti-dark] textarea,
html[data-searchbeauti-dark] select {
  background: var(--sb-bg-card) !important;
  color: var(--sb-text) !important;
  border-color: var(--sb-border) !important;
}

/* === Table & entity cards === */
html[data-searchbeauti-dark] table,
html[data-searchbeauti-dark] .b_entityList tr,
html[data-searchbeauti-dark] .b_entityList td {
  border-color: var(--sb-border) !important;
}
html[data-searchbeauti-dark] .b_entityList td {
  color: var(--sb-text-secondary) !important;
}

/* === Image/Video cards === */
html[data-searchbeauti-dark] .b_imageCard,
html[data-searchbeauti-dark] .b_vPanel {
  background: var(--sb-bg-card) !important;
  border-color: var(--sb-border) !important;
}

/* === Separators === */
html[data-searchbeauti-dark] hr,
html[data-searchbeauti-dark] .b_hLine,
html[data-searchbeauti-dark] .b_hline {
  border-color: var(--sb-border) !important;
}

/* === Override inline dark-color styles === */
html[data-searchbeauti-dark] #b_results [style*="color:#1"],
html[data-searchbeauti-dark] #b_results [style*="color: #1"],
html[data-searchbeauti-dark] #b_results [style*="color:#2"],
html[data-searchbeauti-dark] #b_results [style*="color: #2"],
html[data-searchbeauti-dark] #b_results [style*="color:#3"],
html[data-searchbeauti-dark] #b_results [style*="color: #3"],
html[data-searchbeauti-dark] #b_results [style*="color:#4"],
html[data-searchbeauti-dark] #b_results [style*="color: #4"],
html[data-searchbeauti-dark] #b_results [style*="color:#0"],
html[data-searchbeauti-dark] #b_results [style*="color: #0"] {
  color: var(--sb-text) !important;
}

/* === Override hardcoded dark backgrounds on inline elements === */
html[data-searchbeauti-dark] #b_results [style*="background:#fff"],
html[data-searchbeauti-dark] #b_results [style*="background: #fff"],
html[data-searchbeauti-dark] #b_results [style*="background:white"],
html[data-searchbeauti-dark] #b_results [style*="background-color:#fff"],
html[data-searchbeauti-dark] #b_results [style*="background-color: #fff"] {
  background: var(--sb-bg-card) !important;
}
`

let currentMode: 'on' | 'off' | 'auto' = 'auto'
let mediaQuery: MediaQueryList | null = null

function apply() {
  document.documentElement.setAttribute('data-searchbeauti-dark', '')
}

function removeDark() {
  document.documentElement.removeAttribute('data-searchbeauti-dark')
}

function syncAuto() {
  if (mediaQuery?.matches) apply()
  else removeDark()
}

function setupAuto() {
  teardownAuto()
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  syncAuto()
  mediaQuery.addEventListener('change', syncAuto)
}

function teardownAuto() {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', syncAuto)
    mediaQuery = null
  }
}

function applyMode(mode: 'on' | 'off' | 'auto') {
  currentMode = mode
  teardownAuto()

  if (mode === 'on') {
    apply()
  } else if (mode === 'off') {
    removeDark()
  } else {
    setupAuto()
  }
}

export const darkModeFeature: Feature = {
  name: 'dark-mode',

  init(config: AppConfig) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.setAttribute('data-searchbeauti', this.name)
    style.textContent = darkCSS
    const container = document.head || document.documentElement
    container.appendChild(style)

    applyMode(config.global.darkMode)
  },

  onConfigChange(config: AppConfig) {
    applyMode(config.global.darkMode)
  },

  destroy() {
    teardownAuto()
    document.getElementById(STYLE_ID)?.remove()
    document.documentElement.removeAttribute('data-searchbeauti-dark')
  },
}
