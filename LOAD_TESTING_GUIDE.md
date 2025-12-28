# Load Testing Guide for KlarText

## 🚀 How to Test Website Load Capacity

### Option 1: Lighthouse (Built into Chrome - FREE)

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Check "Performance", "Accessibility", "Best Practices", "SEO"
4. Click **Analyze page load**

This gives you:
- Performance score (0-100)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

---

### Option 2: k6 (Load Testing Tool - FREE)

Install k6: https://k6.io/docs/get-started/installation/

Create a test script `load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Simulate 50 users for 30 seconds
  vus: 50,           // Virtual Users
  duration: '30s',
  
  // Or ramp up gradually:
  // stages: [
  //   { duration: '30s', target: 20 },  // Ramp up to 20 users
  //   { duration: '1m', target: 50 },   // Stay at 50 users
  //   { duration: '30s', target: 0 },   // Ramp down
  // ],
  
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  // Test homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads under 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test dashboard
  res = http.get(`${BASE_URL}/dashboard`);
  check(res, {
    'dashboard status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test lessons page
  res = http.get(`${BASE_URL}/lessons`);
  check(res, {
    'lessons status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

Run: `k6 run load-test.js`

---

### Option 3: Artillery (Node.js based - FREE)

Install: `npm install -g artillery`

Create `load-test.yml`:

```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10    # 10 new users per second
      name: "Warm up"
    - duration: 120
      arrivalRate: 50    # 50 new users per second
      name: "Sustained load"

scenarios:
  - name: "Browse lessons"
    flow:
      - get:
          url: "/"
      - think: 2
      - get:
          url: "/dashboard"
      - think: 2
      - get:
          url: "/lessons"
```

Run: `artillery run load-test.yml`

---

### Option 4: Apache Benchmark (ab) - Simple & Quick

```bash
# Test with 100 requests, 10 concurrent users
ab -n 100 -c 10 http://localhost:3001/

# Test with 1000 requests, 50 concurrent users
ab -n 1000 -c 50 http://localhost:3001/lessons
```

---

### Option 5: Vercel Analytics (for Production - FREE tier)

If deploying to Vercel:
1. Go to your Vercel dashboard
2. Enable **Analytics** and **Speed Insights**
3. Get real user monitoring (RUM) data

---

### Option 6: WebPageTest.org (FREE)

1. Go to https://www.webpagetest.org/
2. Enter your production URL
3. Select test location and browser
4. Get detailed waterfall charts and performance metrics

---

## 📊 Key Metrics to Watch

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| **FID** (First Input Delay) | < 100ms | 100-300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |
| **TTFB** (Time to First Byte) | < 200ms | 200-500ms | > 500ms |
| **Error Rate** | < 1% | 1-5% | > 5% |
| **p95 Response Time** | < 500ms | 500ms-1s | > 1s |

---

## 🎯 Quick Test Command

Add this to your `package.json`:

```json
{
  "scripts": {
    "test:load": "npx autocannon -c 50 -d 30 http://localhost:3001"
  }
}
```

Run: `npm run test:load`

This runs 50 concurrent connections for 30 seconds and shows:
- Requests per second
- Latency (avg, min, max, p99)
- Throughput
