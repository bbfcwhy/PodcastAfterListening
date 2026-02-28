import Foundation

/// Represents a single file operation that was performed by the organizer.
/// Used for tracking history and enabling undo/rollback.
struct FileOperation: Codable, Identifiable, Hashable {
    var id: UUID
    var timestamp: Date
    var type: OperationType
    var sourcePath: String
    var destinationPath: String
    var originalFileName: String
    var newFileName: String
    var ruleId: UUID?
    var ruleName: String?
    var aiAnalysis: AIAnalysisResult?
    var status: OperationStatus
    var undoneAt: Date?

    init(
        id: UUID = UUID(),
        timestamp: Date = Date(),
        type: OperationType = .moveAndRename,
        sourcePath: String,
        destinationPath: String,
        originalFileName: String,
        newFileName: String,
        ruleId: UUID? = nil,
        ruleName: String? = nil,
        aiAnalysis: AIAnalysisResult? = nil,
        status: OperationStatus = .completed
    ) {
        self.id = id
        self.timestamp = timestamp
        self.type = type
        self.sourcePath = sourcePath
        self.destinationPath = destinationPath
        self.originalFileName = originalFileName
        self.newFileName = newFileName
        self.ruleId = ruleId
        self.ruleName = ruleName
        self.aiAnalysis = aiAnalysis
        self.status = status
    }

    var isUndoable: Bool {
        status == .completed && undoneAt == nil
    }

    var sourceURL: URL {
        URL(fileURLWithPath: sourcePath)
    }

    var destinationURL: URL {
        URL(fileURLWithPath: destinationPath)
    }

    var fullDestination: String {
        (destinationPath as NSString).appendingPathComponent(newFileName)
    }

    var fullSource: String {
        (sourcePath as NSString).appendingPathComponent(originalFileName)
    }
}

enum OperationType: String, Codable {
    case move
    case rename
    case moveAndRename = "move_and_rename"
    case copy
}

enum OperationStatus: String, Codable {
    case pending
    case processing
    case completed
    case failed
    case undone
    case skipped
}

// MARK: - AI Analysis Result

struct AIAnalysisResult: Codable, Hashable {
    var category: String
    var subcategory: String?
    var suggestedName: String?
    var tags: [String]
    var summary: String?
    var confidence: Double
    var provider: String

    init(
        category: String,
        subcategory: String? = nil,
        suggestedName: String? = nil,
        tags: [String] = [],
        summary: String? = nil,
        confidence: Double = 0.0,
        provider: String = ""
    ) {
        self.category = category
        self.subcategory = subcategory
        self.suggestedName = suggestedName
        self.tags = tags
        self.summary = summary
        self.confidence = confidence
        self.provider = provider
    }
}

// MARK: - Operation Batch

/// A batch of operations that were performed together (e.g., from a single inbox scan).
struct OperationBatch: Codable, Identifiable {
    var id: UUID
    var timestamp: Date
    var operations: [FileOperation]
    var triggerType: TriggerType

    init(
        id: UUID = UUID(),
        timestamp: Date = Date(),
        operations: [FileOperation] = [],
        triggerType: TriggerType = .automatic
    ) {
        self.id = id
        self.timestamp = timestamp
        self.operations = operations
        self.triggerType = triggerType
    }

    var successCount: Int {
        operations.filter { $0.status == .completed }.count
    }

    var failedCount: Int {
        operations.filter { $0.status == .failed }.count
    }
}

enum TriggerType: String, Codable {
    case automatic
    case manual
    case scheduled
}
