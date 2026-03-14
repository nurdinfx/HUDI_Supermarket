import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      size: { type: String, required: true },
      color: { type: String, required: true }
    }
  ],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String }
  },
  paymentMethod: { type: String, required: true },
  paymentProofImage: { type: String },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Pending Verification', 'Confirmed', 'Rejected'], 
    default: 'Pending' 
  },
  rejectionNote: { type: String },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  status: { 
    type: String, 
    enum: ['Order placed', 'Pending Payment', 'Pending Verification', 'Confirmed', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled'], 
    default: 'Order placed' 
  },
  deliveredAt: { type: Date },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // The assigned delivery rider
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
