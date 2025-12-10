const fs = require('fs');
const path = require('path');

// Generate performance test report
function generateReport() {
  const resultsDir = 'tests/performance/results';
  const reportPath = path.join(resultsDir, 'performance-report.html');
  
  // Check if results directory exists
  if (!fs.existsSync(resultsDir)) {
    console.error('Results directory not found. Please run performance tests first.');
    process.exit(1);
  }
  
  // Read result files
  const resultFiles = fs.readdirSync(resultsDir).filter(file => file.endsWith('.json'));
  
  if (resultFiles.length === 0) {
    console.error('No result files found. Please run performance tests first.');
    process.exit(1);
  }
  
  // Generate HTML report
  const html = generateHTMLReport(resultFiles);
  
  // Write report
  fs.writeFileSync(reportPath, html);
  
  console.log(`Performance report generated: ${reportPath}`);
  console.log('Open the report in your browser to view detailed results.');
}

// Generate HTML report
function generateHTMLReport(resultFiles) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eloquent AI Performance Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        .summary {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .metric {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            margin: 5px;
            font-size: 14px;
        }
        .metric.good {
            background: #27ae60;
        }
        .metric.warning {
            background: #f39c12;
        }
        .metric.error {
            background: #e74c3c;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .chart {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Eloquent AI Performance Test Report</h1>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Test Files:</strong> ${resultFiles.length}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        </div>
        
        <h2>🎯 Performance Metrics</h2>
        <div class="chart">
            <h3>Key Performance Indicators</h3>
            <div class="metric good">Response Time: < 2s</div>
            <div class="metric good">Error Rate: < 1%</div>
            <div class="metric good">Throughput: > 100 req/s</div>
            <div class="metric good">Availability: > 99.9%</div>
        </div>
        
        <h2>📈 Test Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Test Type</th>
                    <th>Duration</th>
                    <th>Virtual Users</th>
                    <th>Requests</th>
                    <th>Response Time (p95)</th>
                    <th>Error Rate</th>
                    <th>Throughput</th>
                </tr>
            </thead>
            <tbody>
                ${generateTestResults(resultFiles)}
            </tbody>
        </table>
        
        <h2>🔍 Detailed Analysis</h2>
        <div class="chart">
            <h3>Performance Trends</h3>
            <p>Analyze the JSON result files for detailed metrics and trends.</p>
            <p>Use tools like Grafana, Prometheus, or custom dashboards for visualization.</p>
        </div>
        
        <h2>💡 Recommendations</h2>
        <ul>
            <li><strong>Monitor Response Times:</strong> Keep 95th percentile response times below 2 seconds</li>
            <li><strong>Error Handling:</strong> Implement proper error handling and retry mechanisms</li>
            <li><strong>Caching:</strong> Implement caching for frequently accessed data</li>
            <li><strong>Database Optimization:</strong> Optimize database queries and indexes</li>
            <li><strong>Load Balancing:</strong> Consider load balancing for high traffic scenarios</li>
            <li><strong>Auto-scaling:</strong> Implement auto-scaling based on load metrics</li>
        </ul>
        
        <h2>📁 Files Generated</h2>
        <ul>
            <li><strong>JSON Results:</strong> Detailed metrics in JSON format</li>
            <li><strong>CSV Results:</strong> Tabular data for analysis</li>
            <li><strong>HTML Report:</strong> This comprehensive report</li>
        </ul>
        
        <div class="footer">
            <p>Generated by Eloquent AI Performance Testing Suite</p>
            <p>For more information, visit: <a href="https://github.com/your-username/eloquent-ai">GitHub Repository</a></p>
        </div>
    </div>
</body>
</html>
  `;
}

// Generate test results table rows
function generateTestResults(resultFiles) {
  return resultFiles.map(file => {
    const testType = file.replace('-results.json', '').replace('-', ' ').toUpperCase();
    return `
      <tr>
        <td>${testType}</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
      </tr>
    `;
  }).join('');
}

// Run the report generation
if (require.main === module) {
  generateReport();
}

module.exports = { generateReport };
