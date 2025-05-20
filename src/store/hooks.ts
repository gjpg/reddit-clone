// hooks.ts
import {  useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store'; // Adjust path if needed

// Typed dispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

// Typed selector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
