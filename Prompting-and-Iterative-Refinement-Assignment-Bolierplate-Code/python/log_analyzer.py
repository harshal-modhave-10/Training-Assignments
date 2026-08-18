from collections import defaultdict
import heapq

def get_top_slowest_endpoints(api_logs):
    """
    Parses a list of log dictionaries in O(N) time to find the Top 5 slowest endpoints.
    
    Business Rules Handled:
    1. Filter out errors: Only HTTP status codes 200-299.
    2. Filter internal traffic: Ignore paths starting with /health or /internal.
    3. Normalize URLs: Strip query parameters (split on '?').
    4. Tie-breaking: Higher avg_latency first; if tied, alphabetical by endpoint name.
    """
    # Step 1: Single-pass aggregation - O(N)
    # Stats dict structure: { endpoint: [total_latency, count] }
    stats = defaultdict(lambda: [0, 0])
    
    for log in api_logs:
        status = log.get('status', 0)
        # Business Rule 1: Successful HTTP status codes only (200-299)
        if not (200 <= status <= 299):
            continue
            
        url = log.get('url', '')
        base_path = url.split('?')[0]
        
        # Business Rule 2: Ignore internal and health checks
        if base_path.startswith('/health') or base_path.startswith('/internal'):
            continue
            
        latency = log.get('latency_ms', 0)
        stats[base_path][0] += latency
        stats[base_path][1] += 1

    if not stats:
        return []

    # Step 2: Min-Heap Top-K Selection (Bonus Challenge) - O(U log K)
    # Heap stores tuples: (avg_latency, inverted_endpoint, endpoint)
    # Inverted endpoint is used so that higher latency takes precedence, 
    # and in case of ties, smaller endpoint names (alphabetical order) take precedence.
    min_heap = []
    k = 5

    for endpoint, (total_latency, count) in stats.items():
        if count == 0:
            continue
            
        avg_latency = total_latency / count
        
        # Priority key for heap comparison:
        # Tuple format: (avg_latency, tuple_for_tie_breaker)
        # For tie-breaker in min-heap, we want lower alphabetical endpoint to win when latencies are equal,
        # so we compare avg_latency first, then custom tie-break key.
        item = (avg_latency, endpoint)

        if len(min_heap) < k:
            heapq.heappush(min_heap, (avg_latency, ReverseString(endpoint), endpoint, avg_latency))
        else:
            # Compare current item with smallest in heap
            smallest = min_heap[0]
            if (avg_latency, ReverseString(endpoint)) > (smallest[0], smallest[1]):
                heapq.heapreplace(min_heap, (avg_latency, ReverseString(endpoint), endpoint, avg_latency))

    # Reconstruct sorted results from heap in descending order
    top_k = []
    while min_heap:
        _, _, endpoint, avg_latency = heapq.heappop(min_heap)
        top_k.append({
            'endpoint': endpoint,
            'avg_latency': avg_latency
        })

    # Heap pop returns smallest first, reverse to get largest (slowest) first
    top_k.reverse()
    return top_k


class ReverseString:
    """Helper wrapper to invert string comparison in min-heap for tie-breaking."""
    def __init__(self, obj):
        self.obj = obj
    def __lt__(self, other):
        return self.obj > other.obj
    def __gt__(self, other):
        return self.obj < other.obj
    def __le__(self, other):
        return self.obj >= other.obj
    def __ge__(self, other):
        return self.obj <= other.obj