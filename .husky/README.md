# Git Hooks Configuration

This directory contains Git hooks managed by Husky.

## Configured Hooks

### `pre-push`
Runs before every `git push` to ensure code quality:

1. **Linting** - Runs `pnpm lint` to check for code style issues
2. **Build** - Runs `pnpm build` to ensure the project compiles successfully

If either check fails, the push will be **blocked** until the issues are fixed.

## Manual Validation

You can manually run the same checks locally:

```bash
pnpm validate
```

## Bypassing Hooks (Emergency Only)

If you absolutely need to bypass the checks (not recommended):

```bash
git push --no-verify
```

⚠️ **Warning**: Only use this in emergencies. Always fix the issues instead.

## Troubleshooting

If hooks aren't running:

1. Make sure hooks are executable: `chmod +x .husky/pre-push`
2. Reinstall hooks: `pnpm prepare`
3. Check that Husky is installed: `pnpm install`
