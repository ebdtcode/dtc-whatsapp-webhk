#!/bin/bash

# Send WhatsApp messages with images and other media

# Load environment variables
source ../utilities/load-env.sh

# Use environment variables
PHONE_NUMBER_ID="${PHONE_NUMBER_ID}"
ACCESS_TOKEN="${SYSTEM_USER_ACCESS_TOKEN}"
RECIPIENT="${1:-27823456789}"  # Can pass as argument or use default

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📸 WhatsApp Media Message Sender"
echo "================================="
echo ""

# Function to send image with caption
send_image_url() {
    local IMAGE_URL="$1"
    local CAPTION="$2"
    
    echo "Sending image from URL..."
    echo "Image: $IMAGE_URL"
    echo "Caption: $CAPTION"
    
    curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{
        \"messaging_product\": \"whatsapp\",
        \"recipient_type\": \"individual\",
        \"to\": \"${RECIPIENT}\",
        \"type\": \"image\",
        \"image\": {
          \"link\": \"${IMAGE_URL}\",
          \"caption\": \"${CAPTION}\"
        }
      }"
    echo ""
}

# Function to send document with caption
send_document() {
    local DOC_URL="$1"
    local CAPTION="$2"
    local FILENAME="$3"
    
    echo "Sending document..."
    echo "Document: $DOC_URL"
    echo "Filename: $FILENAME"
    
    curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{
        \"messaging_product\": \"whatsapp\",
        \"to\": \"${RECIPIENT}\",
        \"type\": \"document\",
        \"document\": {
          \"link\": \"${DOC_URL}\",
          \"caption\": \"${CAPTION}\",
          \"filename\": \"${FILENAME}\"
        }
      }"
    echo ""
}

# Function to send video with caption
send_video() {
    local VIDEO_URL="$1"
    local CAPTION="$2"
    
    echo "Sending video..."
    echo "Video: $VIDEO_URL"
    
    curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{
        \"messaging_product\": \"whatsapp\",
        \"to\": \"${RECIPIENT}\",
        \"type\": \"video\",
        \"video\": {
          \"link\": \"${VIDEO_URL}\",
          \"caption\": \"${CAPTION}\"
        }
      }"
    echo ""
}

# Function to send audio
send_audio() {
    local AUDIO_URL="$1"
    
    echo "Sending audio..."
    echo "Audio: $AUDIO_URL"
    
    curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{
        \"messaging_product\": \"whatsapp\",
        \"to\": \"${RECIPIENT}\",
        \"type\": \"audio\",
        \"audio\": {
          \"link\": \"${AUDIO_URL}\"
        }
      }"
    echo ""
}

# Menu for different media types
echo "Choose media type to send:"
echo "1) Image with caption"
echo "2) Document (PDF, etc.)"
echo "3) Video with caption"
echo "4) Audio"
echo "5) Test with sample image"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        read -p "Enter image URL: " img_url
        read -p "Enter caption text: " caption
        send_image_url "$img_url" "$caption"
        ;;
    2)
        read -p "Enter document URL: " doc_url
        read -p "Enter caption: " caption
        read -p "Enter filename: " filename
        send_document "$doc_url" "$caption" "$filename"
        ;;
    3)
        read -p "Enter video URL: " video_url
        read -p "Enter caption: " caption
        send_video "$video_url" "$caption"
        ;;
    4)
        read -p "Enter audio URL: " audio_url
        send_audio "$audio_url"
        ;;
    5)
        echo -e "${YELLOW}Sending test image...${NC}"
        # Using a sample image URL (replace with your own)
        send_image_url \
            "https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Test+WhatsApp+Image" \
            "🎯 Test image from DTC Webhook System\n\nThis message contains both an image and text caption.\n\nTime: $(date)"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Media message sent!${NC}"
echo "Check WhatsApp for the message"