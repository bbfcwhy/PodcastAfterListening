import Foundation
import Combine

/// Manages the history of all file operations, enabling undo/rollback.
final class HistoryManager: ObservableObject {
    @Published var batches: [OperationBatch] = []
    @Published var allOperations: [FileOperation] = []

    private let maxItems: Int
    private let storageURL: URL

    init(maxItems: Int = 1000) {
        self.maxItems = maxItems

        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        let appDir = appSupport.appendingPathComponent("AIFileOrganizer", isDirectory: true)
        try? FileManager.default.createDirectory(at: appDir, withIntermediateDirectories: true)
        self.storageURL = appDir.appendingPathComponent("history.json")

        loadHistory()
    }

    // MARK: - Recording

    /// Record a batch of operations.
    func addBatch(_ batch: OperationBatch) {
        batches.insert(batch, at: 0)
        allOperations.insert(contentsOf: batch.operations, at: 0)

        // Trim history if needed
        if allOperations.count > maxItems {
            allOperations = Array(allOperations.prefix(maxItems))
        }

        saveHistory()
    }

    /// Record a single operation.
    func addOperation(_ operation: FileOperation) {
        let batch = OperationBatch(operations: [operation], triggerType: .manual)
        addBatch(batch)
    }

    // MARK: - Undo / Rollback

    /// Undo a single operation (move the file back to its original location).
    func undoOperation(_ operation: FileOperation) throws {
        guard operation.isUndoable else {
            throw HistoryError.operationNotUndoable
        }

        let fm = FileManager.default
        let currentPath = operation.fullDestination
        let originalPath = operation.fullSource

        guard fm.fileExists(atPath: currentPath) else {
            throw HistoryError.fileNotFound(currentPath)
        }

        // Ensure original directory exists
        let originalDir = URL(fileURLWithPath: originalPath).deletingLastPathComponent()
        if !fm.fileExists(atPath: originalDir.path) {
            try fm.createDirectory(at: originalDir, withIntermediateDirectories: true)
        }

        try fm.moveItem(
            at: URL(fileURLWithPath: currentPath),
            to: URL(fileURLWithPath: originalPath)
        )

        // Update operation status
        markAsUndone(operation.id)
    }

    /// Undo an entire batch of operations.
    func undoBatch(_ batch: OperationBatch) throws {
        let undoableOps = batch.operations.filter { $0.isUndoable }

        // Undo in reverse order
        for operation in undoableOps.reversed() {
            try undoOperation(operation)
        }
    }

    /// Undo all operations after a given date.
    func undoAllAfter(_ date: Date) throws {
        let operations = allOperations.filter {
            $0.timestamp > date && $0.isUndoable
        }.sorted { $0.timestamp > $1.timestamp }

        for operation in operations {
            try undoOperation(operation)
        }
    }

    // MARK: - Query

    /// Get operations for a specific date range.
    func operations(from: Date, to: Date) -> [FileOperation] {
        allOperations.filter { $0.timestamp >= from && $0.timestamp <= to }
    }

    /// Get operations matching a search term.
    func search(_ query: String) -> [FileOperation] {
        let lowered = query.lowercased()
        return allOperations.filter {
            $0.originalFileName.lowercased().contains(lowered)
                || $0.newFileName.lowercased().contains(lowered)
                || $0.destinationPath.lowercased().contains(lowered)
                || ($0.ruleName?.lowercased().contains(lowered) ?? false)
        }
    }

    /// Clear all history.
    func clearHistory() {
        batches.removeAll()
        allOperations.removeAll()
        saveHistory()
    }

    // MARK: - Private

    private func markAsUndone(_ operationId: UUID) {
        if let index = allOperations.firstIndex(where: { $0.id == operationId }) {
            allOperations[index].status = .undone
            allOperations[index].undoneAt = Date()
        }
        for batchIndex in batches.indices {
            if let opIndex = batches[batchIndex].operations.firstIndex(where: { $0.id == operationId }) {
                batches[batchIndex].operations[opIndex].status = .undone
                batches[batchIndex].operations[opIndex].undoneAt = Date()
            }
        }
        saveHistory()
    }

    private func loadHistory() {
        guard FileManager.default.fileExists(atPath: storageURL.path),
              let data = try? Data(contentsOf: storageURL) else { return }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        if let saved = try? decoder.decode(HistoryStorage.self, from: data) {
            batches = saved.batches
            allOperations = saved.operations
        }
    }

    private func saveHistory() {
        let storage = HistoryStorage(batches: batches, operations: allOperations)
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = .prettyPrinted

        if let data = try? encoder.encode(storage) {
            try? data.write(to: storageURL, options: .atomic)
        }
    }
}

// MARK: - Errors

enum HistoryError: LocalizedError {
    case operationNotUndoable
    case fileNotFound(String)

    var errorDescription: String? {
        switch self {
        case .operationNotUndoable:
            return "This operation cannot be undone."
        case .fileNotFound(let path):
            return "File not found at: \(path)"
        }
    }
}

// MARK: - Storage Format

private struct HistoryStorage: Codable {
    var batches: [OperationBatch]
    var operations: [FileOperation]
}
