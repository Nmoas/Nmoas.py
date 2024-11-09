const ping = require('node-net-ping');
const pcap = require('pcap');
const fs = require('fs');
const net = require('net');

// وظيفة لاكتشاف الأجهزة على الشبكة
function discoverDevices(networkRange) {
    const session = ping.createSession();
    const devices = [];

    for (let i = 1; i < 255; i++) {
        const ip = `${networkRange}.${i}`;
        session.pingHost(ip, (error, target) => {
            if (!error) {
                devices.push(target);
                console.log(`جهاز موجود: ${target}`);
            }
        });
    }
}

// وظيفة لمراقبة حركة الشبكة
function monitorTraffic() {
    const pcapSession = pcap.createSession('en0', 'ip');

    pcapSession.on('packet', (rawPacket) => {
        const packet = pcap.decode.packet(rawPacket);
        const ip = packet.payload.payload;

        if (ip) {
            const ipSrc = ip.saddr;
            const ipDst = ip.daddr;
            console.log(`حركة الشبكة: ${ipSrc} -> ${ipDst}`);
        }
    });
}

// وظيفة لفحص المنافذ
function portScanner(targetIp, ports) {
    ports.forEach(port => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on('connect', () => {
            console.log(`المنفذ ${port} مفتوح`);
            socket.destroy();
        }).on('timeout', () => {
            socket.destroy();
        }).on('error', () => {
            socket.destroy();
        }).connect(port, targetIp);
    });
}

// وظيفة لإنشاء قائمة مرور
function createPasswordList() {
    const commonPasswords = ['123456', 'password', '123456789', '12345678', '12345'];
    fs.writeFileSync('password_list.txt', commonPasswords.join('\n'));
    console.log("تم إنشاء قائمة المرور.");
}

// تنفيذ الوظائف
const networkRange = "192.168.1"; // نطاق الشبكة
console.log("بدء اكتشاف الأجهزة...");
discoverDevices(networkRange);

console.log("\nبدء مراقبة حركة الشبكة...");
monitorTraffic();

const targetIp = "192.168.1.1"; // عنوان IP المستهدف
const portsToScan = Array.from({ length: 1024 }, (_, i) => i + 1); // فحص المنافذ من 1 إلى 1024
console.log("\nبدء فحص المنافذ...");
portScanner(targetIp, portsToScan);

createPasswordList();