import Foundation

// MARK: - AI Service Protocol

protocol AIServiceProvider {
    var providerType: AIProviderType { get }
    func analyzeFile(_ request: AIFileAnalysisRequest) async throws -> AIFileAnalysisResponse
}

enum AIServiceError: LocalizedError {
    case noActiveProvider
    case invalidAPIKey
    case networkError(Error)
    case invalidResponse(String)
    case rateLimited
    case serverError(Int, String)

    var errorDescription: String? {
        switch self {
        case .noActiveProvider:
            return "No AI provider is configured. Please set up an AI provider in Settings."
        case .invalidAPIKey:
            return "Invalid API key. Please check your API key in Settings."
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse(let detail):
            return "Invalid AI response: \(detail)"
        case .rateLimited:
            return "Rate limited by AI provider. Please wait a moment and try again."
        case .serverError(let code, let message):
            return "Server error (\(code)): \(message)"
        }
    }
}

// MARK: - AI Service Manager

/// Manages multiple AI providers and routes requests to the active one.
final class AIServiceManager {
    private var providers: [AIProviderType: AIServiceProvider] = [:]
    private var activeProviderType: AIProviderType?

    func configure(with configs: [AIProviderConfig]) {
        providers.removeAll()
        activeProviderType = nil

        for config in configs {
            guard config.isActive || !config.apiKey.isEmpty || config.type == .ollama else { continue }

            let provider: AIServiceProvider
            switch config.type {
            case .openAI:
                provider = OpenAIService(config: config)
            case .claude:
                provider = ClaudeService(config: config)
            case .ollama:
                provider = OllamaService(config: config)
            case .gemini:
                provider = GeminiService(config: config)
            }
            providers[config.type] = provider

            if config.isActive {
                activeProviderType = config.type
            }
        }
    }

    func analyzeFile(_ request: AIFileAnalysisRequest) async throws -> AIAnalysisResult {
        guard let activeType = activeProviderType,
              let provider = providers[activeType] else {
            throw AIServiceError.noActiveProvider
        }

        let response = try await provider.analyzeFile(request)
        return response.toAnalysisResult(provider: activeType.displayName)
    }

    func analyzeFile(_ request: AIFileAnalysisRequest, using providerType: AIProviderType) async throws -> AIAnalysisResult {
        guard let provider = providers[providerType] else {
            throw AIServiceError.noActiveProvider
        }

        let response = try await provider.analyzeFile(request)
        return response.toAnalysisResult(provider: providerType.displayName)
    }

    var hasActiveProvider: Bool {
        activeProviderType != nil && providers[activeProviderType!] != nil
    }
}

// MARK: - Shared HTTP Helpers

enum AIHTTPHelper {
    static func parseJSONResponse(_ data: Data) throws -> AIFileAnalysisResponse {
        // Try direct JSON parsing first
        if let response = try? JSONDecoder().decode(AIFileAnalysisResponse.self, from: data) {
            return response
        }

        // Try extracting JSON from markdown code blocks
        guard let text = String(data: data, encoding: .utf8) else {
            throw AIServiceError.invalidResponse("Could not decode response as text")
        }

        let jsonPattern = /```(?:json)?\s*\n([\s\S]*?)\n```/
        if let match = text.firstMatch(of: jsonPattern),
           let jsonData = String(match.1).data(using: .utf8),
           let response = try? JSONDecoder().decode(AIFileAnalysisResponse.self, from: jsonData) {
            return response
        }

        // Try finding raw JSON object in text
        if let start = text.firstIndex(of: "{"),
           let end = text.lastIndex(of: "}") {
            let jsonString = String(text[start...end])
            if let jsonData = jsonString.data(using: .utf8),
               let response = try? JSONDecoder().decode(AIFileAnalysisResponse.self, from: jsonData) {
                return response
            }
        }

        throw AIServiceError.invalidResponse("Could not parse AI response as JSON: \(text.prefix(200))")
    }
}
