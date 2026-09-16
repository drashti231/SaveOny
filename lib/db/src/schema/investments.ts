import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestment extends Document {
  ticker: string;
  name: string;
  value: number;
  allocationPercent: number;
  dayChangePercent: number;
  createdAt: Date;
}

const investmentSchema = new Schema<IInvestment>({
  ticker: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  allocationPercent: { type: Number, required: true },
  dayChangePercent: { type: Number, required: true, default: 0 },
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

export const InvestmentModel = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', investmentSchema);
