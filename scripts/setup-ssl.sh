#!/bin/bash
# Setup SSL certificates for Let's Encrypt
# Usage: ./scripts/setup-ssl.sh <domain1> <domain2> <domain3> [email]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/data/.tgo-domain-config"
CERTBOT_DIR="$PROJECT_ROOT/data/certbot"
SSL_DIR="$PROJECT_ROOT/data/nginx/ssl"

if [ $# -lt 3 ]; then
    echo "Usage: $0 <web_domain> <widget_domain> <api_domain> [email]"
    exit 1
fi

WEB_DOMAIN=$1
WIDGET_DOMAIN=$2
API_DOMAIN=$3
EMAIL=${4:-admin@example.com}

# Create necessary directories
mkdir -p "$CERTBOT_DIR/conf" "$CERTBOT_DIR/www" "$CERTBOT_DIR/logs"
mkdir -p "$SSL_DIR"

echo "[INFO] Setting up Let's Encrypt certificates..."
echo "[INFO] Domains: $WEB_DOMAIN, $WIDGET_DOMAIN, $API_DOMAIN"
echo "[INFO] Email: $EMAIL"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed"
    exit 1
fi

# Run certbot for each domain
for domain in "$WEB_DOMAIN" "$WIDGET_DOMAIN" "$API_DOMAIN"; do
    echo "[INFO] Requesting certificate for: $domain"
    
    docker run --rm \
        -v "$CERTBOT_DIR/conf:/etc/letsencrypt" \
        -v "$CERTBOT_DIR/www:/var/www/certbot" \
        -v "$CERTBOT_DIR/logs:/var/log/letsencrypt" \
        -p 80:80 \
        certbot/certbot certonly \
        --standalone \
        --agree-tos \
        --no-eff-email \
        --email "$EMAIL" \
        -d "$domain" || {
        echo "[WARN] Failed to get certificate for $domain"
        continue
    }
    
    # Copy certificate to nginx ssl directory
    mkdir -p "$SSL_DIR/$domain"
    if [ -f "$CERTBOT_DIR/conf/live/$domain/fullchain.pem" ]; then
        cp "$CERTBOT_DIR/conf/live/$domain/fullchain.pem" "$SSL_DIR/$domain/cert.pem"
        cp "$CERTBOT_DIR/conf/live/$domain/privkey.pem" "$SSL_DIR/$domain/key.pem"
        echo "[INFO] Certificate copied for: $domain"
    fi
done

echo "[INFO] SSL setup completed!"
echo "[INFO] Certificates stored in: $SSL_DIR"

