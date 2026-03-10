import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import userReducer from "./reducers/user";
import { BrowserRouter } from "react-router-dom";

const STORAGE_KEY = "venueapp_user";

// Load persisted state from localStorage
const loadState = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    return serialized ? { user: JSON.parse(serialized) } : undefined;
  } catch {
    return undefined;
  }
};

// Save state to localStorage on every change
const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
  } catch {
    // ignore
  }
};

const reducers = combineReducers({
  user: userReducer,
});

const store = configureStore({
  reducer: reducers,
  preloadedState: loadState(),
});

store.subscribe(() => saveState(store.getState()));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
