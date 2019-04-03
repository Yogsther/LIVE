//
//  ViewController.swift
//  StreamClient
//
//  Created by Olle Kaiser on 2019-04-02.
//  Copyright © 2019 YGSTR. All rights reserved.
//

import Cocoa
import SocketIO



class ViewController: NSViewController {
    
    let displayID = CGMainDisplayID()
    var streaming: Bool = false;
    var viewers: Int = 0;
    
    // Timestamp to keep track of fps
    var timeSinceLastFrame = Date().timeIntervalSinceReferenceDate
    
    
    @IBOutlet weak var width: NSTextField!
    @IBOutlet weak var height: NSTextField!
    
    
    @IBOutlet weak var initButton: NSButton!
    
    @IBOutlet weak var fps: NSTextField! // Input FPS

    @IBOutlet weak var previewScreen: NSImageView! // The image field that displayes a preview of the stream
    @IBOutlet weak var ip: NSTextField! // Stream IP input field
    @IBOutlet weak var key: NSTextField! // Stream key input field
    var loopTimer: Timer! // Loop
    
    
    
    @IBOutlet weak var statusText: NSTextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }

    /// Starts or stops the live-stream
    @IBAction func initStream(_ sender: Any) {
        streaming = !streaming;
        
        
        
        if(streaming){
            var manager = SocketManager(socketURL: URL(string: "http://localhost")!, config: [.log(true), .compress])
            let socket = manager.defaultSocket
        
            socket.on(clientEvent: .connect) {data, ack in
                print("socket connected")
            }
            
            initButton.title = "STOP STREAM"
            loopTimer = Timer.scheduledTimer(timeInterval: 1/TimeInterval(Int(fps.stringValue)!)  , target: self, selector: #selector(loop), userInfo: nil, repeats: true)
        } else {
            initButton.title = "GO LIVE"
            loopTimer.invalidate()
        }
    }
    
    /// Screen capture loop
    @objc func loop(){
        let ref = CGDisplayCreateImage(displayID) // Capture screenshot
        let screenshot = NSImage(cgImage: (ref)!, size: NSZeroSize) // Convert captured image data
        let smallScreenshot = screenshot.resizeMaintainingAspectRatio(withSize: NSSize.init(width: Int(width.stringValue)!, height: Int(height.stringValue)!))
        
      
        previewScreen.image = smallScreenshot
        //var test = smallScreenshot!.base64String
    }

    
}

extension NSImage {
    var base64String: String? {
        guard let rep = NSBitmapImageRep(
            bitmapDataPlanes: nil,
            pixelsWide: Int(size.width),
            pixelsHigh: Int(size.height),
            bitsPerSample: 8,
            samplesPerPixel: 4,
            hasAlpha: true,
            isPlanar: false,
            colorSpaceName: .calibratedRGB,
            bytesPerRow: 0,
            bitsPerPixel: 0
            ) else {
                print("Couldn't create bitmap representation")
                return nil
        }
        
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
        draw(at: NSZeroPoint, from: NSZeroRect, operation: .sourceOver, fraction: 1.0)
        NSGraphicsContext.restoreGraphicsState()
        
        guard let data = rep.representation(using: NSBitmapImageRep.FileType.png, properties: [NSBitmapImageRep.PropertyKey.compressionFactor: 1.0]) else {
            print("Couldn't create PNG")
            return nil
        }
        
        // With prefix
        // return "data:image/png;base64,\(data.base64EncodedString(options: []))"
        // Without prefix
        return data.base64EncodedString(options: [])
    }
}

