# Changelog

## 0.1.5

- Removing photo metadata now also clears comments and other hidden data blocks that some cameras and apps add to JPEGs.
- Cron schedules written with a step of 1, such as `*/1`, read as every minute or every hour, and schedules that never run stop searching quickly.
- SQL formatting keeps array subscripts like `tags[1]` together and recognizes `CURRENT ROW` in window frames.
- PDF results link to Linen PDF and image results to Design Brush, the new names of the Snowkit apps.

## 0.1.4

- Added image tools: see what a photo reveals about itself, including where it was taken, and remove that hidden metadata without touching the picture.
- Added head tag tools: write the title, description and share tags for a page, and check a page's HTML for what is missing.
- Image results link to Snowkit Design to keep editing.

## 0.1.3

- Results from text tools open in Snowkit with your content already filled in, carried in the link itself so it still never reaches a server.
- PDF results link to Snowkit PDF to sign, fill, mark up or compress the file.

## 0.1.2

- Added registry metadata so MCP apps and directories can find Snowkit.

## 0.1.1

- Added the Snowkit logo to the README.

## 0.1.0

- First release: 14 tools for PDFs, QR codes, JSON, SQL, text, colour and cron, as an MCP server and a command line.
