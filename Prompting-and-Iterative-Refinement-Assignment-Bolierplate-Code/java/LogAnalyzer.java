// LogAnalyzer.java
import java.util.*;

public class LogAnalyzer {

    public static List<Map<String, Object>> getTopSlowestEndpoints(List<Map<String, Object>> apiLogs) {
        List<String> uniqueEndpoints = new ArrayList<>();
        
        // Pass 1: Find all unique base endpoints - O(N)
        for (Map<String, Object> log : apiLogs) {
            String url = (String) log.get("url");
            String basePath = url.split("\\?")[0];
            if (!uniqueEndpoints.contains(basePath)) { 
                uniqueEndpoints.add(basePath);
            }
        }

        List<Map<String, Object>> results = new ArrayList<>();
        
        // Pass 2: For EVERY unique endpoint, scan the ENTIRE log again - O(E * N)
        for (String endpoint : uniqueEndpoints) {
            double totalTime = 0;
            int count = 0;
            
            for (Map<String, Object> log : apiLogs) {
                String url = (String) log.get("url");
                String basePath = url.split("\\?")[0];
                
                if (basePath.equals(endpoint)) {
                    int status = (int) log.get("status");
                    if (status < 300 && !basePath.startsWith("/health") && !basePath.startsWith("/internal")) {
                        totalTime += (int) log.get("latency_ms");
                        count++;
                    }
                }
            }
            if (count > 0) {
                Map<String, Object> res = new HashMap<>();
                res.put("endpoint", endpoint);
                res.put("avg_latency", totalTime / count);
                results.add(res);
            }
        }

        // Sort by latency descending, then alphabetically
        results.sort((a, b) -> {
            int latencyCompare = Double.compare((Double) b.get("avg_latency"), (Double) a.get("avg_latency"));
            if (latencyCompare != 0) return latencyCompare;
            return ((String) a.get("endpoint")).compareTo((String) b.get("endpoint"));
        });
        
        return results.size() > 5 ? results.subList(0, 5) : results;
    }
}
