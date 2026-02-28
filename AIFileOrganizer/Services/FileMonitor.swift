import Foundation
import Combine

/// Monitors an inbox directory for new files using DispatchSource (FSEvents wrapper).
final class FileMonitor: ObservableObject {
    @Published var detectedFiles: [URL] = []
    @Published var isMonitoring = false
    @Published var error: String?

    private var directorySource: DispatchSourceFileSystemObject?
    private var monitoredDirectory: URL?
    private var knownFiles: Set<String> = []
    private let queue = DispatchQueue(label: "com.aifileorganizer.filemonitor", qos: .utility)
    private var scanTimer: DispatchSourceTimer?

    var onFilesDetected: (([URL]) -> Void)?

    deinit {
        stop()
    }

    /// Start monitoring the given directory.
    func start(directory: URL, scanInterval: TimeInterval = 5) {
        stop()

        let fm = FileManager.default
        var isDir: ObjCBool = false

        // Create directory if it doesn't exist
        if !fm.fileExists(atPath: directory.path, isDirectory: &isDir) {
            do {
                try fm.createDirectory(at: directory, withIntermediateDirectories: true)
            } catch {
                DispatchQueue.main.async {
                    self.error = "Failed to create inbox directory: \(error.localizedDescription)"
                }
                return
            }
        }

        monitoredDirectory = directory

        // Perform initial scan
        knownFiles = currentFileNames(in: directory)

        // Set up directory monitoring with DispatchSource
        let fd = open(directory.path, O_EVTONLY)
        guard fd >= 0 else {
            DispatchQueue.main.async {
                self.error = "Failed to open directory for monitoring"
            }
            return
        }

        let source = DispatchSource.makeFileSystemObjectSource(
            fileDescriptor: fd,
            eventMask: .write,
            queue: queue
        )

        source.setEventHandler { [weak self] in
            self?.checkForNewFiles()
        }

        source.setCancelHandler {
            close(fd)
        }

        directorySource = source
        source.resume()

        // Also set up a periodic scan timer as a fallback
        let timer = DispatchSource.makeTimerSource(queue: queue)
        timer.schedule(deadline: .now() + scanInterval, repeating: scanInterval)
        timer.setEventHandler { [weak self] in
            self?.checkForNewFiles()
        }
        scanTimer = timer
        timer.resume()

        DispatchQueue.main.async {
            self.isMonitoring = true
            self.error = nil
        }
    }

    /// Stop monitoring.
    func stop() {
        directorySource?.cancel()
        directorySource = nil
        scanTimer?.cancel()
        scanTimer = nil
        monitoredDirectory = nil

        DispatchQueue.main.async {
            self.isMonitoring = false
        }
    }

    /// Manually trigger a scan of the inbox.
    func scanNow() {
        queue.async { [weak self] in
            self?.checkForNewFiles()
        }
    }

    /// Remove files from the known set (after they've been processed).
    func markAsProcessed(_ urls: [URL]) {
        queue.async { [weak self] in
            for url in urls {
                self?.knownFiles.insert(url.lastPathComponent)
            }
            DispatchQueue.main.async {
                self?.detectedFiles.removeAll { url in
                    urls.contains(url)
                }
            }
        }
    }

    // MARK: - Private

    private func checkForNewFiles() {
        guard let directory = monitoredDirectory else { return }

        let currentFiles = currentFileNames(in: directory)
        let newFileNames = currentFiles.subtracting(knownFiles)

        guard !newFileNames.isEmpty else { return }

        let newURLs = newFileNames.map { directory.appendingPathComponent($0) }
            .filter { url in
                // Skip hidden files and incomplete downloads
                let name = url.lastPathComponent
                return !name.hasPrefix(".") && !name.hasSuffix(".download") && !name.hasSuffix(".crdownload")
            }

        guard !newURLs.isEmpty else { return }

        // Wait a moment for file writes to complete
        Thread.sleep(forTimeInterval: 0.5)

        // Verify files are fully written (size is stable)
        let stableFiles = newURLs.filter { isFileStable($0) }

        guard !stableFiles.isEmpty else { return }

        knownFiles.formUnion(stableFiles.map { $0.lastPathComponent })

        DispatchQueue.main.async { [weak self] in
            self?.detectedFiles.append(contentsOf: stableFiles)
            self?.onFilesDetected?(stableFiles)
        }
    }

    private func currentFileNames(in directory: URL) -> Set<String> {
        let fm = FileManager.default
        guard let contents = try? fm.contentsOfDirectory(
            at: directory,
            includingPropertiesForKeys: nil,
            options: [.skipsHiddenFiles]
        ) else { return [] }
        return Set(contents.map { $0.lastPathComponent })
    }

    private func isFileStable(_ url: URL) -> Bool {
        guard let attr1 = try? FileManager.default.attributesOfItem(atPath: url.path),
              let size1 = attr1[.size] as? Int64 else { return false }

        Thread.sleep(forTimeInterval: 0.3)

        guard let attr2 = try? FileManager.default.attributesOfItem(atPath: url.path),
              let size2 = attr2[.size] as? Int64 else { return false }

        return size1 == size2 && size1 > 0
    }
}
