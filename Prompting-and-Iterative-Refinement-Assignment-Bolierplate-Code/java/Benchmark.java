// Benchmark.java
import java.io.*;
import java.util.*;

public class Benchmark {

    public static void main(String[] args) {
        System.out.println("Loading logs from CSV...");
        List<Map<String, Object>> mockData = new ArrayList<>();
        
        try (BufferedReader br = new BufferedReader(new FileReader("../api_logs.csv"))) {
            String line = br.readLine(); // Skip header
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 3) {
                    Map<String, Object> log = new HashMap<>();
                    log.put("url", parts[0]);
                    log.put("status", Integer.parseInt(parts[1]));
                    log.put("latency_ms", Integer.parseInt(parts[2]));
                    mockData.add(log);
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading CSV file: " + e.getMessage());
            return;
        }

        System.out.println("Successfully loaded " + mockData.size() + " logs.");
        System.out.println("Running baseline analyzer... (This might take 10-20 seconds!)");

        long startTime = System.currentTimeMillis();
        List<Map<String, Object>> results = LogAnalyzer.getTopSlowestEndpoints(mockData);
        long endTime = System.currentTimeMillis();

        System.out.println("\n--- TOP 5 SLOWEST ENDPOINTS ---");
        for (Map<String, Object> res : results) {
            System.out.printf("%s: %.2f ms\n", res.get("endpoint"), res.get("avg_latency"));
        }
        
        System.out.println("\nExecution Time: " + (endTime - startTime) / 1000.0 + " seconds");
    }
}
