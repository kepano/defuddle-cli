> [!IMPORTANT]  
> Defuddle CLI has moved into the main [Defuddle](https://github.com/kepano/defuddle) repo.

## Installation

```bash
npm install -g defuddle
```

## Usage

```bash
defuddle parse <source> [options]
```

### Arguments

- `source`: HTML file path or URL to parse

### Options

- `-o, --output <file>`: Output file path (default: stdout)
- `-m, --markdown, --md`: Convert content to markdown
- `-j, --json`: Output as JSON with both HTML and markdown content
- `-p, --property <name>`: Extract a specific property (e.g., title, description, domain)
- `--debug`: Enable debug mode
- `-h, --help`: Display help for command

### Examples

Parse a local HTML file (outputs HTML):
```bash
defuddle parse article.html
```

Parse a URL and convert to markdown:
```bash
defuddle parse https://example.com/article --md
```

Parse and get the full JSON response from Defuddle:
```bash
defuddle parse article.html --json
```

Save markdown output to a file:
```bash
defuddle parse article.html --md -o output.md
```

Extract specific properties:
```bash
# Get just the title
defuddle parse article.html --property title

# Get the description
defuddle parse article.html -p description

# Get the domain
defuddle parse article.html --property domain
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev
```
