import mongoose from 'mongoose';

const budgetPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Optional, for guests
  eventType: { type: String, required: true },
  guestCount: { type: Number, required: true },
  totalBudget: { type: Number, required: true },
  breakdown: [
    {
      category: String,
      allocatedAmount: Number,
      percentage: Number,
      tips: String
    }
  ]
}, { timestamps: true });

const BudgetPlan = mongoose.model('BudgetPlan', budgetPlanSchema);
export default BudgetPlan;
