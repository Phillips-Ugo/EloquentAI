#!/bin/bash

# Deployment script for Eloquent AI
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
ENVIRONMENT=${1:-staging}
NAMESPACE="eloquent-ai"
IMAGE_TAG=${2:-latest}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    print_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

print_status "Deploying Eloquent AI to $ENVIRONMENT environment"
print_status "Image tag: $IMAGE_TAG"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed"
        exit 1
    fi
    
    # Check kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Create namespace
create_namespace() {
    print_status "Creating namespace..."
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        print_warning "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f k8s/namespace.yaml
        print_success "Namespace created"
    fi
}

# Deploy secrets
deploy_secrets() {
    print_status "Deploying secrets..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # In production, use sealed secrets or external secret management
        print_warning "Production secrets should be managed externally"
        print_status "Please ensure secrets are properly configured"
    else
        kubectl apply -f k8s/secrets.yaml
        print_success "Secrets deployed"
    fi
}

# Deploy persistent volumes
deploy_pvc() {
    print_status "Deploying persistent volume claims..."
    
    kubectl apply -f k8s/pvc.yaml
    print_success "PVCs deployed"
}

# Deploy Redis
deploy_redis() {
    print_status "Deploying Redis..."
    
    # Deploy Redis using Helm
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    helm upgrade --install redis bitnami/redis \
        --namespace $NAMESPACE \
        --set auth.enabled=true \
        --set auth.password=eloquentai123 \
        --set master.persistence.size=10Gi \
        --set replica.persistence.size=10Gi
    
    print_success "Redis deployed"
}

# Deploy application
deploy_application() {
    print_status "Deploying application..."
    
    # Update image tag in deployment
    sed "s|ghcr.io/your-username/eloquent-ai:latest|ghcr.io/your-username/eloquent-ai:$IMAGE_TAG|g" k8s/deployment.yaml | kubectl apply -f -
    
    # Deploy services
    kubectl apply -f k8s/service.yaml
    
    # Deploy HPA
    kubectl apply -f k8s/hpa.yaml
    
    print_success "Application deployed"
}

# Deploy ingress
deploy_ingress() {
    print_status "Deploying ingress..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        kubectl apply -f k8s/ingress.yaml
        print_success "Ingress deployed"
    else
        print_warning "Skipping ingress for staging environment"
    fi
}

# Wait for deployment
wait_for_deployment() {
    print_status "Waiting for deployment to be ready..."
    
    kubectl wait --for=condition=available --timeout=300s deployment/eloquent-ai -n $NAMESPACE
    
    print_success "Deployment is ready"
}

# Run health checks
health_checks() {
    print_status "Running health checks..."
    
    # Get service endpoint
    if [ "$ENVIRONMENT" = "production" ]; then
        ENDPOINT="https://eloquentai.com"
    else
        # For staging, use port-forward
        kubectl port-forward service/eloquent-ai-service 8080:5001 -n $NAMESPACE &
        PORT_FORWARD_PID=$!
        sleep 5
        ENDPOINT="http://localhost:8080"
    fi
    
    # Health check
    if curl -f "$ENDPOINT/api/health" &> /dev/null; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        exit 1
    fi
    
    # Clean up port-forward
    if [ "$ENVIRONMENT" = "staging" ] && [ ! -z "$PORT_FORWARD_PID" ]; then
        kill $PORT_FORWARD_PID
    fi
}

# Deploy monitoring
deploy_monitoring() {
    print_status "Deploying monitoring..."
    
    # Deploy Prometheus
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace $NAMESPACE \
        --set grafana.adminPassword=admin123 \
        --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
    
    # Deploy Grafana dashboards
    kubectl apply -f monitoring/grafana-dashboard.yaml -n $NAMESPACE
    
    print_success "Monitoring deployed"
}

# Rollback deployment
rollback() {
    print_status "Rolling back deployment..."
    
    kubectl rollout undo deployment/eloquent-ai -n $NAMESPACE
    kubectl rollout status deployment/eloquent-ai -n $NAMESPACE
    
    print_success "Rollback completed"
}

# Main deployment function
main() {
    echo "🚀 Eloquent AI Deployment"
    echo "========================="
    echo ""
    
    check_prerequisites
    create_namespace
    deploy_secrets
    deploy_pvc
    deploy_redis
    deploy_application
    deploy_ingress
    wait_for_deployment
    health_checks
    
    if [ "$ENVIRONMENT" = "production" ]; then
        deploy_monitoring
    fi
    
    print_success "Deployment completed successfully!"
    echo ""
    echo "🌐 Access Points:"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "  - Application: https://eloquentai.com"
        echo "  - API: https://eloquentai.com/api"
        echo "  - Grafana: https://grafana.eloquentai.com"
    else
        echo "  - Application: http://localhost:3000 (port-forward)"
        echo "  - API: http://localhost:8080 (port-forward)"
    fi
    echo ""
    echo "🔧 Management:"
    echo "  - View pods: kubectl get pods -n $NAMESPACE"
    echo "  - View logs: kubectl logs -f deployment/eloquent-ai -n $NAMESPACE"
    echo "  - Scale: kubectl scale deployment eloquent-ai --replicas=5 -n $NAMESPACE"
    echo "  - Rollback: kubectl rollout undo deployment/eloquent-ai -n $NAMESPACE"
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment] [image-tag]"
        echo "  environment: staging (default) or production"
        echo "  image-tag: Docker image tag (default: latest)"
        echo ""
        echo "Commands:"
        echo "  rollback  - Rollback to previous deployment"
        echo "  help      - Show this help message"
        ;;
    *)
        main "$@"
        ;;
esac
