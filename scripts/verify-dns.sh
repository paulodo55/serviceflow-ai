#!/bin/bash

# DNS Verification Script for VervidFlow
# Usage: ./scripts/verify-dns.sh yourdomain.com

DOMAIN=${1:-yourdomain.com}
echo "🔍 Verifying DNS records for: $DOMAIN"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}📡 Checking Vercel Domain Records...${NC}"
echo "A Records:"
dig +short A $DOMAIN
echo "CNAME for www:"
dig +short CNAME www.$DOMAIN

echo -e "\n${BLUE}📱 Checking Twilio Verification...${NC}"
TWILIO_TXT=$(dig +short TXT _twilio.$DOMAIN)
if [ -n "$TWILIO_TXT" ]; then
    echo -e "${GREEN}✅ Twilio TXT record found:${NC} $TWILIO_TXT"
else
    echo -e "${RED}❌ Twilio TXT record not found${NC}"
fi

echo -e "\n${BLUE}📧 Checking Email Records...${NC}"
echo "SPF Record:"
dig +short TXT $DOMAIN | grep "v=spf1"

echo "DKIM Records:"
dig +short CNAME s1._domainkey.$DOMAIN
dig +short CNAME s2._domainkey.$DOMAIN

echo "DMARC Record:"
dig +short TXT _dmarc.$DOMAIN

echo -e "\n${BLUE}🔒 Checking Security Records...${NC}"
echo "CAA Records:"
dig +short CAA $DOMAIN

echo -e "\n${BLUE}🌐 Testing Domain Accessibility...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Domain is accessible (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  Domain returned HTTP $HTTP_STATUS${NC}"
fi

echo -e "\n${BLUE}📊 SSL Certificate Check...${NC}"
SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -issuer -dates 2>/dev/null)
if [ -n "$SSL_INFO" ]; then
    echo -e "${GREEN}✅ SSL Certificate found${NC}"
    echo "$SSL_INFO"
else
    echo -e "${RED}❌ SSL Certificate not found or invalid${NC}"
fi

echo -e "\n${BLUE}🔍 Cloudflare Detection...${NC}"
CF_RAY=$(curl -s -I https://$DOMAIN | grep -i cf-ray)
if [ -n "$CF_RAY" ]; then
    echo -e "${GREEN}✅ Cloudflare detected${NC}"
    echo "$CF_RAY"
else
    echo -e "${YELLOW}⚠️  Cloudflare not detected${NC}"
fi

echo -e "\n${GREEN}🎉 DNS verification complete!${NC}"
echo "=================================================="
