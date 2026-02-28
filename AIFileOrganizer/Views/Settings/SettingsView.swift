import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        TabView {
            GeneralSettingsView()
                .tabItem {
                    Label("General", systemImage: "gear")
                }

            AISettingsView()
                .tabItem {
                    Label("AI Providers", systemImage: "brain")
                }
        }
        .environmentObject(appState)
        .frame(width: 550, height: 450)
    }
}

// MARK: - General Settings

struct GeneralSettingsView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Form {
            Section("Inbox") {
                HStack {
                    TextField("Inbox Path", text: $appState.settings.inboxPath)
                    Button("Browse") {
                        browseInbox()
                    }
                }
            }

            Section("Behavior") {
                Toggle("Auto-organize new files", isOn: $appState.settings.autoOrganize)
                Toggle("Show notifications", isOn: $appState.settings.showNotifications)
                Toggle("Confirm before organizing", isOn: $appState.settings.confirmBeforeOrganize)

                Stepper(
                    "Scan interval: \(appState.settings.scanIntervalSeconds)s",
                    value: $appState.settings.scanIntervalSeconds,
                    in: 1...60
                )
            }

            Section("History") {
                Stepper(
                    "Max history items: \(appState.settings.maxHistoryItems)",
                    value: $appState.settings.maxHistoryItems,
                    in: 100...10000,
                    step: 100
                )
            }
        }
        .formStyle(.grouped)
        .onChange(of: appState.settings) { _, _ in
            appState.saveSettings()
        }
    }

    private func browseInbox() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true

        if panel.runModal() == .OK, let url = panel.url {
            appState.settings.inboxPath = url.path
                .replacingOccurrences(of: NSHomeDirectory(), with: "~")
            appState.saveSettings()
        }
    }
}

// MARK: - AI Settings

struct AISettingsView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Form {
            ForEach($appState.providerConfigs) { $config in
                Section {
                    providerSection(config: $config)
                } header: {
                    HStack {
                        Image(systemName: config.type.iconName)
                        Text(config.type.displayName)
                        Spacer()
                        if config.isActive {
                            Text("Active")
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                    }
                }
            }
        }
        .formStyle(.grouped)
    }

    private func providerSection(config: Binding<AIProviderConfig>) -> some View {
        Group {
            if config.wrappedValue.type.requiresAPIKey {
                SecureField("API Key", text: config.apiKey)
            }

            TextField("Base URL", text: config.baseURL)

            Picker("Model", selection: config.selectedModel) {
                ForEach(config.wrappedValue.type.availableModels, id: \.self) { model in
                    Text(model).tag(model)
                }
            }

            HStack {
                Text("Temperature: \(config.wrappedValue.temperature, specifier: "%.1f")")
                Slider(value: config.temperature, in: 0...1, step: 0.1)
            }

            Stepper("Max Tokens: \(config.wrappedValue.maxTokens)", value: config.maxTokens, in: 256...4096, step: 256)

            Toggle("Active Provider", isOn: Binding(
                get: { config.wrappedValue.isActive },
                set: { newValue in
                    if newValue {
                        // Deactivate others first
                        for i in appState.providerConfigs.indices {
                            appState.providerConfigs[i].isActive = false
                        }
                    }
                    config.wrappedValue.isActive = newValue
                    appState.fileOrganizer.configureAI(with: appState.providerConfigs)
                    appState.saveProviderConfigs()
                }
            ))
        }
        .onChange(of: config.wrappedValue) { _, newValue in
            appState.updateProviderConfig(newValue)
        }
    }
}
