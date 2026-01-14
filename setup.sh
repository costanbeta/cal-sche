#!/bin/bash

# SchedulePro Setup Script
# This script automates the initial setup process

set -e

echo "🚀 SchedulePro Setup Script"
echo "============================"
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20 or higher is required. You have Node.js $(node -v)"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"
echo ""

# Check PostgreSQL
echo "🐘 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install it:"
    echo "   macOS: brew install postgresql@15"
    echo "   Ubuntu: sudo apt install postgresql"
    exit 1
fi
echo "✅ PostgreSQL detected"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://schedulepro:password@localhost:5432/scheduling_mvp?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Google Calendar (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""

# App Config
APP_URL="http://localhost:3000"
APP_NAME="SchedulePro"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
    
    # Generate NEXTAUTH_SECRET
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 32)
        sed -i.bak "s/NEXTAUTH_SECRET=\"\"/NEXTAUTH_SECRET=\"$SECRET\"/" .env
        rm .env.bak 2>/dev/null || true
        echo "✅ .env file created with generated secret"
    else
        echo "✅ .env file created (please generate NEXTAUTH_SECRET manually)"
    fi
else
    echo "ℹ️  .env file already exists, skipping..."
fi
echo ""

# Setup database
echo "🗄️  Setting up database..."
read -p "Do you want to create the database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter PostgreSQL username (default: postgres): " PG_USER
    PG_USER=${PG_USER:-postgres}
    
    createdb -U $PG_USER scheduling_mvp 2>/dev/null || echo "Database might already exist"
    
    echo "✅ Database created"
fi
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Push schema to database
echo "📊 Pushing schema to database..."
read -p "Do you want to push the schema to the database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push
    echo "✅ Schema pushed to database"
fi
echo ""

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your email credentials"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:3000"
echo "4. Sign up and create your first event type!"
echo ""
echo "📚 Read SETUP.md for detailed instructions"
echo ""
echo "Happy scheduling! 🎉"
