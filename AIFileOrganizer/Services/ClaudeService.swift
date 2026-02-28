import Foundation

/// Anthropic Claude API integration for file analysis.
final class ClaudeService: AIServiceProvider {
    let providerType: AIProviderType = .claude
    private let config: AIProviderConfig

    init(config: AIProviderConfig) {
        self.config = config
    }

    func analyzeFile(_ request: AIFileAnalysisRequest) async throws -> AIFileAnalysisResponse {
        guard !config.apiKey.isEmpty else { throw AIServiceError.invalidAPIKey }

        let url = URL(string: "\(config.baseURL)/messages")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue(config.apiKey, forHTTPHeaderField: "x-api-key")
        urlRequest.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "model": config.selectedModel,
            "max_tokens": config.maxTokens,
            "system": request.systemPrompt,
            "messages": [
                ["role": "user", "content": request.userPrompt]
            ]
        ]

        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await performRequest(urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIServiceError.invalidResponse("Not an HTTP response")
        }

        switch httpResponse.statusCode {
        case 200:
            return try parseClaudeResponse(data)
        case 401:
            throw AIServiceError.invalidAPIKey
        case 429:
            throw AIServiceError.rateLimited
        default:
            let errorText = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw AIServiceError.serverError(httpResponse.statusCode, errorText)
        }
    }

    private func performRequest(_ request: URLRequest) async throws -> (Data, URLResponse) {
        do {
            return try await URLSession.shared.data(for: request)
        } catch {
            throw AIServiceError.networkError(error)
        }
    }

    private func parseClaudeResponse(_ data: Data) throws -> AIFileAnalysisResponse {
        struct ClaudeResponse: Decodable {
            struct ContentBlock: Decodable {
                let type: String
                let text: String?
            }
            let content: [ContentBlock]
        }

        let claudeResponse = try JSONDecoder().decode(ClaudeResponse.self, from: data)
        guard let text = claudeResponse.content.first(where: { $0.type == "text" })?.text,
              let textData = text.data(using: .utf8) else {
            throw AIServiceError.invalidResponse("No text content in Claude response")
        }

        return try AIHTTPHelper.parseJSONResponse(textData)
    }
}
