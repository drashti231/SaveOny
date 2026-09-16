import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  role: string;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, ref: 'Conversation' },
  role: { type: String, required: true },
  content: { type: String, required: true },
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

export const MessageModel = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);
