import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    loggedInUser: null,
    failedAttempts: 0,
    isLocked: false,
    lockUntil: null,
    lastLoginAttempt: null,
    roles: ['Website Administrator', 'Product Manager', 'Customer'] // Available roles in the system
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
            state.failedAttempts = 0;
            state.isLocked = false;
            state.lockUntil = null;
            state.lastLoginAttempt = {
                time: new Date().toISOString(),
                success: true
            };
        },
        loginFailure: (state,action) =>{
            state.status = 'failure';
            state.error = action.payload;
            state.lastLoginAttempt = {
                time: new Date().toISOString(),
                success: false,
                reason: action.payload
            };

            if (state.lockUntil && Date.now() < state.lockUntil) {
                state.isLocked = true;  // Account is locked
                return;  // Early return, don't increase failed attempts if locked
            }

            state.failedAttempts += 1;

            if (state.failedAttempts >= 5) {
                state.lockUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
                state.failedAttempts = 0; // Reset failed attempts after lock
            }
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

// Role-related helper functions
export const isAdmin = (user) => user && user.role === 'Website Administrator';
export const isProductManager = (user) => user && user.role === 'Product Manager';
export const isCustomer = (user) => user && user.role === 'Customer';

export default userSlice.reducer;
