const express = require('express');
const bodyParser = require('body-parser');
const { spawn, execSync } = require('child_process');

const app = express();
app.use(bodyParser.json()); 
app.use(express.static('.'));

const DB_CONFIG = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'password123',
    database: process.env.DB_NAME || 'fcode_db',
};

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

// ============================================================
// --- PHẦN MỚI: GADGET CHAIN & PROTOTYPE POLLUTION SETUP ---
// ============================================================

// 1. Gadget Map (Các chức năng có sẵn trong hệ thống)
const gadgetMap = {
    "ConfigGadget": (obj) => {
        // [LỖI] Nếu prototype bị ô nhiễm, 'shell' sẽ được lấy từ đó
        const shell = obj.shell || "/bin/false"; 
        console.log(`[CONFIG]: Using shell: ${shell}`);
        return shell;
    }
};

// 2. Hàm Merge gây lỗi (Source of Vulnerability)
function flightDeepMerge(target, source) {
    for (let key in source) {
        if (key === '__proto__'){
            console.log("[WARNING] Prototype Pollution detected!");
            Object.assign(Object.prototype, source[key]); 
        } 
        else if(typeof source[key] === 'object'){
            target[key] = target[key] || {};
            flightDeepMerge(target[key], source[key]);
        }
        else    target[key] = source[key];
    }
}

app.post('/gadget', (req, res) => {
    try {
        const incomingPayload = req.body;
        let internalState = {};

        console.log("--- Bắt đầu xử lý Gadget Chain ---");

        flightDeepMerge(internalState, incomingPayload);

        const currentShell = gadgetMap["ConfigGadget"](internalState);

        if(internalState.execute){
            console.log(`[SINK] Đang thực thi: ${currentShell} -e ...`);
            
            // Thực thi lệnh nguy hiểm
            // command dạng: node -e "lệnh_của_hacker"
            const output = execSync(`${currentShell} -e "${internalState.args}"`);
            
            res.json({ 
                status: "pwned", 
                output: output.toString(),
                message: "RCE thành công!" 
            });
        }
        else  res.json({ status: "safe", message: "Không có lệnh thực thi nào." });

    }
    catch(e){
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/login', (req, res) => {
    try {
        const {username,passwordHex} = req.body;
        
        // 1. Decode password gốc
        const rawPassword = Buffer.from(passwordHex, 'hex').toString('binary');

        const safePassword = vulnerableEscape(rawPassword);
        let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${safePassword}';`;
        
        console.log("---------------------------------------------------");
        console.log("SQL thực thi:", sql);

        // 2. Gọi psql
        const psql = spawn('psql',[
            '-h', DB_CONFIG.host,
            '-U', DB_CONFIG.user,
            '-d', DB_CONFIG.database
        ],{env:{
            ...process.env,
            PGPASSWORD: DB_CONFIG.password
            }
        });

        let outputData = "";
        let errorData = "";

        psql.stdout.on('data', (data) => {
            outputData += data.toString(); 
        });
        psql.stderr.on('data', (data) => {
            errorData += data.toString();
        });

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

    }catch(err){
        console.error("Lỗi:", err);
        res.json({ success: false, error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));