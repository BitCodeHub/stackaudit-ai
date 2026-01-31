# Troubleshooting Guide

Solutions for common issues with StackAudit.ai.

---

## Quick Diagnostics

Before diving into specific issues, run these checks:

```bash
# 1. Check if server is running
curl http://localhost:3001/health

# 2. Check Node.js version (need 18+)
node --version

# 3. Check port availability
lsof -i :3001

# 4. Check reports directory
ls -la reports/
```

---

## Installation Issues

### Problem: "npm install" fails

**Symptoms:**
```
npm ERR! code EACCES
npm ERR! syscall mkdir
```

**Solutions:**

1. **Fix npm permissions:**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```

2. **Use a node version manager:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Problem: "Cannot find module" errors

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Check you're in the right directory:**
   ```bash
   cd stackaudit/server
   npm install
   ```

3. **Verify package.json exists:**
   ```bash
   cat package.json
   ```

---

### Problem: Node.js version too old

**Symptoms:**
```
SyntaxError: Unexpected token '?'
```

**Solution:**
```bash
# Check version
node --version

# If below 18, upgrade:
# macOS
brew upgrade node

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm
nvm install 20
nvm use 20
```

---

## Server Startup Issues

### Problem: Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**

1. **Find and kill the process:**
   ```bash
   # Find process using port
   lsof -i :3001
   
   # Kill it
   kill -9 <PID>
   ```

2. **Use a different port:**
   ```bash
   PORT=3002 npm start
   ```

3. **Check for zombie processes:**
   ```bash
   pkill -f "node.*stackaudit"
   ```

---

### Problem: Server crashes on startup

**Symptoms:**
```
Server crashes immediately with no error
```

**Solutions:**

1. **Check logs:**
   ```bash
   npm start 2>&1 | tee startup.log
   ```

2. **Run in debug mode:**
   ```bash
   DEBUG=* npm start
   ```

3. **Check memory:**
   ```bash
   free -m  # Linux
   vm_stat  # macOS
   ```

4. **Increase Node memory:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

---

### Problem: CORS errors in browser

**Symptoms:**
```
Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solutions:**

1. **Check CORS is enabled (it is by default):**
   ```javascript
   // In index.js, verify:
   app.use(cors());
   ```

2. **For specific origins:**
   ```javascript
   app.use(cors({
     origin: ['http://localhost:3000', 'https://yourapp.com']
   }));
   ```

3. **Set CORS_ORIGIN environment variable:**
   ```bash
   CORS_ORIGIN=http://localhost:3000 npm start
   ```

---

## API Request Issues

### Problem: "clientName is required" error

**Symptoms:**
```json
{"error": "clientName is required"}
```

**Solution:**

Ensure your JSON includes `clientName`:

```bash
# ✅ Correct
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"clientName": "My Company"}'

# ❌ Wrong (missing clientName)
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"currentStack": []}'
```

---

### Problem: Request body is empty

**Symptoms:**
```
TypeError: Cannot read property 'clientName' of undefined
```

**Solutions:**

1. **Add Content-Type header:**
   ```bash
   curl -X POST http://localhost:3001/api/reports/generate \
     -H "Content-Type: application/json" \  # ← Required!
     -d '{"clientName": "Test"}'
   ```

2. **Check JSON is valid:**
   ```bash
   echo '{"clientName": "Test"}' | jq .
   ```

3. **Escape special characters:**
   ```bash
   # Windows CMD
   curl -X POST http://localhost:3001/api/reports/generate ^
     -H "Content-Type: application/json" ^
     -d "{\"clientName\": \"Test\"}"
   ```

---

### Problem: 413 Payload Too Large

**Symptoms:**
```json
{"error": "Payload Too Large"}
```

**Solutions:**

1. **Increase limit in config:**
   ```javascript
   // In index.js
   app.use(express.json({ limit: '50mb' }));
   ```

2. **Reduce payload size:**
   - Remove unnecessary fields
   - Paginate large tool lists
   - Compress images

---

### Problem: Request timeout

**Symptoms:**
```
ETIMEDOUT or ESOCKETTIMEDOUT
```

**Solutions:**

1. **Increase client timeout:**
   ```javascript
   fetch(url, { timeout: 60000 });  // 60 seconds
   ```

2. **Check server isn't overloaded:**
   ```bash
   top -p $(pgrep -f "node.*stackaudit")
   ```

3. **Use async generation for large reports:**
   ```bash
   curl -X POST http://localhost:3001/api/reports/generate-async \
     -H "Content-Type: application/json" \
     -d '{"clientName": "Large Corp", "async": true}'
   ```

