<p align="center"><img src="https://snowkit.io/assets/snowkit-512.png" width="112" height="112" alt="Snowkit"></p>

# Snowkit

Private tools that run on your computer.

Snowkit merges and splits PDFs, makes QR codes, tidies JSON and SQL, counts words and more. It works from the command line, and it plugs into AI apps that support the Model Context Protocol (MCP), so your assistant can do real work on your files.

Your files never leave your computer. Snowkit has no account, sends nothing over the internet and keeps no copies. It reads the files you point it to and writes the results next to them.

## What it can do

| Tool | What it does |
| --- | --- |
| `pdf_merge` | Combines two or more PDFs into one, in the order you give |
| `pdf_split` | Splits a PDF into one file per page, every few pages, or by page ranges |
| `pdf_extract_pages` | Copies chosen pages into a new PDF, which also reorders or drops pages |
| `pdf_rotate` | Turns all or some pages by 90, 180 or 270 degrees |
| `pdf_info` | Shows page count, page sizes, PDF version, form fields and document details |
| `markdown_to_pdf` | Turns Markdown into a clean, paginated PDF |
| `qr_code` | Makes a QR code for a link or any text, as SVG or PNG |
| `json_format` | Pretty-prints or minifies JSON, keeping large numbers exact |
| `json_validate` | Checks JSON, and optionally checks it against a JSON Schema |
| `sql_format` | Formats or minifies SQL |
| `text_stats` | Counts words, characters and sentences, with reading time and readability |
| `text_transform` | Changes case, makes URL slugs, or removes duplicate lines |
| `color_convert` | Converts a colour between hex, RGB, HSL, HSV and OKLCH, and checks contrast |
| `cron_explain` | Explains a cron schedule in plain English and lists the next runs |

Each result ends with a link to the matching tool on [snowkit.io](https://snowkit.io), in case you would rather see it in your browser.

## Use it with your AI app

You need [Node.js](https://nodejs.org) 18 or newer. There is nothing else to install: the commands below fetch Snowkit the first time it runs.

### Claude Desktop

Open **Settings**, then **Developer**, then **Edit Config**, and add Snowkit to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "snowkit": {
      "command": "npx",
      "args": ["-y", "snowkit"]
    }
  }
}
```

Restart Claude Desktop. If it cannot find `npx` on Windows, use `"command": "cmd"` and `"args": ["/c", "npx", "-y", "snowkit"]`.

### Claude Code

```sh
claude mcp add snowkit -- npx -y snowkit
```

### Cursor

Open **Cursor Settings**, then **MCP**, then **Add new MCP server**, or add this to `~/.cursor/mcp.json` (or `.cursor/mcp.json` inside a project):

```json
{
  "mcpServers": {
    "snowkit": {
      "command": "npx",
      "args": ["-y", "snowkit"]
    }
  }
}
```

### Gemini CLI

Add this to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "snowkit": {
      "command": "npx",
      "args": ["-y", "snowkit"]
    }
  }
}
```

### Any other MCP app

Snowkit is a standard MCP server over standard input and output. Point your app at the command `npx -y snowkit`.

Then just ask, for example:

- "Merge invoice-march.pdf and invoice-april.pdf in my Downloads folder."
- "Pull pages 3 to 5 out of contract.pdf."
- "Make a QR code PNG for https://example.com and save it to my desktop."
- "Is this JSON valid?"

## Use it from the command line

```sh
npx snowkit pdf merge a.pdf b.pdf -o both.pdf
npx snowkit pdf split report.pdf --every 2
npx snowkit pdf split report.pdf --range 1-3 --range 4-
npx snowkit pdf extract report.pdf --pages "1, 4-6"
npx snowkit pdf rotate scan.pdf --angle 90 --pages 2
npx snowkit pdf info report.pdf
npx snowkit md2pdf notes.md --page letter --numbers
npx snowkit qr "https://example.com" -o qr.png
npx snowkit json format data.json --sort
npx snowkit json validate data.json --schema schema.json
npx snowkit sql format query.sql
npx snowkit text stats essay.txt
npx snowkit text case title headings.txt
npx snowkit text dedupe emails.txt --ignore-case
npx snowkit color "#336699" --against white
npx snowkit cron "*/15 9-17 * * 1-5"
npx snowkit --help
```

Text commands read the file you name, or standard input when you pipe text in, so they fit into scripts:

```sh
curl -s https://api.example.com/items | npx snowkit json format
```

Install it once with `npm install -g snowkit` and you can drop the `npx`.

## How it treats your files

- It only reads the files you name and only writes where you ask, or next to the original when you do not say.
- It never replaces an existing file unless you set `overwrite` (or pass `--overwrite` on the command line).
- It never connects to the internet. Every tool runs on your own computer.
- Password-protected PDFs are left alone, with a clear message.

## Good to know

- `markdown_to_pdf` uses built-in fonts that cover Western European languages. Images in the Markdown are left out.
- `pdf_rotate` keeps everything else in the file as it was. Merging, splitting and extracting copy the pages themselves, so bookmarks and document details from the originals are not carried over.
- Errors explain what went wrong and how to fix it, so your assistant can try again sensibly.

## Licence

MIT. See [LICENSE](LICENSE).
