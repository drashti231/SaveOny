import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  title: string;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  title: { type: String, required: true },
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

export const ConversationModel = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationSchema);
