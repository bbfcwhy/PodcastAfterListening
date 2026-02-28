import Foundation
import Combine
import SwiftUI

/// Central application state that manages all services and data.
@MainActor
final class AppState: ObservableObject {
    // MARK: - Published State
    @Published var settings: AppSettings
    @Published var ruleSets: [RuleSet]
    @Published var providerConfigs: [AIProviderConfig]
    @Published var activeRuleSet: RuleSet?
    @Published var isMonitoring = false
    @Published var pendingFiles: [URL] = []
    @Published var statusMessage: String = "Ready"

    // MARK: - Services
    let fileMonitor = FileMonitor()
    let historyManager: HistoryManager
    let fileOrganizer: FileOrganizer
    private let persistence = PersistenceManager.shared

    init() {
        let settings = PersistenceManager.shared.loadSettings()
        let ruleSets = PersistenceManager.shared.loadRuleSets()
        let providers = PersistenceManager.shared.loadProviderConfigs()

        self.settings = settings
        self.ruleSets = ruleSets
        self.providerConfigs = providers

        let history = HistoryManager(maxItems: settings.maxHistoryItems)
        self.historyManager = history
        self.fileOrganizer = FileOrganizer(historyManager: history)

        // Set active rule set
        if let activeId = settings.activeRuleSetId {
            self.activeRuleSet = ruleSets.first { $0.id == activeId }
        }

        // Configure AI
        fileOrganizer.configureAI(with: providers)

        // Set up file monitor callback
        fileMonitor.onFilesDetected = { [weak self] urls in
            Task { @MainActor in
                self?.handleNewFiles(urls)
            }
        }
    }

    // MARK: - Monitoring

    func startMonitoring() {
        let inboxURL = settings.inboxURL
        fileMonitor.start(
            directory: inboxURL,
            scanInterval: TimeInterval(settings.scanIntervalSeconds)
        )
        isMonitoring = true
        statusMessage = "Monitoring \(settings.inboxPath)"
    }

    func stopMonitoring() {
        fileMonitor.stop()
        isMonitoring = false
        statusMessage = "Stopped"
    }

    func toggleMonitoring() {
        if isMonitoring {
            stopMonitoring()
        } else {
            startMonitoring()
        }
    }

    // MARK: - File Processing

    func handleNewFiles(_ urls: [URL]) {
        guard settings.autoOrganize, let ruleSet = activeRuleSet else {
            pendingFiles.append(contentsOf: urls)
            statusMessage = "\(pendingFiles.count) file(s) pending"
            return
        }

        Task {
            statusMessage = "Processing \(urls.count) file(s)..."
            let batch = await fileOrganizer.processFiles(urls, ruleSet: ruleSet)
            fileMonitor.markAsProcessed(urls)
            statusMessage = "Processed \(batch.successCount) file(s), \(batch.failedCount) failed"
        }
    }

    func processNow() {
        guard let ruleSet = activeRuleSet else {
            statusMessage = "No rule set selected"
            return
        }

        let files = pendingFiles
        pendingFiles.removeAll()

        Task {
            statusMessage = "Processing \(files.count) file(s)..."
            let batch = await fileOrganizer.processFiles(files, ruleSet: ruleSet, triggerType: .manual)
            fileMonitor.markAsProcessed(files)
            statusMessage = "Processed \(batch.successCount) file(s), \(batch.failedCount) failed"
        }
    }

    // MARK: - Rule Set Management

    func setActiveRuleSet(_ ruleSet: RuleSet?) {
        activeRuleSet = ruleSet
        settings.activeRuleSetId = ruleSet?.id
        saveSettings()
    }

    func addRuleSet(_ ruleSet: RuleSet) {
        ruleSets.append(ruleSet)
        saveRuleSets()
    }

    func updateRuleSet(_ ruleSet: RuleSet) {
        if let index = ruleSets.firstIndex(where: { $0.id == ruleSet.id }) {
            var updated = ruleSet
            updated.updatedAt = Date()
            ruleSets[index] = updated
            if activeRuleSet?.id == ruleSet.id {
                activeRuleSet = updated
            }
            saveRuleSets()
        }
    }

    func deleteRuleSet(_ ruleSet: RuleSet) {
        ruleSets.removeAll { $0.id == ruleSet.id }
        if activeRuleSet?.id == ruleSet.id {
            activeRuleSet = nil
            settings.activeRuleSetId = nil
        }
        saveRuleSets()
        saveSettings()
    }

    func importRuleSet(from url: URL) throws {
        let ruleSet = try RuleSet.importFromFile(url)
        addRuleSet(ruleSet)
    }

    // MARK: - Provider Management

    func updateProviderConfig(_ config: AIProviderConfig) {
        if let index = providerConfigs.firstIndex(where: { $0.id == config.id }) {
            // If activating this provider, deactivate others
            if config.isActive {
                for i in providerConfigs.indices {
                    providerConfigs[i].isActive = false
                }
            }
            providerConfigs[index] = config
        }
        fileOrganizer.configureAI(with: providerConfigs)
        saveProviderConfigs()
    }

    // MARK: - Persistence

    func saveSettings() {
        persistence.saveSettings(settings)
    }

    func saveRuleSets() {
        persistence.saveRuleSets(ruleSets)
    }

    func saveProviderConfigs() {
        persistence.saveProviderConfigs(providerConfigs)
    }
}
