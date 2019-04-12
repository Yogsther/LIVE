class DownloadButton {
    constructor(title, version, w, h, color = "#fc2145", location) {
        this.DOM = document.createElement("canvas");
        this.DOM.width = w;
        this.DOM.height = h;
        this.DOM.classList.add("download-button")
        this.ctx = this.DOM.getContext("2d");
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0, 0, w, h);
        this.title = title;
        this.version = version;
        this.w = w;
        this.h = h;
        this.colors;
        this.gradient = typeof color == "object" ? true : false;
        this.color = color;
        this.time = 0;
        this.mouseOver = false;
        this.oldColor = ["3d3d3d", "383838"];
        this.newColor = this.oldColor;
        this.colorTransition = 0;
        this.mouseOver = false;

        this.link = document.createElement("a");
        this.link.href = location;
        this.link.appendChild(this.DOM);
        this.link.classList.add("download-button-link")
        this.link.style.width = this.DOM.width + "px";
        this.link.style.height = this.DOM.height + "px";
        this.link.addEventListener("mouseenter", e => {
            this.DOM.style.top = "-4px";
            this.changeColor(this.color)
            this.mouseOver = true;
        })
        this.link.addEventListener("mouseleave", e => {
            this.DOM.style.top = "0px";
            this.changeColor(["3d3d3d", "383838"])
            this.mouseOver = false;
        })


        setInterval(() => {
            this.draw();
        }, 16)
    }

    hexToRgb(hex, opacity = 1) {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
     
        return "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
    }

    changeColor(color) {
        this.oldColor = this.newColor;
        this.newColor = color;
        this.colorTransition = 0;
    }

    draw() {
        this.time += .5;
        var ctx = this.ctx;
        ctx.fillStyle = "#212121"; // Background color
        ctx.fillRect(0, 0, this.w, this.h);
        
        for (var i = 0; i < this.w; i++) {
            if (typeof this.newColor == "object") {
                var rainbow = new Rainbow();
                rainbow.setNumberRange(0, this.w);
                rainbow.setSpectrum(this.newColor[0], this.newColor[1]);
                ctx.fillStyle = "#" + rainbow.colorAt(i);
            } else ctx.fillStyle = this.newColor;
            if (this.colorTransition < this.w) {
                if (i > this.colorTransition) {
                    if (typeof this.oldColor == "object") {
                        var rainbow = new Rainbow();
                        rainbow.setNumberRange(0, this.w);
                        rainbow.setSpectrum(this.oldColor[0], this.oldColor[1]);
                        ctx.fillStyle = "#" + rainbow.colorAt(i);
                    } else {
                        ctx.fillStyle = this.oldColor;
                    }

                } else {
                    if (typeof this.newColor == "object") {
                        rainbow = new Rainbow();
                        rainbow.setNumberRange(0, this.w);
                        rainbow.setSpectrum(this.newColor[0], this.newColor[1]);
                        ctx.fillStyle = "#" + rainbow.colorAt(i);
                    } else ctx.fillStyle = this.newColor
                }
            }
            ctx.fillRect(i, Math.sin((this.time + (i / 10)) / 10) * 10 + (this.h / 2), 1, this.h)
        }
        this.colorTransition += 15;
        // Draw texts
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "20px Ubuntu";
        ctx.fillText(this.title, this.w / 2, this.h / 2 + 7);
    }
}

var javaButton = new DownloadButton("JAVA", "1.0", 200, 50, ["ff9335", "8c5728"], "distribute/LIVE.jar");
var swiftButton = new DownloadButton("SWIFT", "1.0", 200, 50, ["ee3b29", "f3a43d"], "#")
document.getElementById("download-button").appendChild(javaButton.link);
document.getElementById("swift-button").appendChild(swiftButton.link);
