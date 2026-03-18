import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['COD', 'Mobile Money', 'Crypto', 'Stripe', 'PayPal'], required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  transactionId: { type: String },
  phoneNumber: { type: String },
  screenshotUrl: { type: String },
  transactionReference: { type: String },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
