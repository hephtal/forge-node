# forge-node


Forge is a modular toolkit of front-end components and helper utilities inspired by Greek mythology. It provides a collection of reusable UI elements and functions designed to speed up development across your projects. The toolkit is organized into several packages (e.g., auto-form, data-table, ui) that can be used individually or as a whole.


## Using Forge

You can install forge using npm or yarn. Here’s how to get started:

```bash
npm install @hephtal/forge
```

The css classes do not come bundled, instead you need to add to your tailwind config the following:`./node_modules/@hephtal/forge/dist/**/*.{js,ts,jsx,tsx}` to the content section of your config. This will tell tailwind in your project to also look at the classes in the forge package, and not just the classes in your project.

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config = {
  ...
  content: [
    './src/**/*.{ts,tsx}',

    // Add the path to your forge package
    './node_modules/@hephtal/forge/dist/**/*.{js,ts,jsx,tsx}',
  ],
  ...
} satisfies Config;

export default config;

```


## Publishing

When you're ready to publish a new version of any forge package, follow these steps:

### 1. First Check it Builds

Make sure your package builds correctly by running:

```bash
npm run build
```
This will compile your TypeScript code and ensure everything is ready for publishing.

### 2. Login to the GitHub Package Registry

Run the following command to log in with your GitHub credentials:

```bash
npm login --scope=@hephtal
```
When prompted:

- Enter your GitHub username.
- For the password, paste your personal access token (`HT_FORGE_GITHUB_TOKEN`).

### 3. Publish the Package

Push changes to your main branch and a GitHub Action will automatically start to make a new release. This will make a new tag and start a MR, which once you merge, it should publish. 

If you get `Bad Credentials` error, check the secret for `FORGE_GITHUB_TOKEN` in your repo is valid.

## Development

During development, you can easily test changes locally without publishing your packages. Here’s how to work with forge locally:

### 1. Linking Locally with npm link  

In your forge project directory, run:
```bash
npm link
```
Then, in the consuming project where you want to test forge, run:
```bash
npm link @hephtal/forge
```
This creates a symbolic link from your global npm modules directory to your local forge package, allowing you to see your changes in real time.

### 2. Local Testing

After linking, import forge in your consuming project like this:

```ts
import { Button } from '@hephtal/forge';
```

Your consuming project will use the local version of forge, letting you verify that everything works as expected.

### 3. Unlinking

When you’re done testing, you can unlink the package by running:

```bash
npm unlink --no-save @hephtal/forge
```

---

With this setup, forge is easy to develop, test locally, and eventually publish to your private registry so that it can be used across multiple projects. Enjoy building with forge!
