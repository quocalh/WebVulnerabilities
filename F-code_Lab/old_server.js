const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

const app = express();
app.use(bodyParser.json()); 
app.use(express.static('.'));

const DB_CONFIG = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'password123',
    database: process.env.DB_NAME || 'fcode_db',
};

// --- HÀM MÔ PHỎNG CVE-2025-1094 ---
function vulnerableEscape(inputString) {
    const buf = Buffer.from(inputString, 'binary');
    let has_er = false;
    let result = "";

    for(let i = 0; i < buf.length; i++){
        const byte = buf[i];
        if(byte === 0xBF){
            result += buf.toString('binary', i, i + 1);
            has_er = true;
            if (i + 1 < buf.length) {
                result += buf.toString('binary', i + 1, i + 2);
                i++;
            }
        }
        else if(has_er === false && String.fromCharCode(byte) === "'") result += "''"; 
        else result += String.fromCharCode(byte);
    }
    return result;
}

app.post('/login', (req, res) => {
    try {
        const { username, passwordHex } = req.body;
        
        // 1. Decode password gốc
        const rawPassword = Buffer.from(passwordHex, 'hex').toString('binary');
        
        // 2. Tìm ký tự [BAD] (0xBF)
        const badByteStr = Buffer.from([0xBF]).toString('binary');
        const badIndex = rawPassword.indexOf(badByteStr);
        
        let sql = "";

        if (badIndex !== -1) {
            // === TRƯỜNG HỢP CÓ [BAD] ===
            // Logic mới: Tách password thành 2 phần ngay tại vị trí [BAD]
            
            // Phần 1: Trước [BAD] (Ví dụ: "123456") -> Cho vào SQL hợp lệ
            const prefix = rawPassword.substring(0, badIndex);
            
            // Phần 2: Từ [BAD] trở đi (Ví dụ: "[BAD] \! ls...") -> Để ra ngoài làm lệnh mới
            const suffix = rawPassword.substring(badIndex);

            // Escape cả 2 phần (để giữ đúng tính chất lỗ hổng)
            const safePrefix = vulnerableEscape(prefix); // "123456"
            const safeSuffix = vulnerableEscape(suffix); // "¿ \! ls..."

            // Cấu trúc chuẩn:
            // ... password = 'PHẦN_TRƯỚC'; PHẦN_SAU;
            sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${safePrefix}'; ${safeSuffix};`;
            
            console.log("---------------------------------------------------");
            console.log(`Kiểu Input: 🔥 MALICIOUS ([BAD] detected at index ${badIndex})`);
        
        } else {
            // === TRƯỜNG HỢP BÌNH THƯỜNG ===
            const safePassword = vulnerableEscape(rawPassword);
            sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${safePassword}';`;
            
            console.log("---------------------------------------------------");
            console.log("Kiểu Input: ✅ NORMAL");
        }
        
        console.log("SQL thực thi:", sql);

        // 3. Gọi psql
        const psql = spawn('psql', [
            '-h', DB_CONFIG.host,
            '-U', DB_CONFIG.user,
            '-d', DB_CONFIG.database
        ], {
            env: { ...process.env, PGPASSWORD: DB_CONFIG.password }
        });

        let outputData = "";
        let errorData = "";

        psql.stdout.on('data', (data) => { outputData += data.toString(); });
        psql.stderr.on('data', (data) => { errorData += data.toString(); });

        psql.stdin.write(sql);
        psql.stdin.end();

        psql.on('close', (code) => {
            res.json({ 
                success: code === 0, 
                data: outputData, 
                sql: sql,
                raw_error: errorData
            });
        });

    } catch(err){
        console.error("Lỗi:", err);
        res.json({ success: false, error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));