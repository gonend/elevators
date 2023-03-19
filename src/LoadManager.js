class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
    console.log(`Enqueued item: ${item}`);
  }

  dequeue() {
    if (this.isEmpty()) {
      console.log("Queue is empty. Cannot dequeue.");
      return null;
    }
    const dequeuedItem = this.items.shift();
    console.log(
      `Dequeued item: ${dequeuedItem}. Queue size is now ${this.size()}.`
    );
    return dequeuedItem;
  }

  peek() {
    if (this.isEmpty()) {
      console.log("Queue is empty. Cannot peek.");
      return null;
    }
    const peekedItem = this.items[0];
    console.log(`Peeked item: ${peekedItem}.`);
    return peekedItem;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

export const manager = new Queue();
