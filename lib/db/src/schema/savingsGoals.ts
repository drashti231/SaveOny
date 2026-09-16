import mongoose, { Document, Schema } from 'mongoose';

export interface ISavingsGoal extends Document {
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: Date;
}

const savingsGoalSchema = new Schema<ISavingsGoal>({
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, required: true, default: 0 },
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

export const SavingsGoalModel = mongoose.models.SavingsGoal || mongoose.model<ISavingsGoal>('SavingsGoal', savingsGoalSchema);
