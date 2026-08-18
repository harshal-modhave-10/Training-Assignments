import unittest
from log_analyzer import get_top_slowest_endpoints

class TestLogAnalyzer(unittest.TestCase):

    def test_status_code_filtering(self):
        """Only status codes 200-299 should be included."""
        logs = [
            {'url': '/api/users', 'status': 200, 'latency_ms': 100},
            {'url': '/api/users', 'status': 201, 'latency_ms': 100},
            {'url': '/api/users', 'status': 199, 'latency_ms': 999},  # Ignored
            {'url': '/api/users', 'status': 404, 'latency_ms': 999},  # Ignored
            {'url': '/api/users', 'status': 500, 'latency_ms': 999},  # Ignored
        ]
        res = get_top_slowest_endpoints(logs)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]['avg_latency'], 100.0)

    def test_path_filtering(self):
        """Endpoints starting with /health or /internal must be ignored."""
        logs = [
            {'url': '/health/check', 'status': 200, 'latency_ms': 500},
            {'url': '/internal/metrics', 'status': 200, 'latency_ms': 500},
            {'url': '/api/data', 'status': 200, 'latency_ms': 100},
        ]
        res = get_top_slowest_endpoints(logs)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]['endpoint'], '/api/data')

    def test_url_normalization(self):
        """Query parameters must be stripped."""
        logs = [
            {'url': '/api/users?id=123', 'status': 200, 'latency_ms': 100},
            {'url': '/api/users?id=999&page=2', 'status': 200, 'latency_ms': 200},
        ]
        res = get_top_slowest_endpoints(logs)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]['endpoint'], '/api/users')
        self.assertEqual(res[0]['avg_latency'], 150.0)

    def test_alphabetical_tie_breaking(self):
        """When average latencies are tied, endpoints must be sorted alphabetically."""
        logs = [
            {'url': '/api/zebra', 'status': 200, 'latency_ms': 200},
            {'url': '/api/apple', 'status': 200, 'latency_ms': 200},
            {'url': '/api/banana', 'status': 200, 'latency_ms': 200},
        ]
        res = get_top_slowest_endpoints(logs)
        endpoints = [r['endpoint'] for r in res]
        self.assertEqual(endpoints, ['/api/apple', '/api/banana', '/api/zebra'])

if __name__ == '__main__':
    unittest.main()