# Agent Guidelines for mcp-congress_gov-server

## Build/Test/Lint Commands

- **Build**: `npm run build` - Compiles TypeScript to dist/
- **Dev**: `npm run dev` - Runs with nodemon and ts-node for hot reload
- **Lint**: `npm run lint` - ESLint check with TypeScript rules
- **Format**: `npm run format` - Auto-format with Prettier
- **Test**: No tests configured yet (npm test exits with error)
- **Start**: `npm start` - Runs compiled server from dist/

## Code Style Guidelines

- **TypeScript**: Strict mode enabled, ES2022 target, NodeNext modules
- **Imports**: Use `.js` extensions for local imports (e.g., `from "./utils/index.js"`)
- **Formatting**: Prettier with double quotes, semicolons, 80 char width, 2-space indent
- **Naming**: PascalCase for types/interfaces, camelCase for functions/variables
- **Error Handling**: Use custom errors from `utils/errors.ts` (ApiError, RateLimitError, etc.)
- **Logging**: Use `logger` from `utils/index.js`, console.log allowed for servers
- **Types**: Export from barrel files in `types/index.ts`, organize by resource type
- **Async**: Prefer async/await over promises, handle AxiosError appropriately
- **Validation**: Use Zod schemas for runtime validation
- **Git Hooks**: Husky with lint-staged runs eslint --fix and prettier on commit
