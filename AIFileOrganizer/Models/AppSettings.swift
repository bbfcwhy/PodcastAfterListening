import Foundation

/// Global application settings stored in UserDefaults.
struct AppSettings: Codable {
    var inboxPath: String
    var activeRuleSetId: UUID?
    var activeProviderId: UUID?
    var autoOrganize: Bool
    var showNotifications: Bool
    var confirmBeforeOrganize: Bool
    var maxHistoryItems: Int
    var scanIntervalSeconds: Int

    init(
        inboxPath: String = "~/Desktop/Inbox",
        activeRuleSetId: UUID? = nil,
        activeProviderId: UUID? = nil,
        autoOrganize: Bool = true,
        showNotifications: Bool = true,
        confirmBeforeOrganize: Bool = false,
        maxHistoryItems: Int = 1000,
        scanIntervalSeconds: Int = 5
    ) {
        self.inboxPath = inboxPath
        self.activeRuleSetId = activeRuleSetId
        self.activeProviderId = activeProviderId
        self.autoOrganize = autoOrganize
        self.showNotifications = showNotifications
        self.confirmBeforeOrganize = confirmBeforeOrganize
        self.maxHistoryItems = maxHistoryItems
        self.scanIntervalSeconds = scanIntervalSeconds
    }

    var expandedInboxPath: String {
        NSString(string: inboxPath).expandingTildeInPath
    }

    var inboxURL: URL {
        URL(fileURLWithPath: expandedInboxPath)
    }
}

// MARK: - Persistence Keys

enum StorageKey {
    static let appSettings = "app_settings"
    static let ruleSets = "rule_sets"
    static let providerConfigs = "provider_configs"
    static let operationHistory = "operation_history"
}
