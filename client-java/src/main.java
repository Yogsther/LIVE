import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URISyntaxException;
import java.nio.Buffer;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Timer;
import java.util.TimerTask;

public class main {
    public static Socket socket;
    public static boolean streaming = false;
    public static Timer t;
    public static TimerTask tt;
    private static String lastImg;

    public static void main(String[] args) throws URISyntaxException, AWTException, IOException {


        GUI gui = new GUI();
    }

    public static void toggleStream() throws URISyntaxException {
        streaming = !streaming;

        if(streaming){
            // Start the stream
            // Connect socket
            socket = IO.socket("http://localhost");
            socket.connect();

            socket.emit("start_stream", GUI.getKey());

            GUI.displayPreview = true;

            t = new Timer();
            tt = new TimerTask() {
                @Override
                public void run() {
                    //do something
                    BufferedImage img = GUI.getImage();

                    if(img != null){
                        try {

                            final ByteArrayOutputStream os = new ByteArrayOutputStream();
                            ImageIO.write(img, "png", Base64.getEncoder().wrap(os)); // Convert to base65-string
                            String imageString = os.toString(StandardCharsets.ISO_8859_1.name());
                            if(!imageString.equals(lastImg)) {
                                socket.emit("stream", imageString);
                                lastImg = imageString;
                            }
                        } catch (final IOException ioe) {
                        }
                    }
                }
            };
            t.schedule(tt,0,16);

        } else {
            t.cancel();
            tt.cancel();
            GUI.displayPreview = false;
            socket.disconnect();
        }
    }

    public static BufferedImage resizeImg(BufferedImage img, int newW, int newH) {
        Image tmp = img.getScaledInstance(newW, newH, Image.SCALE_SMOOTH);
        BufferedImage finalImg = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_ARGB);

        Graphics2D canvas = finalImg.createGraphics();
        canvas.drawImage(tmp, 0, 0, null);
        canvas.dispose();

        return finalImg;
    }

}
