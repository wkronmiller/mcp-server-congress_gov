# Congress.gov MCP Server with REST API

This server provides both Model Context Protocol (MCP) and REST API access to Congress.gov data.

## Features

- **MCP Server**: Compatible with MCP clients for AI model integration
- **REST API**: Standard HTTP REST endpoints for web applications
- **Single Port**: Both MCP and REST API served on the same port (default: 3000)
- **Shared Services**: Minimal code duplication between MCP and REST implementations

## Getting Started

1. Get a Congress.gov API key from [api.congress.gov](https://api.congress.gov/)
2. Set the API key: `export CONGRESS_GOV_API_KEY="your-api-key"`
3. Install dependencies: `npm install`
4. Start the server: `npm start`

The server will be available at:
- MCP SSE endpoint: `http://localhost:3000/sse`
- REST API: `http://localhost:3000/api`

## REST API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format
All REST API responses follow this format:
```json
{
  "success": true|false,
  "data": {}, // present on success
  "error": {  // present on error
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Resource Endpoints

#### Get Bill Information
```
GET /api/bills/{congress}/{billType}/{billNumber}
```
Example: `GET /api/bills/118/hr/1`

#### Get Member Information
```
GET /api/members/{memberId}
```
Example: `GET /api/members/P000197`

#### Get Congress Information
```
GET /api/congress/{congress}
```
Example: `GET /api/congress/118`

#### Get Committee Information
```
GET /api/committees/{congress}/{chamber}/{committeeCode}
```
Example: `GET /api/committees/118/house/HSAG00`

#### Get API Overview
```
GET /api/info/overview
```

#### Get Current Congress Information
```
GET /api/info/current-congress
```

### Tool Endpoints

#### Search Collections
```
POST /api/search
Content-Type: application/json

{
  "collection": "bill|member|committee|...",
  "query": "optional search terms",
  "limit": 20,
  "offset": 0,
  "sort": "updateDate+desc",
  "filters": {
    "type": "hr",
    "fromDateTime": "2023-01-01T00:00:00Z",
    "toDateTime": "2023-12-31T23:59:59Z"
  }
}
```

Supported collections:
- `bill`
- `amendment`
- `committee-report`
- `committee`
- `committee-print`
- `congressional-record`
- `daily-congressional-record`
- `bound-congressional-record`
- `house-communication`
- `senate-communication`
- `nomination`
- `treaty`
- `member`

#### Get Sub-Resource Data

##### Query Parameter Format
```
GET /api/subresource?parentUri=congress-gov://bill/118/hr/1&subResource=actions&limit=20&offset=0
```

##### RESTful Format
```
GET /api/bills/118-hr-1/actions?limit=20&offset=0
GET /api/members/P000197/sponsored-legislation
GET /api/committees/118-house-HSAG00/bills
```

Resource ID formats:
- Bills: `{congress}-{billType}-{billNumber}` (e.g., `118-hr-1`)
- Members: `{memberId}` (e.g., `P000197`)
- Committees: `{congress}-{chamber}-{committeeCode}` (e.g., `118-house-HSAG00`)
- Amendments: `{amendmentId}`
- Nominations: `{nominationId}`
- Treaties: `{treatyId}`

Supported sub-resources vary by parent type:
- **Bills**: actions, amendments, committees, cosponsors, relatedbills, subjects, summaries, text, titles
- **Members**: sponsored-legislation, cosponsored-legislation
- **Committees**: reports, nominations, house-communication, senate-communication, bills
- **Amendments**: actions, amendments, cosponsors, text
- **Nominations**: actions, committees, hearings
- **Treaties**: actions, committees

## Error Codes

- `NOT_FOUND`: Resource not found (404)
- `VALIDATION_ERROR`: Request validation failed (400)
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded (429)
- `API_ERROR`: Congress.gov API error (varies)
- `RESOURCE_ERROR`: Resource processing error (400)
- `INTERNAL_ERROR`: Internal server error (500)
- `UNKNOWN_ERROR`: Unknown error occurred (500)

## Examples

### Search for bills
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"collection": "bill", "limit": 5}'
```

### Get bill actions
```bash
curl "http://localhost:3000/api/bills/118-hr-1/actions"
```

### Get member sponsored legislation
```bash
curl "http://localhost:3000/api/members/P000197/sponsored-legislation"
```

## MCP Integration

The server also provides MCP resources and tools:

- **Resources**: Bill, Member, Congress, Committee, Info
- **Tools**: Search, Sub-resource retrieval

MCP clients can connect via Server-Sent Events:
- SSE endpoint: `http://localhost:3000/sse`
- Message endpoint: `http://localhost:3000/message`

## Configuration

Environment variables:
- `CONGRESS_GOV_API_KEY`: Required API key for Congress.gov
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Development

- `npm run dev`: Start with hot reload
- `npm run build`: Build TypeScript
- `npm run lint`: Run ESLint
- `npm run format`: Format with Prettier