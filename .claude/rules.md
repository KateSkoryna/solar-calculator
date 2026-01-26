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
