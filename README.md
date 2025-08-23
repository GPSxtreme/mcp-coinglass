# MCP Server Starter Template

A minimal starter template for building Model Context Protocol (MCP) servers using TypeScript and FastMCP.

## Features

* Basic project structure with `src/lib`, `src/services`, `src/tools`.
* TypeScript setup (compiles to `dist/`).
* Biome for linting and formatting.
* `fastmcp` for MCP server implementation.
* A weather service example demonstrating:
  * Proper folder structure (lib, services, tools)
  * API integration with error handling
  * Parameter validation using Zod
  * Separation of concerns
* GitHub Actions workflows for CI and Release (manual trigger by default).

## Getting Started

1. **Create a new repository from this template:**
   Click [here](https://github.com/new?template_name=mcp-server-starter&template_owner=IQAIcom) to generate a new repository from this template.

2. **Navigate to your new project:**

    ```bash
    cd /path/to/your-new-mcp-server
    ```

3. **Initialize Git Repository (if not already):**

    ```bash
    git init
    git branch -M main # Or your preferred default branch name
    ```

4. **Customize `package.json`:**
    * Update `name`, `version`, `description`, `author`, `repository`, etc.
    * Update the `bin` entry if you change the command name.

5. **Install dependencies:**

    ```bash
    pnpm install
    ```

6. **Configure environment variables:**
   For the weather service example, you'll need an OpenWeather API key:

   ```bash
   # Create a .env file (add to .gitignore)
   echo "OPENWEATHER_API_KEY=your_api_key_here" > .env
   ```

   Get an API key from [OpenWeather](https://openweathermap.org/api).

7. **Initial Commit:**
    It's a good idea to make an initial commit at this stage before setting up Husky and Changesets.

    ```bash
    git add .
    git commit -m "feat: initial project setup from template"
    ```

8. **Develop your server:**
    * Add your custom tools in the `src/tools/` directory.
    * Implement logic in `src/lib/` and `src/services/`.
    * Register tools in `src/index.ts`.

## Example Weather Tool

This template includes a weather service example that demonstrates:

1. **HTTP Utilities** (`src/lib/http.ts`):
   * Type-safe HTTP requests with Zod validation
   * Error handling

2. **Configuration** (`src/lib/config.ts`):
   * Environment variable management
   * Service configuration

3. **Weather Service** (`src/services/weatherService.ts`):
   * API integration
   * Data transformation
   * Proper error propagation

4. **Weather Tool** (`src/tools/weather.ts`):
   * Parameter validation with Zod
   * User-friendly output formatting
   * Error handling and user guidance

To use the weather tool:

```bash
# Set your OpenWeather API key
export OPENWEATHER_API_KEY=your_api_key_here

# Run the server
pnpm run start

# Connect with an MCP client and use the GET_WEATHER tool
# with parameter: { "city": "London" }
```

## Pre-commit Linting (Husky & lint-staged)

This template includes `husky` and `lint-staged` in its `devDependencies` for running Biome on staged files before committing. To set it up:

1. **Ensure your package.json has the prepare script for husky:**

   ```json
   {
     "scripts": {
       "prepare": "husky"
     }
   }
   ```

2. **Install dependencies and initialize husky:**

   ```bash
   pnpm install
   pnpm dlx husky init
   ```

   This creates a `.husky` directory with the necessary setup.

3. **Create the pre-commit hook for lint-staged:**

   ```bash
   # Create or edit the pre-commit file
   echo '#!/usr/bin/env sh' > .husky/pre-commit
   echo '. "$(dirname -- "$0")/_/husky.sh"
   
   pnpm lint-staged' >> .husky/pre-commit
   
   # Make it executable
   chmod +x .husky/pre-commit

   ```

4. **Configure `lint-staged` in `package.json`:**
   ```json
   // In package.json
   "lint-staged": {
     "*.{js,ts,cjs,mjs,jsx,tsx,json,jsonc}": [
       "biome check --write --organize-imports-enabled=false --no-errors-on-unmatched"
     ]
   }
   ```

   *Adjust the Biome command as needed. The one above is a common example.*

5. **Test it:**
   Stage some changes to a `.ts` file and try to commit. Biome should run on the staged file.

## Release Management (Changesets)

This template is ready for release management using [Changesets](https://github.com/changesets/changesets).

1. **Install Changesets CLI (if not already in devDependencies):**
    The template `package.json` should include `@changesets/cli`. If not:

    ```bash
    pnpm add -D @changesets/cli
    ```

2. **Initialize Changesets:**
    This command will create a `.changeset` directory with some configuration files.

    ```bash
    pnpm changeset init
    # or npx changeset init
    ```

    Commit the generated `.changeset` directory and its contents.

3. **Adding Changesets During Development:**
    When you make a change that should result in a version bump (fix, feature, breaking change):

    ```bash
    pnpm changeset add
    # or npx changeset add
    ```

    Follow the prompts. This will create a markdown file in the `.changeset` directory describing the change.
    Commit this changeset file along with your code changes.

4. **Publishing a Release:**
    The GitHub Actions workflow `release.yml` (in `mcp-server-starter/.github/workflows/`) is set up for this. When you are ready to release:
    * Ensure all feature PRs with their changeset files are merged to `main`.
    * **Important:** Before publishing, ensure your `package.json` is complete. Add or update fields like `keywords`, `author`, `repository` (e.g., `"repository": {"type": "git", "url": "https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"}`), `bugs` (e.g., `"bugs": {"url": "https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues"}`), and `homepage` (e.g., `"homepage": "https://github.com/YOUR_USERNAME/YOUR_REPO_NAME#readme"`) for better discoverability and information on npm.
    * The `release.yml` workflow (manually triggered by default in the template) will:
        1. Run `changeset version` to consume changeset files, update `package.json` versions, and update `CHANGELOG.md`. It will push these to a `changeset-release/main` branch and open a "Version Packages" PR.
        2. **Merge the "Version Packages" PR.**
        3. Upon merging, the workflow runs again on `main`. This time, it will run `pnpm run publish-packages` (which should include `changeset publish`) to publish to npm and create GitHub Releases/tags.
    * **To enable automatic release flow:** Change `on: workflow_dispatch` in `release.yml` to `on: push: branches: [main]` (or your release branch).

## Available Scripts

* `pnpm run build`: Compiles TypeScript to JavaScript in `dist/` and makes the output executable.
* `pnpm run dev`: Runs the server in development mode using `tsx` (hot-reloading for TypeScript).
* `pnpm run start`: Runs the built server (from `dist/`) using Node.
* `pnpm run lint`: Lints the codebase using Biome.
* `pnpm run format`: Formats the codebase using Biome.

## Using the Server

After building (`pnpm run build`), you can run the server:

* Directly if linked or globally installed: `mcp-hello-server` (or your customized bin name).
* Via node: `node dist/index.js`
* Via `pnpm dlx` (once published): `pnpm dlx your-published-package-name`
