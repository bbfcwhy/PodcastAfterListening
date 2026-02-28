import Foundation

/// Ollama local model integration for file analysis.
final class OllamaService: AIServiceProvider {
    let providerType: AIProviderType = .ollama
    private let config: AIProviderConfig

    init(config: AIProviderConfig) {
        self.config = config
    }

    func analyzeFile(_ request: AIFileAnalysisRequest) async throws -> AIFileAnalysisResponse {
        let url = URL(string: "\(config.baseURL)/api/chat")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.timeoutInterval = 120

        let body: [String: Any] = [
            "model": config.selectedModel,
            "messages": [
                ["role": "system", "content": request.systemPrompt],
                ["role": "user", "content": request.userPrompt]
            ],
            "stream": false,
            "format": "json",
            "options": [
                "temperature": config.temperature,
                "num_predict": config.maxTokens
            ]
        ]

        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await performRequest(urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIServiceError.invalidResponse("Not an HTTP response")
        }

        guard httpResponse.statusCode == 200 else {
            let errorText = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw AIServiceError.serverError(httpResponse.statusCode, errorText)
        }

        return try parseOllamaResponse(data)
    }

    private func performRequest(_ request: URLRequest) async throws -> (Data, URLResponse) {
        do {
            return try await URLSession.shared.data(for: request)
        } catch {
            throw AIServiceError.networkError(error)
        }
    }

    private func parseOllamaResponse(_ data: Data) throws -> AIFileAnalysisResponse {
        struct OllamaResponse: Decodable {
            struct Message: Decodable {
                let content: String
            }
            let message: Message
        }

        let ollamaResponse = try JSONDecoder().decode(OllamaResponse.self, from: data)
        guard let contentData = ollamaResponse.message.content.data(using: .utf8) else {
            throw AIServiceError.invalidResponse("Could not decode Ollama response content")
        }

        return try AIHTTPHelper.parseJSONResponse(contentData)
    }
}
