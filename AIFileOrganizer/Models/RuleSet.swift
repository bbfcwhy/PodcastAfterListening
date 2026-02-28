import Foundation

/// A collection of organization rules that can be shared and imported/exported.
struct RuleSet: Codable, Identifiable, Hashable {
    var id: UUID
    var name: String
    var description: String
    var author: String
    var version: String
    var rules: [OrganizationRule]
    var createdAt: Date
    var updatedAt: Date
    var tags: [String]

    init(
        id: UUID = UUID(),
        name: String,
        description: String = "",
        author: String = "",
        version: String = "1.0.0",
        rules: [OrganizationRule] = [],
        tags: [String] = []
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.author = author
        self.version = version
        self.rules = rules
        self.createdAt = Date()
        self.updatedAt = Date()
        self.tags = tags
    }

    /// Export the rule set to JSON data.
    func exportJSON() throws -> Data {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        return try encoder.encode(self)
    }

    /// Import a rule set from JSON data.
    static func importJSON(_ data: Data) throws -> RuleSet {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(RuleSet.self, from: data)
    }

    /// Import a rule set from a file URL.
    static func importFromFile(_ url: URL) throws -> RuleSet {
        let data = try Data(contentsOf: url)
        return try importJSON(data)
    }

    /// Export the rule set to a file URL.
    func exportToFile(_ url: URL) throws {
        let data = try exportJSON()
        try data.write(to: url)
    }
}

// MARK: - Built-in Rule Set Templates

extension RuleSet {
    static let documentOrganizer = RuleSet(
        name: "Document Organizer",
        description: "Organizes documents by type (PDF, Word, spreadsheets, etc.) into categorized folders.",
        author: "AIFileOrganizer",
        rules: [
            OrganizationRule(
                name: "PDFs to Documents",
                description: "Move PDF files to Documents/PDFs",
                conditions: [
                    RuleCondition(type: .fileExtension, value: "pdf")
                ],
                action: RuleAction(
                    destinationPath: "~/Documents/PDFs",
                    namingTemplate: .datePrefixed
                ),
                priority: 10
            ),
            OrganizationRule(
                name: "Word Docs",
                description: "Move Word documents to Documents/Word",
                conditions: [
                    RuleCondition(type: .fileExtension, value: "docx,doc")
                ],
                action: RuleAction(
                    destinationPath: "~/Documents/Word",
                    namingTemplate: .original
                ),
                priority: 10
            ),
            OrganizationRule(
                name: "Spreadsheets",
                description: "Move spreadsheet files to Documents/Spreadsheets",
                conditions: [
                    RuleCondition(type: .fileExtension, value: "xlsx,xls,csv")
                ],
                action: RuleAction(
                    destinationPath: "~/Documents/Spreadsheets",
                    namingTemplate: .original
                ),
                priority: 10
            )
        ],
        tags: ["documents", "office", "basic"]
    )

    static let aiSmartOrganizer = RuleSet(
        name: "AI Smart Organizer",
        description: "Uses AI to analyze file content and automatically categorize into appropriate folders with smart naming.",
        author: "AIFileOrganizer",
        rules: [
            OrganizationRule(
                name: "AI Auto-Categorize",
                description: "Let AI analyze the file content and decide the best category and name",
                conditions: [
                    RuleCondition(type: .aiCategory, value: "*")
                ],
                action: RuleAction(
                    destinationPath: "~/Documents/{ai_category}",
                    namingTemplate: .aiSuggested,
                    createSubfolders: true
                ),
                priority: 0
            )
        ],
        tags: ["ai", "smart", "auto"]
    )

    static let developerOrganizer = RuleSet(
        name: "Developer File Organizer",
        description: "Organizes common developer files: screenshots, downloads, archives, code files.",
        author: "AIFileOrganizer",
        rules: [
            OrganizationRule(
                name: "Screenshots",
                description: "Move screenshots to Pictures/Screenshots",
                conditions: [
                    RuleCondition(type: .fileNameContains, value: "Screenshot"),
                    RuleCondition(type: .fileExtension, value: "png,jpg,jpeg")
                ],
                action: RuleAction(
                    destinationPath: "~/Pictures/Screenshots",
                    namingTemplate: .datePrefixed
                ),
                priority: 20
            ),
            OrganizationRule(
                name: "Archives",
                description: "Move archive files to Downloads/Archives",
                conditions: [
                    RuleCondition(type: .fileExtension, value: "zip,tar,gz,rar,7z")
                ],
                action: RuleAction(
                    destinationPath: "~/Downloads/Archives",
                    namingTemplate: .original
                ),
                priority: 10
            )
        ],
        tags: ["developer", "screenshots", "archives"]
    )

    static let allBuiltIn: [RuleSet] = [
        .documentOrganizer,
        .aiSmartOrganizer,
        .developerOrganizer
    ]
}
