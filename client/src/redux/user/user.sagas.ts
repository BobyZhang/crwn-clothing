import { takeLatest, put, call, all } from 'redux-saga/effects';

import {
  CHECK_USER_SESSION,
  EMAIL_SIGN_IN_START,
  GOOGLE_SIGN_IN_START,
  SignUpStartAction,
  SIGN_OUT_START,
  SIGN_UP_START,
  SIGN_UP_SUCCESS
} from './user.types';

import { 
  auth, 
  googleProvider, 
  createUserProfileDocument, 
  getCurrentUser 
} from '../../firebase/firebase.utils';

import { 
  signInSuccess, 
  signInFailure,
  signOutSuccess,
  signOutFailure,
  signUpSuccess,
  signUpFailure
} from './user.actions';


export function* getSnapshotFromUserAuth(userAuth: any, additionalData?: any) {
  try {
    const userRef = yield call(createUserProfileDocument, userAuth, additionalData);
    const userSnapshot = yield userRef.get();
    yield put(signInSuccess({ id: userAuth.id, ...userSnapshot.data() }));
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* signInWithGoogle() {
  try {
    const userCredential = yield auth.signInWithPopup(googleProvider);
    
    console.log(userCredential);
    const { user } = userCredential;
    yield getSnapshotFromUserAuth(user);
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* signInWithEmail({ payload: { email, password } }: any) {
  try {
    const { user } = yield auth.signInWithEmailAndPassword(email, password);
    yield getSnapshotFromUserAuth(user);
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* isUserAuthenticated() {
  try {
    const userAuth = yield getCurrentUser();
    if (!userAuth) return;
    yield getSnapshotFromUserAuth(userAuth);
  } catch (error) {
    yield put(signInFailure(error))
  }
}

export function* signOut() {
  try {
    yield auth.signOut();
    yield put(signOutSuccess());
  } catch(error) {
    yield put(signOutFailure(error));
  }
}

export function* signUp({ payload: { email, password, displayName }}: SignUpStartAction) {
  try {
    const { user } = yield auth.createUserWithEmailAndPassword(email, password);
    yield put(signUpSuccess({ user, additionalData: { displayName } }));
  } catch (error) {
    yield put(signUpFailure(error));
  }
}

// TODO
export function* signInAfterSignUp({ payload: { user, additionalData } }: any) {
  yield getSnapshotFromUserAuth(user, additionalData);
}

export function* onGoogleSignInStart() {
  yield takeLatest(GOOGLE_SIGN_IN_START, signInWithGoogle)
}

export function* onEmialSignInStart() {
  yield takeLatest(EMAIL_SIGN_IN_START, signInWithEmail);
}

export function* onCheckUserSession() {
  yield takeLatest(CHECK_USER_SESSION, isUserAuthenticated);
}

export function* onSignOutStart() {
  yield takeLatest(SIGN_OUT_START, signOut)
}

export function* onSignUpStart() {
  yield takeLatest(SIGN_UP_START, signUp)
}

export function* onSignUpSuccess() {
  yield takeLatest(SIGN_UP_SUCCESS, signInAfterSignUp)
}

export function* userSagas() {
  yield all([
    call(onGoogleSignInStart), 
    call(onEmialSignInStart),
    call(onCheckUserSession),
    call(onSignOutStart),
    call(onSignUpStart),
    call(onSignUpSuccess)
  ]);
}