import SwiftUI

@main
struct AIFileOrganizerApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .frame(minWidth: 900, minHeight: 600)
        }
        .windowStyle(.titleBar)
        .defaultSize(width: 1100, height: 750)
        .commands {
            CommandGroup(replacing: .newItem) {}

            CommandMenu("Organize") {
                Button("Start Monitoring") {
                    appState.startMonitoring()
                }
                .keyboardShortcut("m", modifiers: [.command, .shift])
                .disabled(appState.isMonitoring)

                Button("Stop Monitoring") {
                    appState.stopMonitoring()
                }
                .disabled(!appState.isMonitoring)

                Divider()

                Button("Process Now") {
                    appState.processNow()
                }
                .keyboardShortcut(.return, modifiers: .command)
                .disabled(appState.pendingFiles.isEmpty)

                Button("Scan Inbox") {
                    appState.fileMonitor.scanNow()
                }
                .keyboardShortcut("r", modifiers: .command)
            }
        }

        Settings {
            SettingsView()
                .environmentObject(appState)
        }
    }
}
