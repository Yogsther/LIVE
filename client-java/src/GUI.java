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
    private static JButton sendButton = new JButton();
    private static JTextField ip = new JTextField();
    private static JTextField key = new JTextField();
    private static BufferedImage placeholder;
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
                        convertedImage = main.resizeImg(image, 384, 216); // Scale down image
                    } catch (AWTException e) {
                        e.printStackTrace();
                    }

                    double factor = (double) convertedImage.getHeight() / convertedImage.getWidth(); // How much shorter the height is than the width

                    // Draw preview of image
                    g.drawImage(convertedImage, 0, 0, WINDOW_WIDTH, (int) Math.round(WINDOW_WIDTH * factor), null);
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
        ip.setText("http://stream.ygstr.com");

        key.setBounds(10, 360, 465, 30);
        key.setText("KEY");

        add(key);
        add(ip);
        add(sendButton);
        add(imagePreview);
        setVisible(true);
    }

    public static String getKey(){
        return key.getText();
    }

    public static BufferedImage getImage() {
        return convertedImage;
    }
}
