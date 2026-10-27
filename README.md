# SAC IBCS Bar Chart

Static, dependency-free SAP Analytics Cloud custom widget, styled as an IBCS-inspired actual/plan comparison.

## Deployment
1. Create a public GitHub repository named `sac-ibcs-widget`.
2. Upload `ibcs-bar-chart.js` and `index.html` to the repository root.
3. In **Settings → Pages**, deploy from `main` branch and `/ (root)`.
4. Replace `YOUR_GITHUB_USERNAME` in `ibcs-bar-chart.json` with your GitHub username (or replace the entire URL with your actual Pages JS URL).
5. Import the edited JSON into SAC under **Custom Widgets** and add it to an optimized story if your tenant supports custom widgets.

## Data
By default, demo data are displayed. The `data` property accepts a JSON array as a string:
`[{"label":"Europe","actual":680,"plan":720}]`.

**Note:** This version is a standalone widget. SAC model binding is not configured in the manifest; a data-binding-enabled manifest and SAC-specific row mapping would be required for direct model consumption. The script contains a preliminary binding parser for future extension.

IBCS is a trademark of its respective owner. This widget is inspired by the visual style and is not IBCS certified.
