import mongoose, { Schema } from 'mongoose'

const subscriptionSchema = new Schema({
	id: {type: String},
	timestamp: {type: Date, default: Date.now},
	user:{ type: Schema.Types.ObjectId, ref: 'user' },
	timestampUpdate: {type: Date, default: Date.now},
})
subscriptionSchema.plugin(require('meanie-mongoose-to-json'));

export default mongoose.model('subscription', subscriptionSchema);
