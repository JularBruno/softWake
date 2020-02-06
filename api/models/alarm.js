import mongoose, { Schema } from 'mongoose'

const alarmSchema = new Schema({
	id: {type: String},
    time: {type: String},
    days: [{type: String}],
    active: { type: Boolean, default: false },
    // setting:{ type: Schema.Types.ObjectId, ref: 'setting' },
    setting:  {type: String},
})
alarmSchema.plugin(require('meanie-mongoose-to-json'));

export default mongoose.model('alarm', alarmSchema);
