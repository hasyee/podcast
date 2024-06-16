import { useCallback, useEffect, useReducer, useRef } from 'react';

export type Reducer<T> = (state: T) => T;
export type Listener<T> = (state: T) => any;
export type Getter<T> = () => T;
export type Setter<T> = (valueOrReducer: T | Reducer<T>) => T;
export type Action<T> = (...args: any[]) => T | Reducer<T>;
export type Actions<T> = { [actionName: string]: Action<T> };
export type BoundActions<T, A extends Actions<T>> = {
  [actionName in keyof A]: (...args: Parameters<A[actionName]>) => T;
};
export type Subscribe<T> = (listener: Listener<T>) => () => void;
export type WithActions<T> = <A extends Actions<T>>(actions: A) => Store<T, A>;
export type Store<T, A extends Actions<T>> = BoundActions<T, A> & {
  get: Getter<T>;
  set: Setter<T>;
  subscribe: Subscribe<T>;
  withActions: WithActions<T>;
};
export type Hook<T, A extends Actions<T>> = {
  (): [Store<T, A>, T];
  store: Store<T, A>;
  withActions: <A2 extends Actions<T>>(actions: A2) => Hook<T, A2>;
};
export type MemoHook<T> = {
  (): T;
  store: Store<T, {}>;
};
export type MemoDependencyStates<D extends Hook<any, any>[]> = {
  [index in keyof D]: ReturnType<D[index]['store']['get']>;
};
export type Selector<D extends Hook<any, any>[]> = (deps: {
  [index in keyof D]: ReturnType<D[index]['store']['get']>;
}) => any;

const createStore = <T>(initialState: T): Store<T, {}> => {
  let state: T = initialState;
  const listeners = new Set<Listener<T>>();

  const get = () => state;

  const set = (valueOrReducer: T | Reducer<T>) => {
    const nextState = typeof valueOrReducer === 'function' ? (valueOrReducer as Reducer<T>)(state) : valueOrReducer;
    if (state !== nextState) {
      state = nextState;
      listeners.forEach(listener => listener(state));
    }
    return state;
  };

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const withActions = <A extends Actions<T>>(actions: A) => {
    const boundActions = bindActions(actions, set);
    return { ...boundActions, ...store };
  };

  const store = { get, set, subscribe, withActions };
  return store;
};

const bindActions = <T, A extends Actions<T>>(actions: A, set: Setter<T>): BoundActions<T, A> => {
  if (!actions) return {} as BoundActions<T, A>;
  return Object.keys(actions).reduce(
    (acc, key) => ({ ...acc, [key]: (...args: any[]) => set(actions[key](...args)) }),
    {}
  ) as BoundActions<T, A>;
};

const createHook = <T, A extends Actions<T>>(store: Store<T, A>): Hook<T, A> => {
  const useHook = () => {
    const state = useRef(store.get());
    const isSensitive = useRef(false);
    state.current = store.get();
    const [, forceRender] = useReducer(n => n + 1, 0);

    const listener = useCallback((nextState: T) => {
      if (!isSensitive.current || state.current === nextState) return;
      forceRender();
    }, []);

    useEffect(() => store.subscribe(listener), [listener]);

    const result = [store, state.current] as [Store<T, A>, T];

    Object.defineProperty(result, 1, {
      get: () => {
        isSensitive.current = true;
        return state.current;
      }
    });
    return result;
  };

  useHook.store = store;
  useHook.withActions = <A2 extends Actions<T>>(actions: A2): Hook<T, A2> => {
    const nextStore = useHook.store.withActions(actions);
    return createHook(nextStore);
  };

  return useHook;
};

export const state = <T>(initialState: T) => createHook(createStore(initialState));

export const memo = <S extends Selector<D>, D extends Hook<any, any>[]>(
  selector: S,
  deps: D
): MemoHook<ReturnType<S>> => {
  let depStates = deps.map(dep => dep.store.get());

  const initialState = selector(depStates as MemoDependencyStates<D>);
  const store = createStore(initialState);

  deps.forEach((dep, i) => {
    dep.store.subscribe(nextDepState => {
      depStates = depStates.map((depState, j) => (i === j ? nextDepState : depState));
      store.set(selector(depStates as MemoDependencyStates<D>));
    });
  });

  const useHook = () => store.get();

  useHook.store = store;

  return useHook;
};
