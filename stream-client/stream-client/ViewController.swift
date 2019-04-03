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
    
    
    @IBOutlet weak var initButton: NSButton!
    
    @IBOutlet weak var fps: NSTextField! // Input FPS

    @IBOutlet weak var previewScreen: NSImageView! // The image field that displayes a preview of the stream
    @IBOutlet weak var ip: NSTextField! // Stream IP input field
    @IBOutlet weak var key: NSTextField! // Stream key input field
    var loopTimer: Timer! // Loop
    
    
    @IBOutlet weak var statusText: NSTextField! // Status text field
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }

    /// Starts or stops the live-stream
    @IBAction func initStream(_ sender: Any) {
        streaming = !streaming;
        
        
        
        if(streaming){
            
            var manager = SocketManager(socketURL: URL(string: "http://localhost:80")!, config: [.log(true), .compress])
            var socket = manager.defaultSocket
        
            
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
        previewScreen.image = screenshot; // Update preview screen
        
        statusText.stringValue = "Viewers: " + String(viewers)
    }

}
