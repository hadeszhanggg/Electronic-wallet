const moment = require('moment-timezone');
const db = require('../models'); // Import DB models hoặc thư viện tương tự
const logging=require('./logging');
// Function để kiểm tra và cập nhật sổ tiết kiệm
async function checkAndUpdatePassbooks() {
    try {
        const currentDateTime = moment().tz('Asia/Ho_Chi_Minh');

        // Lấy tất cả các sổ tiết kiệm
        const passbooks = await db.wallets_passbooks.findAll();

        // Lặp qua danh sách sổ tiết kiệm
        for (const passbook of passbooks) {
            const expireDateTime = moment(passbook.expire);

            // Kiểm tra nếu ngày hết hạn đã đến hoặc vượt qua
            if (currentDateTime.isSameOrAfter(expireDateTime)) {
                // Lấy thông tin về passbook
                const passbookData = await db.passbook.findByPk(passbook.passbookId);
                const interestRate = passbookData.interest_rate;
                const initialDeposit = passbook.amount_deposit;

                // Tính toán số tiền lãi
                const interestAmount = initialDeposit * interestRate;

                // Cập nhật số dư trong tài khoản của người dùng
                const wallet = await db.wallet.findByPk(passbook.walletId);
                const updatedBalance = wallet.account_balance + initialDeposit + interestAmount;
                await wallet.update({ account_balance: updatedBalance });

                // Xóa bản ghi sổ tiết kiệm đã hết hạn
                await passbook.destroy();
            }
        }
    } catch (error) {
        console.error('Error checking and updating passbooks:', error);
    }
}

// Function để tính thời gian còn lại đến lần kiểm tra và cập nhật tiếp theo
function timeUntilNextCheck() {
    try {
        const now = moment().tz('Asia/Ho_Chi_Minh');
        // Thời gian hàng ngày 0:00:00 (theo múi giờ VN) của ngày tiếp theo
        const nextCheckTime = moment().tz('Asia/Ho_Chi_Minh').add(1, 'days').startOf('day');
        const timeDiff = nextCheckTime.diff(now);
        return timeDiff;
    } catch (error) {
        console.error('Error calculating time until next check:', error);
    }
}

// Function để lập lịch kiểm tra và cập nhật
function scheduleCheckAndUpdate() {
    try {
        console.log('Scheduling check and update...');
        const checkInterval = timeUntilNextCheck();

        // Đảm bảo rằng hàm checkAndUpdatePassbooks được gọi liên tục
        setInterval(async () => {
            await checkAndUpdatePassbooks();
            logging.info("Check and update completed for today ");
            console.log('Check and update completed for today.');
        }, checkInterval);
    } catch (error) {
        console.error('Error scheduling check and update:', error);
    }
}

module.exports = { scheduleCheckAndUpdate };
