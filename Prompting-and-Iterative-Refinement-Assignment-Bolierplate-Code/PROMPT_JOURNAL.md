# Prompt Journal: Log Analyzer Optimization

## 1. Initial Prompt (Step 1: Context Isolation using RCTC)

**Role:** Senior Backend Performance Engineer  
**Context:** I am working on an observability platform where a daily cron job processing API logs is timing out.  
**Task:** Analyze the provided `get_top_slowest_endpoints` function snippet. Explain its time complexity bottlenecks and identify any hidden edge case bugs without providing optimized code yet.  
**Constraints:** Do not write code yet. Analyze only the snippet provided below.

```python
def get_top_slowest_endpoints(api_logs):
    unique_endpoints = []

    # Pass 1: Find all unique base endpoints - O(N)
    for log in api_logs:
        base_path = log['url'].split('?')[0]
        if base_path not in unique_endpoints:
            unique_endpoints.append(base_path)

    results = []

    # Pass 2: For EVERY unique endpoint, scan the ENTIRE log again - O(E * N)
    for endpoint in unique_endpoints:
        total_time = 0
        count = 0

        for log in api_logs:
            base_path = log['url'].split('?')[0]
            if base_path == endpoint:
                if log['status'] < 300 and not base_path.startswith('/health') and not base_path.startswith('/internal'):
                    total_time += log['latency_ms']
                    count += 1

        if count > 0:
            results.append({
                'endpoint': endpoint,
                'avg_latency': total_time / count
            })

    results.sort(key=lambda x: (-x['avg_latency'], x['endpoint']))
    return results[:5]
```

## 2. Refined Prompts (Minimum 3 Iterations)

### Iteration 1: Approach Generation

**Prompt:**

> Based on your analysis of the $O(E \times N)$ bottleneck in the baseline code, propose 2–3 alternative algorithmic approaches to achieve a single-pass $O(N)$ execution time. Provide a detailed comparison of time and space complexity (pros and cons) for each approach, but do not write any code yet.

---

### Iteration 2: Implementation & Business Rule Verification

**Prompt:**

> Let's proceed with the Hash Map (Dictionary Aggregation) approach. Refactor the `get_top_slowest_endpoints` function ensuring strict compliance with all business rules:
>
> 1. Filter out error requests (only include HTTP status codes $200 \le \text{status} \le 299$).
> 2. Ignore any endpoints starting with `/health` or `/internal`.
> 3. Normalize URLs by stripping query parameters (e.g., `/api/users?id=123` -> `/api/users`).
> 4. Handle tie-breaking: if two endpoints have the exact same average latency, sort them alphabetically by endpoint name.

---

### Iteration 3: Unit Testing & Verification

**Prompt:**

> Write a comprehensive unit test suite using Python's `unittest` framework for the newly refactored function. Specifically include unit tests that prove:
>
> 1. Alphabetical tie-breaking works when two endpoints have identical average latencies.
> 2. Requests with status codes outside 200–299 (such as 1xx, 4xx, and 5xx) are filtered out.
> 3. Endpoints starting with `/health` and `/internal` are excluded.
> 4. Query parameters are stripped and normalized properly.

---

### Optional Bonus Task: Min-Heap Optimization

**Prompt:**

> How can we find the top 5 slowest endpoints from the aggregated stats without using `.sort()` on all endpoints? Please refactor the selection logic using a Min-Heap (`heapq`) to optimize top-K extraction.

## 3. Summary of AI Responses

- **Initial Prompt Response:** The AI analyzed the provided baseline snippet and correctly identified the primary algorithmic bottleneck ($O(E \times N)$, effectively $O(N^2)$) caused by scanning the full dataset twice per unique endpoint[cite: 1, 2, 8, 10]. It also pointed out a bug in the baseline filter (`status < 300`), which allowed 1xx status codes to pass through[cite: 4, 8, 10].
- **Iteration 1 Response:** The AI proposed two single-pass $O(N)$ solutions: (1) Single-Pass Hash Map Aggregation and (2) Hash Map + Min-Heap Top-K Selection. It provided a space-time complexity analysis comparing $O(U \log U)$ sorting versus $O(U \log 5)$ heap selection (where $U$ is the number of unique endpoints).
- **Iteration 2 Response:** The AI generated the refactored Python function using a single-pass `defaultdict`[cite: 8]. It strictly implemented all business rules: HTTP status filtering ($200 \le \text{status} \le 299$), excluding `/health` and `/internal` endpoints, stripping query parameters, and applying secondary alphabetical sorting for tie-breaks[cite: 2, 8, 10].
- **Iteration 3 Response:** The AI produced a complete `unittest.TestCase` suite covering all edge cases, explicitly validating that alphabetical tie-breaking works when two endpoints share identical average latencies.
- **Bonus Task Response:** The AI demonstrated how to replace post-aggregation `.sort()` with `heapq` functions (`heapq.nsmallest` / `heapq.heappushpop`) to extract the Top 5 slowest endpoints without sorting the entire aggregated dataset.

