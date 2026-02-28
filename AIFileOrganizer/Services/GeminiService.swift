import Foundation

/// Google Gemini API integration for file analysis.
final class GeminiService: AIServiceProvider {
    let providerType: AIProviderType = .gemini
    private let config: AIProviderConfig

    init(config: AIProviderConfig) {
        self.config = config
    }

    func analyzeFile(_ request: AIFileAnalysisRequest) async throws -> AIFileAnalysisResponse {
        guard !config.apiKey.isEmpty else { throw AIServiceError.invalidAPIKey }

        let model = config.selectedModel
        let url = URL(string: "\(config.baseURL)/models/\(model):generateContent?key=\(config.apiKey)")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "contents": [
                [
                    "parts": [
                        ["text": "\(request.systemPrompt)\n\n\(request.userPrompt)"]
                    ]
                ]
            ],
            "generationConfig": [
                "temperature": config.temperature,
                "maxOutputTokens": config.maxTokens,
                "responseMimeType": "application/json"
            ]
        ]

        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await performRequest(urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIServiceError.invalidResponse("Not an HTTP response")
        }

        switch httpResponse.statusCode {
        case 200:
            return try parseGeminiResponse(data)
        case 401, 403:
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

    private func parseGeminiResponse(_ data: Data) throws -> AIFileAnalysisResponse {
        struct GeminiResponse: Decodable {
            struct Candidate: Decodable {
                struct Content: Decodable {
                    struct Part: Decodable {
                        let text: String?
                    }
                    let parts: [Part]
                }
                let content: Content
            }
            let candidates: [Candidate]?
        }

        let geminiResponse = try JSONDecoder().decode(GeminiResponse.self, from: data)
        guard let text = geminiResponse.candidates?.first?.content.parts.first?.text,
              let textData = text.data(using: .utf8) else {
            throw AIServiceError.invalidResponse("No text in Gemini response")
        }

        return try AIHTTPHelper.parseJSONResponse(textData)
    }
}
