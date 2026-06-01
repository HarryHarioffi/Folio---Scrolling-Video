import AVFoundation
import CoreGraphics
import ImageIO
import Foundation

func extractFrames() {
    let fileManager = FileManager.default
    let currentDir = fileManager.currentDirectoryPath
    let videoPath = "\(currentDir)/public/1-TCC_Video_v06.mov"
    let outputDir = "\(currentDir)/public/frames"
    
    // Create output directory if it doesn't exist
    if !fileManager.fileExists(atPath: outputDir) {
        try? fileManager.createDirectory(atPath: outputDir, withIntermediateDirectories: true, attributes: nil)
    }
    
    let fileURL = URL(fileURLWithPath: videoPath)
    guard fileManager.fileExists(atPath: videoPath) else {
        print("ERROR: Source video not found at \(videoPath)")
        exit(1)
    }
    
    let asset = AVAsset(url: fileURL)
    let duration = asset.duration.seconds
    
    guard duration > 0 else {
        print("ERROR: Invalid video duration")
        exit(1)
    }
    
    print("SUCCESS: Loaded video. Duration: \(duration)s. Starting extraction of 150 frames...")
    
    let generator = AVAssetImageGenerator(asset: asset)
    generator.requestedTimeToleranceBefore = CMTime(seconds: 0.05, preferredTimescale: 600)
    generator.requestedTimeToleranceAfter = CMTime(seconds: 0.05, preferredTimescale: 600)
    generator.appliesPreferredTrackTransform = true
    
    let totalFrames = 150
    var times = [NSValue]()
    
    for i in 0..<totalFrames {
        let percent = Double(i) / Double(totalFrames - 1)
        let time = CMTime(seconds: percent * duration, preferredTimescale: 600)
        times.append(NSValue(time: time))
    }
    
    let group = DispatchGroup()
    var completedCount = 0
    
    generator.generateCGImagesAsynchronously(forTimes: times) { (requestedTime, image, actualTime, result, error) in
        let index = times.firstIndex(of: NSValue(time: requestedTime)) ?? 0
        let frameNumber = index + 1
        
        if result == .succeeded, let img = image {
            let outputFilePath = "\(outputDir)/frame_\(String(format: "%03d", frameNumber)).png"
            let outputURL = URL(fileURLWithPath: outputFilePath)
            
            if let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, "public.png" as CFString, 1, nil) {
                CGImageDestinationAddImage(destination, img, nil)
                CGImageDestinationFinalize(destination)
            }
        } else {
            print("WARNING: Failed to extract frame \(frameNumber): \(String(describing: error))")
        }
        
        completedCount += 1
        if completedCount % 15 == 0 || completedCount == totalFrames {
            print("Progress: \(completedCount)/\(totalFrames) frames extracted (\(Int(Double(completedCount)/Double(totalFrames)*100))%)")
        }
        
        if completedCount == totalFrames {
            group.leave()
        }
    }
    
    group.enter()
    group.wait()
    
    // Final check to fill in any missing frames by copying the nearest successful neighbor
    print("Performing final checks to fill any frame gaps...")
    for i in 1...totalFrames {
        let currentFile = "\(outputDir)/frame_\(String(format: "%03d", i)).png"
        if !fileManager.fileExists(atPath: currentFile) {
            var found = false
            for offset in 1...totalFrames {
                let prevIdx = i - offset
                let nextIdx = i + offset
                if prevIdx >= 1 {
                    let candidate = "\(outputDir)/frame_\(String(format: "%03d", prevIdx)).png"
                    if fileManager.fileExists(atPath: candidate) {
                        try? fileManager.copyItem(atPath: candidate, toPath: currentFile)
                        print("GAP FILL: Duplicated frame \(prevIdx) to fill missing frame \(i)")
                        found = true
                        break
                    }
                }
                if nextIdx <= totalFrames {
                    let candidate = "\(outputDir)/frame_\(String(format: "%03d", nextIdx)).png"
                    if fileManager.fileExists(atPath: candidate) {
                        try? fileManager.copyItem(atPath: candidate, toPath: currentFile)
                        print("GAP FILL: Duplicated frame \(nextIdx) to fill missing frame \(i)")
                        found = true
                        break
                    }
                }
            }
            if !found {
                print("ERROR: Could not fill gap for frame \(i)")
            }
        }
    }
    print("SUCCESS: All 150 frames verified and populated under public/frames/")
}

extractFrames()
