import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: '',
  access_token: '',
  id: '',
  isAdmin: false
}

export const userSlide = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const payload = action.payload || {};
      if (Object.prototype.hasOwnProperty.call(payload, 'name')) state.name = payload.name ?? '';
      if (Object.prototype.hasOwnProperty.call(payload, 'email')) state.email = payload.email ?? '';
      if (Object.prototype.hasOwnProperty.call(payload, 'phone')) state.phone = payload.phone ?? '';
      if (Object.prototype.hasOwnProperty.call(payload, 'address')) state.address = payload.address ?? '';
      if (Object.prototype.hasOwnProperty.call(payload, 'avatar')) state.avatar = payload.avatar ?? '';
      if (Object.prototype.hasOwnProperty.call(payload, '_id')) state.id = payload._id ?? '';
      if (Object.prototype.hasOwnProperty.call(payload, 'id')) state.id = payload.id ?? '';
      if (Object.prototype.hasOwnProperty.call(payload, 'access_token')) state.access_token = payload.access_token ?? '';
      if (Object.prototype.hasOwnProperty.call(payload, 'isAdmin')) state.isAdmin = Boolean(payload.isAdmin);
    },
    resetUser: (state,) => {

      state.name = '';
      state.email = '';
      state.phone = '';
      state.address = '';
      state.avatar = '';
      state.id = '';
      state.access_token = '';
      state.isAdmin = false;
    },
  },
})


export const { updateUser, resetUser } = userSlide.actions

export default userSlide.reducer
