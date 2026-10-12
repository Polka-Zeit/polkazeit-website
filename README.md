# Polka-Zeit website — Google Sheets edition

All original photographs are retained as uploaded; no AI-generated photographs.

## Set up once

1. Upload **Polka-Zeit-Content-Template.xlsx** to Google Drive, then open it with Google Sheets. Use **File → Save as Google Sheets** if Google opens the Excel file in Office editing mode. The Google Sheet must have these exact five tab names: `Shows`, `Bios`, `Booking`, `Videos`, `Site Info`.
2. In the Google Sheet, click **Share → General access → Anyone with the link → Viewer**. This means anyone who gets the URL can read the contents; only authorized editors can change them. Do **not** include private information. If your Google Workspace account prevents public sharing, use a personal Google account or adjust sharing permissions.
3. Copy the spreadsheet ID from the URL between `/d/` and `/edit`.
4. Open `sheet-config.js` in this website folder, and paste the ID inside the quotes. Example: `window.POLKAZEIT_SHEET_ID = "1AbC...";`
5. In your GitHub repository, upload **the contents of this folder** (HTML, CSS, JS, and `assets`), replacing the older website files. GitHub Pages will deploy automatically. The `.xlsx` template and this README are optional in GitHub; they are not needed by the live website.
6. Refresh the site. You can now edit your Google Sheet without uploading website code again.

## Spreadsheet tab guide

- **Shows:** One concert per row. Enter Date as `YYYY-MM-DD` (e.g. `2026-10-24`). Upcoming/past is determined automatically by the visitor's local date. `Visible` can be `YES` or `NO`; the supplied sample show is marked NO and will not display. `Ticket URL` is optional.
- **Bios:** Name, Instrument, Biography, Photo filename, Order, Visible. Use a filename already in the website's `assets/` folder, e.g. `accordion-red.jpg`. New photos still need to be uploaded to GitHub once; changing biography text does not.
- **Booking:** Edit the values for Headline, Description, Email, Phone, Contact name, Button text. Leave email/phone blank until ready to publish.
- **Videos:** Title, YouTube URL, Description, Visible. Paste regular YouTube watch links or youtu.be links; rows without valid links are skipped.
- **Site Info:** Edit the five text values. Don't change the Field labels.

## Important

- **Never rename the five tabs or column headings** unless updating `sheet-content.js` to match.
- The Google Sheet is a **public read-only data source** for website visitors, not a secure database. Anyone with its link can view all tabs, even rows marked `Visible=NO`. Do not put secrets or private contact information there.
- Changes typically appear on reload; Google may cache responses briefly.
- If the spreadsheet is inaccessible or the ID is missing, the site remains usable with its built-in placeholder text.
- The spreadsheet does not control image layout or site styling. Those remain in HTML/CSS on GitHub.
- Troubleshooting: confirm it is a **native Google Sheet**, publicly viewable, has exact tab names, and the ID is pasted into `sheet-config.js`. Open browser Developer Tools → Console for loading errors.
