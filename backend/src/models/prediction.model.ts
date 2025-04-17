import mongoose, { Document, Schema } from 'mongoose';

// Prediction document interface
export interface IPrediction extends Document {
  userId: mongoose.Types.ObjectId;
  originalSequence: string;
  predictedSequence: string;
  editCount: number;
  editPositions: number[];
  explanations: {
    text: string;
    timestamp: Date;
  }[];
  visualizations: {
    imageUrl: string;
    type: 'sequence' | 'diagram';
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Prediction schema
const predictionSchema = new Schema<IPrediction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalSequence: {
      type: String,
      required: true,
    },
    predictedSequence: {
      type: String,
      required: true,
    },
    editCount: {
      type: Number,
      required: true,
    },
    editPositions: {
      type: [Number],
      default: [],
    },
    explanations: {
      type: [{
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      }],
      default: [],
    },
    visualizations: {
      type: [{
        imageUrl: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['sequence', 'diagram'],
          default: 'sequence',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

// Add indexes for faster lookups
predictionSchema.index({ userId: 1 });
predictionSchema.index({ createdAt: -1 });

// Create and export Prediction model
const Prediction = mongoose.model<IPrediction>('Prediction', predictionSchema);
export default Prediction; 