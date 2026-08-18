# benchmark.py
import csv
import time
from log_analyzer import get_top_slowest_endpoints

def load_logs(filename="../api_logs.csv"):
    logs = []
    with open(filename, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            logs.append({
                'url': row['url'],
                'status': int(row['status']),
                'latency_ms': int(row['latency_ms'])
            })
    return logs

if __name__ == "__main__":
    print("Loading logs from CSV...")
    mock_data = load_logs()
    print(f"Successfully loaded {len(mock_data)} logs.")
    
    print("Running baseline analyzer... (This might take 10-20 seconds!)")
    start_time = time.time()
    
    results = get_top_slowest_endpoints(mock_data)
    
    end_time = time.time()
    
    print("\n--- TOP 5 SLOWEST ENDPOINTS ---")
    for res in results:
        print(f"{res['endpoint']}: {res['avg_latency']:.2f} ms")
        
    print(f"\nExecution Time: {end_time - start_time:.4f} seconds")
