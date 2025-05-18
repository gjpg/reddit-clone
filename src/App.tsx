import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './store/features/counter/counterSlice';
import { type RootState, type AppDispatch } from './store';

function App() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}

export default App;