---

## Report Generation Issues

### Problem: PDF fails to generate

**Symptoms:**
```
Error: Failed to generate report
```

**Solutions:**

1. **Check reports directory exists:**
   ```bash
   mkdir -p reports
   chmod 755 reports
   ```

2. **Check disk space:**
   ```bash
   df -h
   ```

3. **Check memory for large reports:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

4. **Check dependencies:**
   ```bash
   npm ls pdfkit
   ```

---

### Problem: Report is empty or corrupted

**Symptoms:**
- PDF opens but is blank
- PDF won't open at all

**Solutions:**

1. **Verify input data:**
   ```bash
   curl http://localhost:3001/api/templates/validate \
     -H "Content-Type: application/json" \
     -d '{"auditData": {"clientName": "Test"}}'
   ```

2. **Check server logs:**
   ```bash
   npm start 2>&1 | grep -i error
   ```

3. **Try sample data:**
   ```bash
   # Get sample data
   curl http://localhost:3001/api/sample-data > sample.json
   
   # Generate with sample
   curl -X POST http://localhost:3001/api/reports/generate \
     -H "Content-Type: application/json" \
     -d @sample.json
   ```

---

### Problem: Can't download report

**Symptoms:**
```
404 Not Found: Report not found
```

**Solutions:**

1. **Check file exists:**
   ```bash
   ls -la reports/
   ```

2. **Verify filename matches:**
   ```bash
   # Use exact filename from generate response
   curl -O http://localhost:3001/reports/EXACT_FILENAME.pdf
   ```

3. **Check static file serving:**
   ```javascript
   // Ensure this line exists in index.js:
   app.use('/reports', express.static(path.join(__dirname, 'reports')));
   ```

---

## Performance Issues

### Problem: Server is slow

**Solutions:**

1. **Profile the server:**
   ```bash
   node --prof index.js
   # Generate report, then:
   node --prof-process isolate-*.log > profile.txt
   ```

2. **Add caching:**
   ```javascript
   // Cache template data
   const cache = new Map();
   ```

3. **Optimize for production:**
   ```bash
   NODE_ENV=production npm start
   ```

4. **Use clustering:**
   ```bash
   # pm2 with clustering
   pm2 start index.js -i max
   ```

---

### Problem: High memory usage

**Solutions:**

1. **Monitor memory:**
   ```bash
   node --expose-gc index.js
   ```

2. **Stream large files:**
   ```javascript
   // Instead of loading entire file
   res.download(filePath);
   ```

3. **Clean up old reports:**
   ```bash
   find reports/ -mtime +7 -delete
   ```

---

## Docker Issues

### Problem: Container won't start

**Solutions:**

1. **Check logs:**
   ```bash
   docker logs stackaudit
   ```

2. **Run interactively:**
   ```bash
   docker run -it --rm stackaudit/stackaudit:latest sh
   ```

3. **Check port mapping:**
   ```bash
   docker ps -a
   docker port stackaudit
   ```

---

### Problem: Volume permissions

**Symptoms:**
```
EACCES: permission denied, mkdir '/app/reports'
```

**Solutions:**

1. **Fix ownership:**
   ```bash
   sudo chown -R 1000:1000 ./reports
   ```

2. **Run as root (not recommended for production):**
   ```bash
   docker run --user root ...
   ```

3. **Create volume with correct permissions:**
   ```bash
   docker volume create --opt type=tmpfs --opt o=uid=1000 stackaudit-reports
   ```

---

## Getting More Help

### Enable Debug Logging

```bash
DEBUG=stackaudit:* npm start
```

### Collect Diagnostic Info

```bash
# Save this output for support
echo "=== System Info ===" > diagnostics.txt
uname -a >> diagnostics.txt
node --version >> diagnostics.txt
npm --version >> diagnostics.txt
echo "=== npm ls ===" >> diagnostics.txt
npm ls >> diagnostics.txt 2>&1
echo "=== Disk Space ===" >> diagnostics.txt
df -h >> diagnostics.txt
echo "=== Memory ===" >> diagnostics.txt
free -m >> diagnostics.txt 2>/dev/null || vm_stat >> diagnostics.txt
```

### Contact Support

- **Email**: support@stackaudit.ai
- **GitHub Issues**: [github.com/stackaudit/issues](https://github.com/stackaudit/stackaudit/issues)
- **Discord**: discord.gg/stackaudit

Include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Error messages (full text)
4. Diagnostic output

---

*Problem not listed? Check [FAQ](./faq.md) or contact support.*
