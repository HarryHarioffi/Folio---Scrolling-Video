import AVFoundation
import Foundation

let fileURL = URL(fileURLWithPath: "1-TCC_Video.mp4")
let asset = AVAsset(url: fileURL)
let duration = asset.duration.seconds
print("SUCCESS: Swift and AVFoundation are fully functional! Duration: \(duration)")
