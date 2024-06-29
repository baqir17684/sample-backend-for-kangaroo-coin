import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const AdminSchema = new Schema({
  email: { type: String, required: true, unique: true, max: 100 },
  name: { type: String, required: true, max:100 },
  password: { type: String, required: true, max: 100 },
  store: { type: Object, required: false, default: {} },
  sessionActive: { type: Boolean, required: false, default: false },
});

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;