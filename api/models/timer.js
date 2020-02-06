import mongoose, { Schema } from 'mongoose'

const timerSchema = new Schema({
	id: {type: String},
    time: {type: String},
    active: { type: Boolean, default: false },
    setting:  {type: String},
})

timerSchema.plugin(require('meanie-mongoose-to-json'));

export default mongoose.model('timer', timerSchema);
