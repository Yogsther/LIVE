import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URISyntaxException;

public class GUI extends JFrame {

    private static BufferedImage image = null;
    private static BufferedImage convertedImage = null;
    private static JPanel imagePreview;
    public static JButton sendButton = new JButton();
    public static JTextField ip = new JTextField();
    private static JTextField key = new JTextField();
    private static BufferedImage placeholder;
    private static JTextField widthInput = new JTextField();
    private static JTextField heightInput = new JTextField();
    private static JTextField compressionInput = new JTextField();
    private static JLabel compressionLabel = new JLabel();
    private static JLabel fpsLabel = new JLabel();
    private static JTextField fpsInput = new JTextField();
    private static JLabel x = new JLabel();
    private static BufferedImage lastImg;

    public static boolean displayPreview = false;

    public GUI() throws IOException {

        int WINDOW_WIDTH = 500;
        int WINDOW_HEIGHT = 550;

        setTitle("LIVE Client");
        setSize(WINDOW_WIDTH, WINDOW_HEIGHT);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setResizable(false);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        // TODO: Fix icon /(^-^)/ Exception in thread "main" java.lang.NullPointerException
        // at java.desktop/javax.swing.ImageIcon.<init>
        //setIconImage(new ImageIcon(getClass().getResource("img/icon.png")).getImage());

        setIconImage(ImageIO.read(getClass().getResource("/img/logo.png")));
        placeholder = ImageIO.read(getClass().getResource("/img/placeholder.png"));

        imagePreview = new JPanel(){
            @Override
            protected void paintComponent(Graphics g){
                super.paintComponent(g);
                if(displayPreview){
                    try {
                        // Capture screenshot
                        image = new Robot().createScreenCapture(new Rectangle(Toolkit.getDefaultToolkit().getScreenSize()));
                        convertedImage = main.resizeImg(image, main.width, main.height); // Scale down image
                    } catch (AWTException e) {
                        e.printStackTrace();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                    double factor = (double) convertedImage.getHeight() / convertedImage.getWidth(); // How much shorter the height is than the width

                    // Draw preview of image
                    g.drawImage(lastImg, 0, 0, WINDOW_WIDTH, (int) Math.round(WINDOW_WIDTH * factor), null);

                } else {
                    double factor = (double) placeholder.getHeight() / placeholder.getWidth(); // How much shorter the height is than the width
                    g.drawImage(placeholder, 0, 0,  WINDOW_WIDTH, (int) Math.round(WINDOW_WIDTH * factor), null);
                }

                repaint(); // Re-do this
            }
        };

        //getContentPane().setBackground(Color.decode("#111111"));
        // 500x550
        setLayout(null);
        imagePreview.setBounds(0, 0, 500, 300);
        sendButton.setBounds(10, 450, 120, 40);
        sendButton.setText("GO LIVE");

        sendButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    main.toggleStream();
                } catch (URISyntaxException e1) {
                    e1.printStackTrace();
                }
            }
        });

        ip.setBounds(10, 320, 465, 30);
        ip.setText("http://live.ygstr.com");

        key.setBounds(10, 360, 465, 30);
        key.setText("KEY");

        widthInput.setText("768");
        heightInput.setText("432");
        compressionInput.setText("0.5");

        widthInput.setBounds(10, 400, 50, 30);
        heightInput.setBounds(70, 400, 50, 30);
        compressionInput.setBounds(220, 400, 50, 30);

        compressionLabel.setText("Compression");
        compressionLabel.setBounds(130, 389, 100, 50);

        fpsLabel.setText("FPS");
        fpsLabel.setBounds(280, 389, 50, 50);

        fpsInput.setText("15");
        fpsInput.setBounds(310, 400, 50, 30);

        x.setText("x");
        x.setBounds(61,398, 30, 30);

        add(x);
        add(fpsInput);
        add(fpsLabel);
        add(compressionLabel);
        add(widthInput);
        add(heightInput);
        add(compressionInput);
        add(key);
        add(ip);
        add(sendButton);
        add(imagePreview);
        setVisible(true);
    }

    /**
     * Retrieve w,h from GUI
     * @return Array with the dimensions [w,h]
     */
    public static int[] getDimensions(){
        int[] dimensions = {Integer.parseInt(widthInput.getText()), Integer.parseInt(heightInput.getText())};
        return dimensions;
    }

    /**
     * Retrieve compression float from GUI
     * @return compression-factor
     */
    public static float getCompressionSetting(){
        return Float.parseFloat(compressionInput.getText());
    }

    /**
     * Get stream-key from GUI
     * @return stream key
     */
    public static String getKey(){
        return key.getText();
    }

    /**
     * Getter for last genereated frame
     * @return Frame
     */
    public static BufferedImage getImage() {
        lastImg = convertedImage;
        return convertedImage;
    }

    /**
     * Retrieve FPS from GUI
     * @return preferred fps
     */
    public static int getFPS(){
        return Integer.parseInt(fpsInput.getText());
    }
}