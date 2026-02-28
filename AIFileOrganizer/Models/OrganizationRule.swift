import Foundation

// MARK: - Rule Condition

/// A single condition that a file must match for a rule to apply.
enum RuleConditionType: String, Codable, CaseIterable, Identifiable {
    case fileExtension = "file_extension"
    case fileNameContains = "file_name_contains"
    case fileNameMatches = "file_name_matches"
    case fileSizeGreaterThan = "file_size_gt"
    case fileSizeLessThan = "file_size_lt"
    case contentContains = "content_contains"
    case aiCategory = "ai_category"
    case aiTag = "ai_tag"
    case createdDateAfter = "created_date_after"
    case createdDateBefore = "created_date_before"
    case mimeType = "mime_type"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .fileExtension: return "File Extension"
        case .fileNameContains: return "File Name Contains"
        case .fileNameMatches: return "File Name Matches (Regex)"
        case .fileSizeGreaterThan: return "File Size Greater Than"
        case .fileSizeLessThan: return "File Size Less Than"
        case .contentContains: return "Content Contains"
        case .aiCategory: return "AI Category"
        case .aiTag: return "AI Tag"
        case .createdDateAfter: return "Created After"
        case .createdDateBefore: return "Created Before"
        case .mimeType: return "MIME Type"
        }
    }

    var requiresAI: Bool {
        switch self {
        case .aiCategory, .aiTag, .contentContains:
            return true
        default:
            return false
        }
    }
}

struct RuleCondition: Codable, Identifiable, Hashable {
    var id: UUID
    var type: RuleConditionType
    var value: String
    var negate: Bool

    init(id: UUID = UUID(), type: RuleConditionType, value: String, negate: Bool = false) {
        self.id = id
        self.type = type
        self.value = value
        self.negate = negate
    }
}

// MARK: - Rule Action

enum NamingTemplate: String, Codable, CaseIterable {
    case original = "{original}"
    case datePrefixed = "{date}_{original}"
    case categoryPrefixed = "{category}_{original}"
    case aiSuggested = "{ai_suggested}"
    case custom = "custom"

    var displayName: String {
        switch self {
        case .original: return "Keep Original"
        case .datePrefixed: return "Date Prefix (2026-02-28_file.pdf)"
        case .categoryPrefixed: return "Category Prefix (invoice_file.pdf)"
        case .aiSuggested: return "AI Suggested Name"
        case .custom: return "Custom Template"
        }
    }
}

struct RuleAction: Codable, Identifiable, Hashable {
    var id: UUID
    var destinationPath: String
    var namingTemplate: NamingTemplate
    var customTemplate: String?
    var createSubfolders: Bool
    var subfolderTemplate: String?

    init(
        id: UUID = UUID(),
        destinationPath: String,
        namingTemplate: NamingTemplate = .original,
        customTemplate: String? = nil,
        createSubfolders: Bool = false,
        subfolderTemplate: String? = nil
    ) {
        self.id = id
        self.destinationPath = destinationPath
        self.namingTemplate = namingTemplate
        self.customTemplate = customTemplate
        self.createSubfolders = createSubfolders
        self.subfolderTemplate = subfolderTemplate
    }
}

// MARK: - Condition Logic

enum ConditionLogic: String, Codable {
    case allOf = "all_of"
    case anyOf = "any_of"
}

// MARK: - Organization Rule

struct OrganizationRule: Codable, Identifiable, Hashable {
    var id: UUID
    var name: String
    var description: String
    var conditions: [RuleCondition]
    var conditionLogic: ConditionLogic
    var action: RuleAction
    var priority: Int
    var isEnabled: Bool
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        name: String,
        description: String = "",
        conditions: [RuleCondition] = [],
        conditionLogic: ConditionLogic = .allOf,
        action: RuleAction,
        priority: Int = 0,
        isEnabled: Bool = true
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.conditions = conditions
        self.conditionLogic = conditionLogic
        self.action = action
        self.priority = priority
        self.isEnabled = isEnabled
        self.createdAt = Date()
        self.updatedAt = Date()
    }

    var requiresAI: Bool {
        conditions.contains { $0.type.requiresAI }
            || action.namingTemplate == .aiSuggested
            || action.namingTemplate == .categoryPrefixed
    }
}
