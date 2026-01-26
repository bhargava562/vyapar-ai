# Project Structure

## Current Organization

```
Multilingual_App/
├── .git/                 # Git version control
├── .kiro/               # Kiro AI assistant configuration
│   ├── hooks/           # AI automation hooks
│   └── steering/        # AI guidance documents
├── .vscode/             # VS Code workspace settings
│   └── settings.json    # Editor configuration
└── README.md            # Project documentation
```

## Recommended Structure for Multilingual Apps

```
Multilingual_App/
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   ├── pages/          # Application pages/views
│   ├── locales/        # Translation files
│   │   ├── en/         # English translations
│   │   ├── es/         # Spanish translations
│   │   └── fr/         # French translations
│   ├── utils/          # Utility functions
│   └── i18n/           # Internationalization setup
├── public/             # Static assets
├── tests/              # Test files
├── docs/               # Documentation
└── config/             # Configuration files
```

## File Naming Conventions
- Use kebab-case for file and folder names
- Translation files: `{locale}.json` or `{namespace}.{locale}.json`
- Component files: `ComponentName.jsx/tsx`
- Test files: `ComponentName.test.js/ts`

## Localization File Organization
- Group translations by feature/page
- Use nested JSON structure for organization
- Keep translation keys descriptive and hierarchical
- Separate common/shared translations from page-specific ones