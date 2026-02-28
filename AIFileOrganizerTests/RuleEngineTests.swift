import XCTest
@testable import AIFileOrganizerCore

final class RuleEngineTests: XCTestCase {
    var ruleEngine: RuleEngine!

    override func setUp() {
        super.setUp()
        ruleEngine = RuleEngine()
    }

    // MARK: - Condition Evaluation Tests

    func testFileExtensionCondition() {
        let condition = RuleCondition(type: .fileExtension, value: "pdf")
        let fileInfo = makeFileInfo(fileName: "document.pdf")

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: fileInfo))
    }

    func testFileExtensionMultipleValues() {
        let condition = RuleCondition(type: .fileExtension, value: "doc,docx,pdf")
        let pdfInfo = makeFileInfo(fileName: "test.pdf")
        let docxInfo = makeFileInfo(fileName: "test.docx")
        let txtInfo = makeFileInfo(fileName: "test.txt")

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: pdfInfo))
        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: docxInfo))
        XCTAssertFalse(ruleEngine.evaluateCondition(condition, against: txtInfo))
    }

    func testFileExtensionCaseInsensitive() {
        let condition = RuleCondition(type: .fileExtension, value: "PDF")
        let fileInfo = makeFileInfo(fileName: "document.pdf")

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: fileInfo))
    }

    func testFileNameContainsCondition() {
        let condition = RuleCondition(type: .fileNameContains, value: "invoice")
        let matchInfo = makeFileInfo(fileName: "invoice_2024.pdf")
        let noMatchInfo = makeFileInfo(fileName: "receipt_2024.pdf")

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: matchInfo))
        XCTAssertFalse(ruleEngine.evaluateCondition(condition, against: noMatchInfo))
    }

    func testFileNameContainsCaseInsensitive() {
        let condition = RuleCondition(type: .fileNameContains, value: "Invoice")
        let fileInfo = makeFileInfo(fileName: "2024_INVOICE_001.pdf")

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: fileInfo))
    }

    func testFileNameMatchesRegex() {
        let condition = RuleCondition(type: .fileNameMatches, value: "^\\d{4}-\\d{2}-\\d{2}")
        let matchInfo = makeFileInfo(fileName: "2024-01-15_report.pdf")
        let noMatchInfo = makeFileInfo(fileName: "report_2024.pdf")

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: matchInfo))
        XCTAssertFalse(ruleEngine.evaluateCondition(condition, against: noMatchInfo))
    }

    func testNegateCondition() {
        let condition = RuleCondition(type: .fileExtension, value: "pdf", negate: true)
        let pdfInfo = makeFileInfo(fileName: "document.pdf")
        let txtInfo = makeFileInfo(fileName: "document.txt")

        XCTAssertFalse(ruleEngine.evaluateCondition(condition, against: pdfInfo))
        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: txtInfo))
    }

    func testAICategoryCondition() {
        let condition = RuleCondition(type: .aiCategory, value: "Finance")
        let fileInfo = makeFileInfo(fileName: "doc.pdf")
        let aiResult = AIAnalysisResult(category: "Finance", confidence: 0.9, provider: "test")

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: fileInfo, aiResult: aiResult))
    }

    func testAICategoryWildcard() {
        let condition = RuleCondition(type: .aiCategory, value: "*")
        let fileInfo = makeFileInfo(fileName: "doc.pdf")
        let aiResult = AIAnalysisResult(category: "Anything", confidence: 0.5, provider: "test")

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: fileInfo, aiResult: aiResult))
    }

    func testAICategoryWithoutResult() {
        let condition = RuleCondition(type: .aiCategory, value: "Finance")
        let fileInfo = makeFileInfo(fileName: "doc.pdf")

        XCTAssertFalse(ruleEngine.evaluateCondition(condition, against: fileInfo, aiResult: nil))
    }

    func testAITagCondition() {
        let condition = RuleCondition(type: .aiTag, value: "tax,receipt")
        let fileInfo = makeFileInfo(fileName: "doc.pdf")
        let aiResult = AIAnalysisResult(
            category: "Finance",
            tags: ["invoice", "tax", "2024"],
            confidence: 0.9,
            provider: "test"
        )

        XCTAssertTrue(ruleEngine.evaluateCondition(condition, against: fileInfo, aiResult: aiResult))
    }

    // MARK: - Rule Evaluation Tests

    func testAllOfConditionLogic() {
        let rule = OrganizationRule(
            name: "PDF Invoices",
            conditions: [
                RuleCondition(type: .fileExtension, value: "pdf"),
                RuleCondition(type: .fileNameContains, value: "invoice")
            ],
            conditionLogic: .allOf,
            action: RuleAction(destinationPath: "~/Documents/Invoices")
        )

        let matchInfo = makeFileInfo(fileName: "invoice_2024.pdf")
        let partialMatchInfo = makeFileInfo(fileName: "invoice_2024.doc")

        XCTAssertTrue(ruleEngine.evaluateRule(rule, against: matchInfo))
        XCTAssertFalse(ruleEngine.evaluateRule(rule, against: partialMatchInfo))
    }

    func testAnyOfConditionLogic() {
        let rule = OrganizationRule(
            name: "Documents",
            conditions: [
                RuleCondition(type: .fileExtension, value: "pdf"),
                RuleCondition(type: .fileExtension, value: "docx")
            ],
            conditionLogic: .anyOf,
            action: RuleAction(destinationPath: "~/Documents")
        )

        let pdfInfo = makeFileInfo(fileName: "test.pdf")
        let docxInfo = makeFileInfo(fileName: "test.docx")
        let txtInfo = makeFileInfo(fileName: "test.txt")

        XCTAssertTrue(ruleEngine.evaluateRule(rule, against: pdfInfo))
        XCTAssertTrue(ruleEngine.evaluateRule(rule, against: docxInfo))
        XCTAssertFalse(ruleEngine.evaluateRule(rule, against: txtInfo))
    }

    func testEmptyConditionsReturnsFalse() {
        let rule = OrganizationRule(
            name: "Empty",
            conditions: [],
            action: RuleAction(destinationPath: "~/Documents")
        )
        let fileInfo = makeFileInfo(fileName: "test.pdf")

        XCTAssertFalse(ruleEngine.evaluateRule(rule, against: fileInfo))
    }

    func testDisabledRuleNotMatched() {
        let ruleSet = RuleSet(
            name: "Test",
            rules: [
                OrganizationRule(
                    name: "PDFs",
                    conditions: [RuleCondition(type: .fileExtension, value: "pdf")],
                    action: RuleAction(destinationPath: "~/Documents"),
                    isEnabled: false
                )
            ]
        )

        let fileInfo = makeFileInfo(fileName: "test.pdf")
        XCTAssertNil(ruleEngine.findMatchingRule(for: fileInfo, in: ruleSet))
    }

    func testPriorityOrdering() {
        let ruleSet = RuleSet(
            name: "Test",
            rules: [
                OrganizationRule(
                    name: "Low Priority",
                    conditions: [RuleCondition(type: .fileExtension, value: "pdf")],
                    action: RuleAction(destinationPath: "~/Documents/General"),
                    priority: 1
                ),
                OrganizationRule(
                    name: "High Priority",
                    conditions: [RuleCondition(type: .fileExtension, value: "pdf")],
                    action: RuleAction(destinationPath: "~/Documents/Important"),
                    priority: 10
                )
            ]
        )

        let fileInfo = makeFileInfo(fileName: "test.pdf")
        let matched = ruleEngine.findMatchingRule(for: fileInfo, in: ruleSet)

        XCTAssertEqual(matched?.name, "High Priority")
    }

    // MARK: - File Name Resolution Tests

    func testOriginalNamingTemplate() {
        let rule = makeRule(naming: .original)
        let fileInfo = makeFileInfo(fileName: "my-document.pdf")

        let result = ruleEngine.resolveFileName(rule: rule, fileInfo: fileInfo)
        XCTAssertEqual(result, "my-document.pdf")
    }

    func testDatePrefixedNaming() {
        let rule = makeRule(naming: .datePrefixed)
        let fileInfo = makeFileInfo(fileName: "document.pdf")

        let result = ruleEngine.resolveFileName(rule: rule, fileInfo: fileInfo)
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let today = dateFormatter.string(from: Date())

        XCTAssertTrue(result.hasPrefix(today))
        XCTAssertTrue(result.hasSuffix("document.pdf"))
    }

    func testCategoryPrefixedNaming() {
        let rule = makeRule(naming: .categoryPrefixed)
        let fileInfo = makeFileInfo(fileName: "report.pdf")
        let aiResult = AIAnalysisResult(category: "Finance", confidence: 0.9, provider: "test")

        let result = ruleEngine.resolveFileName(rule: rule, fileInfo: fileInfo, aiResult: aiResult)
        XCTAssertEqual(result, "finance_report.pdf")
    }

    func testAISuggestedNaming() {
        let rule = makeRule(naming: .aiSuggested)
        let fileInfo = makeFileInfo(fileName: "IMG_20240115.pdf")
        let aiResult = AIAnalysisResult(
            category: "Finance",
            suggestedName: "tax-return-2024",
            confidence: 0.95,
            provider: "test"
        )

        let result = ruleEngine.resolveFileName(rule: rule, fileInfo: fileInfo, aiResult: aiResult)
        XCTAssertEqual(result, "tax-return-2024.pdf")
    }

    func testAISuggestedFallback() {
        let rule = makeRule(naming: .aiSuggested)
        let fileInfo = makeFileInfo(fileName: "document.pdf")

        let result = ruleEngine.resolveFileName(rule: rule, fileInfo: fileInfo, aiResult: nil)
        XCTAssertEqual(result, "document.pdf")
    }

    // MARK: - Destination Path Resolution Tests

    func testDestinationPathWithAICategory() {
        var rule = makeRule(naming: .original)
        rule.action.destinationPath = "~/Documents/{ai_category}"

        let fileInfo = makeFileInfo(fileName: "test.pdf")
        let aiResult = AIAnalysisResult(category: "Finance", confidence: 0.9, provider: "test")

        let result = ruleEngine.resolveDestinationPath(rule: rule, fileInfo: fileInfo, aiResult: aiResult)
        XCTAssertTrue(result.hasSuffix("/Documents/Finance"))
    }

    func testDestinationPathWithoutAIFallback() {
        var rule = makeRule(naming: .original)
        rule.action.destinationPath = "~/Documents/{ai_category}"

        let fileInfo = makeFileInfo(fileName: "test.pdf")

        let result = ruleEngine.resolveDestinationPath(rule: rule, fileInfo: fileInfo, aiResult: nil)
        XCTAssertTrue(result.hasSuffix("/Documents/Uncategorized"))
    }

    // MARK: - Helpers

    private func makeFileInfo(fileName: String) -> FileInfo {
        let tempDir = FileManager.default.temporaryDirectory
        let url = tempDir.appendingPathComponent(fileName)
        var info = FileInfo(url: url)
        info.fileSize = 1024
        return info
    }

    private func makeRule(naming: NamingTemplate) -> OrganizationRule {
        OrganizationRule(
            name: "Test Rule",
            conditions: [RuleCondition(type: .fileExtension, value: "pdf")],
            action: RuleAction(
                destinationPath: "~/Documents/Test",
                namingTemplate: naming
            )
        )
    }
}
