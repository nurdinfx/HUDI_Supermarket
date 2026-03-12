import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Assigned', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Assigned' 
  },
  pickupTime: { type: Date },
  deliveryTime: { type: Date },
  deliveryLocation: {
    lat: Number,
    lng: Number
  },
  notes: { type: String }
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
