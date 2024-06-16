import { useCallback, useReducer, useRef, useEffect } from 'react';

export type Reducer<S> = (state: S) => S;
export type Listener<S> = (state: S) => any;
export type Getter<S> = () => S;
export type Setter<S> = (valueOrReducer: S | Reducer<S>) => S;
export type Action<S> = (...args: any[]) => S | Reducer<S>;
export type Actions<S> = { [actionName: string]: Action<S> };
export type BoundActions<S, A extends Actions<S>> = {
  [actionName in keyof A]: (...args: Parameters<A[actionName]>) => S;
};
export type Subscribe<S> = (listener: Listener<S>) => () => void;
export type Store<S, A extends Actions<S>> = BoundActions<S, A> & {
  get: Getter<S>;
  set: Setter<S>;
  subscribe: Subscribe<S>;
};
export type Hook<S, A extends Actions<S>> = () => [Store<S, A>, S];

export const createStore = <S, A extends Actions<S>>(initialState: S, actions?: A): Store<S, A> => {
  let state: S = initialState;
  const listeners = new Set<Listener<S>>();

  const get = () => state;

  const set = (valueOrReducer: S | Reducer<S>) => {
    const nextState = typeof valueOrReducer === 'function' ? (valueOrReducer as Reducer<S>)(state) : valueOrReducer;
    if (state !== nextState) {
      state = nextState;
      listeners.forEach(listener => listener(state));
    }
    return state;
  };

  const subscribe = (listener: Listener<S>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const boundActions = bindActions(actions ?? ({} as A), set);

  const store = { ...boundActions, get, set, subscribe };
  return store;
};

export const bindActions = <S, A extends Actions<S>>(actions: A, set: Setter<S>): BoundActions<S, A> => {
  if (!actions) return {} as BoundActions<S, A>;
  return Object.keys(actions).reduce(
    (acc, key) => ({ ...acc, [key]: (...args: any[]) => set(actions[key](...args)) }),
    {}
  ) as BoundActions<S, A>;
};

export const createHook = <S, A extends Actions<S>>(store: Store<S, A>): Hook<S, A> => {
  const useHook = () => {
    const state = useRef(store.get());
    const isSensitive = useRef(false);
    state.current = store.get();
    const [, forceRender] = useReducer(n => n + 1, 0);

    const listener = useCallback((nextState: S) => {
      if (!isSensitive.current || state.current === nextState) return;
      forceRender();
    }, []);

    useEffect(() => store.subscribe(listener), [listener]);

    const result = [store, state.current] as [Store<S, A>, S];

    Object.defineProperty(result, 1, {
      get: () => {
        isSensitive.current = true;
        return state.current;
      }
    });
    return result;
  };

  return useHook;
};

export const state = <S, A extends Actions<S>>(initialState: S, actions?: A) =>
  createHook(createStore(initialState, actions));
