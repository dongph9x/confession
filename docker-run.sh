#!/bin/bash

# Script để chạy Confession Bot với Docker

set -e

echo "🐳 Confession Bot Docker Setup"
echo "================================"

# Kiểm tra Docker và Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker không được cài đặt. Vui lòng cài đặt Docker trước."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose không được cài đặt. Vui lòng cài đặt Docker Compose trước."
    exit 1
fi

# Kiểm tra file .env
if [ ! -f .env ]; then
    echo "❌ File .env không tồn tại."
    echo "🔧 Creating .env file from template..."
    node setup-env.js
    echo "📝 Please edit the .env file with your actual values and run this script again."
    exit 1
fi

# Validate environment variables
echo "🔍 Validating environment variables..."
node validate-env.js
if [ $? -ne 0 ]; then
    echo "❌ Environment validation failed. Please fix the errors above."
    exit 1
fi

# Tạo thư mục logs nếu chưa có
mkdir -p logs
mkdir -p src/logs

echo "✅ Kiểm tra môi trường hoàn tất"

# Menu lựa chọn
echo ""
echo "Chọn hành động:"
echo "1) 🚀 Chạy bot với MongoDB"
echo "2) 🛑 Dừng tất cả services"
echo "3) 🔄 Restart bot"
echo "4) 📊 Xem logs"
echo "5) 🧹 Xóa tất cả containers và volumes"
echo "6) 🔧 Build lại image"
echo "7) 📋 Xem status của services"

read -p "Nhập lựa chọn (1-7): " choice

case $choice in
    1)
        echo "🚀 Khởi động bot với MongoDB..."
        docker-compose up -d
        echo "✅ Bot đã được khởi động!"
        echo "📊 Xem logs: docker-compose logs -f bot"
        ;;
    2)
        echo "🛑 Dừng tất cả services..."
        docker-compose down
        echo "✅ Đã dừng tất cả services!"
        ;;
    3)
        echo "🔄 Restart bot..."
        docker-compose restart bot
        echo "✅ Bot đã được restart!"
        ;;
    4)
        echo "📊 Hiển thị logs..."
        docker-compose logs -f
        ;;
    5)
        echo "🧹 Xóa tất cả containers và volumes..."
        read -p "Bạn có chắc chắn muốn xóa tất cả? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            docker-compose down -v
            docker system prune -f
            echo "✅ Đã xóa tất cả containers và volumes!"
        else
            echo "❌ Hủy bỏ."
        fi
        ;;
    6)
        echo "🔧 Build lại image..."
        docker-compose build --no-cache
        echo "✅ Image đã được build lại!"
        ;;
    7)
        echo "📋 Status của services:"
        docker-compose ps
        ;;
    *)
        echo "❌ Lựa chọn không hợp lệ!"
        exit 1
        ;;
esac

echo ""
echo "📚 Hướng dẫn sử dụng:"
echo "- Xem logs: docker-compose logs -f [service_name]"
echo "- Vào container: docker-compose exec bot sh"
echo "- Dừng services: docker-compose down"
echo "- Restart service: docker-compose restart [service_name]" 