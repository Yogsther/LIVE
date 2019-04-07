import javax.swing.*;

public class GUI extends JFrame {

    private JLabel testLabel;

    public GUI(){

        add(testLabel);
        setTitle("LIVE Client");
        setSize(400, 500);
        setResizable(false);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        // TODO: Fix icon /(^-^)/ Exception in thread "main" java.lang.NullPointerException
        // at java.desktop/javax.swing.ImageIcon.<init>
        //setIconImage(new ImageIcon(getClass().getResource("img/icon.png")).getImage());

        setVisible(true);
    }
}
