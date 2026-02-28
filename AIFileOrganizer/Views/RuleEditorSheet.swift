import SwiftUI

struct RuleEditorSheet: View {
    @Environment(\.dismiss) var dismiss

    @State private var rule: OrganizationRule
    private let isNew: Bool
    private let onSave: (OrganizationRule) -> Void

    init(rule: OrganizationRule, onSave: @escaping (OrganizationRule) -> Void) {
        self._rule = State(initialValue: rule)
        self.isNew = rule.name.isEmpty
        self.onSave = onSave
    }

    var body: some View {
        VStack(spacing: 0) {
            // Title
            HStack {
                Text(isNew ? "New Rule" : "Edit Rule")
                    .font(.headline)
                Spacer()
            }
            .padding()

            Divider()

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    basicInfoSection
                    conditionsSection
                    actionSection
                }
                .padding()
            }

            Divider()

            // Buttons
            HStack {
                Button("Cancel") { dismiss() }
                    .keyboardShortcut(.cancelAction)
                Spacer()
                Button(isNew ? "Create" : "Save") {
                    rule.updatedAt = Date()
                    onSave(rule)
                    dismiss()
                }
                .keyboardShortcut(.defaultAction)
                .disabled(rule.name.isEmpty)
            }
            .padding()
        }
        .frame(width: 600, height: 650)
    }

    // MARK: - Basic Info

    private var basicInfoSection: some View {
        GroupBox("Basic Info") {
            VStack(spacing: 12) {
                HStack {
                    Text("Name")
                        .frame(width: 100, alignment: .trailing)
                    TextField("Rule name", text: $rule.name)
                }
                HStack {
                    Text("Description")
                        .frame(width: 100, alignment: .trailing)
                    TextField("Optional description", text: $rule.description)
                }
                HStack {
                    Text("Priority")
                        .frame(width: 100, alignment: .trailing)
                    Stepper(value: $rule.priority, in: 0...100) {
                        Text("\(rule.priority)")
                            .monospacedDigit()
                    }
                    Spacer()
                    Toggle("Enabled", isOn: $rule.isEnabled)
                }
            }
            .padding(8)
        }
    }

    // MARK: - Conditions

    private var conditionsSection: some View {
        GroupBox("Conditions") {
            VStack(alignment: .leading, spacing: 12) {
                Picker("Match", selection: $rule.conditionLogic) {
                    Text("All conditions (AND)").tag(ConditionLogic.allOf)
                    Text("Any condition (OR)").tag(ConditionLogic.anyOf)
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 300)

                ForEach($rule.conditions) { $condition in
                    conditionRow(condition: $condition)
                }

                Button {
                    rule.conditions.append(
                        RuleCondition(type: .fileExtension, value: "")
                    )
                } label: {
                    Label("Add Condition", systemImage: "plus.circle")
                }
            }
            .padding(8)
        }
    }

    private func conditionRow(condition: Binding<RuleCondition>) -> some View {
        HStack(spacing: 8) {
            Picker("", selection: condition.type) {
                ForEach(RuleConditionType.allCases) { type in
                    Text(type.displayName).tag(type)
                }
            }
            .frame(width: 180)

            Toggle("NOT", isOn: condition.negate)
                .toggleStyle(.checkbox)

            TextField("Value", text: condition.value)

            Button {
                rule.conditions.removeAll { $0.id == condition.wrappedValue.id }
            } label: {
                Image(systemName: "minus.circle.fill")
                    .foregroundStyle(.red)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Action

    private var actionSection: some View {
        GroupBox("Action") {
            VStack(spacing: 12) {
                HStack {
                    Text("Destination")
                        .frame(width: 100, alignment: .trailing)
                    TextField("~/Documents/Category", text: $rule.action.destinationPath)
                    Button("Browse") {
                        browseDestination()
                    }
                }

                HStack {
                    Text("Naming")
                        .frame(width: 100, alignment: .trailing)
                    Picker("", selection: $rule.action.namingTemplate) {
                        ForEach(NamingTemplate.allCases, id: \.self) { template in
                            Text(template.displayName).tag(template)
                        }
                    }
                }

                if rule.action.namingTemplate == .custom {
                    HStack {
                        Text("Template")
                            .frame(width: 100, alignment: .trailing)
                        TextField("{date}_{original}", text: Binding(
                            get: { rule.action.customTemplate ?? "" },
                            set: { rule.action.customTemplate = $0 }
                        ))
                    }
                    Text("Variables: {original}, {date}, {date_compact}, {category}, {ai_name}")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.leading, 108)
                }

                HStack {
                    Text("")
                        .frame(width: 100)
                    Toggle("Create subfolders automatically", isOn: $rule.action.createSubfolders)
                    Spacer()
                }
            }
            .padding(8)
        }
    }

    private func browseDestination() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false

        if panel.runModal() == .OK, let url = panel.url {
            rule.action.destinationPath = url.path
                .replacingOccurrences(of: NSHomeDirectory(), with: "~")
        }
    }
}
