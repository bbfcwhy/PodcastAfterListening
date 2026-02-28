import Foundation

/// Handles persistence of app data (settings, rule sets, provider configs) to disk.
final class PersistenceManager {
    static let shared = PersistenceManager()

    private let appSupportURL: URL
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    private init() {
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        appSupportURL = appSupport.appendingPathComponent("AIFileOrganizer", isDirectory: true)
        try? FileManager.default.createDirectory(at: appSupportURL, withIntermediateDirectories: true)

        encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601

        decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
    }

    // MARK: - Settings

    func loadSettings() -> AppSettings {
        load(from: "settings.json") ?? AppSettings()
    }

    func saveSettings(_ settings: AppSettings) {
        save(settings, to: "settings.json")
    }

    // MARK: - Rule Sets

    func loadRuleSets() -> [RuleSet] {
        load(from: "rulesets.json") ?? RuleSet.allBuiltIn
    }

    func saveRuleSets(_ ruleSets: [RuleSet]) {
        save(ruleSets, to: "rulesets.json")
    }

    // MARK: - Provider Configs

    func loadProviderConfigs() -> [AIProviderConfig] {
        load(from: "providers.json") ?? AIProviderType.allCases.map { AIProviderConfig(type: $0) }
    }

    func saveProviderConfigs(_ configs: [AIProviderConfig]) {
        save(configs, to: "providers.json")
    }

    // MARK: - Generic Persistence

    private func load<T: Decodable>(from filename: String) -> T? {
        let url = appSupportURL.appendingPathComponent(filename)
        guard let data = try? Data(contentsOf: url) else { return nil }
        return try? decoder.decode(T.self, from: data)
    }

    private func save<T: Encodable>(_ value: T, to filename: String) {
        let url = appSupportURL.appendingPathComponent(filename)
        guard let data = try? encoder.encode(value) else { return }
        try? data.write(to: url, options: .atomic)
    }
}
