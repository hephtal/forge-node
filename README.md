# forge


Forge is a modular toolkit of front-end components and helper utilities inspired by Greek mythology. It provides a collection of reusable UI elements and functions designed to speed up development across your projects. The toolkit is organized into several packages (e.g., auto-form, data-table, ui) that can be used individually or as a whole.


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

### 3. Publish Your Package

Once logged in, release and publish a new version of the package using

```bash
npm run release
```
This will publish your package to GitHub’s Package Registry under the scope `@hephtal`, and update the version in the `package.json` file. Make sure to commit and push your changes to the repository.


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