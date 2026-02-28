import Foundation
import Combine

/// Orchestrates the complete file organization pipeline:
/// detect → analyze (AI) → match rule → move/rename → record history.
final class FileOrganizer: ObservableObject {
    @Published var isProcessing = false
    @Published var lastError: String?
    @Published var processedCount = 0

    private let ruleEngine = RuleEngine()
    private let aiManager = AIServiceManager()
    private let historyManager: HistoryManager
    private let fileAnalyzer = FileAnalyzer()

    init(historyManager: HistoryManager) {
        self.historyManager = historyManager
    }

    /// Configure the AI service with provider configs.
    func configureAI(with configs: [AIProviderConfig]) {
        aiManager.configure(with: configs)
    }

    /// Process a batch of files against a rule set.
    func processFiles(
        _ urls: [URL],
        ruleSet: RuleSet,
        triggerType: TriggerType = .automatic
    ) async -> OperationBatch {
        await MainActor.run {
            isProcessing = true
            lastError = nil
        }

        var operations: [FileOperation] = []

        for url in urls {
            let operation = await processFile(url, ruleSet: ruleSet)
            operations.append(operation)
        }

        let batch = OperationBatch(
            operations: operations,
            triggerType: triggerType
        )

        historyManager.addBatch(batch)

        await MainActor.run {
            isProcessing = false
            processedCount += operations.filter { $0.status == .completed }.count
        }

        return batch
    }

    /// Process a single file.
    func processFile(_ url: URL, ruleSet: RuleSet) async -> FileOperation {
        // 1. Gather file info
        var fileInfo = FileInfo(url: url)

        // 2. Extract text content if possible
        fileInfo.textContent = fileAnalyzer.extractText(from: url)

        // 3. Run AI analysis if needed and available
        var aiResult: AIAnalysisResult?
        let needsAI = ruleSet.rules.contains { $0.requiresAI }

        if needsAI && aiManager.hasActiveProvider {
            let request = AIFileAnalysisRequest(
                fileName: fileInfo.fileName,
                fileExtension: fileInfo.fileExtension,
                fileSize: fileInfo.fileSize,
                mimeType: fileInfo.mimeType,
                textContent: fileInfo.textContent,
                metadata: fileInfo.metadata
            )

            do {
                aiResult = try await aiManager.analyzeFile(request)
            } catch {
                await MainActor.run {
                    lastError = "AI analysis failed: \(error.localizedDescription)"
                }
            }
        }

        // 4. Find matching rule
        guard let rule = ruleEngine.findMatchingRule(for: fileInfo, in: ruleSet, aiResult: aiResult) else {
            return FileOperation(
                sourcePath: url.deletingLastPathComponent().path,
                destinationPath: url.deletingLastPathComponent().path,
                originalFileName: url.lastPathComponent,
                newFileName: url.lastPathComponent,
                status: .skipped
            )
        }

        // 5. Resolve destination and file name
        let destinationPath = ruleEngine.resolveDestinationPath(rule: rule, fileInfo: fileInfo, aiResult: aiResult)
        let newFileName = ruleEngine.resolveFileName(rule: rule, fileInfo: fileInfo, aiResult: aiResult)

        // 6. Determine operation type
        let sourcePath = url.deletingLastPathComponent().path
        let isMove = destinationPath != sourcePath
        let isRename = newFileName != url.lastPathComponent
        let operationType: OperationType
        if isMove && isRename {
            operationType = .moveAndRename
        } else if isMove {
            operationType = .move
        } else if isRename {
            operationType = .rename
        } else {
            return FileOperation(
                sourcePath: sourcePath,
                destinationPath: destinationPath,
                originalFileName: url.lastPathComponent,
                newFileName: newFileName,
                ruleId: rule.id,
                ruleName: rule.name,
                aiAnalysis: aiResult,
                status: .skipped
            )
        }

        // 7. Execute the file operation
        let operation = FileOperation(
            type: operationType,
            sourcePath: sourcePath,
            destinationPath: destinationPath,
            originalFileName: url.lastPathComponent,
            newFileName: newFileName,
            ruleId: rule.id,
            ruleName: rule.name,
            aiAnalysis: aiResult,
            status: .processing
        )

        do {
            try executeOperation(operation)
            var completed = operation
            completed.status = .completed
            return completed
        } catch {
            await MainActor.run {
                lastError = "Failed to organize \(url.lastPathComponent): \(error.localizedDescription)"
            }
            var failed = operation
            failed.status = .failed
            return failed
        }
    }

    /// Execute a file move/rename operation on disk.
    private func executeOperation(_ operation: FileOperation) throws {
        let fm = FileManager.default

        // Create destination directory if needed
        let destinationDir = URL(fileURLWithPath: operation.destinationPath)
        if !fm.fileExists(atPath: destinationDir.path) {
            try fm.createDirectory(at: destinationDir, withIntermediateDirectories: true)
        }

        let sourceURL = URL(fileURLWithPath: operation.fullSource)
        var destinationURL = URL(fileURLWithPath: operation.fullDestination)

        // Handle name conflicts by appending a number
        if fm.fileExists(atPath: destinationURL.path) {
            destinationURL = uniqueDestination(for: destinationURL)
        }

        try fm.moveItem(at: sourceURL, to: destinationURL)
    }

    /// Generate a unique file name to avoid conflicts.
    private func uniqueDestination(for url: URL) -> URL {
        let fm = FileManager.default
        let directory = url.deletingLastPathComponent()
        let baseName = (url.deletingPathExtension().lastPathComponent)
        let ext = url.pathExtension

        var counter = 1
        var candidate: URL
        repeat {
            let name = ext.isEmpty ? "\(baseName)_\(counter)" : "\(baseName)_\(counter).\(ext)"
            candidate = directory.appendingPathComponent(name)
            counter += 1
        } while fm.fileExists(atPath: candidate.path)

        return candidate
    }
}
