Building a React Component Library: A Complete Guide with Vite, Vitest, TypeScript, Tailwind CSS, and Storybook

While attempting to build my library, I realized there wasn't a comprehensive tutorial or article that combined all the necessary tools to successfully create a modern library. This guide aims to fill that gap, providing you with the steps to build a library that can be installed and used in any project, regardless of the framework or library used in the main app.

Let's begin by creating a React project with Vite.

```bash
pnpm create vite
```

```bash
✔ Project name: … dilo-library
```

```bash
✔ Select a framework: › React
```

```bash
✔ Select a variant: › TypeScript
```

Next, navigate to your new project directory and run `pnpm install`:

```bash
cd dilo-library
pnpm install
```

We will rename the `src/` folder to `lib/` and delete the unnecessary files:
- `app.tsx`
- `app.css`
- `main.tsx`
- `assets/`

Let's install the necessary CSS libraries as devDependencies:

```bash
pnpm add -D tailwindcss postcss autoprefixer
```

```bash
npx tailwindcss init -p
```

Modify the Tailwind config and replace your `index.css` file with the necessary lines for Tailwind:

```css
// ./tailwind.config.js
export default {  
  content: ["./lib/**/*.{js,ts,jsx,tsx}"],  
  theme: { extend: {} },  
  plugins: [],  
}

// ./lib/index.css

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Next, let's install Storybook:

```bash
pnpm dlx @storybook/cli@latest init
```

Then, remove the `stories/` folder. We will create each story inside the component folder (an example will follow). But first, we need to finish our installation. Let's configure Storybook to read our `lib/` folder. Inside `.storybook/main.ts`, replace `"stories/"` with `"lib/"`:

```typescript
// .storybook/main.ts

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../lib/**/*.mdx",
    "../lib/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;
```

And let's add our CSS config to the Storybook preview:

```typescript
// .storybook/preview.ts
import '../lib/index.css';

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

Storybook is now ready. Next, we will need Vitest and all necessary dependencies to test our React components:

```bash
pnpm add -D vitest @types/jest @testing-library/jest-dom @testing-library/react jsdom
```

Additionally, I wanted to add some extra libraries to make my package JavaScript-only with no external CSS and to export its own types. For that, I also added the following dependencies:

```bash
pnpm add -D @vitejs/plugin-react-swc vite-plugin-dts vite-plugin-css-injected-by-js
```

Once the installation is finished, we need to configure it. This process was challenging, so pay close attention.

Configure the Vite config file -> `vite.config.ts`:

```typescript
// ./vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "./lib/index.ts"),
      name: "react-beautiful-timeline",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "tailwindcss"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          tailwindcss: "tailwindcss",
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    react(),
    dts({ rollupTypes: true }),
    cssInjectedByJsPlugin()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./lib/setupTests.ts'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "lib"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
```

Inside `lib/`, create the setupTest file:

```typescript
// ./lib/setupTests.ts

import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
```

Move `react` and `react-dom` to devDependencies:

```bash
pnpm add -D react react-dom
```

Now let's configure the `package.json` file:

```json
// ./package.json
{
  "name": "dilo-library",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.umd.js",
  "module": "./dist/index.es.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.es.js",
      "require": "./dist/index.umd.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test": "vitest"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.4"
  },
  "devDependencies": {
    "@chromatic-com/storybook": "^1.5.0",
    "@storybook/addon-essentials": "^8.1.6",
    "@storybook/addon-interactions": "^8.1.6",
    "@storybook/addon-links": "^8.1.6",
    "@storybook/addon-onboarding": "^8.1.6",
    "@storybook/blocks": "^8.1.6",
    "@storybook/react": "^8.1.6",
    "@storybook/react-vite": "^8.1.6",
    "@storybook/test": "^8.1.6",
    "@testing-library/jest-dom": "^6.4.5",
    "@testing-library/react": "^16.0.0",
    "@types/jest": "^29.5.12",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitejs/plugin-react-swc": "^3.7.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "eslint-plugin-storybook": "^0.8.0",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.38",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "storybook": "^8.1.6",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "vite-plugin-css-injected-by-js": "^3.5.1",
    "vite-plugin-dts": "^3.9.1",
    "vitest": "^1.6.0"
  }
}
```

This configuration includes some extra keys to export the main file and adds the key `"peerDependencies"` to prevent installing `react/react-dom` inside the consumer app.

We also need to update our `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "skipLibCheck": true,
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "jsx": "react-jsx",
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./lib/*"
      ]
    },
    "outDir": "./dist"
  },
  "include": [
    "lib"
  ],
  "references": [
    {
      "path": "./tsconfig.node.json"
    }
  ]
}              
```

Now, we're ready to start creating our first component. Run our Storybook to see what we're doing:

```bash
pnpm storybook
```

This command will open a localhost server at port 6006.

Create your first component in the `lib` folder. For example, I've created a `components/` folder and inside it another folder called `navbar` that has three files:

```plaintext
lib/components/
├── index.ts
└── navbar
    ├── navbar.spec.tsx
    ├── navbar.stories.ts
    └── navbar.tsx
```

Let's start by creating our `navbar.tsx` component:

```typescript
export default function Navbar() {
	return (
		<div></div>
	);
}
```

Great! Now we can use Storybook to see what we're doing and import the component into our testing file.

Let's create the first test:

```typescript
// ./lib/components/navbar/navbar.spec.tsx

import { render } from '@testing-library/react';
import Navbar from './navbar';

describe('Navbar test', () => {
	it('renders', () => {
		const { getByText } = render(<Navbar />);
		expect(getByText('Navbar')).toBeTruthy();
	});
});
```

Run Vitest in another terminal to see the output:

```bash
pnpm vitest
```

If you encounter any errors, adjust your component accordingly. Once fixed, you should see a successful test output.

Now let's create our basic story:

```typescript
// ./lib/components/navbar/navbar.stories.ts

import Navbar from "./navbar";
import { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: "Navbar Example",
  component: Navbar,
} satisfies Meta<typeof Navbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

Inside our Storybook server, you can now select the navbar example story.

You're now ready to start building your UI component. However, before concluding this article, it's essential to understand how to build and publish your library.

Create an export file at `./lib/index.ts`, containing all components you wish to export:

```typescript
import Navbar from './components/navbar/navbar';

export { Navbar };
```

Now you're ready to build:

```bash
pnpm run build
```

To publish your library, configure your npm account and login. Then run:

```bash
npm publish
```

That's it! I'll leave my repo so you can clone it and start your library from there. Now you have all the basic structure for creating your own UI library or any custom component you want to publish on npm.

If this guide helped you, please follow me on GitHub at https://github.com/lorenzotomasdiez or on Twitter at https://twitter.com/di_lorennzo. Leave me a star or share this article on social media. Thank you for reading, and I hope it helped you.
