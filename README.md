# Realtidsströmmining online

### Plattformen kommer bestå utav tre delar. En server som hanterar allting (JS, Node), en klient i Swift som används för att strömma (datorskärm och eller webcam) till serven och en HTML5 klient som kan visa och interagera med strömmarna.

## Server
Skriven i Javascript med Node. Den kommer ta emot en ström från en klient som verifieras med en "Stream-key". Sedan skickar den vidare strömmen till alla som tittar på realtids-strömmen via webbläsaren. Tittare kan också interagera med strömmen genom en chat. Servern ska klara av oändligt med instanser av strömningar, men den kommer så klart sakta ner för varje ny instans.

## Klienten (Strömmare, Swift (macOS & Ubuntu))

Klienten kommer ha en simple GUI. Man ska kunna mata in sin stream-key, se hur många tittare man har och se en förhandsgranskning av strömmen. Man ska också kunna specificera en titel på ens ström, en beskrivning och vilket spel man spelar. (https://www.igdb.com/api), 
(https://github.com/socketio/socket.io-client-swift)

## Webb-Klienten (HTML5)

På hemsidan ska man enkelt kunna skapa en användare som man både kan titta på strömmar med och strömma själv. Man ska kunna ladda ned ström-klienten från hemsidan också. Man ska också kunna bläddra och sortera strömmar efter tittare eller vilket spel de spelar.
