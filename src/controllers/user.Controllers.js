// Controller để xử lý sự kiện "welcomeMessage"
function handleWelcomeMessage(message) {
    console.log('Received welcome message:', message);
}

// Export controller để có thể sử dụng ở nơi khác trong ứng dụng
module.exports = {
    handleWelcomeMessage: handleWelcomeMessage
};
