export class ObjectPool<T> {
  private readonly available: T[] = [];
  private readonly active = new Set<T>();

  constructor(private readonly create: () => T, private readonly activate: (item: T) => void, private readonly deactivate: (item: T) => void) {}

  acquire(): T {
    const item = this.available.pop() ?? this.create();
    this.active.add(item); this.activate(item); return item;
  }

  release(item: T): void {
    if (!this.active.delete(item)) return;
    this.deactivate(item); this.available.push(item);
  }

  releaseAll(): void { for (const item of [...this.active]) this.release(item); }
  get activeCount(): number { return this.active.size; }
  get pooledCount(): number { return this.available.length; }
}
