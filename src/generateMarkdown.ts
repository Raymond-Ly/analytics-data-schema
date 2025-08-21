
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownTable } from 'markdown-table';

interface ColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
  confidential: boolean;
  notes?: string;
}

interface SchemaVersion {
  version: string; // semantic versioning, e.g., '1.0.0'
  view: string;
  columns: ColumnMeta[];
}

function generateMarkdownTable(columns: ColumnMeta[]): string {
  return markdownTable([
    ['Column', 'Type', 'Nullable', 'Confidential', 'Description', 'Notes'],
    ...columns.map(col => [
      col.name,
      col.type,
      col.nullable ? 'YES' : 'NO',
      col.confidential ? 'YES' : 'NO',
      col.description,
      col.notes || ''
    ])
  ]);
}

function isValidSemver(version: string): boolean {
  // Simple semver regex: major.minor.patch, e.g., 1.0.0
  return /^\d+\.\d+\.\d+$/.test(version);
}


// Instead of updating, rewrite the changelog from scratch with only present JSON files
async function writeChangelog(schemas: SchemaVersion[], changelogPath: string) {
  // Sort by version descending
  schemas.sort((a, b) => compareSemver(b.version, a.version));
  let changelog = '';
  if (schemas.length > 0) {
    const viewHeader = `# ${schemas[0].view}`;
    changelog += viewHeader + '\n';
  }
  for (const schema of schemas) {
    const versionHeader = `## Version ${schema.version}`;
    const markdown = `\n${versionHeader}\n\n${await generateMarkdownTable(schema.columns)}\n`;
    changelog += markdown.trimEnd() + '\n\n';
  }
  fs.writeFileSync(changelogPath, changelog.trimStart());
  if (schemas.length > 0) {
    console.log(`Wrote ${schemas.length} versions to ${changelogPath}`);
  }
}


async function main() {
  // __dirname workaround for ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Always use the source schemas directory relative to project root
  const schemasDir = path.join(process.cwd(), 'src', 'schemas');
  const views = fs.readdirSync(schemasDir);
  let readmeSections: string[] = [];
  for (const view of views) {
    const viewDir = path.join(schemasDir, view);
    if (!fs.statSync(viewDir).isDirectory()) continue;
    const files = fs.readdirSync(viewDir).filter(f => f.endsWith('.json'));
    let schemas: SchemaVersion[] = [];
    let latestSchema: SchemaVersion | undefined = undefined;
    for (const file of files) {
      const schemaPath = path.join(viewDir, file);
      const schema: SchemaVersion = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      if (!isValidSemver(schema.version)) continue;
      schemas.push(schema);
      if (!latestSchema || compareSemver(schema.version, latestSchema.version) > 0) {
        latestSchema = schema;
      }
    }
    const changelogPath = path.join(viewDir, 'CHANGELOG.md');
    await writeChangelog(schemas, changelogPath);
    if (latestSchema) {
      const viewHeader = `# ${latestSchema.view}`;
      const versionHeader = `## Version ${latestSchema.version}`;
      const markdown = `\n${viewHeader}\n${versionHeader}\n\n${await generateMarkdownTable(latestSchema.columns)}\n`;
      readmeSections.push(markdown.trimStart());
    }
  }
  // Write a single top-level README.md with all latest schemas
  if (readmeSections.length > 0) {
    const readmePath = path.join(process.cwd(), 'README.md');
    const intro = '# Analytics Data Schemas\n\nThis document contains the latest version of each analytic Postgres view.\n';
    fs.writeFileSync(readmePath, intro + '\n' + readmeSections.join('\n---\n\n'));
    console.log(`Wrote combined README.md with ${readmeSections.length} views.`);
  }
}

// Compare two semver strings. Returns 1 if a > b, -1 if a < b, 0 if equal
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

main();
