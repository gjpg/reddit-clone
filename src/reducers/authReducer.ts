
const initialState = {
    isAuthenticated: false,
    userData: null,
    accessToken: null,
  };

  type AuthAction =
  | { type: "SET_USER_DATA"; payload: any }
  | { type: "LOGOUT" };
  
  export const authReducer = (state = initialState, action: AuthAction) => {
    switch (action.type) {
      case "SET_USER_DATA":
        return {
          ...state,
          isAuthenticated: true,
          userData: action.payload,
        };
      case "LOGOUT":
        return {
          ...state,
          isAuthenticated: false,
          userData: null,
          accessToken: null,
        };
      default:
        return state;
    }
  };
  