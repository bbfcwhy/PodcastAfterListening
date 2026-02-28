import SwiftUI

struct RuleStoreView: View {
    @EnvironmentObject var appState: AppState
    @State private var isImporting = false
    @State private var importError: String?

    var body: some View {
        VStack(spacing: 0) {
            headerBar
            Divider()
            ruleStoreContent
        }
        .alert("Import Error", isPresented: .init(
            get: { importError != nil },
            set: { if !$0 { importError = nil } }
        )) {
            Button("OK") { importError = nil }
        } message: {
            Text(importError ?? "")
        }
    }

    // MARK: - Header

    private var headerBar: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Rule Store")
                    .font(.title2.bold())
                Text("Built-in templates and imported rule sets")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                importRuleSet()
            } label: {
                Label("Import Rule Set", systemImage: "square.and.arrow.down")
            }
        }
        .padding()
    }

    // MARK: - Content

    private var ruleStoreContent: some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.adaptive(minimum: 300, maximum: 400), spacing: 16)
            ], spacing: 16) {
                ForEach(RuleSet.allBuiltIn) { ruleSet in
                    RuleSetCard(
                        ruleSet: ruleSet,
                        isInstalled: appState.ruleSets.contains { $0.name == ruleSet.name },
                        onInstall: { installRuleSet(ruleSet) }
                    )
                }
            }
            .padding()
        }
    }

    // MARK: - Actions

    private func installRuleSet(_ ruleSet: RuleSet) {
        // Create a copy with a new ID
        var copy = ruleSet
        copy.id = UUID()
        copy.createdAt = Date()
        copy.updatedAt = Date()
        appState.addRuleSet(copy)
    }

    private func importRuleSet() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.json]
        panel.allowsMultipleSelection = false
        panel.message = "Select a rule set JSON file to import"

        guard panel.runModal() == .OK, let url = panel.url else { return }

        do {
            try appState.importRuleSet(from: url)
        } catch {
            importError = "Failed to import: \(error.localizedDescription)"
        }
    }
}

// MARK: - Rule Set Card

struct RuleSetCard: View {
    let ruleSet: RuleSet
    let isInstalled: Bool
    let onInstall: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(ruleSet.name)
                        .font(.headline)
                    Text("by \(ruleSet.author)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                if ruleSet.rules.contains(where: { $0.requiresAI }) {
                    Text("AI")
                        .font(.caption.bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(.purple.opacity(0.2))
                        .foregroundStyle(.purple)
                        .clipShape(Capsule())
                }
            }

            Text(ruleSet.description)
                .font(.body)
                .foregroundStyle(.secondary)
                .lineLimit(3)

            // Tags
            FlowLayout(spacing: 4) {
                ForEach(ruleSet.tags, id: \.self) { tag in
                    Text(tag)
                        .font(.caption2)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(.secondary.opacity(0.1))
                        .clipShape(Capsule())
                }
            }

            // Stats and action
            HStack {
                Text("\(ruleSet.rules.count) rules")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Spacer()

                if isInstalled {
                    Label("Installed", systemImage: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundStyle(.green)
                } else {
                    Button("Install") {
                        onInstall()
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                }
            }
        }
        .padding()
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(.separator, lineWidth: 1)
        )
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 4

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(in: proposal.width ?? 0, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(in: bounds.width, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private struct LayoutResult {
        var positions: [CGPoint]
        var size: CGSize
    }

    private func layout(in width: CGFloat, subviews: Subviews) -> LayoutResult {
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var maxHeight: CGFloat = 0
        var totalHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > width && x > 0 {
                x = 0
                y += maxHeight + spacing
                maxHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            maxHeight = max(maxHeight, size.height)
            x += size.width + spacing
            totalHeight = y + maxHeight
        }

        return LayoutResult(
            positions: positions,
            size: CGSize(width: width, height: totalHeight)
        )
    }
}
