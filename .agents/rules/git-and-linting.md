# Git Commit & Linting Standards

> Critical rules to ensure zero pre-commit hook failures and spotless code quality.

## Pre-Commit Checklist
Before executing any `git commit`, the agent MUST run:
```bash
cd frontend && npx eslint --quiet src
```
Only proceed with `git commit` if the command exits cleanly with `0 errors`.

---

## Preventable Lint Patterns

### 1. `react-hooks/set-state-in-effect`
- **Violation**: Calling `setState` synchronously within the body of a `useEffect`.
- **Solution**:
  - For client environment detection (e.g. `isIOS`, `preferences`), initialize state with a lazy function:
    ```tsx
    const [isIOS] = useState(() => {
      if (typeof window !== "undefined") {
        return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      }
      return false;
    });
    ```
  - Or derive the value directly during render.

### 2. `react/no-unescaped-entities`
- **Violation**: Raw unescaped quotes or apostrophes in JSX text (e.g. `owner's`, `"quote"`).
- **Solution**:
  - Replace `'` with `&apos;`
  - Replace `"` with `&ldquo;` and `&rdquo;`
  - Or use JSX string expression `{"'"}`

### 3. `@typescript-eslint/no-explicit-any`
- **Violation**: Using `(err: any)`, `(val: any)`, or `as any`.
- **Solution**:
  - In `catch` blocks: use `catch (err: unknown)` and cast properties safely with `(err as { response?: ... })`.
  - In state/handlers: use TypeScript generic constraints `<K extends keyof T>(field: K, value: T[K])`.

### 4. `unused-imports/no-unused-imports`
- **Violation**: Importing symbols that are never referenced in the file.
- **Solution**: Run `npm --prefix frontend run lint:fix` or remove unused imports cleanly.
