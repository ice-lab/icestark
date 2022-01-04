class CssStorage {
    private loaded: Map<string, number>;
    private pending: Map<string, number>;
    private subscriber: Map<string, (() => void)[]>;

    public constructor() {
        this.loaded = new Map();
        this.pending = new Map();
        this.subscriber = new Map();
    }

    /**
     * 引用计数, 默认放到 pending 队列里面
     * @param nameList 
     */
    public count(nameList: string[]) {
        nameList = nameList || [];
        nameList.forEach(name => {
            if (this.loaded.has(name)) {
                this.countLoaded(name);
            } else {
                this.countPending(name);
            }
        });
    }
    /**
     * 减少计数值
     * @param nameList 
     */
    public decount(nameList: string[]) {
        nameList = nameList || [];
        nameList.forEach(name => {
            if (this.loaded.has(name)) {
                this.decountLoaded(name);
            } else {
                this.decountPending(name);
            }
        });
    }
    /**
     * 
     * @param name 
     * @returns 
     */
    public isPendingHold(name: string) {
        return this.pending.has(name);
    }
    /**
     * 
     * @param name 
     * @returns 
     */
    public isLoadedHold(name: string) {
        return this.loaded.has(name);
    }

    /**
     * pending2Loaded
     * @param name 
     * @returns 
     */
    public pending2Loaded(name: string) {
        if (!this.pending.has(name)) {
            return;
        }
        const count = this.pending.get(name);
        if (!this.loaded.has(name)) {
            this.loaded.set(name, count);
        } else {
            this.loaded.set(name, this.loaded.get(name) + count);
        }
        if (this.subscriber.has(name)) {
            const resolves = this.subscriber.get(name);
            resolves.forEach(resolve => {
                resolve();
            });
        }
    }
    public subscribe(name: string, resolve) {
        if (this.subscriber.has(name)) {
            this.subscriber.set(name, this.subscriber.get(name).push(resolve));
        } else {
            this.subscriber.set(name, [resolve]);
        }
    }
    /**
     * 增加 pending 队列计数
     * @param name 
     */
    private countPending(name: string) {
        if (this.pending.has(name)) {
            this.pending.set(name, this.pending.get(name) + 1);
        } else {
            this.pending.set(name, 1);
        }
    }

    /**
     * 增加 loaded 队列计数
     * @param name 
     */
    private countLoaded(name: string) {
        if (this.loaded.has(name)) {
            this.loaded.set(name, this.loaded.get(name) + 1);
        } else {
            this.loaded.set(name, 1);
        }
    }

    /**
     * 减少 pending 队列计数
     * @param name 
     */
    private decountPending(name: string) {
        if (this.pending.has(name)) {
            const count = this.pending.get(name);
            if (count > 1) {
                this.pending.set(name, count - 1);
            } else {
                this.pending.delete(name);
            }
        }
    }
    /**
     * 减少 loaded 队列计数
     * @param name 
     */
    private decountLoaded(name: string) {
        if (this.loaded.has(name)) {
            const count = this.loaded.get(name);
            if (count > 1) {
                this.loaded.set(name, count - 1);
            } else {
                this.loaded.delete(name);
            }
        }
    }

}

export const cssStorage = new CssStorage();