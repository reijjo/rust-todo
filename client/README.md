# Frontend

## How to install different stuff

### Vitest & React Testinglibrary

#### Install

`bun add -d vitest jsdom @testing-library/react @testing-library/jest-dom @vitest/coverage-v8` to install the package

- Create setup file for tests `src/tests/setup.ts`

```ts
import "@testing-library/jest-dom";
```

- Update `vite.config.ts`

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
  },
});
```

- Add scripts to `package.json`:

```json
{
  ...
  "scripts": {
    ...
    "test": "vitest",
    "test:cover": "vitest run --coverage",
    ...
  },
	...
}
```

#### Usage

Create `HomePage.spec.tsx` file next to the `HomePage.tsx` file:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import HomePage from "./HomePage";

describe("HomePage", () => {
  it("renders HomePage", () => {
    render(<HomePage />);

    expect(/add a todo/i).toBeInTheDocument();
  });
});
```
