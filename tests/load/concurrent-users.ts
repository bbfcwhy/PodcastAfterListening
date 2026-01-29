/**
 * SC-005: 系統可支援同時 500 位訪客瀏覽而不影響使用體驗
 * 
 * This is a load test script that should be run with a load testing tool
 * like k6, Artillery, or Apache Bench.
 * 
 * For k6 example:
 * k6 run --vus 500 --duration 30s concurrent-users.ts
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 500 }, // Ramp up to 500 users
    { duration: "1m", target: 500 }, // Stay at 500 users
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    http_req_failed: ["rate<0.01"], // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Simulate browsing homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    "homepage status is 200": (r) => r.status === 200,
    "homepage loads in < 3s": (r) => r.timings.duration < 3000,
  });

  sleep(1);

  // Simulate viewing an episode
  const episodeRes = http.get(`${BASE_URL}/episodes/test-show/test-episode`);
  check(episodeRes, {
    "episode page status is 200": (r) => r.status === 200,
    "episode page loads in < 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
