import io.socket.client.IO;
import io.socket.client.Socket;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URISyntaxException;
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

    public static int width;
    public static int height;
    public static float compression;
    public static int fps;

    public static void main(String[] args) throws IOException {


        GUI gui = new GUI();
    }

    public static void toggleStream() throws URISyntaxException {
        streaming = !streaming;

        if(streaming){
            // Start the stream
            // Connect socket
            socket = IO.socket(GUI.ip.getText());
            socket.connect();

            width = GUI.getDimensions()[0];
            height = GUI.getDimensions()[1];
            compression = GUI.getCompressionSetting();
            fps = GUI.getFPS();

            socket.emit("start_stream", GUI.getKey());

            GUI.displayPreview = true;
            GUI.sendButton.setText("STOP STREAM");

            t = new Timer();
            tt = new TimerTask() {
                @Override
                public void run() {
                    //do something
                    BufferedImage img = GUI.getImage();

                    if(img != null){
                        try {
                            final ByteArrayOutputStream os = new ByteArrayOutputStream();
                            ImageIO.write(img, "jpg", Base64.getEncoder().wrap(os)); // Convert to base65-string
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
            t.schedule(tt,0,Math.round(1000/fps));

        } else {
            t.cancel();
            tt.cancel();
            GUI.sendButton.setText("GO LIVE");
            GUI.displayPreview = false;
            socket.disconnect();
        }
    }

    // Resize and compress
    public static BufferedImage resizeImg(BufferedImage img, int newW, int newH) throws IOException {
        Image tmp = img.getScaledInstance(newW, newH, Image.SCALE_SMOOTH);
        BufferedImage finalImg = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_ARGB);

        Graphics2D canvas = finalImg.createGraphics();
        canvas.drawImage(tmp, 0, 0, null);
        canvas.dispose();

        // Convert image to JPG from PNG
        BufferedImage jpgImage = new BufferedImage(finalImg.getWidth(), finalImg.getHeight(), BufferedImage.TYPE_INT_RGB);
        jpgImage.createGraphics().drawImage(finalImg, 0, 0, Color.WHITE, null);

        // Compress JPG
        ByteArrayOutputStream compressed = new ByteArrayOutputStream();
        ImageOutputStream outputStream = ImageIO.createImageOutputStream(compressed);

        ImageWriter jpgWriter = ImageIO.getImageWritersByFormatName("jpg").next();

        ImageWriteParam jpgWriteParam = jpgWriter.getDefaultWriteParam();
        jpgWriteParam.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        jpgWriteParam.setCompressionQuality(compression);

        jpgWriter.setOutput(outputStream);

        jpgWriter.write(null, new IIOImage(jpgImage, null, null), jpgWriteParam);
        jpgWriter.dispose();

        ByteArrayInputStream bais = new ByteArrayInputStream(compressed.toByteArray());

        return ImageIO.read(bais);
    }

}