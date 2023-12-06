type Action<A> = (value: A) => Promise<void>;

/**
 * Represents a class that will emit events and allow callers to listen for events.
 */
export class AsyncDelegate<A> {
  actions: Action<A>[] = [];

  constructor() { }

  /**
   * Bind a function that will be invoked whenever something is emitted by this delegate.
   * @returns Returns closer function, if called the reference to the function will be removed.
   */
  listen = (action: Action<A>) => {
    this.actions.push(action);

    return () => {
      this.actions = this.actions.filter(f => f === action);
    }
  }

  /**
   * Publishes an event for all listeners bound to this delegate.
   */
  emit = async (event: A) => {
    for (const action of this.actions) {
      await action(event);
    }
  }
}