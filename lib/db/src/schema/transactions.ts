import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  merchant: string;
  category: string;
  amount: number;
  date: string;
  isIncome: boolean;
  notes?: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  merchant: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  isIncome: { type: Boolean, required: true, default: false },
  notes: { type: String, required: false },
  createdAt: { type: Date, required: true, default: Date.now }
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

export const TransactionModel = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
