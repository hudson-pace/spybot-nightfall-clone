const { model, Schema } = require('mongoose');

const saveSchema = new Schema({
  name: String,
});
module.exports = model('Save', saveSchema);
