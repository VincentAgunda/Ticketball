const express = require("express");
const router = express.Router();
const {
  initiateSTKPush,
  handleCallback,
  checkPaymentStatus,
} = require("../controllers/mpesaController");

// ⚠️ Removed auth → allows both guest & logged-in
router.post("/stk-push", initiateSTKPush);
router.post("/callback", handleCallback);
router.get("/check-payment", checkPaymentStatus);

module.exports = router;
