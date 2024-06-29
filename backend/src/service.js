import fs from 'fs';
import jwt from 'jsonwebtoken';
import AsyncLock from 'async-lock';
import { InputError, AccessError, } from './error.js';
import Admin from '../models/admin.js';
const lock = new AsyncLock();

const JWT_SECRET = 'llamallamaduck';
const DATABASE_FILE = './database.json';

/***************************************************************
                       State Management
***************************************************************/
export const reset = async () => {
  await Admin.deleteMany({});
};

/***************************************************************
                       Helper Functions
***************************************************************/

export const userLock = callback => new Promise((resolve, reject) => {
  lock.acquire('userAuthLock', done => { 
    try {
      Promise.resolve(callback(resolve, reject))
        .then(done)
        .catch(done);
    } catch (err) {
      done();
    }
  });
});

/***************************************************************
                       Auth Functions
***************************************************************/

export const getEmailFromAuthorization = async authorization => {
  try {
    const token = authorization.replace('Bearer ', '');
    const { email, } = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new AccessError('Invalid Token');
    }
    return email;
  } catch {
    throw new AccessError('Invalid token');
  }
};

export const login = (email, password) => userLock(async (resolve, reject) => {
  const admin = await Admin.findOne({ email });
  if (admin && admin.password === password) {
    resolve(jwt.sign({ email, }, JWT_SECRET, { algorithm: 'HS256', }));
  }
  reject(new InputError('Invalid username or password'));
});

// 返回指定callback的userLock
export const logout = (email) => {
  return userLock(async (resolve, reject) => {
    await Admin.updateOne({ email }, { sessionActive: false });
    resolve();
  });
};

export const register = (email, password, name) => userLock(async (resolve, reject) => {
  const adminExist = await Admin.findOne({ email });
  if (adminExist) {
    return reject(new InputError('Email address already registered'));
  }
  const admin = new Admin({ email, password, name, });
  await admin.save();
  const token = jwt.sign({ email, }, JWT_SECRET, { algorithm: 'HS256', });
  resolve(token);
});

/***************************************************************
                       Store Functions
***************************************************************/

export const getStore = (email) => {
  return userLock(async (resolve, reject) => {
    const admin = await Admin.findOne({ email });
    if (admin) {
      resolve({ store: admin.store });
    } else {
      reject(new AccessError('Admin not found'));
    }
  });
};

export const setStore = (email, store) => {
  return userLock(async (resolve, reject) => {
    await Admin.updateOne({ email }, { store });
    resolve();
  });
};