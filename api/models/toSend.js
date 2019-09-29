// schema just in case

import mongoose, { Schema } from 'mongoose'

const toSendSchema = new Schema({
	id: {type: String},
    alarm:{ type: Schema.Types.ObjectId, ref: 'alarm' },
    timer:{ type: Schema.Types.ObjectId, ref: 'timer' },
})

toSendSchema.plugin(require('meanie-mongoose-to-json'));

export default mongoose.model('toSend', toSendSchema);
