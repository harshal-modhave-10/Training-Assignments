# Assignment

Choose a small development task (personal, sample, or open source) and complete it using iterative prompting.

**Do the below assignment. Here are the details:**

You are a backend developer working on an observability platform. Your service processes massive JSON logs of API requests to generate latency reports. Your project repository contains three files:
* `s3_log_fetcher.py` (or `.java`): Downloads raw, gigabyte-sized log files 
* `log_analyzer.py` (or `.java`): Parses the logs to calculate API performance metrics.
* `slack_notifier.py` (or `.java`): Sends the final report to the engineering team's Slack channel.

**Issues:** 
The daily cron job is timing out. The `get_top_slowest_endpoints` function in the log analyzer was written hastily as a quick prototype. It is supposed to parse a list of log dictionaries and return the Top 5 slowest endpoints by average latency.
Currently, it has an algorithmic bottleneck of O(E × N) (effectively O(n²)) and takes far too long to process even 50,000 logs. We need to optimize this to run in milliseconds in a single pass (O(N)).

**The Edge Cases Required:** 
Your final optimized solution must strictly handle the following business rules:
* **Filter out errors:** Only calculate latency for successful requests (HTTP status codes 200–299). Ignore 4xx and 5xx errors.
* **Filter internal traffic:** Ignore any endpoint starting with `/health` or `/internal`.
* **Normalize URLs:** Endpoints with query parameters (e.g., `/api/users?id=123` and `/api/users?id=999`) must be grouped together as just `/api/users`.
* **Tie-breaking:** If two endpoints have the exact same average latency, sort them alphabetically by the endpoint name.

---

## Step 1: Context Isolation & Problem Analysis (No Code Yet!)
Use the RCTC framework to provide the AI only the inefficient log analyzer snippet, avoiding context pollution from other files.

## Step 2: Approach Generation & Evaluation
Prompt the AI to suggest 2-3 algorithmic approaches to achieve O(N) performance. Analyse pros and cons.

## Step 3: Implementation & Edge Cases
Select the best approach from the AI's suggestions and instruct it to write the refactored function. Fix all the edge cases.

## Step 4: Validation & Benchmarking
Ask the AI to generate a unit test suite, explicitly demanding a test that proves the alphabetical tie-breaker edge case works. Similar for other edge cases. Run the newly generated function through the provided benchmark script to verify and record your performance gains.

## Bonus Challenge
Once you have your O(N) solution, ask the AI how to find the top 5 without using `.sort()`. 
*(Hint: ask about heaps!)*

---

## Requirements
* Do not rewrite the code yourself. Use only iterative prompting to guide the AI toward a solution.
* Your refined prompts should explicitly ask the AI to first explain the current bottlenecks before proposing a fix.
* The final solution must correctly handle edge cases.

## Success Criteria
* The final solution achieves O(N) time complexity or better, down from the original O(n²) baseline.
* All listed edge cases are handled correctly and verified with tests.
* Before/after complexity is documented, with measured runtime benchmarked on a generated dataset of at least 100,000 records.

## Expected Deliverables
`PROMPT_JOURNAL.md` containing:
* Initial prompt
* Refined prompts (minimum 2–3 iterations)
* Summary of AI responses
* Reason for each refinement
* Final accepted solution
* Short observations describing:
    * How iterative prompting improved the output
    * Key learnings from the exercise
    * Best practices followed during prompting
    * Lessons learned during the assignment

---

## How to Get Started

1. **Unzip the Assignment Files:** Extract the provided assignment ZIP file to your local machine. Choose either the Python or Java folder based on your preference.
2. **Run the Baseline Benchmark:** Before making any changes, run the provided benchmark script (`benchmark.py` or `Benchmark.java`). It will read the `api_logs.csv` file and run the original function. **Record this initial execution time** so you can compare it.
3. **Prepare Your Workspace:** Create a new file named `PROMPT_JOURNAL.md` in your project folder.
4. **Initiate Step 1 (Context Isolation):** Open your preferred AI tool. Draft your first prompt using the RCTC framework. Make sure you copy and paste **only** the inefficient `log_analyzer` code snippet into the AI. Do not include the S3, Slack, or benchmark files to avoid context pollution.
5. **Follow the Prompting Sequence:** Continue guiding the AI strictly through Steps 2, 3, and 4 from the assignment document. Document every prompt, AI summary, and refinement reason in your `PROMPT_JOURNAL.md`!
