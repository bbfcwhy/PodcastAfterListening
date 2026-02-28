import Foundation

/// Represents a configured AI provider for file analysis.
enum AIProviderType: String, Codable, CaseIterable, Identifiable {
    case openAI = "openai"
    case claude = "claude"
    case ollama = "ollama"
    case gemini = "gemini"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .openAI: return "OpenAI"
        case .claude: return "Claude (Anthropic)"
        case .ollama: return "Ollama (Local)"
        case .gemini: return "Google Gemini"
        }
    }

    var iconName: String {
        switch self {
        case .openAI: return "brain.head.profile"
        case .claude: return "sparkle"
        case .ollama: return "desktopcomputer"
        case .gemini: return "diamond"
        }
    }

    var requiresAPIKey: Bool {
        switch self {
        case .ollama: return false
        default: return true
        }
    }

    var defaultBaseURL: String {
        switch self {
        case .openAI: return "https://api.openai.com/v1"
        case .claude: return "https://api.anthropic.com/v1"
        case .ollama: return "http://localhost:11434"
        case .gemini: return "https://generativelanguage.googleapis.com/v1beta"
        }
    }

    var availableModels: [String] {
        switch self {
        case .openAI: return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]
        case .claude: return ["claude-sonnet-4-20250514", "claude-haiku-4-20250414"]
        case .ollama: return ["llama3.1", "mistral", "gemma2"]
        case .gemini: return ["gemini-2.0-flash", "gemini-2.0-pro"]
        }
    }
}

struct AIProviderConfig: Codable, Identifiable, Hashable {
    var id: UUID
    var type: AIProviderType
    var apiKey: String
    var baseURL: String
    var selectedModel: String
    var isActive: Bool
    var maxTokens: Int
    var temperature: Double

    init(
        id: UUID = UUID(),
        type: AIProviderType,
        apiKey: String = "",
        baseURL: String? = nil,
        selectedModel: String? = nil,
        isActive: Bool = false,
        maxTokens: Int = 1024,
        temperature: Double = 0.3
    ) {
        self.id = id
        self.type = type
        self.apiKey = apiKey
        self.baseURL = baseURL ?? type.defaultBaseURL
        self.selectedModel = selectedModel ?? (type.availableModels.first ?? "")
        self.isActive = isActive
        self.maxTokens = maxTokens
        self.temperature = temperature
    }
}

// MARK: - AI Request/Response

struct AIFileAnalysisRequest {
    var fileName: String
    var fileExtension: String
    var fileSize: Int64
    var mimeType: String?
    var textContent: String?
    var metadata: [String: String]

    /// The system prompt telling the AI how to analyze files.
    var systemPrompt: String {
        """
        You are a file organization assistant. Analyze the given file information and return a JSON response with the following structure:
        {
            "category": "main category (e.g., Finance, Medical, Legal, Personal, Work, Education, Photos, Code, Design)",
            "subcategory": "optional subcategory (e.g., Invoices, Receipts, Tax, Contracts)",
            "suggested_name": "a clean, descriptive filename without extension",
            "tags": ["tag1", "tag2"],
            "summary": "brief one-line description of the file content",
            "confidence": 0.95
        }

        Rules:
        - Category and subcategory should be in English
        - suggested_name should be lowercase with hyphens, descriptive but concise
        - confidence should be between 0.0 and 1.0
        - Always respond with valid JSON only, no extra text
        """
    }

    var userPrompt: String {
        var parts: [String] = []
        parts.append("File name: \(fileName)")
        parts.append("Extension: \(fileExtension)")
        parts.append("Size: \(ByteCountFormatter.string(fromByteCount: fileSize, countStyle: .file))")
        if let mimeType { parts.append("MIME type: \(mimeType)") }
        if !metadata.isEmpty {
            parts.append("Metadata: \(metadata.map { "\($0.key)=\($0.value)" }.joined(separator: ", "))")
        }
        if let textContent, !textContent.isEmpty {
            let truncated = String(textContent.prefix(3000))
            parts.append("Content preview:\n\(truncated)")
        }
        return parts.joined(separator: "\n")
    }
}

struct AIFileAnalysisResponse: Codable {
    var category: String
    var subcategory: String?
    var suggestedName: String?
    var tags: [String]?
    var summary: String?
    var confidence: Double?

    enum CodingKeys: String, CodingKey {
        case category
        case subcategory
        case suggestedName = "suggested_name"
        case tags
        case summary
        case confidence
    }

    func toAnalysisResult(provider: String) -> AIAnalysisResult {
        AIAnalysisResult(
            category: category,
            subcategory: subcategory,
            suggestedName: suggestedName,
            tags: tags ?? [],
            summary: summary,
            confidence: confidence ?? 0.0,
            provider: provider
        )
    }
}
