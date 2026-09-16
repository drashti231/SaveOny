import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: string;
  category: string;
  monthlyLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>({
  userId: { type: String, required: true },
  category: { type: String, required: true },
  monthlyLimit: { type: Number, required: true },
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

export const BudgetModel = mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);
