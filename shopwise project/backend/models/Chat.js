import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: false,
  },
  productId: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: false,
  },
  quickReplies: {
    type: [String], // ✅ Array of strings
    default: [],
  },
  products: {
    type: [mongoose.Schema.Types.Mixed], // ✅ Array of any objects
    default: [],
  },
}, { _id: false }); // ✅ Don't create _id for subdocuments

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot', 'agent'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: metadataSchema, // ✅ Use the schema
    default: {},
  },
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: ['active', 'closed', 'waiting_agent'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;