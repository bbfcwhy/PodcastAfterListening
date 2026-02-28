import SwiftUI

struct RuleListView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedRuleSet: RuleSet?
    @State private var isAddingRuleSet = false
    @State private var isEditingRule = false
    @State private var editingRule: OrganizationRule?
    @State private var editingRuleSetIndex: Int?

    var body: some View {
        HSplitView {
            ruleSetList
                .frame(minWidth: 250, maxWidth: 300)

            if let ruleSet = selectedRuleSet,
               let index = appState.ruleSets.firstIndex(where: { $0.id == ruleSet.id }) {
                ruleDetailView(ruleSet: ruleSet, index: index)
            } else {
                noSelectionView
            }
        }
        .sheet(isPresented: $isAddingRuleSet) {
            RuleSetFormSheet { ruleSet in
                appState.addRuleSet(ruleSet)
                selectedRuleSet = ruleSet
            }
        }
        .sheet(item: $editingRule) { rule in
            if let setIndex = editingRuleSetIndex {
                RuleEditorSheet(rule: rule) { updated in
                    if let ruleIndex = appState.ruleSets[setIndex].rules.firstIndex(where: { $0.id == updated.id }) {
                        appState.ruleSets[setIndex].rules[ruleIndex] = updated
                    } else {
                        appState.ruleSets[setIndex].rules.append(updated)
                    }
                    appState.saveRuleSets()
                    selectedRuleSet = appState.ruleSets[setIndex]
                }
            }
        }
    }

    // MARK: - Rule Set List

    private var ruleSetList: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Rule Sets")
                    .font(.headline)
                Spacer()
                Button {
                    isAddingRuleSet = true
                } label: {
                    Image(systemName: "plus")
                }
            }
            .padding()

            Divider()

            List(appState.ruleSets, selection: $selectedRuleSet) { ruleSet in
                RuleSetRow(
                    ruleSet: ruleSet,
                    isActive: appState.activeRuleSet?.id == ruleSet.id
                )
                .tag(ruleSet)
                .contextMenu {
                    Button("Set as Active") {
                        appState.setActiveRuleSet(ruleSet)
                    }
                    Button("Export...") {
                        exportRuleSet(ruleSet)
                    }
                    Divider()
                    Button("Delete", role: .destructive) {
                        appState.deleteRuleSet(ruleSet)
                        if selectedRuleSet?.id == ruleSet.id {
                            selectedRuleSet = nil
                        }
                    }
                }
            }
        }
    }

    // MARK: - Rule Detail View

    private func ruleDetailView(ruleSet: RuleSet, index: Int) -> some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(ruleSet.name)
                        .font(.title2.bold())
                    if !ruleSet.description.isEmpty {
                        Text(ruleSet.description)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                HStack(spacing: 8) {
                    if appState.activeRuleSet?.id != ruleSet.id {
                        Button("Set Active") {
                            appState.setActiveRuleSet(ruleSet)
                        }
                        .buttonStyle(.borderedProminent)
                    } else {
                        Label("Active", systemImage: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                    }

                    Button {
                        editingRuleSetIndex = index
                        editingRule = OrganizationRule(
                            name: "",
                            action: RuleAction(destinationPath: "~/Documents")
                        )
                    } label: {
                        Image(systemName: "plus")
                        Text("Add Rule")
                    }
                }
            }
            .padding()

            Divider()

            // Rules list
            if ruleSet.rules.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "list.bullet.rectangle")
                        .font(.system(size: 40))
                        .foregroundStyle(.secondary)
                    Text("No rules yet")
                        .font(.title3)
                        .foregroundStyle(.secondary)
                    Text("Add rules to define how files should be organized.")
                        .foregroundStyle(.tertiary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List {
                    ForEach(ruleSet.rules) { rule in
                        RuleRow(rule: rule)
                            .contextMenu {
                                Button("Edit") {
                                    editingRuleSetIndex = index
                                    editingRule = rule
                                }
                                Button("Duplicate") {
                                    var copy = rule
                                    copy.id = UUID()
                                    copy.name += " (Copy)"
                                    appState.ruleSets[index].rules.append(copy)
                                    appState.saveRuleSets()
                                    selectedRuleSet = appState.ruleSets[index]
                                }
                                Divider()
                                Button(rule.isEnabled ? "Disable" : "Enable") {
                                    if let ruleIdx = appState.ruleSets[index].rules.firstIndex(where: { $0.id == rule.id }) {
                                        appState.ruleSets[index].rules[ruleIdx].isEnabled.toggle()
                                        appState.saveRuleSets()
                                        selectedRuleSet = appState.ruleSets[index]
                                    }
                                }
                                Button("Delete", role: .destructive) {
                                    appState.ruleSets[index].rules.removeAll { $0.id == rule.id }
                                    appState.saveRuleSets()
                                    selectedRuleSet = appState.ruleSets[index]
                                }
                            }
                            .onTapGesture(count: 2) {
                                editingRuleSetIndex = index
                                editingRule = rule
                            }
                    }
                    .onMove { from, to in
                        appState.ruleSets[index].rules.move(fromOffsets: from, toOffset: to)
                        appState.saveRuleSets()
                        selectedRuleSet = appState.ruleSets[index]
                    }
                }
            }
        }
    }

    private var noSelectionView: some View {
        VStack(spacing: 12) {
            Image(systemName: "list.bullet.rectangle")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("Select a Rule Set")
                .font(.title3)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func exportRuleSet(_ ruleSet: RuleSet) {
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.json]
        panel.nameFieldStringValue = "\(ruleSet.name).json"

        if panel.runModal() == .OK, let url = panel.url {
            try? ruleSet.exportToFile(url)
        }
    }
}

