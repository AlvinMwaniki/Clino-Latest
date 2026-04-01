const axios = require('axios');
const sql = require('mssql');

// ?? HELPERS ???????????????????????????????????????????????????????????????????
const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const getOAuthToken = async () => {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  return response.data.access_token;
};

// ?? STK PUSH (initiate payment prompt on customer phone) ??????????????????????
const initiateSTKPush = async (req, res) => {
  const { billing_id, phone_number, amount } = req.body;

  if (!billing_id || !phone_number || !amount) {
    return res.status(400).json({ message: 'billing_id, phone_number, and amount are required.' });
  }

  // Format phone: 0712345678 ? 254712345678
  const formattedPhone = phone_number.replace(/^0/, '254').replace(/^\+/, '');

  try {
    const token = await getOAuthToken();
    const timestamp = getTimestamp();
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount), // M-Pesa requires integer
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.BACKEND_URL}/api/mpesa/callback`,
        AccountReference: `BILL-${billing_id}`,
        TransactionDesc: `MediSoft Hospital Bill #${billing_id}`
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { CheckoutRequestID, ResponseCode, ResponseDescription } = stkResponse.data;

    if (ResponseCode !== '0') {
      return res.status(400).json({ message: ResponseDescription });
    }

    // Save pending transaction to DB
    const request = new sql.Request();
    request.input('billing_id', sql.Int, billing_id);
    request.input('checkout_request_id', sql.VarChar(100), CheckoutRequestID);
    request.input('phone_number', sql.VarChar(20), formattedPhone);
    request.input('amount', sql.Decimal(10, 2), amount);

    await request.query(`
      INSERT INTO MpesaTransactions (billing_id, checkout_request_id, phone_number, amount, status, created_at)
      VALUES (@billing_id, @checkout_request_id, @phone_number, @amount, 'Pending', GETDATE())
    `);

    res.json({
      message: 'STK Push sent. Waiting for customer to confirm payment.',
      checkout_request_id: CheckoutRequestID
    });
  } catch (err) {
    console.error('M-Pesa STK error:', err.response?.data || err.message);
    res.status(500).json({ message: 'M-Pesa request failed', error: err.response?.data || err.message });
  }
};

// ?? STK CALLBACK (Safaricom calls this URL after payment) ?????????????????????
const mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = stkCallback;

    const request = new sql.Request();
    request.input('checkout_request_id', sql.VarChar(100), CheckoutRequestID);

    if (ResultCode === 0) {
      // Payment successful — extract metadata
      const items = CallbackMetadata.Item;
      const getMeta = (name) => items.find(i => i.Name === name)?.Value;

      const mpesa_receipt = getMeta('MpesaReceiptNumber');
      const amount = getMeta('Amount');
      const phone = getMeta('PhoneNumber');

      request.input('mpesa_receipt', sql.VarChar(50), mpesa_receipt);
      request.input('amount', sql.Decimal(10, 2), amount);

      await request.query(`
        UPDATE MpesaTransactions
        SET status = 'Completed', mpesa_receipt = @mpesa_receipt, completed_at = GETDATE()
        WHERE checkout_request_id = @checkout_request_id
      `);

      // Update billing record
      await request.query(`
        UPDATE Billing
        SET payment_status = 'Paid',
            payment_method = 'M-Pesa',
            mpesa_receipt  = @mpesa_receipt,
            paid_at        = GETDATE()
        WHERE billing_id = (
          SELECT billing_id FROM MpesaTransactions
          WHERE checkout_request_id = @checkout_request_id
        )
      `);
    } else {
      // Payment failed or cancelled
      await request.query(`
        UPDATE MpesaTransactions
        SET status = 'Failed'
        WHERE checkout_request_id = @checkout_request_id
      `);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // Always return 0 to Safaricom
  }
};

// ?? CHECK PAYMENT STATUS ??????????????????????????????????????????????????????
const checkPaymentStatus = async (req, res) => {
  const { checkoutRequestId } = req.params;
  try {
    const request = new sql.Request();
    request.input('id', sql.VarChar(100), checkoutRequestId);
    const result = await request.query(`
      SELECT status, mpesa_receipt, amount, completed_at
      FROM MpesaTransactions
      WHERE checkout_request_id = @id
    `);
    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error checking status', error: err.message });
  }
};

module.exports = { initiateSTKPush, mpesaCallback, checkPaymentStatus };