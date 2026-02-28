import SwiftUI

enum SidebarItem: String, CaseIterable, Identifiable {
    case inbox = "Inbox"
    case rules = "Rules"
    case history = "History"
    case ruleStore = "Rule Store"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .inbox: return "tray.and.arrow.down"
        case .rules: return "list.bullet.rectangle"
        case .history: return "clock.arrow.circlepath"
        case .ruleStore: return "square.grid.2x2"
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedItem: SidebarItem = .inbox

    var body: some View {
        NavigationSplitView {
            sidebar
        } detail: {
            detailView
        }
        .toolbar {
            ToolbarItemGroup(placement: .primaryAction) {
                toolbarItems
            }
        }
    }

    // MARK: - Sidebar

    private var sidebar: some View {
        List(SidebarItem.allCases, selection: $selectedItem) { item in
            Label(item.rawValue, systemImage: item.icon)
                .tag(item)
                .badge(badgeCount(for: item))
        }
        .listStyle(.sidebar)
        .safeAreaInset(edge: .bottom) {
            statusBar
        }
    }

    private func badgeCount(for item: SidebarItem) -> Int {
        switch item {
        case .inbox: return appState.pendingFiles.count
        default: return 0
        }
    }

    // MARK: - Detail Views

    @ViewBuilder
    private var detailView: some View {
        switch selectedItem {
        case .inbox:
            InboxView()
        case .rules:
            RuleListView()
        case .history:
            HistoryView()
        case .ruleStore:
            RuleStoreView()
        }
    }

    // MARK: - Toolbar

    @ViewBuilder
    private var toolbarItems: some View {
        Button {
            appState.toggleMonitoring()
        } label: {
            Image(systemName: appState.isMonitoring ? "stop.circle.fill" : "play.circle.fill")
                .foregroundStyle(appState.isMonitoring ? .red : .green)
            Text(appState.isMonitoring ? "Stop" : "Start")
        }
        .help(appState.isMonitoring ? "Stop monitoring inbox" : "Start monitoring inbox")

        if !appState.pendingFiles.isEmpty {
            Button {
                appState.processNow()
            } label: {
                Image(systemName: "arrow.right.circle.fill")
                Text("Process (\(appState.pendingFiles.count))")
            }
            .help("Process pending files now")
        }

        // Active rule set picker
        Menu {
            ForEach(appState.ruleSets) { ruleSet in
                Button {
                    appState.setActiveRuleSet(ruleSet)
                } label: {
                    if appState.activeRuleSet?.id == ruleSet.id {
                        Label(ruleSet.name, systemImage: "checkmark")
                    } else {
                        Text(ruleSet.name)
                    }
                }
            }
            Divider()
            Button("None") {
                appState.setActiveRuleSet(nil)
            }
        } label: {
            Label(
                appState.activeRuleSet?.name ?? "No Rule Set",
                systemImage: "list.bullet.rectangle"
            )
        }
    }

    // MARK: - Status Bar

    private var statusBar: some View {
        HStack {
            Circle()
                .fill(appState.isMonitoring ? .green : .gray)
                .frame(width: 8, height: 8)
            Text(appState.statusMessage)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}
