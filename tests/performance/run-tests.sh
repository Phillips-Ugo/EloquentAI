#!/bin/bash

# Performance Testing Script for Eloquent AI
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
BASE_URL=${1:-"http://localhost:5001"}
OUTPUT_DIR=${2:-"tests/performance/results"}
TEST_TYPE=${3:-"all"}

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if k6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed. Please install k6 first."
        print_status "Installation instructions: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    
    print_success "k6 is installed"
}

# Check if target server is running
check_server() {
    print_status "Checking if server is running at $BASE_URL..."
    
    if curl -f "$BASE_URL/api/health" &> /dev/null; then
        print_success "Server is running and healthy"
    else
        print_error "Server is not running or not healthy at $BASE_URL"
        print_status "Please start the server first: npm start"
        exit 1
    fi
}

# Run benchmark test
run_benchmark() {
    print_status "Running benchmark test..."
    
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$OUTPUT_DIR/benchmark-results.json" \
        --out csv="$OUTPUT_DIR/benchmark-results.csv" \
        tests/performance/benchmark.js
    
    print_success "Benchmark test completed"
}

# Run load test
run_load_test() {
    print_status "Running load test..."
    
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$OUTPUT_DIR/load-test-results.json" \
        --out csv="$OUTPUT_DIR/load-test-results.csv" \
        tests/performance/load-test.js
    
    print_success "Load test completed"
}

# Run stress test
run_stress_test() {
    print_status "Running stress test..."
    
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$OUTPUT_DIR/stress-test-results.json" \
        --out csv="$OUTPUT_DIR/stress-test-results.csv" \
        tests/performance/stress-test.js
    
    print_success "Stress test completed"
}

# Run spike test
run_spike_test() {
    print_status "Running spike test..."
    
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$OUTPUT_DIR/spike-test-results.json" \
        --out csv="$OUTPUT_DIR/spike-test-results.csv" \
        tests/performance/spike-test.js
    
    print_success "Spike test completed"
}

# Run WebSocket test
run_websocket_test() {
    print_status "Running WebSocket test..."
    
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$OUTPUT_DIR/websocket-test-results.json" \
        --out csv="$OUTPUT_DIR/websocket-test-results.csv" \
        tests/performance/websocket-test.js
    
    print_success "WebSocket test completed"
}

# Generate performance report
generate_report() {
    print_status "Generating performance report..."
    
    cat > "$OUTPUT_DIR/performance-report.md" << EOF
# Eloquent AI Performance Test Report

Generated on: $(date)

## Test Configuration
- Base URL: $BASE_URL
- Output Directory: $OUTPUT_DIR
- Test Type: $TEST_TYPE

## Test Results

### Benchmark Test
- **Purpose**: Baseline performance measurement
- **Results**: See benchmark-results.json and benchmark-results.csv

### Load Test
- **Purpose**: Normal load testing
- **Results**: See load-test-results.json and load-test-results.csv

### Stress Test
- **Purpose**: High load testing
- **Results**: See stress-test-results.json and stress-test-results.csv

### Spike Test
- **Purpose**: Sudden load increase testing
- **Results**: See spike-test-results.json and spike-test-results.csv

### WebSocket Test
- **Purpose**: WebSocket connection testing
- **Results**: See websocket-test-results.json and websocket-test-results.csv

## Performance Metrics

### Key Performance Indicators (KPIs)
- **Response Time**: 95th percentile should be < 2 seconds
- **Error Rate**: Should be < 1% for normal load
- **Throughput**: Should handle > 100 requests/second
- **Availability**: Should be > 99.9%

### Thresholds
- Health Check: < 100ms
- Text Upload: < 1 second
- File Upload: < 500ms
- Analytics: < 100ms
- WebSocket: < 1 second

## Recommendations

1. **Monitor Response Times**: Keep 95th percentile response times below 2 seconds
2. **Error Handling**: Implement proper error handling and retry mechanisms
3. **Caching**: Implement caching for frequently accessed data
4. **Database Optimization**: Optimize database queries and indexes
5. **Load Balancing**: Consider load balancing for high traffic scenarios
6. **Auto-scaling**: Implement auto-scaling based on load metrics

## Files Generated
- JSON results: \`*.json\` files contain detailed metrics
- CSV results: \`*.csv\` files contain tabular data for analysis
- This report: \`performance-report.md\`

## Next Steps
1. Analyze the results in detail
2. Identify performance bottlenecks
3. Implement optimizations
4. Re-run tests to validate improvements
5. Set up continuous performance monitoring

EOF
    
    print_success "Performance report generated: $OUTPUT_DIR/performance-report.md"
}

# Main execution
main() {
    echo "🚀 Eloquent AI Performance Testing"
    echo "=================================="
    echo ""
    
    check_k6
    check_server
    
    case "$TEST_TYPE" in
        "benchmark")
            run_benchmark
            ;;
        "load")
            run_load_test
            ;;
        "stress")
            run_stress_test
            ;;
        "spike")
            run_spike_test
            ;;
        "websocket")
            run_websocket_test
            ;;
        "all")
            run_benchmark
            run_load_test
            run_stress_test
            run_spike_test
            run_websocket_test
            ;;
        *)
            print_error "Invalid test type: $TEST_TYPE"
            print_status "Valid options: benchmark, load, stress, spike, websocket, all"
            exit 1
            ;;
    esac
    
    generate_report
    
    print_success "All performance tests completed!"
    echo ""
    echo "📊 Results:"
    echo "  - Output Directory: $OUTPUT_DIR"
    echo "  - Report: $OUTPUT_DIR/performance-report.md"
    echo "  - JSON Results: $OUTPUT_DIR/*.json"
    echo "  - CSV Results: $OUTPUT_DIR/*.csv"
    echo ""
    echo "🔧 Analysis:"
    echo "  - View report: cat $OUTPUT_DIR/performance-report.md"
    echo "  - Analyze JSON: Use k6's built-in analysis tools"
    echo "  - Import CSV: Use Excel, Google Sheets, or other tools"
}

# Handle script arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [base-url] [output-dir] [test-type]"
        echo "  base-url: Target server URL (default: http://localhost:5001)"
        echo "  output-dir: Output directory for results (default: tests/performance/results)"
        echo "  test-type: Type of test to run (default: all)"
        echo ""
        echo "Test Types:"
        echo "  benchmark  - Baseline performance measurement"
        echo "  load       - Normal load testing"
        echo "  stress     - High load testing"
        echo "  spike      - Sudden load increase testing"
        echo "  websocket  - WebSocket connection testing"
        echo "  all        - Run all tests (default)"
        echo ""
        echo "Examples:"
        echo "  $0                                    # Run all tests on localhost"
        echo "  $0 http://staging.eloquentai.com     # Run all tests on staging"
        echo "  $0 http://localhost:5001 results benchmark  # Run only benchmark test"
        ;;
    *)
        main "$@"
        ;;
esac
