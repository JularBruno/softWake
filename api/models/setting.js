import mongoose, { Schema } from 'mongoose'

const settingSchema = new Schema({
	id: {type: String},
	vTime: {type: String},
	vIntensity: {type: String},
	vVariation: {type: String},
})
settingSchema.plugin(require('meanie-mongoose-to-json'));

export default mongoose.model('setting', settingSchema);
