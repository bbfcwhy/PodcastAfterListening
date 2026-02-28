# AI File Organizer

A native macOS application that uses AI to automatically organize your files based on customizable rules. Drop files into an inbox folder, and they get analyzed, renamed, and moved to the right place.

## Features

- **AI-Powered Analysis** — Analyze file content with OpenAI, Claude, Ollama (local), or Google Gemini to determine categories and suggest file names
- **Customizable Rules** — Create rules with conditions (file type, name patterns, AI categories, size, etc.) and actions (destination folder, naming templates)
- **Inbox Monitoring** — Watch a folder for new files and automatically process them
- **Rule Sets** — Group rules into shareable sets. Import/export as JSON.
- **Full History & Undo** — Every file operation is tracked. Undo any move or rename at any time.
- **Built-in Templates** — Start with pre-made rule sets for documents, developer files, or AI-driven organization

## Requirements

- macOS 14.0 (Sonoma) or later
- Xcode 15+ (for building)
- Swift 5.9+

## Setup

### Build with Xcode

1. Open Xcode → File → New → Project → macOS → App
2. Set product name to "AIFileOrganizer", interface to "SwiftUI", language to "Swift"
3. Replace the generated source files with the files from `AIFileOrganizer/`
4. Build and run

### Build the core library (SPM)

```bash
swift build
swift test
```

## Project Structure

```
AIFileOrganizer/
├── App/
│   ├── AIFileOrganizerApp.swift    # App entry point
│   └── AppState.swift              # Central state management
├── Models/
│   ├── OrganizationRule.swift      # Rule conditions & actions
│   ├── RuleSet.swift               # Rule collections + import/export
│   ├── FileOperation.swift         # Operation history records
│   ├── AIProvider.swift            # AI provider configs & request/response
│   └── AppSettings.swift           # User preferences
├── Services/
│   ├── AIService.swift             # AI service protocol & manager
│   ├── OpenAIService.swift         # OpenAI GPT integration
│   ├── ClaudeService.swift         # Anthropic Claude integration
│   ├── OllamaService.swift         # Ollama local model integration
│   ├── GeminiService.swift         # Google Gemini integration
│   ├── RuleEngine.swift            # Rule matching & evaluation
│   ├── FileMonitor.swift           # FSEvents inbox watcher
│   ├── FileOrganizer.swift         # File processing pipeline
│   └── HistoryManager.swift        # Operation history & undo
├── Views/
│   ├── ContentView.swift           # Main window with sidebar
│   ├── InboxView.swift             # Inbox file list + drag & drop
│   ├── RuleListView.swift          # Rule set & rule management
│   ├── RuleEditorSheet.swift       # Rule editor form
│   ├── HistoryView.swift           # Operation history + undo
│   ├── RuleStoreView.swift         # Browse & install rule templates
│   └── Settings/
│       └── SettingsView.swift      # General + AI provider settings
├── Utilities/
│   ├── FileAnalyzer.swift          # Text extraction (PDF, RTF, etc.)
│   └── PersistenceManager.swift    # Data persistence to disk
└── Tests/
    ├── RuleEngineTests.swift
    ├── RuleSetTests.swift
    └── AIServiceTests.swift
```

## How It Works

1. **Set up an inbox folder** (default: `~/Desktop/Inbox`)
2. **Choose or create a rule set** — define conditions (file extension, AI category, name patterns) and actions (destination folder, naming template)
3. **Configure an AI provider** (optional) — add API keys for OpenAI, Claude, or use Ollama locally
4. **Start monitoring** — the app watches for new files in the inbox
5. **Files are processed automatically** — matched against rules, analyzed by AI if needed, then moved and renamed
6. **Review history** — see all operations, undo any of them

## Rule Conditions

| Condition | Description |
|-----------|-------------|
| File Extension | Match by extension (e.g., `pdf`, `docx,doc`) |
| File Name Contains | Match if filename contains text |
| File Name Matches | Match by regex pattern |
| File Size | Greater than / less than threshold |
| AI Category | AI-determined category (Finance, Medical, etc.) |
| AI Tag | AI-determined tags |
| MIME Type | Match by MIME type |
| Created Date | Before or after a date |

## Naming Templates

| Template | Example |
|----------|---------|
| Keep Original | `invoice.pdf` |
| Date Prefix | `2026-02-28_invoice.pdf` |
| Category Prefix | `finance_invoice.pdf` |
| AI Suggested | `q1-vendor-invoice.pdf` |
| Custom | `{date}_{category}_{original}` |

## License

MIT
