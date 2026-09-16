import mongoose, { Document, Schema } from 'mongoose';

export interface IBill extends Document {
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const billSchema = new Schema<IBill>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: String, required: true },
  isPaid: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
}, {
  timestamps: false,
  toJSON: {
    transform: function (doc, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const BillModel = mongoose.models.Bill || mongoose.model<IBill>('Bill', billSchema);
