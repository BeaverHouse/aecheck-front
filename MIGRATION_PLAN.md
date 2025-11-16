# React + MUI → Next.js + shadcn/ui Migration Plan

모든 npm 관련 명령어는 pnpm을 사용합니다.

## Current State Analysis

### Statistics

- **Total Components**: 44 TSX files
- **MUI Dependencies**: 204 imports across 44 files
- **Component Structure**: Atomic Design (atoms/molecules/organisms/pages)

### Dependencies to Remove

- `@mui/material` (204 usages)
- `@mui/icons-material` (included in count above)
- MUI theme system
- Emotion (MUI's CSS-in-JS)

### Dependencies to Add

- `shadcn/ui` components (as needed)
- `tailwindcss` (shadcn dependency)
- `lucide-react` (icons)
- `class-variance-authority` (CVA)
- `clsx` / `tailwind-merge`

---

## Migration Strategy

### Phase 1: Setup & Infrastructure (CURRENT)

**Goal**: Prepare the project for shadcn/ui

1. ✅ **Install Tailwind CSS**
2. ✅ **Configure shadcn/ui**
3. ✅ **Setup theme system** (replace MUI theme)
4. ✅ **Install base shadcn components**

### Phase 2: Atoms Migration (Small, Reusable Components)

**Priority**: High - These are building blocks for everything else

#### Group A: Buttons (7 components)

- `Coffee.tsx`
- `Download.tsx`
- `GrastaFilter.tsx`
- `InvenFilter.tsx`
- `Language.tsx`
- `ManifestFilter.tsx`
- `NormalAnnounce.tsx`
- `PopupConfig.tsx`
- `ScrollTop.tsx`
- `StaralignFilter.tsx`
- `ToggleTheme.tsx`

**shadcn components needed**: Button, Alert

#### Group B: Form Inputs (2 components)

- `SearchField.tsx`
- `PersonalitySelect.tsx`

**shadcn components needed**: Input, Select

#### Group C: Cards & Displays (4 components)

- `BuddyCard.tsx`
- `Loading.tsx`
- `TopNavigateBox.tsx`

**shadcn components needed**: Card, Skeleton

#### Group D: Character Components (2 components)

- `character/Avatar.tsx`
- `character/Modal.tsx`

**shadcn components needed**: Dialog, Avatar

#### Group E: Modals (2 components)

- `DataLoaderModal.tsx`
- `FilterModal.tsx`

**shadcn components needed**: Dialog, Sheet

### Phase 3: Molecules Migration (Composite Components)

**Priority**: Medium - Depends on atoms

#### Group A: Character Details (3 components)

- `character/Grasta.tsx`
- `character/Manifest.tsx`
- `character/Staralign.tsx`

#### Group B: Navigation & Layout (3 components)

- `Sidebar.tsx`
- `GlobalFilter.tsx`
- `GlobalModal.tsx` (if exists)

**shadcn components needed**: Sheet, Tabs, Accordion

### Phase 4: Organisms Migration (Complex Features)

**Priority**: Medium-Low - Depends on molecules

#### Group A: Dashboards (5 components)

- `check/BuddyDashboard.tsx`
- `check/CharacterDashboard.tsx`
- `check/GrastaDashboard.tsx`
- `check/ManifestDashboard.tsx`
- `check/StaralignDashboard.tsx`

#### Group B: Search (2 components)

- `search/BuddySearch.tsx`
- `search/CharacterSearch.tsx`

#### Group C: Analysis (4 components)

- `analysis/LegacyAnalysis.tsx`
- `analysis/LegacyTableAnalysis.tsx`
- `analysis/StardreamAnalysis.tsx`
- `analysis/WhiteKeyAnalysis.tsx`

**shadcn components needed**: Table, Tabs, Badge

#### Group D: Menu (1 component)

- `Menu.tsx`

**shadcn components needed**: DropdownMenu, NavigationMenu

### Phase 5: Pages Migration (Top-level Routes)

**Priority**: Low - Migrate last after all dependencies

- `Analysis.tsx`
- `Check.tsx`
- `Error.tsx`
- `Home.tsx`
- `Link.tsx`
- `Search.tsx`

### Phase 6: Theme & Style System

**Priority**: High - Do early alongside Phase 1

1. Replace `src/constants/theme.ts` with Tailwind config
2. Replace `src/constants/style.tsx` with Tailwind utilities
3. Migrate color system
4. Setup dark mode with next-themes

### Phase 7: Cleanup

**Priority**: Final

1. Remove MUI dependencies from package.json
2. Remove unused imports
3. Remove MUI theme provider
4. Run tests
5. Performance audit

---

## Component Mapping: MUI → shadcn/ui

| MUI Component      | shadcn/ui Equivalent         |
| ------------------ | ---------------------------- |
| `Button`           | `Button`                     |
| `TextField`        | `Input`                      |
| `Select`           | `Select`                     |
| `Dialog`           | `Dialog`                     |
| `Drawer`           | `Sheet`                      |
| `Card`             | `Card`                       |
| `Alert`            | `Alert`                      |
| `Tabs`             | `Tabs`                       |
| `Menu`             | `DropdownMenu`               |
| `Tooltip`          | `Tooltip`                    |
| `IconButton`       | `Button variant="ghost"`     |
| `CircularProgress` | `Spinner` (custom or lucide) |
| `Chip`             | `Badge`                      |
| `ImageList`        | Custom Grid                  |
| `Table`            | `Table`                      |
| `Accordion`        | `Accordion`                  |

---

## Icon Migration: MUI Icons → Lucide React

Common replacements:

- `ArrowUpwardIcon` → `ArrowUp`
- `SearchIcon` → `Search`
- `MenuIcon` → `Menu`
- `CloseIcon` → `X`
- `DownloadIcon` → `Download`
- etc.

---

## Execution Plan

### Step-by-Step Order

1. **Setup** (Do First)

   - Install Tailwind + shadcn/ui
   - Configure theme
   - Install base components

2. **Atoms - Buttons** (Simplest, most used)

   - Migrate all button components
   - Test in isolation

3. **Atoms - Inputs** (Form elements)

   - SearchField, PersonalitySelect

4. **Atoms - Cards & Displays**

   - BuddyCard, Loading, TopNavigateBox

5. **Atoms - Modals**

   - DataLoaderModal, FilterModal
   - Character Modal

6. **Molecules**

   - Character details (Grasta, Manifest, Staralign)
   - Sidebar, GlobalFilter

7. **Organisms**

   - Dashboards
   - Search components
   - Analysis components
   - Menu

8. **Pages**

   - Migrate all page components

9. **Theme & Constants**

   - Replace theme.ts
   - Replace style.tsx

10. **Cleanup**
    - Remove MUI
    - Final testing

---

## Notes & Considerations

### Breaking Changes

- MUI's `sx` prop → Tailwind classes
- Theme tokens → CSS variables
- Component APIs differ (especially forms)

### Testing Strategy

- Test each component individually after migration
- Keep dev server running
- Check dark mode compatibility
- Verify i18n still works

### Rollback Plan

- Git branch: `migration/nextjs-shadcn`
- Commit after each phase
- Can revert individual components if needed

---

## Current Progress

- [x] Phase 1: Setup & Infrastructure ✅
  - [x] Installed Tailwind CSS (v4.1.14)
  - [x] Configured PostCSS
  - [x] Installed shadcn/ui dependencies (CVA, clsx, tailwind-merge, lucide-react)
  - [x] Installed Radix UI primitives
  - [x] Created utility functions (`src/lib/utils.ts`)
  - [x] Added Tailwind directives to `src/index.css`
  - [x] Created base shadcn/ui components:
    - Button (`src/components/ui/button.tsx`)
    - Input (`src/components/ui/input.tsx`)
    - Label (`src/components/ui/label.tsx`)
    - Select (`src/components/ui/select.tsx`)
    - Dialog (`src/components/ui/dialog.tsx`)
    - Card (`src/components/ui/card.tsx`)
    - Alert (`src/components/ui/alert.tsx`)
    - Badge (`src/components/ui/badge.tsx`)
    - Skeleton (`src/components/ui/skeleton.tsx`)
    - Sheet (`src/components/ui/sheet.tsx`)
- [ ] Phase 2: Atoms Migration (NEXT)
- [ ] Phase 3: Molecules Migration
- [ ] Phase 4: Organisms Migration
- [ ] Phase 5: Pages Migration
- [ ] Phase 6: Theme & Style System
- [ ] Phase 7: Cleanup

**Status**: Phase 1 Complete! Ready for Phase 2
**Next Action**: Begin migrating Atom components (starting with buttons)
