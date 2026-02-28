import SwiftUI

struct HistoryView: View {
    @EnvironmentObject var appState: AppState
    @State private var searchText = ""
    @State private var filterStatus: OperationStatus?
    @State private var showingUndoConfirmation = false
    @State private var operationToUndo: FileOperation?

    private var filteredOperations: [FileOperation] {
        var ops = appState.historyManager.allOperations

        if !searchText.isEmpty {
            ops = appState.historyManager.search(searchText)
        }

        if let status = filterStatus {
            ops = ops.filter { $0.status == status }
        }

        return ops
    }

    var body: some View {
        VStack(spacing: 0) {
            headerBar
            Divider()

            if appState.historyManager.allOperations.isEmpty {
                emptyState
            } else {
                operationList
            }
        }
        .alert("Undo Operation", isPresented: $showingUndoConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Undo", role: .destructive) {
                if let op = operationToUndo {
                    performUndo(op)
                }
            }
        } message: {
            if let op = operationToUndo {
                Text("Move \"\(op.newFileName)\" back to its original location?\n\nFrom: \(op.destinationPath)\nTo: \(op.sourcePath)")
            }
        }
    }

    // MARK: - Header

    private var headerBar: some View {
        HStack {
            Text("History")
                .font(.title2.bold())

            Spacer()

            HStack(spacing: 8) {
                // Filter
                Menu {
                    Button("All") { filterStatus = nil }
                    Divider()
                    Button("Completed") { filterStatus = .completed }
                    Button("Failed") { filterStatus = .failed }
                    Button("Undone") { filterStatus = .undone }
                    Button("Skipped") { filterStatus = .skipped }
                } label: {
                    Label(
                        filterStatus?.rawValue.capitalized ?? "All",
                        systemImage: "line.3.horizontal.decrease.circle"
                    )
                }

                TextField("Search...", text: $searchText)
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 200)

                if !appState.historyManager.allOperations.isEmpty {
                    Button("Clear All", role: .destructive) {
                        appState.historyManager.clearHistory()
                    }
                }
            }
        }
        .padding()
    }

    // MARK: - Operation List

    private var operationList: some View {
        List {
            ForEach(filteredOperations) { operation in
                OperationRow(operation: operation)
                    .contextMenu {
                        if operation.isUndoable {
                            Button("Undo") {
                                operationToUndo = operation
                                showingUndoConfirmation = true
                            }
                        }
                        Button("Show in Finder") {
                            showInFinder(operation)
                        }
                        Button("Copy Path") {
                            #if os(macOS)
                            NSPasteboard.general.clearContents()
                            NSPasteboard.general.setString(operation.fullDestination, forType: .string)
                            #endif
                        }
                    }
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("No history yet")
                .font(.title3)
                .foregroundStyle(.secondary)
            Text("File operations will appear here once files are processed.")
                .font(.body)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Actions

    private func performUndo(_ operation: FileOperation) {
        do {
            try appState.historyManager.undoOperation(operation)
            appState.statusMessage = "Undone: \(operation.originalFileName)"
        } catch {
            appState.statusMessage = "Undo failed: \(error.localizedDescription)"
        }
    }

    private func showInFinder(_ operation: FileOperation) {
        #if os(macOS)
        let url = URL(fileURLWithPath: operation.fullDestination)
        NSWorkspace.shared.activateFileViewerSelecting([url])
        #endif
    }
}

// MARK: - Operation Row

struct OperationRow: View {
    let operation: FileOperation

    var body: some View {
        HStack(spacing: 12) {
            statusIcon

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(operation.originalFileName)
                        .font(.body.weight(.medium))

                    if operation.originalFileName != operation.newFileName {
                        Image(systemName: "arrow.right")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(operation.newFileName)
                            .font(.body)
                            .foregroundStyle(.blue)
                    }
                }

                HStack(spacing: 8) {
                    if let ruleName = operation.ruleName {
                        Label(ruleName, systemImage: "list.bullet.rectangle")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Label(operation.destinationPath, systemImage: "folder")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                HStack(spacing: 8) {
                    Text(operation.timestamp, style: .relative)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)

                    if let ai = operation.aiAnalysis {
                        HStack(spacing: 4) {
                            Text("AI: \(ai.category)")
                                .font(.caption2)
                                .padding(.horizontal, 5)
                                .padding(.vertical, 1)
                                .background(.purple.opacity(0.15))
                                .clipShape(Capsule())

                            Text("\(Int(ai.confidence * 100))%")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }

                    if operation.status == .undone {
                        Text("Undone")
                            .font(.caption2)
                            .foregroundStyle(.orange)
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
        .opacity(operation.status == .undone ? 0.6 : 1.0)
    }

    private var statusIcon: some View {
        Group {
            switch operation.status {
            case .completed:
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
            case .failed:
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(.red)
            case .undone:
                Image(systemName: "arrow.uturn.backward.circle.fill")
                    .foregroundStyle(.orange)
            case .skipped:
                Image(systemName: "minus.circle.fill")
                    .foregroundStyle(.gray)
            case .processing:
                ProgressView()
                    .scaleEffect(0.7)
            case .pending:
                Image(systemName: "clock.fill")
                    .foregroundStyle(.yellow)
            }
        }
        .font(.title3)
    }
}
