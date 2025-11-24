# ResponScore - AI Coding Agent Instructions

## Project Overview
ResponScore is a **response-speed scoring communication app** for a 5-person accounting firm. Users press emoji reaction buttons (👍 ack, 🟡 later, 🔴 working, ✔ done) on tasks, and the system calculates scores based on reaction speed and generates rankings.

**Tech Stack:** React 19 + TypeScript + Vite + React Router DOM 7

## Architecture Pattern: Repository → Service → Components

This codebase strictly enforces a 3-layer architecture with clear separation of concerns:

### Layer 1: Repository (Data Access)
**Location:** `src/repositories/`

- **Interfaces** (`interfaces.ts`): Generic `IRepository<T>` pattern + specialized interfaces (ITaskRepository, IReactionRepository, IScoreRepository, IUserRepository)
- **All methods return Promises** for async consistency and future API migration (localStorage → Supabase/Kintone)
- **Deep copy on returns** to prevent accidental state mutations via `storage.ts::deepCopy()`
- **Current backend:** localStorage only; designed for seamless API swap

**Key pattern:**
```typescript
export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: string, partial: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
```

**When modifying:** Always use dependency injection in services. Never instantiate repositories directly in components.

### Layer 2: Service (Business Logic)
**Location:** `src/services/`

- **Composition:** Inject IRepository interfaces into constructors
- **Return DTOs:** Services transform entities into DTOs (TaskDTO, UserDTO, RankingStatsDTO) for stable API contracts
- **Event-driven scoring:** `ReactionService.addReaction()` automatically calls `scoreCalculator.generateScoreRecordsForReaction()`
- **Pure function calls:** All scoring logic delegated to `scoreCalculator.ts` (no side effects)

**Current services:** UserService, TaskService, ReactionService, ScoreService

**Constraint:** No I/O, no localStorage calls in services. Use repositories only.

### Layer 3: Components (Presentation)
**Location:** `src/components/`, `src/pages/`

- **Hooks:** `useState`, `useEffect`, `useNavigate`, `useParams` from React Router
- **Service injection:** Import singleton services from `services/index.ts`
- **Toast notifications:** Use `showSuccess()` / `showError()` from `utils/toast.ts` for user feedback
- **Loading states:** Use `<SkeletonCard>` / `<SkeletonTable>` to prevent layout shift

**Routing:** Defined in `src/App.tsx` using React Router v7:
```
/ → TaskListPage
/task/:id → TaskDetailPage
/ranking → RankingPage
/* → NotFoundPage (404)
```

## Data Model & Scoring Algorithm

### Core Types
**Location:** `src/types/index.ts`

Key entities:
- `User`: id, name
- `Task`: id, title, detail, assignerId, assigneeId, createdAt, deadline?, status ('unread' | 'in_progress' | 'done')
- `Reaction`: id, taskId, userId, type ('ack' | 'later' | 'working' | 'done'), createdAt, isFirstReactionForTask
- `ScoreRecord`: id, userId, taskId, value (points), reason, createdAt
- `UserRankStats`: userId, userName, totalScore, averageFirstReactionTimeMinutes, scoreChangePercent

### Scoring Rules
**Location:** `src/utils/scoreCalculator.ts` (pure functions only)

**Reaction-to-points formula:**
- ≤1 min: +5 pts
- ≤5 min: +4 pts
- ≤30 min: +3 pts
- ≤2 hrs: +2 pts
- ≤24 hrs: +1 pt
- >24 hrs: -5 pts

**Bonus:**
- Completing task ('done' type): +3 pts additional

**Critical constraint:** All scoring is deterministic and testable. Never add randomness or side effects.

## UI/UX Patterns

### Design System
**Location:** `src/styles/global.css`

- **Color tokens:** --color-primary (#1E88E5 blue), --color-unread (red), --color-in_progress (yellow), --color-done (green)
- **Spacing scale:** --space-{4, 8, 12, 16, 24, 32, 40, 48}px
- **Breakpoints:** --breakpoint-{sm: 640px, md: 768px, lg: 1024px, xl: 1280px}

**Apply via:** CSS custom properties in component `.css` files. No inline styles.

### Component Library

| Component | Path | Purpose |
|-----------|------|---------|
| MainLayout | `components/layouts/MainLayout.tsx` | Sticky header + navigation + user selector |
| TaskCard | `components/TaskList/TaskCard.tsx` | Task display with status badge |
| ReactionButtons | `components/TaskDetail/ReactionButtons.tsx` | 4 emoji buttons with Toast feedback |
| RankingTable | `components/Ranking/RankingTable.tsx` | Full ranking with medals & trend icons |
| Loading | `components/Loading.tsx` | Skeleton cards + spinners |
| Toast | `components/Toast.tsx` | Auto-dismiss notifications |

### Important Constraints

1. **No duplicate reactions:** `ReactionService.addReaction()` throws error if user already reacted to same task
2. **Status auto-updates:**
   - 👍 ack on 'unread' → 'in_progress'
   - 🟡 later on 'unread'/'in_progress' → 'in_progress'
   - 🔴 working on 'unread' → 'in_progress'
   - ✔ done on any → 'done'
3. **First-reaction scoring:** Only tasks with `isFirstReactionForTask=true` earn initial reaction score

## Development Workflow

### Commands
```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # TypeScript compile + Vite optimize
npm run lint     # ESLint check
npm run preview  # Preview built bundle
```

### Debugging Tips
- **localStorage inspection:** Open DevTools → Application → Local Storage → check `tasks`, `users`, `reactions`, `scores` keys
- **React DevTools:** Check component hierarchy, hooks state via React DevTools extension
- **Toast visibility:** Toast errors auto-hide in 5s; use browser console for persistent errors

### Mock Data
**Location:** `src/utils/mockData.ts`

5 users, 5 tasks, 6 reactions, 6 score records pre-loaded. Modify here for testing specific scenarios.

## Common Workflows

### Adding a New Feature
1. **Define types** in `src/types/index.ts`
2. **Add Repository methods** in `src/repositories/*.ts`
3. **Add Service methods** in `src/services/*.ts`, return DTOs
4. **Create/update components** in `src/components/` or `src/pages/`
5. **Add routing** if new page in `src/App.tsx`
6. **Style with tokens** in new `.css` file, reference `global.css`

### Fixing a Bug
- Check **repository layer first** (data storage/retrieval)
- Then **service layer** (business logic, event handlers)
- Finally **component layer** (UI state, renders)
- Verify TypeScript types are strict (no `any`)

### Testing Scoring Logic
- Modify `mockData.ts` task/reaction timestamps
- Call `scoreCalculator.calcReactionScore()` directly (pure function)
- Check localStorage for generated `scores` entries

## Pitfalls to Avoid

1. **Never call repositories directly in components** → Use services
2. **Never mutate returned entities** → Deep copy prevents this, but still be careful
3. **Never add I/O to services** → Keep services pure except repository calls
4. **Never hardcode colors/spacing** → Use CSS tokens
5. **Never allow unlimited reactions** → Enforce 1 reaction per user per task
6. **Never calculate scores in components** → Always use `scoreCalculator.ts`

## Key Files to Reference

- `src/App.tsx` - Routing root, user state
- `src/types/index.ts` - Single source of truth for all types
- `src/services/reactionService.ts` - Event-driven reaction + score creation example
- `src/utils/scoreCalculator.ts` - Pure scoring functions (deterministic, testable)
- `src/styles/global.css` - Design system tokens
- `src/components/layouts/MainLayout.tsx` - Navigation pattern with React Router
- `package.json` - Dependencies + build scripts