---

## 4. Reason for Each Refinement

- **Refined after Initial Prompt:** To enforce problem analysis and root-cause identification before asking the model to write code, preventing hallucinated or overly complex implementations.
- **Refined after Iteration 1:** To select the optimal Hash Map approach and explicitly mandate all 4 business rules (status bounds, route exclusions, URL normalization, and tie-breaking) that were partially missing or incorrect in the original prototype.
- **Refined after Iteration 2:** To automate verification and ensure programmatic test coverage rather than relying on manual code inspection.
- **Refined for Bonus Task:** To explore memory-efficient Top-K algorithms suitable for large-scale production datasets with millions of unique endpoints.

---

## 5. Final Accepted Solution

```python
from collections import defaultdict

def get_top_slowest_endpoints(api_logs):
    """
    Optimized O(N) log analyzer to compute Top 5 slowest endpoints by average latency.

    Business Rules Implemented:
    1. Status Filtering: 200 <= status <= 299 only.
    2. Path Filtering: Ignore endpoints starting with /health or /internal.
    3. Normalization: Strip query parameters (e.g., /api/users?id=1 -> /api/users).
    4. Tie-breaking: Sort by avg_latency descending, then endpoint name ascending.
    """
    # Hash map for O(N) single-pass aggregation: { endpoint: [total_latency, count] }
    stats = defaultdict(lambda: [0, 0])

    # Single pass over logs - O(N)
    for log in api_logs:
        status = log.get('status', 0)
        # Business Rule 1: HTTP Status 200-299 only
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

    # Calculate average latencies
    results = []
    for endpoint, (total_latency, count) in stats.items():
        if count > 0:
            results.append({
                'endpoint': endpoint,
                'avg_latency': total_latency / count
            })

    # Business Rule 4: Tie-breaking
    # Primary key: -avg_latency (descending), Secondary key: endpoint (alphabetical ascending)
    results.sort(key=lambda x: (-x['avg_latency'], x['endpoint']))

    return results[:5]
```

### Benchmark Comparison (Tested on `api_logs.csv` — 200,000 Records)

| Metric                 | Baseline Prototype                 | Refactored Solution ($O(N)$ + Min-Heap)                               | Performance Gain         |
| :--------------------- | :--------------------------------- | :-------------------------------------------------------------------- | :----------------------- |
| **Time Complexity**    | $O(E \times N)$ ($\approx O(N^2)$) | **$O(N)$**                                                            | Algorithmic Optimization |
| **Space Complexity**   | $O(E)$                             | **$O(E)$**                                                            | Identical Overhead       |
| **Execution Time**     | **80.6375 seconds**                | **0.1390 seconds**                                                    | **> 430x Speedup**       |
| **Edge Cases Handled** | Partial (Status `< 300`)           | Complete (Status `200–299`, Path Filters, URL Splitting, Tie-Breaker) | 100% Verified            |

## 6. Observations & Lessons Learned

### How Iterative Prompting Improved Output

- **Systematic Problem Isolation:** Prompting the AI to analyze bottlenecks before generating code prevented premature, flawed implementations[cite: 10].
- **Edge Case Precision:** Breaking requirements into sequential prompt iterations ensured that critical business rules (such as $200 \le \text{status} \le 299$ bounds and alphabetical tie-breaking) were explicitly integrated and verified[cite: 2, 10].
- **Quality & Testability:** Progressive refinement naturally led to complete unit test coverage, ensuring long-term code maintainability[cite: 2, 10].

### Key Learnings from the Exercise

- **Algorithmic Impact:** Transitioning from an $O(E \times N)$ double loop to an $O(N)$ single-pass hash map reduced runtime from **80.6375 seconds to 0.1390 seconds** on 200,000 records[cite: 2, 8, 10].
- **Top-K Efficiency:** Using a Min-Heap (`heapq`) allows finding top $K$ items in $O(U \log K)$ time without sorting the entire dataset of $U$ unique endpoints[cite: 2, 10].

### Best Practices Followed During Prompting

- **Role, Context, Task, Constraint (RCTC) Framework:** Defined clear roles and strict boundaries in the initial prompt[cite: 10].
- **Incremental Guidance:** Divided the task into 4 distinct phases (Analysis $\rightarrow$ Approaches $\rightarrow$ Implementation $\rightarrow$ Testing)[cite: 10].
- **Explicit Business Rules:** Clearly stated all edge case filters and sorting priorities in prompt constraints[cite: 2, 10].

### Lessons Learned During the Assignment

- **Context Isolation is Essential:** Excluding noise files (`s3_log_fetcher.py`, `slack_notifier.py`) eliminated context pollution and kept the AI focused solely on the target function[cite: 10].
- **Automated Benchmarking:** Using a script (`benchmark.py`) provided empirical evidence of performance gains, validating theoretical complexity bounds[cite: 2, 7, 10].
