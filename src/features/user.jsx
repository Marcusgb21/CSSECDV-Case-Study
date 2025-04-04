import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    loggedInUser: null
  };
  
export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers :{
        registerRequest: (state) =>{
            state.status ='loading';
        },
        registerSuccess: (state,action) =>{
            state.status = 'success';
            state.user = action.payload;
        },
        registerFailure: (state,action) =>{
            state.status = 'failure';
            state.error = action.payload;
        },
        loginRequest: (state) =>{
            state.status = 'loading';
        },
        loginSuccess: (state,action) =>{
            state.status = 'success';
            state.loggedInUser = action.payload;
        },
        loginFailure: (state,action) =>{
            state.status = 'faiure';
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
            state.status = 'idle';
        }
    }

});

export const {registerRequest, registerSuccess, registerFailure,
    loginRequest, loginSuccess, loginFailure, clearError
} = userSlice.actions;

export default userSlice.reducer;
