const admin = require('firebase-admin');
const serviceAccount = require('./e-wallet-8e979-e85f7d100004.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function sendNotification(title, body, token) {
    const message = {
        notification: {
            title: title,
            body: body
        },
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error };
    }
}

module.exports = {
    sendNotification,
};
