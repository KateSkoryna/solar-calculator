# Coding Rules

## Code Style

### No Comments

- Do not add comments to code
- Code should be self-explanatory through clear naming and structure
- If code needs a comment to be understood, refactor it instead

### Variable Naming

- Use clear, descriptive variable names that explain their purpose
- Names should make the code self-documenting
- Prefer longer, descriptive names over short, cryptic ones
- Use conventional naming patterns:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and components
  - `UPPER_SNAKE_CASE` for constants

### Single Source of Truth (DRY)

- If the same literal value, role list, or type shows up in more than one place, extract it into a single named constant/type and import it everywhere instead of repeating it
- Example: fleet role checks use `ANY_FLEET_ROLE`, `FLEET_EDITOR_ROLES`, and `FLEET_OWNER_ONLY` from `lib/fleet-auth.ts` rather than inline arrays like `["OWNER", "MANAGER"]` scattered across route files
- When the underlying value can change (e.g. an enum in `prisma/schema.prisma`), derive the constant from that source (e.g. `Object.values(Role)`) instead of hand-typing the list, so a rename or addition only needs to happen in one place
- Before adding a new literal, grep for it first — if it already exists elsewhere, reuse or extract rather than duplicate

### Code Clarity

- Write code that reads like plain English
- Break complex logic into well-named functions
- Keep functions focused on a single responsibility

### Styling

- Avoid inline styles using the `style` property
- Use Tailwind CSS utility classes for styling elements
- Only use inline styles when absolutely necessary (e.g., dynamic values that can't be expressed with Tailwind classes)
- Leverage Tailwind's responsive modifiers, state variants, and other utilities

### CSS Media Queries

- Always place media queries inside selectors, not outside
- Never wrap selectors with media queries
- Use nested media query syntax for better organization

## Tool Usage

### No Descriptions

- Do not use description parameters in tool calls
- Omit the description field entirely

## Git Commits

### No Claude Attribution

- Do not include "Generated with Claude Code" footer in commit messages
- Do not include "Co-Authored-By: Claude" attribution
- Keep commit messages clean and without tool attribution
