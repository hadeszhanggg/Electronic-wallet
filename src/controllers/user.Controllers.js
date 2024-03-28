const logging = require('../middleware/logging');
const db = require("../models");
const jwt = require("jsonwebtoken");
// Controller để xử lý sự kiện "welcomeMessage" cho socket.io
exports.handleWelcomeMessage=async(req,res)=> {
    console.log('Received welcome message:', message);
};

// Function to get all bills of a user based on accessToken
exports.getAllBillsByAccessToken = async (req, res) => {
    try {
      const userId = req.userId;
      // Find walletId corresponding to userId
      const userWallet = await db.wallet.findOne({ where: { userId: userId } });
      
      if (!userWallet) {
        return res.status(404).send({ message: "User wallet not found" });
      }
  
      const walletId = userWallet.id;
  
      // Find all bills associated with the user's walletId
      const bills = await db.bill.findAll({ where: { walletId: walletId } });
  
      return res.status(200).json(bills);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };


