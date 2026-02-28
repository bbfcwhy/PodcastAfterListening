import Foundation

/// Evaluates organization rules against file metadata and AI analysis results.
final class RuleEngine {

    /// Evaluate all rules in a rule set and return the best matching rule for a file.
    func findMatchingRule(
        for fileInfo: FileInfo,
        in ruleSet: RuleSet,
        aiResult: AIAnalysisResult? = nil
    ) -> OrganizationRule? {
        let enabledRules = ruleSet.rules
            .filter { $0.isEnabled }
            .sorted { $0.priority > $1.priority }

        for rule in enabledRules {
            if evaluateRule(rule, against: fileInfo, aiResult: aiResult) {
                return rule
            }
        }
        return nil
    }

    /// Evaluate a single rule against file info.
    func evaluateRule(
        _ rule: OrganizationRule,
        against fileInfo: FileInfo,
        aiResult: AIAnalysisResult? = nil
    ) -> Bool {
        guard !rule.conditions.isEmpty else { return false }

        let results = rule.conditions.map { condition in
            evaluateCondition(condition, against: fileInfo, aiResult: aiResult)
        }

        switch rule.conditionLogic {
        case .allOf:
            return results.allSatisfy { $0 }
        case .anyOf:
            return results.contains(true)
        }
    }

    /// Evaluate a single condition.
    func evaluateCondition(
        _ condition: RuleCondition,
        against fileInfo: FileInfo,
        aiResult: AIAnalysisResult? = nil
    ) -> Bool {
        let matched: Bool

        switch condition.type {
        case .fileExtension:
            let extensions = condition.value
                .split(separator: ",")
                .map { $0.trimmingCharacters(in: .whitespaces).lowercased() }
            matched = extensions.contains(fileInfo.fileExtension.lowercased())

        case .fileNameContains:
            matched = fileInfo.fileName.localizedCaseInsensitiveContains(condition.value)

        case .fileNameMatches:
            matched = fileInfo.fileName.range(
                of: condition.value,
                options: .regularExpression,
                range: fileInfo.fileName.startIndex..<fileInfo.fileName.endIndex
            ) != nil

        case .fileSizeGreaterThan:
            guard let threshold = Int64(condition.value) else { return false }
            matched = fileInfo.fileSize > threshold

        case .fileSizeLessThan:
            guard let threshold = Int64(condition.value) else { return false }
            matched = fileInfo.fileSize < threshold

        case .contentContains:
            matched = fileInfo.textContent?.localizedCaseInsensitiveContains(condition.value) ?? false

        case .aiCategory:
            guard let aiResult else { return false }
            if condition.value == "*" {
                matched = true
            } else {
                let categories = condition.value
                    .split(separator: ",")
                    .map { $0.trimmingCharacters(in: .whitespaces).lowercased() }
                matched = categories.contains(aiResult.category.lowercased())
            }

        case .aiTag:
            guard let aiResult else { return false }
            let requiredTags = condition.value
                .split(separator: ",")
                .map { $0.trimmingCharacters(in: .whitespaces).lowercased() }
            let fileTags = aiResult.tags.map { $0.lowercased() }
            matched = requiredTags.contains { fileTags.contains($0) }

        case .createdDateAfter:
            guard let date = ISO8601DateFormatter().date(from: condition.value) else { return false }
            matched = (fileInfo.createdDate ?? Date.distantPast) > date

        case .createdDateBefore:
            guard let date = ISO8601DateFormatter().date(from: condition.value) else { return false }
            matched = (fileInfo.createdDate ?? Date.distantFuture) < date

        case .mimeType:
            let mimeTypes = condition.value
                .split(separator: ",")
                .map { $0.trimmingCharacters(in: .whitespaces).lowercased() }
            matched = mimeTypes.contains(fileInfo.mimeType?.lowercased() ?? "")
        }

        return condition.negate ? !matched : matched
    }