// MARK: - Rule Set Row

struct RuleSetRow: View {
    let ruleSet: RuleSet
    let isActive: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(ruleSet.name)
                        .font(.body.weight(.medium))
                    if isActive {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                            .font(.caption)
                    }
                }
                Text("\(ruleSet.rules.count) rule(s)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(.vertical, 2)
    }
}

// MARK: - Rule Row

struct RuleRow: View {
    let rule: OrganizationRule

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Circle()
                        .fill(rule.isEnabled ? .green : .gray)
                        .frame(width: 8, height: 8)
                    Text(rule.name)
                        .font(.body.weight(.medium))
                    if rule.requiresAI {
                        Text("AI")
                            .font(.caption2.bold())
                            .padding(.horizontal, 5)
                            .padding(.vertical, 1)
                            .background(.purple.opacity(0.2))
                            .foregroundStyle(.purple)
                            .clipShape(Capsule())
                    }
                }

                if !rule.description.isEmpty {
                    Text(rule.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                HStack(spacing: 8) {
                    Label(
                        "\(rule.conditions.count) condition(s)",
                        systemImage: "line.3.horizontal.decrease.circle"
                    )
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                    Label(rule.action.destinationPath, systemImage: "folder")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            Text("Priority: \(rule.priority)")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
        .opacity(rule.isEnabled ? 1 : 0.5)
    }
}

// MARK: - Rule Set Form Sheet

struct RuleSetFormSheet: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var description = ""
    @State private var author = ""

    var onSave: (RuleSet) -> Void

    var body: some View {
        VStack(spacing: 0) {
            Text("New Rule Set")
                .font(.headline)
                .padding()

            Form {
                TextField("Name", text: $name)
                TextField("Description", text: $description)
                TextField("Author", text: $author)
            }
            .formStyle(.grouped)
            .padding()

            HStack {
                Button("Cancel") { dismiss() }
                    .keyboardShortcut(.cancelAction)
                Spacer()
                Button("Create") {
                    let ruleSet = RuleSet(
                        name: name,
                        description: description,
                        author: author
                    )
                    onSave(ruleSet)
                    dismiss()
                }
                .keyboardShortcut(.defaultAction)
                .disabled(name.isEmpty)
            }
            .padding()
        }
        .frame(width: 400)
    }
}
