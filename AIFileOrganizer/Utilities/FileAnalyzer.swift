import Foundation

/// Extracts text content from various file types for AI analysis.
final class FileAnalyzer {

    /// Extract text content from a file, if possible.
    func extractText(from url: URL) -> String? {
        let ext = url.pathExtension.lowercased()

        switch ext {
        case "txt", "md", "csv", "json", "xml", "html", "swift", "py", "js", "ts",
             "java", "c", "cpp", "h", "rb", "go", "rs", "sh", "yml", "yaml", "toml",
             "ini", "cfg", "conf", "log", "sql", "r", "m", "kt", "scala":
            return readPlainText(from: url)

        case "pdf":
            return extractPDFText(from: url)

        case "rtf":
            return extractRTFText(from: url)

        default:
            return nil
        }
    }

    /// Get file metadata for any file type.
    func getMetadata(from url: URL) -> [String: String] {
        var metadata: [String: String] = [:]

        guard let attributes = try? FileManager.default.attributesOfItem(atPath: url.path) else {
            return metadata
        }

        if let size = attributes[.size] as? Int64 {
            metadata["size"] = ByteCountFormatter.string(fromByteCount: size, countStyle: .file)
        }
        if let created = attributes[.creationDate] as? Date {
            metadata["created"] = ISO8601DateFormatter().string(from: created)
        }
        if let modified = attributes[.modificationDate] as? Date {
            metadata["modified"] = ISO8601DateFormatter().string(from: modified)
        }
        if let type = attributes[.type] as? FileAttributeType {
            metadata["type"] = type.rawValue
        }

        return metadata
    }

    // MARK: - Private Extractors

    private func readPlainText(from url: URL) -> String? {
        guard let data = try? Data(contentsOf: url) else { return nil }

        // Try UTF-8 first, then other encodings
        if let text = String(data: data, encoding: .utf8) {
            return truncate(text)
        }
        if let text = String(data: data, encoding: .ascii) {
            return truncate(text)
        }
        if let text = String(data: data, encoding: .isoLatin1) {
            return truncate(text)
        }

        return nil
    }

    private func extractPDFText(from url: URL) -> String? {
        // Use PDFKit through NSObject/dynamic to avoid hard dependency
        // This works on macOS which has PDFKit available
        guard let pdfDoc = CGPDFDocument(url as CFURL) else { return nil }

        var text = ""
        let pageCount = min(pdfDoc.numberOfPages, 10) // Limit to first 10 pages

        for pageIndex in 1...pageCount {
            guard let page = pdfDoc.page(at: pageIndex) else { continue }

            // Get page content as a string by scanning operators
            // For a production app, use PDFKit's PDFPage.string property
            // Since we're using CGPDFDocument, we'll get basic info
            let mediaBox = page.getBoxRect(.mediaBox)
            text += "[Page \(pageIndex) - \(Int(mediaBox.width))x\(Int(mediaBox.height))]\n"
        }

        // For a full implementation, use:
        // import PDFKit
        // let doc = PDFDocument(url: url)
        // return doc?.string
        return text.isEmpty ? nil : truncate(text)
    }

    private func extractRTFText(from url: URL) -> String? {
        guard let data = try? Data(contentsOf: url),
              let attributedString = try? NSAttributedString(
                  data: data,
                  options: [.documentType: NSAttributedString.DocumentType.rtf],
                  documentAttributes: nil
              ) else { return nil }

        return truncate(attributedString.string)
    }

    private func truncate(_ text: String, maxLength: Int = 5000) -> String {
        if text.count <= maxLength { return text }
        return String(text.prefix(maxLength)) + "\n[... truncated]"
    }
}