    /// Resolve the destination path for a matched rule, replacing template variables.
    func resolveDestinationPath(
        rule: OrganizationRule,
        fileInfo: FileInfo,
        aiResult: AIAnalysisResult? = nil
    ) -> String {
        var path = rule.action.destinationPath

        // Replace template variables
        path = path.replacingOccurrences(of: "{ai_category}", with: aiResult?.category ?? "Uncategorized")
        path = path.replacingOccurrences(of: "{ai_subcategory}", with: aiResult?.subcategory ?? "General")

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        path = path.replacingOccurrences(of: "{date}", with: dateFormatter.string(from: Date()))

        dateFormatter.dateFormat = "yyyy"
        path = path.replacingOccurrences(of: "{year}", with: dateFormatter.string(from: Date()))

        dateFormatter.dateFormat = "MM"
        path = path.replacingOccurrences(of: "{month}", with: dateFormatter.string(from: Date()))

        path = path.replacingOccurrences(of: "{extension}", with: fileInfo.fileExtension)

        // Expand tilde
        path = NSString(string: path).expandingTildeInPath

        return path
    }

    /// Resolve the new file name based on the rule's naming template.
    func resolveFileName(
        rule: OrganizationRule,
        fileInfo: FileInfo,
        aiResult: AIAnalysisResult? = nil
    ) -> String {
        let baseName = (fileInfo.fileName as NSString).deletingPathExtension
        let ext = fileInfo.fileExtension

        let newBaseName: String
        switch rule.action.namingTemplate {
        case .original:
            newBaseName = baseName

        case .datePrefixed:
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd"
            newBaseName = "\(dateFormatter.string(from: Date()))_\(baseName)"

        case .categoryPrefixed:
            let category = aiResult?.category.lowercased()
                .replacingOccurrences(of: " ", with: "-") ?? "uncategorized"
            newBaseName = "\(category)_\(baseName)"

        case .aiSuggested:
            newBaseName = aiResult?.suggestedName ?? baseName

        case .custom:
            if let template = rule.action.customTemplate {
                var result = template
                result = result.replacingOccurrences(of: "{original}", with: baseName)
                result = result.replacingOccurrences(of: "{category}", with: aiResult?.category ?? "unknown")
                result = result.replacingOccurrences(of: "{ai_name}", with: aiResult?.suggestedName ?? baseName)

                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd"
                result = result.replacingOccurrences(of: "{date}", with: dateFormatter.string(from: Date()))

                dateFormatter.dateFormat = "yyyyMMdd"
                result = result.replacingOccurrences(of: "{date_compact}", with: dateFormatter.string(from: Date()))

                newBaseName = result
            } else {
                newBaseName = baseName
            }
        }

        return ext.isEmpty ? newBaseName : "\(newBaseName).\(ext)"
    }
}

// MARK: - File Info

/// Metadata about a file being processed.
struct FileInfo {
    var url: URL
    var fileName: String
    var fileExtension: String
    var fileSize: Int64
    var mimeType: String?
    var textContent: String?
    var createdDate: Date?
    var modifiedDate: Date?
    var metadata: [String: String]

    init(url: URL) {
        self.url = url
        self.fileName = url.lastPathComponent
        self.fileExtension = url.pathExtension
        self.metadata = [:]

        // Read file attributes
        let attributes = try? FileManager.default.attributesOfItem(atPath: url.path)
        self.fileSize = (attributes?[.size] as? Int64) ?? 0
        self.createdDate = attributes?[.creationDate] as? Date
        self.modifiedDate = attributes?[.modificationDate] as? Date

        // Determine MIME type from extension
        self.mimeType = FileInfo.mimeType(for: url.pathExtension)

        // Extract text content for supported types
        self.textContent = nil
    }

    static func mimeType(for ext: String) -> String? {
        let mapping: [String: String] = [
            "pdf": "application/pdf",
            "txt": "text/plain",
            "md": "text/markdown",
            "csv": "text/csv",
            "json": "application/json",
            "xml": "application/xml",
            "html": "text/html",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "xls": "application/vnd.ms-excel",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "ppt": "application/vnd.ms-powerpoint",
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "gif": "image/gif",
            "svg": "image/svg+xml",
            "mp3": "audio/mpeg",
            "mp4": "video/mp4",
            "zip": "application/zip",
            "gz": "application/gzip",
            "tar": "application/x-tar",
            "swift": "text/x-swift",
            "py": "text/x-python",
            "js": "text/javascript",
            "ts": "text/typescript",
        ]
        return mapping[ext.lowercased()]
    }
}
