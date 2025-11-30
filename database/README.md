# Database Management Guide

## Prerequisites
- MySQL 8.0+ installed
- MySQL running on localhost:3306

## Setup Steps

### 1. Create Database
```bash
# Login to MySQL
mysql -u root -p

# Run setup script
source database/setup.sql
```

### 2. Auto Setup (Recommended)
```bash
# This will create tables automatically
npm run db:sync
```

### 3. Manual Setup (Optional)
```bash
# If you want to create tables manually
mysql -u root -p paybridge < database/schema.sql
```

### 4. Add Sample Data (Optional)
```bash
mysql -u root -p paybridge < database/seed.sql
```

## Database Configuration

Update `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paybridge
DB_USER=root
DB_PASSWORD=your_mysql_password
```

## Management Commands

### Check Database Connection
```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'paybridge';"
```

### View Tables
```bash
mysql -u root -p paybridge -e "SHOW TABLES;"
```

### View Table Structure
```bash
mysql -u root -p paybridge -e "DESCRIBE merchants;"
mysql -u root -p paybridge -e "DESCRIBE payments;"
mysql -u root -p paybridge -e "DESCRIBE refunds;"
```

### Backup Database
```bash
mysqldump -u root -p paybridge > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u root -p paybridge < backup_20241201.sql
```

### Reset Database
```bash
mysql -u root -p -e "DROP DATABASE paybridge;"
mysql -u root -p < database/setup.sql
npm run db:sync
```

## Troubleshooting

### Connection Issues
1. Check MySQL is running: `systemctl status mysql`
2. Check port: `netstat -tlnp | grep :3306`
3. Check credentials in `.env`

### Permission Issues
```sql
GRANT ALL PRIVILEGES ON paybridge.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Character Set Issues
```sql
ALTER DATABASE paybridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```