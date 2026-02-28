import XCTest
@testable import AIFileOrganizerCore

final class AIServiceTests: XCTestCase {

    // MARK: - AIFileAnalysisRequest Tests

    func testAnalysisRequestPromptGeneration() {
        let request = AIFileAnalysisRequest(
            fileName: "invoice_2024.pdf",
            fileExtension: "pdf",
            fileSize: 1024 * 512,
            mimeType: "application/pdf",
            textContent: "Invoice #12345\nAmount: $500",
            metadata: ["pages": "3"]
        )

        XCTAssertTrue(request.systemPrompt.contains("file organization assistant"))
        XCTAssertTrue(request.userPrompt.contains("invoice_2024.pdf"))
        XCTAssertTrue(request.userPrompt.contains("pdf"))
        XCTAssertTrue(request.userPrompt.contains("Invoice #12345"))
        XCTAssertTrue(request.userPrompt.contains("pages=3"))
    }

    func testAnalysisRequestWithoutOptionalFields() {
        let request = AIFileAnalysisRequest(
            fileName: "photo.png",
            fileExtension: "png",
            fileSize: 2048,
            mimeType: nil,
            textContent: nil,
            metadata: [:]
        )

        let prompt = request.userPrompt
        XCTAssertTrue(prompt.contains("photo.png"))
        XCTAssertFalse(prompt.contains("MIME type"))
        XCTAssertFalse(prompt.contains("Content preview"))
    }

    func testAnalysisRequestTruncatesLongContent() {
        let longContent = String(repeating: "A", count: 5000)
        let request = AIFileAnalysisRequest(
            fileName: "large.txt",
            fileExtension: "txt",
            fileSize: 5000,
            mimeType: "text/plain",
            textContent: longContent,
            metadata: [:]
        )

        // The prompt should contain truncated content (max 3000 chars)
        XCTAssertTrue(request.userPrompt.contains("Content preview"))
        // User prompt contains at most 3000 chars of content
        let contentLine = request.userPrompt.components(separatedBy: "Content preview:\n").last ?? ""
        XCTAssertLessThanOrEqual(contentLine.count, 3000)
    }

    // MARK: - AIFileAnalysisResponse Tests

    func testResponseToAnalysisResult() {
        let response = AIFileAnalysisResponse(
            category: "Finance",
            subcategory: "Invoices",
            suggestedName: "invoice-2024-q1",
            tags: ["finance", "invoice", "2024"],
            summary: "Q1 2024 invoice from vendor",
            confidence: 0.95
        )

        let result = response.toAnalysisResult(provider: "OpenAI")

        XCTAssertEqual(result.category, "Finance")
        XCTAssertEqual(result.subcategory, "Invoices")
        XCTAssertEqual(result.suggestedName, "invoice-2024-q1")
        XCTAssertEqual(result.tags, ["finance", "invoice", "2024"])
        XCTAssertEqual(result.summary, "Q1 2024 invoice from vendor")
        XCTAssertEqual(result.confidence, 0.95)
        XCTAssertEqual(result.provider, "OpenAI")
    }

    func testResponseWithMissingOptionalFields() {
        let response = AIFileAnalysisResponse(
            category: "Personal",
            subcategory: nil,
            suggestedName: nil,
            tags: nil,
            summary: nil,
            confidence: nil
        )

        let result = response.toAnalysisResult(provider: "Claude")

        XCTAssertEqual(result.category, "Personal")
        XCTAssertNil(result.subcategory)
        XCTAssertNil(result.suggestedName)
        XCTAssertEqual(result.tags, [])
        XCTAssertNil(result.summary)
        XCTAssertEqual(result.confidence, 0.0)
    }

    // MARK: - JSON Parsing Tests

    func testParseValidJSON() throws {
        let json = """
        {
            "category": "Finance",
            "subcategory": "Tax",
            "suggested_name": "tax-return-2024",
            "tags": ["tax", "2024"],
            "summary": "Tax return document",
            "confidence": 0.92
        }
        """
        let data = json.data(using: .utf8)!
        let response = try AIHTTPHelper.parseJSONResponse(data)

        XCTAssertEqual(response.category, "Finance")
        XCTAssertEqual(response.subcategory, "Tax")
        XCTAssertEqual(response.suggestedName, "tax-return-2024")
        XCTAssertEqual(response.confidence, 0.92)
    }

    func testParseJSONInMarkdownBlock() throws {
        let markdown = """
        Here's the analysis:
        ```json
        {
            "category": "Medical",
            "confidence": 0.8
        }
        ```
        """
        let data = markdown.data(using: .utf8)!
        let response = try AIHTTPHelper.parseJSONResponse(data)

        XCTAssertEqual(response.category, "Medical")
        XCTAssertEqual(response.confidence, 0.8)
    }

    func testParseJSONEmbeddedInText() throws {
        let text = """
        Based on my analysis, here is the result:
        {"category": "Education", "confidence": 0.75}
        I hope this helps.
        """
        let data = text.data(using: .utf8)!
        let response = try AIHTTPHelper.parseJSONResponse(data)

        XCTAssertEqual(response.category, "Education")
    }

    func testParseInvalidJSONThrows() {
        let invalidData = "This is not JSON at all".data(using: .utf8)!
        XCTAssertThrowsError(try AIHTTPHelper.parseJSONResponse(invalidData))
    }

    // MARK: - Provider Config Tests

    func testProviderConfigDefaults() {
        let openAI = AIProviderConfig(type: .openAI)
        XCTAssertEqual(openAI.baseURL, "https://api.openai.com/v1")
        XCTAssertTrue(openAI.type.requiresAPIKey)
        XCTAssertFalse(openAI.isActive)

        let ollama = AIProviderConfig(type: .ollama)
        XCTAssertEqual(ollama.baseURL, "http://localhost:11434")
        XCTAssertFalse(ollama.type.requiresAPIKey)
    }

    func testAllProvidersHaveModels() {
        for providerType in AIProviderType.allCases {
            XCTAssertFalse(providerType.availableModels.isEmpty,
                           "\(providerType.displayName) should have available models")
        }
    }

    // MARK: - AIServiceManager Tests

    func testManagerWithNoProviderThrows() async {
        let manager = AIServiceManager()
        manager.configure(with: [])

        let request = AIFileAnalysisRequest(
            fileName: "test.pdf",
            fileExtension: "pdf",
            fileSize: 100,
            mimeType: nil,
            textContent: nil,
            metadata: [:]
        )

        do {
            _ = try await manager.analyzeFile(request)
            XCTFail("Should have thrown")
        } catch let error as AIServiceError {
            if case .noActiveProvider = error {
                // Expected
            } else {
                XCTFail("Expected noActiveProvider error")
            }
        } catch {
            XCTFail("Unexpected error type: \(error)")
        }
    }

    func testManagerHasActiveProvider() {
        let manager = AIServiceManager()

        let configs = [
            AIProviderConfig(type: .openAI, apiKey: "test-key", isActive: true)
        ]
        manager.configure(with: configs)

        XCTAssertTrue(manager.hasActiveProvider)
    }

    func testManagerWithNoActiveProvider() {
        let manager = AIServiceManager()

        let configs = [
            AIProviderConfig(type: .openAI, apiKey: "test-key", isActive: false)
        ]
        manager.configure(with: configs)

        XCTAssertFalse(manager.hasActiveProvider)
    }
}
