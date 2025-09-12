# Agent Guidelines for mcp-congress_gov-server

## Project Management

**Linear Project:** Congress API MCP Server

- **Project ID:** `8a6e6579-ae68-41e7-b3e5-4ce9cd393422`
- **Project URL:** https://linear.app/rory-kronmiller/project/congress-api-mcp-server-252cd7eba8ae

**IMPORTANT:** All tasks, issues, and feature requests for this project MUST be created under the "Congress API MCP Server" Linear project. Use the project name "Congress API MCP Server" when creating issues.

## Build/Test/Lint Commands

- **Build**: `npm run build` - Compiles TypeScript to dist/
- **Dev**: `npm run dev` - Runs with nodemon and ts-node for hot reload
- **Lint**: `npm run lint` - ESLint check with TypeScript rules
- **Format**: `npm run format` - Auto-format with Prettier
- **Test**: `npm test` - Jest with ts-jest and ESM support
- **Test Single**: `npm test -- --testNamePattern="pattern"` or `npm test -- path/to/test.test.ts`
- **Test Integration**: `npm test:integration` - Integration tests only
- **Test Watch**: `npm test:watch` - Watch mode for development
- **Test Coverage**: `npm test:coverage` - Generate coverage reports
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

## Available Resources

### Reference Resources

- **Bill Types** (`congress-gov://bill-types`): Complete list of valid bill types with descriptions and examples. Returns information about all 8 bill types (hr, s, hjres, sjres, hconres, sconres, hres, sres) including their full names, descriptions, example numbers, and originating chamber.

### Congressional Data Resources

- **Bills** (`congress-gov://bill/{congress}/{billType}/{billNumber}`): Individual bill information
- **Bill Sub-resources**: Actions, amendments, committees, cosponsors, related bills, subjects, summaries, text, titles
- **Members** (`congress-gov://member/{bioguideId}`): Member information and sponsored/cosponsored legislation
- **Committees** (`congress-gov://committee/{chamber}/{code}`): Committee information and related documents
- **Amendments** (`congress-gov://amendment/{congress}/{type}/{number}`): Amendment details and sub-resources
- **Nominations** (`congress-gov://nomination/{congress}/{number}`): Presidential nomination information
- **Treaties** (`congress-gov://treaty/{congress}/{number}`): Treaty information and related data
- **Committee Reports & Prints**: Official committee publications
- **Congressional Record**: Daily proceedings and bound volumes
- **Communications**: House and Senate communications
- **CRS Reports**: Congressional Research Service reports
- **Summaries**: Bill summaries by Congress and type
- **House Votes**: House voting records (Beta)
