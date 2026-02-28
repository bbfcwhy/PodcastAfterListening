import XCTest
@testable import AIFileOrganizerCore

final class RuleSetTests: XCTestCase {

    // MARK: - JSON Export/Import Tests

    func testExportAndImportRuleSet() throws {
        let original = RuleSet(
            name: "Test Set",
            description: "A test rule set",
            author: "Tester",
            version: "1.0.0",
            rules: [
                OrganizationRule(
                    name: "PDFs",
                    description: "Move PDFs",
                    conditions: [
                        RuleCondition(type: .fileExtension, value: "pdf")
                    ],
                    action: RuleAction(
                        destinationPath: "~/Documents/PDFs",
                        namingTemplate: .datePrefixed
                    ),
                    priority: 10
                )
            ],
            tags: ["test", "pdf"]
        )

        let data = try original.exportJSON()
        let imported = try RuleSet.importJSON(data)

        XCTAssertEqual(imported.name, original.name)
        XCTAssertEqual(imported.description, original.description)
        XCTAssertEqual(imported.author, original.author)
        XCTAssertEqual(imported.version, original.version)
        XCTAssertEqual(imported.rules.count, 1)
        XCTAssertEqual(imported.rules.first?.name, "PDFs")
        XCTAssertEqual(imported.rules.first?.conditions.count, 1)
        XCTAssertEqual(imported.rules.first?.conditions.first?.type, .fileExtension)
        XCTAssertEqual(imported.rules.first?.conditions.first?.value, "pdf")
        XCTAssertEqual(imported.rules.first?.action.namingTemplate, .datePrefixed)
        XCTAssertEqual(imported.tags, ["test", "pdf"])
    }

    func testExportToFileAndImportFromFile() throws {
        let ruleSet = RuleSet(
            name: "File Test",
            rules: [
                OrganizationRule(
                    name: "Images",
                    conditions: [
                        RuleCondition(type: .fileExtension, value: "png,jpg,jpeg")
                    ],
                    action: RuleAction(destinationPath: "~/Pictures")
                )
            ]
        )

        let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("test-ruleset-\(UUID().uuidString).json")

        defer { try? FileManager.default.removeItem(at: tempURL) }

        try ruleSet.exportToFile(tempURL)
        XCTAssertTrue(FileManager.default.fileExists(atPath: tempURL.path))

        let imported = try RuleSet.importFromFile(tempURL)
        XCTAssertEqual(imported.name, "File Test")
        XCTAssertEqual(imported.rules.count, 1)
        XCTAssertEqual(imported.rules.first?.name, "Images")
    }

    func testImportInvalidJSON() {
        let invalidData = "not json".data(using: .utf8)!
        XCTAssertThrowsError(try RuleSet.importJSON(invalidData))
    }

    // MARK: - Built-in Rule Set Tests

    func testBuiltInRuleSetsExist() {
        let builtIn = RuleSet.allBuiltIn
        XCTAssertFalse(builtIn.isEmpty)
        XCTAssertTrue(builtIn.contains { $0.name == "Document Organizer" })
        XCTAssertTrue(builtIn.contains { $0.name == "AI Smart Organizer" })
        XCTAssertTrue(builtIn.contains { $0.name == "Developer File Organizer" })
    }

    func testBuiltInRuleSetsHaveRules() {
        for ruleSet in RuleSet.allBuiltIn {
            XCTAssertFalse(ruleSet.rules.isEmpty, "\(ruleSet.name) should have rules")
        }
    }

    func testBuiltInRuleSetsAreSerializable() throws {
        for ruleSet in RuleSet.allBuiltIn {
            let data = try ruleSet.exportJSON()
            let reimported = try RuleSet.importJSON(data)
            XCTAssertEqual(reimported.name, ruleSet.name)
            XCTAssertEqual(reimported.rules.count, ruleSet.rules.count)
        }
    }

    // MARK: - Rule Condition Tests

    func testRuleConditionTypeRequiresAI() {
        XCTAssertTrue(RuleConditionType.aiCategory.requiresAI)
        XCTAssertTrue(RuleConditionType.aiTag.requiresAI)
        XCTAssertTrue(RuleConditionType.contentContains.requiresAI)
        XCTAssertFalse(RuleConditionType.fileExtension.requiresAI)
        XCTAssertFalse(RuleConditionType.fileNameContains.requiresAI)
        XCTAssertFalse(RuleConditionType.mimeType.requiresAI)
    }

    func testOrganizationRuleRequiresAI() {
        let noAIRule = OrganizationRule(
            name: "No AI",
            conditions: [RuleCondition(type: .fileExtension, value: "pdf")],
            action: RuleAction(destinationPath: "~/Documents", namingTemplate: .original)
        )
        XCTAssertFalse(noAIRule.requiresAI)

        let aiConditionRule = OrganizationRule(
            name: "AI Condition",
            conditions: [RuleCondition(type: .aiCategory, value: "Finance")],
            action: RuleAction(destinationPath: "~/Documents", namingTemplate: .original)
        )
        XCTAssertTrue(aiConditionRule.requiresAI)

        let aiNamingRule = OrganizationRule(
            name: "AI Naming",
            conditions: [RuleCondition(type: .fileExtension, value: "pdf")],
            action: RuleAction(destinationPath: "~/Documents", namingTemplate: .aiSuggested)
        )
        XCTAssertTrue(aiNamingRule.requiresAI)
    }

    // MARK: - Naming Template Tests

    func testNamingTemplateDisplayNames() {
        for template in NamingTemplate.allCases {
            XCTAssertFalse(template.displayName.isEmpty)
        }
    }

    // MARK: - FileOperation Tests

    func testFileOperationPaths() {
        let op = FileOperation(
            sourcePath: "/Users/test/Desktop/Inbox",
            destinationPath: "/Users/test/Documents/Finance",
            originalFileName: "invoice.pdf",
            newFileName: "2024-01-15_invoice.pdf"
        )

        XCTAssertEqual(op.fullSource, "/Users/test/Desktop/Inbox/invoice.pdf")
        XCTAssertEqual(op.fullDestination, "/Users/test/Documents/Finance/2024-01-15_invoice.pdf")
        XCTAssertTrue(op.isUndoable)
    }

    func testFileOperationNotUndoableWhenUndone() {
        var op = FileOperation(
            sourcePath: "/source",
            destinationPath: "/dest",
            originalFileName: "file.txt",
            newFileName: "file.txt",
            status: .completed
        )
        XCTAssertTrue(op.isUndoable)

        op.undoneAt = Date()
        XCTAssertFalse(op.isUndoable)
    }

    func testFileOperationNotUndoableWhenFailed() {
        let op = FileOperation(
            sourcePath: "/source",
            destinationPath: "/dest",
            originalFileName: "file.txt",
            newFileName: "file.txt",
            status: .failed
        )
        XCTAssertFalse(op.isUndoable)
    }
}
