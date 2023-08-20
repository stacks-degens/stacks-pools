import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import mainReducer, { IinitialState } from '../reducers';

import { createTransform, persistReducer, persistStore } from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import storage from 'redux-persist/lib/storage';
import { AppConfig, UserSession } from '@stacks/connect';
import { userSession } from '../reducers/user-state';

// not used
const generateSecretKey = () => {
  const rand = 10000000 + Math.random() * 10000000;
  return Math.floor(rand).toString();
  // return parseInt(Math.floor(Math.random() * 10000).toString(), 16);
  // crypto.randomBytes(32).toString('hex'); // Generates a 64-character hex key
};

const UserSesssionPersistTransform = createTransform(
  (inboundState: IinitialState, key: string | number) => {
    console.log('inbount', key, inboundState);
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const userSession = new UserSession({ appConfig });
    // return inboundState;
    return !userSession.isUserSignedIn() ? inboundState : { ...inboundState, userSession };
    // return { ...inboundState, userSession };
  },
  (outboundState: IinitialState, key: string | number) => {
    console.log('outbound', key);
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const userSession = new UserSession({ appConfig });
    return !userSession.isUserSignedIn() ? outboundState : { ...outboundState, userSession };
    return outboundState;
  },
  { whitelist: userSession.isUserSignedIn() ? ['theme'] : [] }
);

const persistConfig = {
  key: 'root',
  storage: storage,
  transforms: [
    // UserSesssionPersistTransform,
    encryptTransform({
      secretKey: userSession.isUserSignedIn() ? userSession.loadUserData().profile.stxAddress['testnet'] : 'signed-out',
      // secretKey: 'hello',
      onError: function (error) {
        console.log(error);
      },
    }),
  ],
  whitelist: userSession.isUserSignedIn() ? ['theme'] : [],
  // blacklist: [''],
};

const persistedReducer = persistReducer(persistConfig, mainReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // reducer: mainReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
