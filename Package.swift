// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AIFileOrganizer",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "AIFileOrganizerCore",
            targets: ["AIFileOrganizerCore"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AIFileOrganizerCore",
            dependencies: [],
            path: "AIFileOrganizer",
            exclude: ["App/AIFileOrganizerApp.swift"]
        ),
        .testTarget(
            name: "AIFileOrganizerTests",
            dependencies: ["AIFileOrganizerCore"],
            path: "AIFileOrganizerTests"
        )
    ]
)
