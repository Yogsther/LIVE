import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

import java.net.URISyntaxException;

public class main {
    public static void main(String[] args) throws URISyntaxException {


        Socket socket = IO.socket("http://localhost");
        socket.connect();

        System.out.println("Test");
        GUI gui = new GUI();
    }
}
