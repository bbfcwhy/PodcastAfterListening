import SwiftUI

struct InboxView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedFiles: Set<URL> = []
    @State private var isDragOver = false

    var body: some View {
        VStack(spacing: 0) {
            // Header
            headerBar

            Divider()

            if appState.pendingFiles.isEmpty && !appState.fileMonitor.isMonitoring {
                emptyState
            } else if appState.pendingFiles.isEmpty {
                monitoringEmptyState
            } else {
                fileList
            }
        }
        .onDrop(of: [.fileURL], isTargeted: $isDragOver) { providers in
            handleDrop(providers)
        }
        .overlay {
            if isDragOver {
                dragOverlay
            }
        }
    }

    // MARK: - Header

    private var headerBar: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Inbox")
                    .font(.title2.bold())
                Text(appState.settings.inboxPath)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            HStack(spacing: 8) {
                Button("Open Inbox") {
                    openInboxInFinder()
                }

                Button("Scan Now") {
                    appState.fileMonitor.scanNow()
                }
                .disabled(!appState.isMonitoring)

                if !appState.pendingFiles.isEmpty {
                    Button("Process All") {
                        appState.processNow()
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .padding()
    }

    // MARK: - File List

    private var fileList: some View {
        List(appState.pendingFiles, id: \.self, selection: $selectedFiles) { url in
            FileRow(url: url)
        }
    }

    // MARK: - Empty States

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("No files in inbox")
                .font(.title3)
                .foregroundStyle(.secondary)
            Text("Drop files here or start monitoring to auto-detect new files.")
                .font(.body)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)

            HStack(spacing: 12) {
                Button("Start Monitoring") {
                    appState.startMonitoring()
                }
                .buttonStyle(.borderedProminent)

                Button("Open Inbox Folder") {
                    openInboxInFinder()
                }
            }
            .padding(.top, 8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var monitoringEmptyState: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Monitoring inbox...")
                .font(.title3)
                .foregroundStyle(.secondary)
            Text("Drop files into \(appState.settings.inboxPath) and they'll appear here.")
                .font(.body)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Drag & Drop

    private var dragOverlay: some View {
        ZStack {
            Color.accentColor.opacity(0.1)

            VStack(spacing: 12) {
                Image(systemName: "arrow.down.doc.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(.accent)
                Text("Drop files to add to inbox")
                    .font(.headline)
                    .foregroundStyle(.accent)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(.accent, style: StrokeStyle(lineWidth: 2, dash: [8]))
        )
        .padding()
    }

    private func handleDrop(_ providers: [NSItemProvider]) -> Bool {
        for provider in providers {
            provider.loadItem(forTypeIdentifier: "public.file-url", options: nil) { item, _ in
                guard let data = item as? Data,
                      let url = URL(dataRepresentation: data, relativeTo: nil) else { return }

                DispatchQueue.main.async {
                    // Copy file to inbox
                    let inboxURL = appState.settings.inboxURL
                    let destination = inboxURL.appendingPathComponent(url.lastPathComponent)
                    try? FileManager.default.copyItem(at: url, to: destination)
                }
            }
        }
        return true
    }

    private func openInboxInFinder() {
        let inboxURL = appState.settings.inboxURL

        // Create directory if it doesn't exist
        try? FileManager.default.createDirectory(at: inboxURL, withIntermediateDirectories: true)

        #if os(macOS)
        NSWorkspace.shared.open(inboxURL)
        #endif
    }
}

// MARK: - File Row

struct FileRow: View {
    let url: URL

    var body: some View {
        HStack(spacing: 12) {
            fileIcon

            VStack(alignment: .leading, spacing: 2) {
                Text(url.lastPathComponent)
                    .font(.body)
                    .lineLimit(1)

                HStack(spacing: 8) {
                    Text(url.pathExtension.uppercased())
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(.secondary.opacity(0.15))
                        .clipShape(Capsule())

                    if let size = fileSize {
                        Text(size)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }

    private var fileIcon: some View {
        Image(systemName: iconName)
            .font(.title2)
            .foregroundStyle(.secondary)
            .frame(width: 32)
    }

    private var iconName: String {
        let ext = url.pathExtension.lowercased()
        switch ext {
        case "pdf": return "doc.richtext"
        case "doc", "docx": return "doc.text"
        case "xls", "xlsx", "csv": return "tablecells"
        case "ppt", "pptx": return "rectangle.split.3x1"
        case "png", "jpg", "jpeg", "gif", "svg": return "photo"
        case "mp3", "wav", "m4a": return "music.note"
        case "mp4", "mov", "avi": return "film"
        case "zip", "gz", "tar", "rar": return "archivebox"
        case "swift", "py", "js", "ts": return "chevron.left.forwardslash.chevron.right"
        default: return "doc"
        }
    }

    private var fileSize: String? {
        guard let attrs = try? FileManager.default.attributesOfItem(atPath: url.path),
              let size = attrs[.size] as? Int64 else { return nil }
        return ByteCountFormatter.string(fromByteCount: size, countStyle: .file)
    }
}
