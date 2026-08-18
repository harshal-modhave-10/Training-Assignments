// SlackNotifier.java
public class SlackNotifier {
    public static void sendSlackAlert(String channel, String message) {
        System.out.println("Connecting to Slack API...");
        System.out.println("Sending message to " + channel + ": " + message);
    }
}
