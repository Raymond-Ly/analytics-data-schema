# Analytics Postgres Views to Markdown

Generates markdown tables from view definitions.

## TODOs
- Semantic versioning
- Connection to Postgres to fetch the schema for a specific table

## Getting Started

1. Install dependencies:
   ```sh
   yarn install
   ```
2. Configure your Postgres connection in `.env` (NOT YET IMPLEMENTED).
3. Run the markdown generator:
   ```sh
   yarn generate:markdown
   ```

## Scripts
- `generate:markdown`: Generates markdown tables for all analytic views.
