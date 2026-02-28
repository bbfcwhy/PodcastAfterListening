import Foundation

/// OpenAI API integration for file analysis.
final class OpenAIService: AIServiceProvider {
    let providerType: AIProviderType = .openAI
    private let config: AIProviderConfig

    init(config: AIProviderConfig) {
        self.config = config
    }

    func analyzeFile(_ request: AIFileAnalysisRequest) async throws -> AIFileAnalysisResponse {
        guard !config.apiKey.isEmpty else { throw AIServiceError.invalidAPIKey }

        let url = URL(string: "\(config.baseURL)/chat/completions")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("Bearer \(config.apiKey)", forHTTPHeaderField: "Authorization")
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "model": config.selectedModel,
            "messages": [
                ["role": "system", "content": request.systemPrompt],
                ["role": "user", "content": request.userPrompt]
            ],
            "max_tokens": config.maxTokens,
            "temperature": config.temperature,
            "response_format": ["type": "json_object"]
        ]

        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await performRequest(urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIServiceError.invalidResponse("Not an HTTP response")
        }

        switch httpResponse.statusCode {
        case 200:
            return try parseOpenAIResponse(data)
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

    private func parseOpenAIResponse(_ data: Data) throws -> AIFileAnalysisResponse {
        struct OpenAIResponse: Decodable {
            struct Choice: Decodable {
                struct Message: Decodable {
                    let content: String?
                }
                let message: Message
            }
            let choices: [Choice]
        }

        let openAIResponse = try JSONDecoder().decode(OpenAIResponse.self, from: data)
        guard let content = openAIResponse.choices.first?.message.content,
              let contentData = content.data(using: .utf8) else {
            throw AIServiceError.invalidResponse("No content in OpenAI response")
        }

        return try AIHTTPHelper.parseJSONResponse(contentData)
    }
}
