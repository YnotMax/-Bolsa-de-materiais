# Product

## Register

product

## Users

Two primary roles inside Brazilian city-hall (município) government, both municipal employees
using this during work hours on desktop, likely on aging institutional hardware/networks:

- **Requisitante** — a department employee who needs materials/equipment and searches the
  marketplace before requesting a new purchase.
- **Cedente** — a department/warehouse employee who lists materials their storage already has
  available for other departments to claim.

A given user may act as both roles depending on context. Secondary: an administrator role
(Secretaria de Administração) overseeing workflow approvals and reporting.

## Product Purpose

Bolsa de Materiais lets one city hall's departments search for and claim materials already sitting
in another department's storage before buying new — avoiding redundant government purchasing.
Success looks like: fewer new-purchase requests for items already available somewhere in the
municipality, and départements trusting the listed inventory enough to claim from it instead of
filing a purchase order.

## Brand Personality

Trustworthy, efficient, official. This is institutional software representing the city hall to its
own employees — it should read as an official, sanctioned government tool (leaning into the
gov.br/DS-gov institutional identity, not away from it), while staying fast to use for people
processing real requisitions during their workday.

## Anti-references

Legacy internal government/procurement software: dense unstyled tables, no visual hierarchy, tiny
cramped form fields, ambiguous icon-only buttons, inconsistent spacing — the dated municipal ERP
look many city halls still run internally. DS-gov compliance is the antidote to this, not an
aesthetic constraint fighting against it.

## Design Principles

1. **DS-gov first, municipal identity second** — official component structure and color always
   win; Florianópolis's own green accent layers on top, never replaces it.
2. **Show availability, don't bury it** — the core job (find it elsewhere before buying) only
   works if search results and cross-warehouse availability are the most prominent thing on
   screen, not secondary to workflow chrome.
3. **Accessible by default, not by exception** — eMAG/WCAG conformance is a shipping requirement
   for every screen, not a follow-up pass (per the DS-gov migration design spec).
4. **Legible over decorative** — this is used by employees getting through real requisition work;
   clarity and speed beat visual flourish.

## Accessibility & Inclusion

WCAG AA (eMAG-aligned, per Brazilian federal e-government accessibility model) is a first-class,
per-phase requirement — see `docs/superpowers/specs/2026-07-17-govbr-ds-migration-design.md` for
the specific gates (semantic landmarks, keyboard nav, contrast including non-DS-gov municipal
accent colors, ARIA labeling, skip-links).
